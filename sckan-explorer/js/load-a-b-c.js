// This file contains the function called loadABCData() to load, process, search, and display the a to b via c connections 
// for the SCKAN Explorer. 

// Database and queries
// const dbName = 'NPO';
// const qry3 = npo_partial_order;

// Global variables
var NPO_POSET = new Array();
var NPO_NEURON_PATHS = new Array();
var NPO_NEURON_PATHS_WITH_SYNAPSE = new Array();
var NPO_NEURON_METADATA = new Array();
var A_TO_B_VIA_C = new Array();


// Not sending the query to the server. Using pre-generated json files instead.
// async function getPartialOrderDataFromDB() 
// {
//     try 
//     {
//        var queryResults = await executeDBQuery(conn, dbName, qry3);
//        return queryResults;
//     } 
//     catch (error) 
//     {
//       console.error(error);
//       alert("Satrdog is not responding with query results.");
//     }
// }

const json_directory = "./json/explorer-data/sckan-data/";

function loadJSONFromFile(filename) 
{
  const xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open('GET', filename, false);
  xhr.send();

  if (xhr.status === 200) 
  {
    jsonData =  JSON.parse(xhr.responseText)
    return jsonData.results.bindings;
  } 
  else 
  {
    console.error("Error fetching JSON data:", xhr.statusText);
    return null;
  }
}
async function loadABCData()
{
    //const neuronsMetaDataFromDB = await getNeuronsMetaDataFromDB();
    const neuronsMetaDataFromDB = loadJSONFromFile(json_directory + "neuron-metadata.json");
    NPO_NEURON_METADATA = getNeuronsMetaData(neuronsMetaDataFromDB);

    //const poDataFromDB = await getPartialOrderDataFromDB();
    const poDataFromDB = loadJSONFromFile(json_directory + "axonal-path.json");

    NPO_POSET = getNPOPartialOrders(poDataFromDB);
    populateNPONeuronDiGraphs();
    
    //const abc_data = await getABCDataFromDB();
    const abc_data = loadJSONFromFile(json_directory + "a-b-via-c.json");
    A_TO_B_VIA_C = getAtoBviaC(abc_data);

    // console.info("ATOBVIAC"); console.log (aToBviaC);
    // console.info("Neurons MetaDATA"); console.log (NPO_NEURON_METADATA);
    // console.info("Neurons PARTIAL ORDER"); console.log (NPO_POSET);
    // console.info ("NPO NEURON PATHS"); console.log (NPO_NEURON_PATHS);

    // Updated function for new axonal-path query
    function getNPOPartialOrders(poData)
    {
      var npo_poset_data = new Array();
      for (i = 0; i <poData.length; i++)
      {
         var neuron_iri = poData[i].Neuron_Connected.value;
         var neuron_id = getCurieFromIRI(neuron_iri);
         
         // get neuron label from NPO_NEURON_METADATA
         var neuron_label = getNeuronLabelFromID (neuron_id);
         var neuronType = new ClassEntity (neuron_id, neuron_iri, neuron_label);
         
         var v1IRI = poData[i].V1_ID.value;
         var v1ID = getCurieFromIRI(v1IRI);
         var v1Label= poData[i].V1.value;
         var v1 = new ClassEntity(v1ID, v1IRI, v1Label);
         var v1Type = poData[i].V1_Type.value;
  
         var v2IRI = poData[i].V2_ID.value;
         var v2ID = getCurieFromIRI(v2IRI);
         var v2Label= poData[i].V2.value;
         var v2 = new ClassEntity(v2ID, v2IRI, v2Label);
         var v2Type = poData[i].V2_Type.value;
         var isSynapse = poData[i].IsSynapse.value;
  
         var poset = new AdjTable(neuronType, v1, v1Type, v2, v2Type, isSynapse);
         npo_poset_data.push(poset);
      }
      return npo_poset_data;
    }

    // get label from npo_neuron_metadata
    function getNeuronLabelFromID(neuronID) 
    {
      const neuron = NPO_NEURON_METADATA.find(neuron => neuron.neuronID === neuronID);
      return neuron ? neuron.neuronPrefLabel : null; // return neuronLabel if found, otherwise null
    }

    function populateNPONeuronDiGraphs()
    {
      var neurons_with_poset = [...new Set(NPO_POSET.map(obj => obj.neuron.ID))];

      for (let i = 0; i < neurons_with_poset.length; i++)
        {
          var diGraph = getDiGraph(neurons_with_poset[i]);
          var neuronPathDiGraph = new NeuronPathDiGraph(neurons_with_poset[i], diGraph);
          NPO_NEURON_PATHS.push (neuronPathDiGraph );

          // For diGraph with Synaptic Forward Connections.
          var diGraphWithSynapse = getDiGraphWithSynapse (neurons_with_poset[i]);
          var neuronPathDiGraphWithSynapse = new NeuronPathDiGraph(neurons_with_poset[i], diGraphWithSynapse);
          NPO_NEURON_PATHS_WITH_SYNAPSE.push (neuronPathDiGraphWithSynapse);

        }

      // console.log (NPO_NEURON_PATHS);
      // console.log (NPO_NEURON_PATHS[0].neuronID + NPO_NEURON_PATHS[0].diGraph);
    }
   
    // Updated function to add different color and style for the nodes
    function getDiGraph(n_id)
    {
        var neuronAdj = NPO_POSET.filter(obj => obj.neuron.ID === n_id);
        
        var diGraph  = 'strict digraph {';    
            diGraph += 'label = <';            
              
            // to add label for the digraph in html table format
            var htmlLabel = '<table border = "0" cellborder="0" cellspacing="2" cellpadding="5">';
                // add an invisible row since graphviz does not support <br/> before the html table tag
                htmlLabel += '<TR><TD BGCOLOR="white" HEIGHT="8" BORDER="0"></TD></TR>';
                htmlLabel += "<tr><td BGCOLOR= '#b1d6f8'><b>&nbsp;" + neuronAdj[0].neuron.ID + "</b>&nbsp;</td>";
                htmlLabel += "<td BGCOLOR='#EFF5FB'>" + getFormattedNeuronLabel(neuronAdj[0].neuron.Label) + "</td></tr>";
                htmlLabel += "</table>";
            
            diGraph += htmlLabel + '>\n';           
            diGraph += getDiGraphEdges(neuronAdj, false);
            diGraph += '}';

        return diGraph;
    }

    // DONE: get digraph for a neuron population including the population(s) connected via forward connections
    function getDiGraphWithSynapse(n_id)
    {
      // Find neurons synaptically connected from the given neuron_id i.e., the n_id
      // Get connected neurons from NeuronMetadata in an array
      var connected_neurons = getConnectedNeurons(n_id).split(',').map(item => item.trim());

      var neuronAdj = NPO_POSET.filter(obj => obj.neuron.ID === n_id);
      
      var diGraph  = 'strict digraph {';
          diGraph += 'label = <' ;

          // to add label for the digraph in html table format
          var htmlLabel = '<table border = "0" cellborder="0" cellspacing="2" cellpadding="5">';
          // add an invisible row since graphviz does not support <br/> before the html table tag
          htmlLabel += '<TR><TD BGCOLOR="white" HEIGHT="8" BORDER="0"></TD></TR>';
          htmlLabel += "<tr><td BGCOLOR='#b1d6f8'><b>&nbsp;" + neuronAdj[0].neuron.ID + "</b>&nbsp;</td>";
          htmlLabel += "<td BGCOLOR='#EFF5FB'>" + getFormattedNeuronLabel(neuronAdj[0].neuron.Label) + "</td></tr>";
          
      if (connected_neurons !== null)
        {
          // Add labels for the next synaptically connected  neurons 
          for (i = 0; i < connected_neurons.length; i++)
          {
            var neuron_id = connected_neurons[i];
            var neuron_label = getNeuronLabelFromID(neuron_id);
            if ( neuron_id !== "")
            {            
              htmlLabel += "<tr><td BGCOLOR='#b1d6f8'><b>&nbsp;" + neuron_id + "</b>&nbsp;</td>";
              htmlLabel += "<td BGCOLOR='#EFF5FB'>" + getFormattedNeuronLabel(neuron_label) + "</td></tr>";
            }
          }
          htmlLabel += "</table>";    

          diGraph += htmlLabel + '>\n';
        }
            
        diGraph += getDiGraphEdges(neuronAdj, true);

        if (connected_neurons !== null)
          {
            // Add nodes and edges for the synaptically connected  neurons
            for (i = 0; i < connected_neurons.length; i++)
            {
              neuronAdj = NPO_POSET.filter(obj => obj.neuron.ID === connected_neurons[i]);
              diGraph += getDiGraphEdges(neuronAdj, true);
            }
          }
          diGraph += '}';

      return diGraph;
    } // end of function getDiGraphWithSynapse()

    // get connected neuron from npo_neuron_metadata
    function getConnectedNeurons(neuronID) 
    {
      const neuron = NPO_NEURON_METADATA.find(neuron => neuron.neuronID === neuronID);
      return neuron ? neuron.forwardConnections : null; // return forward connections if found, otherwise null
    }

    // get the edges for the digraph
    function getDiGraphEdges(neuronAdj, withSynapse)
    {
      const synapseNodeStyle = `shape=rect, style="rounded, filled", fillcolor="#eefaec", peripheries=2, color="blue"`;

      var diGraph = "";
      for (let i = 0; i < neuronAdj.length; i++)
        { 
          // V1 Node formatting
          let v1NodeStyle = ""; var v1Type = neuronAdj[i].v1_type;
          v1NodeStyle = getNodeStyle (v1Type);
          
          // V2 Node formatting
          let v2NodeStyle = ""; var v2Type = neuronAdj[i].v2_type;
          v2NodeStyle = getNodeStyle (v2Type);
          
          // Check if V2 is a synapse Location; if so, change the shape to synapse style 
          var isSynapse = neuronAdj[i].is_synapse;
                    
          if (withSynapse)
          {
            if (isSynapse.trim().toUpperCase() === "YES")
              v2NodeStyle = synapseNodeStyle;
          }

          const v1_text = neuronAdj[i].v1.ID + "\\n"
                        + splitTextIntoLines(neuronAdj[i].v1.Label, 26)
          const v2_text = neuronAdj[i].v2.ID + "\\n"
                        + splitTextIntoLines(neuronAdj[i].v2.Label, 26)
          
          diGraph += `"${v1_text}" [label="${v1_text}", ${v1NodeStyle}];\n`;
          diGraph += `"${v2_text}" [label="${v2_text}", ${v2NodeStyle}];\n`;
          // add edge
          diGraph += `"${v1_text}" -> "${v2_text}";\n`;
        }
        return diGraph;
    }

  // get node style for the digraph based on node type  
  function getNodeStyle(nodeType)
    {
      const somaNodeStyle = `shape=rect, style="rounded, filled", fillcolor="#eefaec", color=black`;
      const axonNodeStyle = `shape=rect, style="rounded, filled, dashed", fillcolor="#ecf1fe" color=black`;
      const sensoryNodeStyle = `shape=rect, color=red`;
      const axonTerminalNodeStyle = `shape=rect, style="rounded, diagonals, filled", fillcolor="#feeeee", color=red`;
      const synapseNodeStyle = `shape=rect, style="rounded, filled", fillcolor="#eefaec", peripheries=2, color=black`;
      
      var nodeStyle = "";

      if (nodeType === "hasSomaLocation")
          nodeStyle = somaNodeStyle;
      
      if (nodeType === "hasAxonLocation" || nodeType === "hasAxonLeadingToSensoryTerminal")
          nodeStyle = axonNodeStyle;
      
      if (nodeType === "hasSensoryAxonTerminalLocation")
          nodeStyle = sensoryNodeStyle;
      
      if (nodeType === "hasAxonTerminalLocation")
          nodeStyle = axonTerminalNodeStyle;

      return nodeStyle;
    }

// For wrapping a long label for the nodes or the label of the neuron type in the digraph.
// Returns HTML version when html=true using <br/>; otherwise, returns plain text with \n.
function splitTextIntoLines(text, maxChar, html = false)
{
  let lines = [];
  let currentLine = "";

  // Split text into words
  const words = text.split(" ");

  for (let i = 0; i < words.length; i++) 
    {
      const word = words[i];

      // to check if adding the next word exceeds the maxChar limit
      if (currentLine.length + word.length + 1 <= maxChar)
      {
          // if currentLine is empty, simply assign the word
          currentLine += (currentLine === "" ? "" : " ") + word;
      }
      else
      {
          // if currentLine is not empty, push it to lines first
          if (currentLine.length > 0) 
          {
              lines.push(currentLine);
          }
          // Start new line with the current word
          currentLine = word;
      }
    }
  // push the last line if it has content
  if (currentLine.length > 0)
  {
      lines.push(currentLine);
  }

  // to join lines with <br/> for HTML or with \n for plain text
  return html ? lines.join('<br/>') : lines.join('\n');
}

function getFormattedNeuronLabel(neuronLabel, maxChar = 110)
{
  let labelLines = [];
  
  // Bold "to" and "via" and add a space after
  let formattedLabel = neuronLabel.replace(/(\b(to|via)\b)/g, '<b>$1</b>&nbsp;');
  
  // Split formatted label into words
  const words = formattedLabel.split(" ");
  let currentLine = "";
  let isFirstLine = true;

  words.forEach((word) => {
    // Check if we're on the first line and "via" is encountered
    if (isFirstLine && word.toLowerCase() === "<b>via</b>&nbsp;")
    {
      // Add the current line without "via" and start the next line with "via"
      if (currentLine.trim().length > 0)
      {
        labelLines.push(currentLine.trim());
      }
      currentLine = word; // "via" starts the next line
      isFirstLine = false;
    }
    else if (currentLine.length + word.length + 1 <= maxChar)
    {
      // Add word to current line if within maxChar limit
      currentLine += (currentLine === "" ? "" : " ") + word;
    } 
    else
    {
      // For subsequent lines, if "via" is the last word before maxChar, move it to the next line
      if (currentLine.endsWith("<b>via</b>&nbsp;"))
      {
        currentLine = currentLine.slice(0, currentLine.lastIndexOf("<b>via</b>&nbsp;")).trim();
        labelLines.push(currentLine);
        currentLine = "<b>via</b>&nbsp;" + word;
      }
      else
      {
        // Push the current line and start a new one with the current word
        labelLines.push(currentLine.trim());
        currentLine = word;
      }
      isFirstLine = false;
    }
  });

  // Push any remaining text in currentLine
  if (currentLine.length > 0)
  {
    labelLines.push(currentLine.trim());
  }

  // Join lines with <br/> for HTML line breaks
  var label = `${labelLines.join('<br/>')}`;
  return label;
}


function getAtoBviaC(abc_data)
  {
        var abc = new Array();
        for (i = 0; i <abc_data.length; i++)
        {
           var neuron_iri = abc_data[i].Neuron_ID.value;
           var neuron_id = getCurieFromIRI(neuron_iri);
           var neuronType = new ClassEntity (neuron_id, neuron_iri, "");
           
           var originIRI = abc_data[i].A_IRI.value;
           var originID = getCurieFromIRI(originIRI);
           var originLabel = abc_data[i].A_Label.value;
           var origin = new ClassEntity(originID, originIRI, originLabel);
           
           var destIRI = abc_data[i].B_IRI.value;
           var destID = getCurieFromIRI(destIRI);
           var destLabel = abc_data[i].B_Label.value;
           var dest = new ClassEntity(destID, destIRI, destLabel);
    
           var via = new ClassEntity("", "", ""); 
    
           if (abc_data[i].hasOwnProperty("C_IRI"))
            {
            var viaIRI = abc_data[i].C_IRI.value;
            var viaID = getCurieFromIRI(viaIRI);
            var viaLabel = abc_data[i].C_Label.value;
            via = new ClassEntity(viaID, viaIRI, viaLabel);
            }

           var target_organ = new ClassEntity("", "", "");
    
           if (abc_data[i].hasOwnProperty("Target_Organ_IRI"))
            {
            var targetOrganIRI = abc_data[i].Target_Organ_IRI.value;
            var targetOrganID = getCurieFromIRI(targetOrganIRI);
            var targetOrganLabel = abc_data[i].Target_Organ_Label.value;
            target_organ = new ClassEntity(targetOrganID, targetOrganIRI, targetOrganLabel);
            }

           var neuron_meta = NPO_NEURON_METADATA.find(obj => obj.neuronID === neuron_id);
           
           var neuron_digraph = new NeuronPathDiGraph("", "");   
           var digraph = NPO_NEURON_PATHS.find(obj=> obj.neuronID === neuron_id);
           if (digraph)
            {
              neuron_digraph = digraph;
            }

           // For neurons with synaptic forward connections

           var neuron_digraph_with_synapse = new NeuronPathDiGraph("", "");   
           var digraph_with_synapse = NPO_NEURON_PATHS_WITH_SYNAPSE.find(obj=> obj.neuronID === neuron_id);
           if (digraph_with_synapse)
            {
              neuron_digraph_with_synapse = digraph_with_synapse;
            }

           var abcData = new AtoBviaC (neuronType, origin, dest, via, neuron_meta, target_organ, 
                                       neuron_digraph, neuron_digraph_with_synapse);
           abc.push(abcData);
        }
        return abc;
  }

    function getNeuronsMetaData(neuronMetaData)
    {
        var neurons_meta = new Array();
        for (i = 0; i <neuronMetaData.length; i++)
        {
           var neuron_iri = neuronMetaData[i].Neuron_IRI.value;
           var neuron_id = getCurieFromIRI(neuron_iri);
    
           var neuron_label = "";
           if (neuronMetaData[i].hasOwnProperty("Neuron_Label"))
                neuron_label = neuronMetaData[i].Neuron_Label.value;
           
           var neuron_pref_label = "";
           if (neuronMetaData[i].hasOwnProperty("Neuron_Pref_Label"))
                neuron_pref_label = neuronMetaData[i].Neuron_Pref_Label.value;
           
           var neuron_sex = "";
           if (neuronMetaData[i].hasOwnProperty("Sex"))
                neuron_sex = neuronMetaData[i].Sex.value;
           
           var neuron_species = "";
           if (neuronMetaData[i].hasOwnProperty("Species"))
               // neuron_species = neuronMetaData[i].Species.value;
               neuron_species = sortWords(neuronMetaData[i].Species.value); // sort the species for multispecies populations.

           var neuron_phenotypes = "";
           if (neuronMetaData[i].hasOwnProperty("Phenotypes"))
           {
              if (neuronMetaData[i].Phenotypes.value === "Pre ganglionic phenotype, Sympathetic phenotype" ||
                  neuronMetaData[i].Phenotypes.value === "Sympathetic phenotype, Pre ganglionic phenotype")
                neuron_phenotypes = "Sympathetic Pre-Ganglionic phenotype";
            
              else if (neuronMetaData[i].Phenotypes.value === "Post ganglionic phenotype, Sympathetic phenotype" ||
                      neuronMetaData[i].Phenotypes.value === "Sympathetic phenotype, Post ganglionic phenotype")
                neuron_phenotypes = "Sympathetic Post-Ganglionic phenotype";
            
              else if (neuronMetaData[i].Phenotypes.value === "Post ganglionic phenotype, Parasympathetic phenotype" ||
                      neuronMetaData[i].Phenotypes.value === "Parasympathetic phenotype, Post ganglionic phenotype")
                neuron_phenotypes = "Parasympathetic Post-Ganglionic phenotype";
            
              else if (neuronMetaData[i].Phenotypes.value === "Pre ganglionic phenotype, Parasympathetic phenotype" ||
                      neuronMetaData[i].Phenotypes.value === "Parasympathetic phenotype, Pre ganglionic phenotype")
                neuron_phenotypes = "Parasympathetic Pre-Ganglionic phenotype";

              else
                neuron_phenotypes = neuronMetaData[i].Phenotypes.value;
           }
        
           var neuron_forward_connections = "";
           if (neuronMetaData[i].hasOwnProperty("Forward_Connections"))
            {
                neuron_forward_connections = neuronMetaData[i].Forward_Connections.value;
                neuron_forward_connections = getPrefixesFromIRIs(neuron_forward_connections);
            }
           
           var neuron_alert = "";
           if (neuronMetaData[i].hasOwnProperty("Alert"))
                neuron_alert = neuronMetaData[i].Alert.value;
           
           var neuron_reference = "";
           if (neuronMetaData[i].hasOwnProperty("Reference"))
                neuron_reference = neuronMetaData[i].Reference.value;
           
           var neuron_citation = "";
           if (neuronMetaData[i].hasOwnProperty("Citations"))
                neuron_citation = neuronMetaData[i].Citations.value;
           
           var neuron_diagram_link = "";
           if (neuronMetaData[i].hasOwnProperty("Diagram_Link"))
                neuron_diagram_link = neuronMetaData[i].Diagram_Link.value;      
    
           var neuron_meta_data = new NeuronMetaData (neuron_id, neuron_label, neuron_pref_label, neuron_species, neuron_sex, 
                                                      neuron_phenotypes, neuron_forward_connections, 
                                                      neuron_alert, neuron_diagram_link, neuron_reference, neuron_citation);
           neurons_meta.push (neuron_meta_data);
        }
        return neurons_meta;
    }

    // To have an ordered list of species for neuron metadata where a population is observed on multiple species.
    function sortWords(inputString) 
    {
      // split the input string into an array of words
      let words = inputString.split(', ');  
      words.sort();
      // join the sorted array back into a string
      let sortedString = words.join(', ');
      
      return sortedString;
    }

    function getPrefixesFromIRIs(uriString) 
    {
        const uris = uriString.split(", ");
  
        var replacedURIs = uris.map(uri => 
          {
            var prefix = getCurieFromIRI(uri);
            return prefix;
          });
  
        return replacedURIs.join(", ");
    }
    
    populateNeuronIDs();
    function populateNeuronIDs()
    {
       //populate the distinct set of neuron IDs for auto-complete.
       var neuron_ids = [...new Set(A_TO_B_VIA_C.map(obj => obj.neuron.ID))];
       autocomplete(document.getElementById("neuron-txt"), neuron_ids);
    }

    populateNeuronSpecies()
    function populateNeuronSpecies()
    {
        var species = [...new Set(A_TO_B_VIA_C.map(obj => obj.neuronMetaData.species))];
        autocomplete(document.getElementById("species-txt"), species);

    }

    // for multiple species seperated by comma we want to have ordered list. SPARQL group_concat does not gurantee ordering.
    // (not needed for now)
    // function sortStringsInArray(inputArray) 
    // {
    //   // Sort each string within the input array
    //   var sortedArray = inputArray.map(function(str)
    //   {
    //       // Split the string by comma, sort the parts, and join back with comma
    //       return str.split(', ').sort().join(', ');
    //   });
      
    //   return sortedArray;
    // }

    populateNeuronTergetOrgans()
    function populateNeuronTergetOrgans()
    {
        var target_organs = [...new Set(A_TO_B_VIA_C.map(obj => obj.targetOrgan.Label))];
        autocomplete(document.getElementById("organ-txt"), target_organs);
    }

    function search(event)
     {

      event.preventDefault();

      var filtered_abc = new Array(); 
      filtered_abc = A_TO_B_VIA_C;

      const neuron_id = document.getElementById("neuron-txt").value.toLowerCase().trim();
      const species_id = document.getElementById("species-txt").value.trim();
      const organ_id = document.getElementById("organ-txt").value.toLowerCase().trim();
      const phenotype = getStringAfterColon(document.getElementById("conn-phenotype").value.trim());
      const model_id = getStringAfterPipe(document.getElementById("conn-model").value.trim());
      
      const conn_origin = document.getElementById("conn-origin").value.trim();
      const conn_dest = document.getElementById("conn-dest").value.trim();
      const conn_via = document.getElementById("conn-via").value.trim();
      
      const oID =  getStringAfterPipe(conn_origin);
      const dID = getStringAfterPipe (conn_dest);
      const vID = getStringAfterPipe(conn_via);

      if (model_id !== "")
        filtered_abc = filtered_abc.filter(obj => obj.neuron.ID.includes(model_id));

      if (phenotype !== "")
        filtered_abc = filtered_abc.filter(obj => obj.neuronMetaData.phenotypes.includes(phenotype));

      if (organ_id !== "")
         filtered_abc = filtered_abc.filter(obj => obj.targetOrgan.Label.includes(organ_id));

      if (species_id !== "")
         filtered_abc = filtered_abc.filter(obj => obj.neuronMetaData.species.includes(species_id));
      
      if (neuron_id !== "")
         filtered_abc = filtered_abc.filter(obj => obj.neuron.ID.includes(neuron_id));
      
      if (oID !== "")   
          filtered_abc = filtered_abc.filter(obj => obj.origin.ID === oID);
      
      if (dID !== "")   
          filtered_abc = filtered_abc.filter(obj => obj.destination.ID === dID);
      
      if (vID !== "")   
          filtered_abc = filtered_abc.filter(obj => obj.via.ID === vID);
               
      var resultNotificationText = "";
      
      if (filtered_abc.length===0)
      {
        resultNotificationText = "<center>Search Result: No results found in SCKAN. Please verify the input fields.<br></center>";
        document.getElementById("query-result").innerHTML = resultNotificationText;
      }
      
      else
      {
        var neuron_count = [...new Set(filtered_abc.map(obj => obj.neuron.ID))].length;

        if (neuron_count === 1)
            resultNotificationText = "<center>Search Result: Found <B>" 
                                      + neuron_count + "</B> Neuron Population in SCKAN."
                                      + "</center><br>";
        else
            resultNotificationText = "<center>Search Result: Found <B>" 
                                      + neuron_count + "</B> Neuron Populations in SCKAN."
                                      + "</center><br>";    
        
        document.getElementById("query-result").innerHTML = "";
        document.getElementById("query-result").innerHTML = resultNotificationText;
      }

      var tableContainer = document.getElementById("table-container");
      var generatedTable = getPopulatedTable(filtered_abc);
      tableContainer.innerHTML = "";
      tableContainer.appendChild (generatedTable);

      const resultsEnd = document.getElementById("query-results-end");
      var endMessage = "<hr><center>End of search results.</center><br><br>"
      resultsEnd.innerHTML = endMessage;

      return;      
    }

     function getStringAfterPipe(str) 
     {
         let index = str.indexOf('|');
         if (index !== -1) {
             return str.slice(index + 1).trim();
         }
         return str.trim();
     }

     function getStringAfterColon(str) 
     {
         let index = str.indexOf(':');
         if (index !== -1) {
             return str.slice(index + 1).trim();
         }
         return str.trim();
     }

     const searchButton = document.querySelector("button", "#submit");
     searchButton.addEventListener("click", search);

return true; //return true after all the data are loaded and ready to be used by the html forms

} // End of function loadABCData(); 
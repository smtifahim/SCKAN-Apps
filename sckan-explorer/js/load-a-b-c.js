// This file contains the function called loadABCData() to load, process, search, and display the a to b via c connections 
// for the SCKAN Explorer. 

// Database and queries
// const dbName = 'NPO';
// const qry1 = a_b_via_c;
// const qry2 = npo_neuron_meta;
// const qry3 = npo_partial_order;

// Global variables
var npo_poset = new Array();
var npo_neuron_paths = new Array();
var npo_neurons_metadata = new Array();
var abc_data = new Array();
var aToBviaC = new Array();


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

// async function getNeuronsMetaDataFromDB() 
// {
//     try 
//     {
//        var queryResults = await executeDBQuery(conn, dbName, qry2);
//        return queryResults;
//     } 
//     catch (error) 
//     {
//       console.error(error);
//       alert("Satrdog is not responding with query results.");
//     }
// }

// async function getABCDataFromDB() 
// {
//     try 
//     {
//        var queryResults = await executeDBQuery(conn, dbName, qry1);
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
    npo_neurons_metadata = getNeuronsMetaData(neuronsMetaDataFromDB);

    //const poDataFromDB = await getPartialOrderDataFromDB();
    const poDataFromDB = loadJSONFromFile(json_directory + "axonal-path.json");

    npo_poset = getNPOPartialOrders(poDataFromDB);
    populateNPONeuronDiGraphs();
    
    //const abc_data = await getABCDataFromDB();
    const abc_data = loadJSONFromFile(json_directory + "a-b-via-c.json");
    aToBviaC = getAtoBviaC(abc_data);

    // console.info("ATOBVIAC"); console.log (aToBviaC);
    // console.info("Neurons MetaDATA"); console.log (npo_neurons_metadata);
    // console.info("Neurons PARTIAL ORDER"); console.log (npo_poset);
    // console.info ("NPO NEURON PATHS"); console.log (npo_neuron_paths);

    function getNPOPartialOrders(poData)
    {
      var npo_poset_data = new Array();
      for (i = 0; i <poData.length; i++)
      {
         var neuron_iri = poData[i].Neuron_IRI.value;
         var neuron_id = getCurieFromIRI(neuron_iri);
         var neuron_label = poData[i].Neuron_Label.value;
         var neuronType = new ClassEntity (neuron_id, neuron_iri, neuron_label);
         
         var v1IRI = poData[i].V1.value;
         var v1ID = getCurieFromIRI(v1IRI);
         var v1Label= poData[i].V1_Label.value;
         var v1 = new ClassEntity(v1ID, v1IRI, v1Label);
  
         var v2IRI = poData[i].V2.value;
         var v2ID = getCurieFromIRI(v2IRI);
         var v2Label= poData[i].V2_Label.value;
         var v2 = new ClassEntity(v2ID, v2IRI, v2Label);
  
         var poset = new AdjTableData (neuronType, v1, v2);
         npo_poset_data.push(poset);       
      }
      return npo_poset_data;
    }

    function getDiGraph(n_id)
    {
        var neuronAdj = npo_poset.filter(obj => obj.neuron.ID === n_id);
        var diGraph  = 'digraph {'; 
            diGraph += 'label = "[' + neuronAdj[0].neuron.ID + '] ' 
                                    + splitTextIntoLines(neuronAdj[0].neuron.Label,70) + '";\n';
        
        for (let i=0; i < neuronAdj.length; i++)
        {
            diGraph += '"' + neuronAdj[i].v1.ID + "\\n" + splitTextIntoLines(neuronAdj[i].v1.Label, 25) 
                    + '" -> "' 
                    + neuronAdj[i].v2.ID + "\\n"+ splitTextIntoLines(neuronAdj[i].v2.Label, 25) + '";\n';
        }

            diGraph += '}';

        return diGraph;
    }

    // For wrapping a long label for the nodes or the label of the neuron type in the digraph.
    function splitTextIntoLines(text, maxChar) 
    {
      let lines = [];
      let currentLine = "";
    
      // Split text into words
      const words = text.split(" ");
    
      for (let i = 0; i < words.length; i++) 
      {
        const word = words[i];
    
        if (currentLine.length + word.length + 1 <= maxChar)
        {
          // Add word to current line
          if (currentLine === "") 
          {
            currentLine = word;
          } else 
          {
            currentLine += " " + word;
          }
        } else 
        {
          // Start new line with current word
          lines.push(currentLine);
          currentLine = word;
        }
      }
      // Add last line
      lines.push(currentLine);
    
      // Join lines with newline character
      return lines.join("\\n");
    }

    function populateNPONeuronDiGraphs()
    {
      var neurons_with_poset = [...new Set(npo_poset.map(obj => obj.neuron.ID))];

      for (let i = 0; i < neurons_with_poset.length; i++)
        {
          var diGraph= getDiGraph(neurons_with_poset[i]);
          var neuronPathWithDiGraph = new NeuronPathDiGraph(neurons_with_poset[i], diGraph);
          npo_neuron_paths.push (neuronPathWithDiGraph );
        }

      // console.log (npo_neuron_paths);
      // console.log (npo_neuron_paths[0].neuronID + npo_neuron_paths[0].diGraph);
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

           var neuron_meta = npo_neurons_metadata.find(obj => obj.neuronID === neuron_id);
           
           var neuron_digraph = new NeuronPathDiGraph("", "");   
           var digraph = npo_neuron_paths.find(obj=> obj.neuronID === neuron_id);
           if (digraph){neuron_digraph = digraph;}

           var abcData = new AtoBviaC (neuronType, origin, dest, via, neuron_meta, target_organ, neuron_digraph);
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
       var neuron_ids = [...new Set(aToBviaC.map(obj => obj.neuron.ID))];
       autocomplete(document.getElementById("neuron-txt"), neuron_ids);
    }

    populateNeuronSpecies()
    function populateNeuronSpecies()
    {
        var species = [...new Set(aToBviaC.map(obj => obj.neuronMetaData.species))];
      //  var unique_species = [...new Set(sortStringsInArray(species))];
      //  autocomplete(document.getElementById("species-txt"), unique_species);
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
        var target_organs = [...new Set(aToBviaC.map(obj => obj.targetOrgan.Label))];
        autocomplete(document.getElementById("organ-txt"), target_organs);
    }

    function search(event)
     {
      event.preventDefault();
      var filtered_abc = new Array(); 
      filtered_abc = aToBviaC;

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
      tableContainer.innerHTML="";
      tableContainer.appendChild (generatedTable);
      // tableContainer.innerHTML = getPopulatedTable(filtered_abc).outerHTML;


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
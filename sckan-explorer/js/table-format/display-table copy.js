function getPopulatedTable(data)
{
  // create table element
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "1250px";
  table.style.border = "1px solid black";

  // create a map to group data by neuron ID
  const neuronDataMap = new Map();
  for (const datum of data)
  {
    if (!neuronDataMap.has(datum.neuron.ID))
    {
      neuronDataMap.set(datum.neuron.ID, []);
    }
    neuronDataMap.get(datum.neuron.ID).push(datum);
  }

  // loop through neuron data and add rows to table
  for (var [neuronId, neuronData] of neuronDataMap)
  {
    // store axonal path for the neuron as a graph
    var gData = neuronData[0].diGraph.axonalPath;
    
    // create neuron row
    const neuronRow = document.createElement("tr"); //panelRow
    neuronRow.classList.add('panel');

    const neuronHeader = document.createElement("th"); //headerCell
    neuronHeader.classList.add('panel-header');
    neuronHeader.colSpan = 6;
    
    if (gData !== "")
      neuronHeader.innerHTML = `Neuron Population: ${neuronId}` + '<font color="#C0F0FB"> [Click to Visualize]</font>';
    else
      neuronHeader.innerHTML = `Neuron Population: ${neuronId}`; 
    
      neuronHeader.style.border = "1px solid black";
    neuronHeader.style.backgroundColor = "black";

    neuronRow.appendChild(neuronHeader);

    const vizRow = document.createElement("tr"); //panelBodyRow
    if (gData !== "")
    {
      neuronHeader.addEventListener('click', () => {
        togglePanel(vizRow);
      });
      
     // neuronRow.appendChild(neuronHeader);

      //const vizRow = document.createElement("tr"); //panelBodyRow
      vizRow.classList.add('panel-body');
      vizRow.style.display = 'none';

      const vizData = document.createElement("td"); //contentCell
      vizData.style.border = "1px solid black";
      vizData.colSpan = 6;
      const div = document.createElement('div');
      div.id = "graphContainer";
    
      var graphSVG = Viz(gData);
      div.innerHTML = graphSVG;

      vizData.appendChild(div);    
      vizRow.appendChild (vizData);
    }

    table.appendChild(neuronRow);

    var neuronDataRow = document.createElement("tr");
    neuronDataRow.style.backgroundColor = "#EFF5FB";
    var neuronMetaData = document.createElement("td");
    neuronMetaData.style.border = "1px solid black";
    neuronMetaData.colSpan = 6;
    var nmdata = getFormattedNeuronMetaData(neuronData[0].neuronMetaData);
    neuronMetaData.innerHTML = nmdata;
    neuronDataRow.appendChild (neuronMetaData);
    
    table.appendChild (neuronDataRow);
    table.appendChild(vizRow);
   
    const locationHeaderRow = document.createElement("tr");
    locationHeaderRow.style.backgroundColor = "#A9D0F5";
    locationHeaderRow.style.border = "1px solid black";
    
    const originHeader = document.createElement("th");
    originHeader.style.border = "1px solid black";
    originHeader.innerText = "Origin";
    locationHeaderRow.appendChild(originHeader);

    const originIDHeader = document.createElement("th");
    originIDHeader.style.border = "1px solid black";
    originIDHeader.innerText = "Origin ID";
    locationHeaderRow.appendChild(originIDHeader);
    
    const destinationHeader = document.createElement("th");
    destinationHeader.style.border = "1px solid black";
    destinationHeader.innerText = "Destination";
    locationHeaderRow.appendChild(destinationHeader);

    const destinationIDHeader = document.createElement("th");
    destinationIDHeader.style.border = "1px solid black";
    destinationIDHeader.innerText = "Destination ID";
    locationHeaderRow.appendChild(destinationIDHeader);
    
    const viaHeader = document.createElement("th");
    viaHeader.style.border = "1px solid black";
    viaHeader.innerText = "Via";
    locationHeaderRow.appendChild(viaHeader);

    const viaIDHeader = document.createElement("th");
    viaIDHeader.style.border = "1px solid black";
    viaIDHeader.innerText = "Via ID";
    locationHeaderRow.appendChild(viaIDHeader);

    table.appendChild(locationHeaderRow);

    // create rows for each origin, destination, and via
    for (const datum of neuronData) 
    {
      const dataRow = document.createElement("tr");
      dataRow.style.backgroundColor = "#EFF5FB";
      
      const origin = document.createElement("td");
      origin.style.border = "1px solid black";
      origin.innerText = datum.origin.Label;
      dataRow.appendChild(origin);

      const origin_id = document.createElement("td");
      origin_id.style.border = "1px solid black";
      origin_id.innerHTML = '<a href ="' + datum.origin.IRI + '" target="_blank">' 
                                      + datum.origin.ID + '</a>';
      dataRow.appendChild(origin_id);

      
      const destination = document.createElement("td");
      destination.style.border = "1px solid black";
      destination.innerText = datum.destination.Label || "-";
      dataRow.appendChild(destination);

      const dest_id = document.createElement("td");
      dest_id.style.border = "1px solid black";
      dest_id.innerHTML = '<a href ="' + datum.destination.IRI + '" target="_blank">' 
                                       + datum.destination.ID + '</a>';
      dataRow.appendChild(dest_id);

      
      const via = document.createElement("td");
      via.style.border = "1px solid black";
      via.innerText = datum.via ? datum.via.Label : "-";
      dataRow.appendChild(via);

      const via_id = document.createElement("td");
      via_id.style.border = "1px solid black";
      via_id.innerHTML = '<a href ="' + datum.via.IRI + '" target="_blank">' 
                                       + datum.via.ID + '</a>';
      dataRow.appendChild(via_id);

      table.appendChild(dataRow);
       
    }
    const emptyRow = document.createElement("tr");
    const emptyData = document.createElement("td")
    emptyData.colSpan = 6;
    emptyData.style.border = "1px solid transparent";
   // emptyData.innerText = neuronData[0].diGraph.axonalPath;
    emptyData.innerHTML = "";
    emptyRow.appendChild(emptyData);
    
    table.appendChild(emptyRow);

  }

  function getFormattedNeuronMetaData(nmdata)
  {
      var text = "<strong>Label:</strong> " + nmdata.neuronLabel +
                 "<hr><strong>Phenotype(s):</strong> " + nmdata.phenotypes;
      if (nmdata.species !== "")
        text += "<hr><b>Species:</b> " + nmdata.species;
      if (nmdata.sex !== "")
        text += "; <b>Sex:</b> " + nmdata.sex;
      if (nmdata.forwardConnections !=="")
        text += "<hr><b>Forward Connection(s):</b> " + nmdata.forwardConnections;
      if (nmdata.reference !== "")
        text += "<hr><b>Reference:</b> " + addHyperlinksToURIs(nmdata.reference);
      if (nmdata.alert != "")
        text += "<hr><b>Alert Note:</b> " + addHyperlinksToURIs(nmdata.alert);
  
     // text = JSON.stringify(nmdata);
      text += "<br></br>"

      return text;
  }

  function addHyperlinksToURIs(text) 
  {
    // Regular expression to match URIs ignoring punctuation charecters or any braces 
    // at the end of a url within the texts
    const uriRegex = /(https?:\/\/[^\s,:]+[^\s.)},;:])/g;
    
    // Replace URIs with hyperlinks
    const result = text.replace(uriRegex, '<a href="$&" target="_blank">$&</a>');
    
    return result;
  }

  return table;
}

  // Toggle the display of panel body
function togglePanel(panelBodyRow)
{
    panelBodyRow.style.display = panelBodyRow.style.display === 'none' ? 'table-row' : 'none';
}
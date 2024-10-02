function getPopulatedTable(data) 
{
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "1250px";
  table.style.border = "1px solid black";

  const neuronDataMap = groupDataByNeuronID(data);

  for (const [neuronId, neuronData] of neuronDataMap) 
  {
    var gData = neuronData[0].diGraph.axonalPath;
    const vizRow = createVizRow(gData);
    const neuronRow = createNeuronRow(neuronId, gData, vizRow);
    const neuronDataRow = createNeuronDataRow(neuronData[0].neuronMetaData);
    const locationHeaderRow = createLocationHeaderRow();
    table.append(
      neuronRow,
      neuronDataRow,
      vizRow,
      locationHeaderRow,
      ...createDataRows(neuronData)
    );
    table.appendChild(createEmptyRow());
  }

  return table;
}

function groupDataByNeuronID(data)
{
  const neuronDataMap = new Map();
  for (const datum of data) {
    if (!neuronDataMap.has(datum.neuron.ID)) {
      neuronDataMap.set(datum.neuron.ID, []);
    }
    neuronDataMap.get(datum.neuron.ID).push(datum);
  }
  return neuronDataMap;
}

function createNeuronRow(neuronId, gData, vizRow)
{
  const neuronRow = createTableRow("panel");
  const neuronHeader = createTableHeader("panel-header");
  neuronHeader.colSpan = 6;
  neuronHeader.innerHTML = `Neuron Population: ${neuronId}`;
  if (gData !== "") {
    neuronHeader.innerHTML += ' <font color="#C0F0FB">[Click to Visualize]</font>';
    neuronHeader.addEventListener('click', () => togglePanel(vizRow));
  }
  neuronHeader.style.border = "1px solid black";
  neuronHeader.style.backgroundColor = "black";
  neuronRow.appendChild(neuronHeader);
  return neuronRow;
}

function createVizRow(gData)
{
  if (gData !== "") {
    const vizRow = createTableRow("panel-body");
    vizRow.style.display = 'none';
    const vizData = createTableData("");
    vizData.style.border = "none";
    vizData.colSpan = 6;
    const div = document.createElement('div');
    div.id = "graphContainer";
    const graphSVG = Viz(gData); //calling the Viz constructor from GraphViz's viz.js
    div.innerHTML = graphSVG;
    vizData.appendChild(div);
    vizRow.appendChild(vizData);
    return vizRow;
  }
  return document.createElement("tr");
}

function createNeuronDataRow(neuronMetaData)
{
  const neuronDataRow = createTableRow();
  neuronDataRow.style.backgroundColor = "#EFF5FB";
  const neuronMetaDataCell = createTableData();
  neuronMetaDataCell.colSpan = 6;
  neuronMetaDataCell.innerHTML = getFormattedNeuronMetaData(neuronMetaData);
  neuronDataRow.appendChild(neuronMetaDataCell);
  return neuronDataRow;
}

function createLocationHeaderRow()
{
  const locationHeaderRow = createTableRow();
  locationHeaderRow.style.backgroundColor = "#A9D0F5";
  locationHeaderRow.style.border = "1px solid black";

  const headers = [
    "Origin",
    "Origin ID",
    "Destination",
    "Destination ID",
    "Via",
    "Via ID"
  ];

  for (const headerText of headers) {
    const headerCell = createTableHeader();
    headerCell.innerText = headerText;
    headerCell.style.border = "1px solid black";
    locationHeaderRow.appendChild(headerCell);
  }

  return locationHeaderRow;
}

// function createDataRows(neuronData)
// {
//   return neuronData.map(datum => {
//     const dataRow = createTableRow();
//     dataRow.style.backgroundColor = "#EFF5FB";
//     dataRow.appendChild(createTableData(datum.origin.Label));
//     dataRow.appendChild(createTableData(createLink(datum.origin.IRI, datum.origin.ID)));
//     dataRow.appendChild(createTableData(datum.destination.Label || "-"));
//     dataRow.appendChild(createTableData(createLink(datum.destination.IRI, datum.destination.ID)));
//     dataRow.appendChild(createTableData(datum.via ? datum.via.Label : "-"));
//     dataRow.appendChild(createTableData(createLink(datum.via.IRI, datum.via.ID)));
//     return dataRow;
//   });
// }

// To create unique rows for each population.
function createDataRows(neuronData) 
{
  const uniqueData = new Set();

  return neuronData
    .filter(datum => {
      // creating a unique key for each row, ensuring all relevant fields are consistently represented
      const key = [
        datum.origin.Label || "",
        datum.origin.IRI || "",
        datum.origin.ID || "",
        datum.destination.Label || "-",
        datum.destination.IRI || "",
        datum.destination.ID || "",
        datum.via ? datum.via.Label || "-" : "-",
        datum.via ? datum.via.IRI || "" : "",
        datum.via ? datum.via.ID || "" : ""
      ].join("|"); // joining all parts with a delimiter to form a unique string

      // Check if the key is already in the Set
      if (uniqueData.has(key)) {
        return false; // if duplicate is found, filter it out
      } else {
        uniqueData.add(key); // Add the key to the Set
        return true; // Include the row
      }
    })
    .map(datum => {
      const dataRow = createTableRow();
      dataRow.style.backgroundColor = "#EFF5FB";
      dataRow.appendChild(createTableData(datum.origin.Label));
      dataRow.appendChild(createTableData(createLink(datum.origin.IRI, datum.origin.ID)));
      dataRow.appendChild(createTableData(datum.destination.Label || "-"));
      dataRow.appendChild(createTableData(createLink(datum.destination.IRI, datum.destination.ID)));
      dataRow.appendChild(createTableData(datum.via ? datum.via.Label : "-"));
      dataRow.appendChild(createTableData(createLink(datum.via.IRI, datum.via.ID)));
      return dataRow;
    });
}

function createEmptyRow()
{
  const emptyRow = createTableRow();
  const emptyData = createTableData();
  emptyData.colSpan = 6;
  emptyData.style.border = "1px solid transparent";
  emptyRow.appendChild(emptyData);
  return emptyRow;
}

// function getFormattedNeuronMetaData(nmdata) 
// {
//   let text = `<strong>Label:</strong> ` + nmdata.neuronLabel;

//   if (nmdata.neuronPrefLabel !== "")
//     text +=  `<hr><strong>Preferred Label</strong><pre>  </pre>` + nmdata.neuronPrefLabel; 

//   text += `<hr><strong>Phenotype(s):</strong>` + nmdata.phenotypes;
//   if (nmdata.species !== "")
//     text += `<hr><b>Species:</b>` +  nmdata.species;

//   if (nmdata.sex !== "")
//     text += `; <b>Sex:</b>` + nmdata.sex;
  
//   if (nmdata.forwardConnections !== "")
//     text += `<hr><b>Forward Connection(s):</b>` +  nmdata.forwardConnections;
  
//   if (nmdata.reference !== "")
//     text += `<hr><b>Reference:</b>` +  addHyperlinksToURIs(nmdata.reference);
  
//   if (nmdata.alert !== "")
//     text += `<hr><b>Alert Note:</b>` + addHyperlinksToURIs(nmdata.alert);

//   text += "<br>";
//   return text;
// }

function getFormattedNeuronMetaData(nmdata) 
{
  let table = `<table style="border-collapse: collapse; width: 100%;">`;

  table += `<tr><td style="font-weight: bold; width: 25px;">Label</td>`;
  table += `<td style="width:90%">${nmdata.neuronLabel}</td></tr>`;

  // Will need to consider if we want the label to be displayed in title case
  // table += `<td style="width:90%">${convertToTitleCase(nmdata.neuronLabel)}</td></tr>`;

  if (nmdata.neuronPrefLabel !== "") 
  {
    table += `<tr><td style="font-weight: bold;">Preferred Label</td>`;
    table += `<td>${convertToTitleCase(nmdata.neuronPrefLabel)}</td></tr>`;
    
    // Will need to consider if we want the pref label to be displayed in title case
    // table += `<td>${convertToTitleCase(nmdata.neuronPrefLabel)}</td></tr>`;
  }

  table += `<tr><td style="font-weight: bold;">Phenotype(s)</td>`;
  table += `<td>${nmdata.phenotypes}</td></tr>`;

  if (nmdata.species !== "")
  {
    table += `<tr><td style="font-weight: bold;">Species</td>`;
    table += `<td>${nmdata.species}`;
    if (nmdata.sex !== "")
      table += `; <b>Sex:</b> ${convertToTitleCase(nmdata.sex)}`;
    table += `</td></tr>`;
  }

  // if (nmdata.sex !== "") {
  //   table += `<tr><td style="font-weight: bold;">Sex:</td>`;
  //   table += `<td>${titleCase(nmdata.sex)}</td></tr>`;
  // }

  if (nmdata.forwardConnections !== "")
  {
    table += `<tr><td style="font-weight: bold;">Forward Connection(s)</td>`;
    table += `<td>${nmdata.forwardConnections}</td></tr>`;
  }

  if (nmdata.diagramLink !== "")
  {
      table += `<tr><td style="font-weight: bold;">Model Diagram</td>`;
      table += `<td>${addHyperlinksToURIs(nmdata.diagramLink)}</td></tr>`;
  }

  if (nmdata.reference !== "")
  {
    table += `<tr><td style="font-weight: bold;">Reference</td>`;
    table += `<td>${addHyperlinksToURIs(nmdata.reference)}</td></tr>`;
  }

  if (nmdata.citation !== "")
    {
      table += `<tr><td style="font-weight: bold;">Citations</td>`;
      table += `<td>${addHyperlinksToURIs(nmdata.citation)}</td></tr>`;
    }

  if (nmdata.alert !== "")
  {
    table += `<tr><td style="font-weight: bold;">Alert Note</td>`;
    table += `<td>${addHyperlinksToURIs(nmdata.alert)}</td></tr>`;
  }

  table += `</table>`;
  return table;
}

// function titleCase(str) 
// {
//   return str.toLowerCase().split(' ').map(function(word) {
//     return word.replace(word[0], word[0].toUpperCase());
//   }).join(' ');
// }

function convertToTitleCase(sentence)
{
  const smallWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'with',
                      'via', 'on', 'at', 'to', 'from', 'by', 'in', 'of'];
  const words = sentence.toLowerCase().split(/[\s,]+/);

  for (let i = 0; i < words.length; i++) 
  {
    const word = words[i];

    if (i === 0 || !smallWords.includes(word)) 
    {
      // Check if the word matches the pattern "X1-X9" or "X1-XN"
      if (/^[a-z]\d+(-[a-z]\d+|-[a-z]n)?$/.test(word)) 
      {
        words[i] = word.toUpperCase(); // Preserve the pattern in uppercase
      } 
      else 
      {
        words[i] = word.charAt(0).toUpperCase() + word.slice(1); // Convert other words to title case
      }
    }
  }

  return words.join(' ');
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


function togglePanel(panelBodyRow)
{
  panelBodyRow.style.display = panelBodyRow.style.display === 'none' ? 'table-row' : 'none';
}

function createTableRow(className)
{
  const row = document.createElement("tr");
  if (className) {
    row.classList.add(className);
  }
  return row;
}

function createTableHeader(className)
{
  const header = document.createElement("th");
  if (className) {
    header.classList.add(className);
  }
  return header;
}

function createTableData(content)
{
  const data = document.createElement("td");
  data.style.border = "1px solid black";
  if (content) {
    data.innerHTML = content;
  }
  return data;
}

function createLink(href, text)
{
  return `<a href="${href}" target="_blank">${text}</a>`;
}

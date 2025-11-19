// Ensure getIRIFromCurie is available
if (typeof getIRIFromCurie === 'undefined') {
  // For browser environments, try to get from window if loaded globally
  if (typeof window !== 'undefined' && window.getIRIFromCurie) {
    var getIRIFromCurie = window.getIRIFromCurie;
  }
}

// Return the populated table based on the search filters.
// the data represents an array of 'AtoBviaC' class instances
function getPopulatedTable(data)
{
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "65%";
  table.style.border = "1px solid black";
 // table.style.borderRadius = "8px";
 //  table.style.overflow = "hidden";


  // Ensure progress bar exists in DOM
  let progressContainer = document.getElementById("search-progress-container");
  if (!progressContainer) {
    progressContainer = document.createElement("div");
    progressContainer.id = "search-progress-container";
    progressContainer.style.display = "block";
    progressContainer.style.width = "100%";
    progressContainer.style.background = "#f3f3f3";
    progressContainer.style.marginBottom = "10px";
    const bar = document.createElement("div");
    bar.id = "search-progress-bar";
  bar.style.width = "0%";
  // Remove inline height to allow CSS to control thickness
  bar.style.background = "DodgerBlue";
    progressContainer.appendChild(bar);
    // Insert before the table if possible, else at top of body
    if (document.body.contains(table)) {
      document.body.insertBefore(progressContainer, table);
    } else {
      document.body.insertBefore(progressContainer, document.body.firstChild);
    }
  } else {
    progressContainer.style.display = "block";
    const bar = document.getElementById("search-progress-bar");
    if (bar) bar.style.width = "0%";
  }
  updateSearchProgress(0);

  const neuronDataMap = groupDataByNeuronID(data);
  
  const totalProgress = neuronDataMap.size; //number of neuron populations
  let currentProgress = 0;
  
  for (const [neuronId, neuronData] of neuronDataMap) {
    var metaData = neuronData[0].neuronMetaData;
    const vizRow = createVizRow(neuronData);
    const neuronRow = createNeuronRow(neuronId, neuronData[0], vizRow);
    const neuronDataRow = createNeuronDataRow(metaData);

    // Create a self-contained table for the location data
    const locationTable = document.createElement("table");
    locationTable.classList.add("location-table");
    locationTable.style.width = "100%";
    locationTable.style.marginTop = "0px";
    locationTable.style.marginBottom = "24px";
    // Add header and data rows to the location table
    locationTable.appendChild(createLocationHeaderRow());
    const dataRows = Array.from(createDataRows(neuronData));
    const maxVisibleRows = 8;
    let rowIndex = 0;
    for (const row of dataRows) {
      if (rowIndex >= maxVisibleRows) {
        row.classList.add("location-table-hidden-row");
        row.style.display = "none";
      }
      locationTable.appendChild(row);
      rowIndex++;
    }
    console.log(`Total data rows: ${dataRows.length}, Hidden rows: ${dataRows.length - maxVisibleRows}`);

    // Add expand/collapse button if there are more than maxVisibleRows
    if (dataRows.length > maxVisibleRows) {
      const expandButtonRow = document.createElement("tr");
      expandButtonRow.classList.add("location-table-expand-row");
      const expandButtonCell = document.createElement("td");
      expandButtonCell.colSpan = 7;
      expandButtonCell.style.textAlign = "center";
      expandButtonCell.style.padding = "8px";
      expandButtonCell.style.backgroundColor = "#f8fbff";

      const expandButton = document.createElement("button");
      expandButton.innerHTML = `<b>Show ${dataRows.length - maxVisibleRows} more rows ▼</b>`;
      expandButton.className = "rounded-button";
      expandButton.style.fontSize = "14px";
      expandButton.style.padding = "6px 12px";
      expandButton.style.backgroundColor = "#2E9AFE";
      expandButton.style.color = "#fff";

      let isExpanded = false;
      expandButton.addEventListener("click", function() {
        const hiddenRows = locationTable.querySelectorAll(".location-table-hidden-row");
        isExpanded = !isExpanded;
        hiddenRows.forEach(row => {
          row.style.display = isExpanded ? "" : "none";
        });
        expandButton.innerHTML = isExpanded
          ? "<b>Show less ▲</b>"
          : `<b>Show ${dataRows.length - maxVisibleRows} more rows ▼</b>`;
      });

      expandButtonCell.appendChild(expandButton);
      expandButtonRow.appendChild(expandButtonCell);
      locationTable.appendChild(expandButtonRow);
    }

    // Append all rows/tables for this population to the main table
    table.append(
      neuronRow,
      neuronDataRow,
      vizRow
    );
    // Insert the location table as a full-width row
    const locationTableRow = document.createElement("tr");
    const locationTableCell = document.createElement("td");
    locationTableCell.colSpan = 7;
    locationTableCell.style.paddingTop = "0px";
    locationTableCell.style.paddingBottom = "8px";
    locationTableCell.appendChild(locationTable);
    locationTableRow.appendChild(locationTableCell);
    table.appendChild(locationTableRow);

    table.appendChild(createEmptyRow());

    currentProgress++;
    console.log(" Progress+ "+ (currentProgress/totalProgress)*100);
    updateSearchProgress((currentProgress/totalProgress) * 100);
    // Throttle progress bar update to visually match chunking speed
    const start = Date.now();
    while (Date.now() - start < 3) {} // ~5ms delay per update
  }

  return table;
}

function groupDataByNeuronID(data)
{
  const neuronDataMap = new Map();
  for (const datum of data)
  {
    if (!neuronDataMap.has(datum.neuron.ID))
    {
      neuronDataMap.set(datum.neuron.ID, []);
    }
    neuronDataMap.get(datum.neuron.ID).push(datum);
  }
  return neuronDataMap;
}

function createNeuronRow(neuronId, neuronData, vizRow)
{
  const neuronRow = createTableRow("panel");

  const neuronHeader = createTableHeader("panel-header");
  neuronHeader.colSpan = 7;
  neuronHeader.style.cursor = 'default';
  neuronHeader.style.borderCollapse = "collapse";
 // neuronHeader.style.borderTopLeftRadius = "8px";
 // neuronHeader.style.borderTopRightRadius = "8px";
  neuronHeader.style.overflow = "hidden";

  neuronHeader.innerHTML = `Population: ${neuronId}`;

  var gData = neuronData.diGraph.axonalPath;
  // Add Visualize button if graph data exists
  if (gData !== "") {
    const visualizeButton = document.createElement('button');
    visualizeButton.innerHTML = '<b>Visualize</b>';
    visualizeButton.style.backgroundColor = "#d0eaf6ff";
    visualizeButton.style.color = "#05154fff";
    visualizeButton.style.border = "none";
    visualizeButton.style.borderRadius = "8px";
    visualizeButton.style.padding = "8px 16px";
    visualizeButton.style.fontSize = "14px";
    visualizeButton.style.fontWeight = "600";
    visualizeButton.style.cursor = 'pointer';
    visualizeButton.style.marginLeft = '10px';
    visualizeButton.style.transition = "all 0.2s ease";
    visualizeButton.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    visualizeButton.addEventListener('mouseenter', function() {
      this.style.backgroundColor = "#abfff9ff";
      this.style.transform = "translateY(-1px)";
      this.style.boxShadow = "0 4px 6px rgba(0,0,0,0.15)";
    });
    visualizeButton.addEventListener('mouseleave', function() {
      this.style.backgroundColor = "#abe6ffff";
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    });
    visualizeButton.addEventListener('click', () => togglePanel(vizRow));
    neuronHeader.appendChild(visualizeButton);
  }

  // Add Edit In Composer button if composerURI exists
  if (neuronData.neuronMetaData && neuronData.neuronMetaData.composerURI && neuronData.neuronMetaData.composerURI.trim() !== "") {
    const editButton = document.createElement('button');
    editButton.innerHTML = '<b>Edit in Composer</b>';
    editButton.style.backgroundColor = "#cfddf2ff";
    editButton.style.color = "#1d1b1bff";
    editButton.style.border = "none";
    editButton.style.borderRadius = "8px";
    editButton.style.padding = "8px 16px";
    editButton.style.fontSize = "14px";
    editButton.style.fontWeight = "600";
    editButton.style.cursor = 'pointer';
    editButton.style.float = 'right';
    editButton.style.marginRight = '10px';
    editButton.style.transition = "all 0.2s ease";
    editButton.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    editButton.addEventListener('mouseenter', function() {
      this.style.backgroundColor = "#f9d266ff";
      this.style.transform = "translateY(-1px)";
      this.style.boxShadow = "0 4px 6px rgba(0,0,0,0.15)";
    });
    editButton.addEventListener('mouseleave', function() {
      this.style.backgroundColor = "#cfddf2ff";
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    });
    editButton.addEventListener('click', (e) => {
      e.stopPropagation();
      window.open(neuronData.neuronMetaData.composerURI, '_blank');
    });
    neuronHeader.appendChild(editButton);
  }

  neuronHeader.style.border = "1px solid black";
  neuronHeader.style.backgroundColor = "black";
  neuronRow.appendChild(neuronHeader);
  return neuronRow;
}

//function createVizRow(gData, gDataWithSynapse, hasSynapse)
function createVizRow(neuronData)
{
  const gData = neuronData[0];
  const hasSynapse = neuronData[0].neuronMetaData.forwardConnections;
  
  if (gData.diGraph.axonalPath !== "")
  {
    const vizRow = createTableRow("panel-body");
    vizRow.style.display = 'none';
    
    const vizData = createTableData("");
    vizData.style.border = 'none';
    vizData.colSpan = 6;
    
    const synapseCheckbox = getSynapseCheckBox();
    vizData.appendChild(synapseCheckbox);    
    synapseCheckbox.style.display = 'none'; //hide checkbox

    if (hasSynapse !== "")
    {
      synapseCheckbox.style.display = 'block'; //show checkbox
    }    
      
    // Create a containers for the toggle viz
    var divNonSynapse = document.createElement('div');
    divNonSynapse.id = "divNonSynapse";
    divNonSynapse.appendChild(getVizWithoutSynapse(gData));
    divNonSynapse.style.display = 'block'; // Initially show divNonSynapse
   
    var divSynapse = document.createElement('div');
    divSynapse.id = "divSynapse";
    divSynapse.appendChild (getVizWithSynapse(gData));
    divSynapse.style.display = 'none'; // Initially hide divSynapse

    vizData.appendChild(divSynapse);
    vizData.appendChild(divNonSynapse);
    
     // Toggle effect for the checkbox
    synapseCheckbox.firstChild.addEventListener('change', function ()
    {
        if (this.checked)
        {      
          divSynapse.style.display = 'block'; // show viz
          divNonSynapse.style.display = 'none'; //hide viz
        }
        else
        {
          divSynapse.style.display = 'none'; // hide viz
          divNonSynapse.style.display = 'block'; //show viz
        }
    });

    vizData.appendChild(getVizLegend());   
    vizRow.appendChild(vizData);
    
    return vizRow;
  }
  return document.createElement("tr");
}

function getVizWithoutSynapse(gData)
{
  const div = document.createElement('div');
  div.id = "graphWithoutSynapse";
  div.style = "display: flex; justify-content: center";
  
  const graphSVG = Viz(gData.diGraph.axonalPath); //calling the Viz constructor from GraphViz's viz.js
  div.innerHTML = graphSVG;
  
  return div;
}

function getVizWithSynapse(gData)
{
  const div = document.createElement('div');
  div.id = "graphWithSynapse";
  div.style = "display: flex; justify-content: center";
  
  const graphSVG = Viz(gData.diGraphSynapse.axonalPath); //calling the Viz constructor from GraphViz's viz.js
  div.innerHTML = graphSVG;

  return div;
}

function getSynapseCheckBox() 
{
  const synapseDiv = document.createElement('div');
  synapseDiv.id = 'syn-div';
  synapseDiv.style = `display: flex; justify-content: center; align-items: center;
                       margin: 10px auto 20px auto; width: fit-content;`;

  const synapseCheckbox = document.createElement('input');
  synapseCheckbox.type = 'checkbox';
  synapseCheckbox.id = 'synapseCheckbox';
  synapseCheckbox.style.width = '25px';
  synapseCheckbox.style.height = '25px';
  synapseCheckbox.style.verticalAlign = 'middle';

  const synapseLabel = document.createElement('label');
  synapseLabel.htmlFor = 'synapseCheckbox';
  synapseLabel.innerText = 'Show Synaptic Connections';
  synapseLabel.style.backgroundColor = '#C0F0FB'; 
  synapseLabel.style.color = 'black';        
  synapseLabel.style.padding = '5px 5px';
  synapseLabel.style.cursor = 'pointer';
  synapseLabel.style.verticalAlign = 'middle';

  // append checkbox and label to synapseDiv
  synapseDiv.appendChild(synapseCheckbox);
  synapseDiv.appendChild(synapseLabel);

  return synapseDiv;
}

function getVizLegend()
{
  const vizLegend = `digraph G 
                    {   
                        subgraph cluster_legend 
                        {
                            rankdir=LR; // Left-to-right layout for the legend
                            label = "Legend";
                            fontsize = 12;
                            shape = "rect";
                            style = "rounded, dotted"; // Dashed box around the legend
                            legend_synapse [label="Synapse\nLocation", fontsize=12, shape=rect, style="rounded, filled", fillcolor="#eefaec", peripheries=2, color=black];
                            legend_axon_sensory_terminal [label="Sensory\nTerminal", fontsize=12, shape=rect, color=red];
                            legend_axon_terminal [label="Axon\nTerminal", fontsize=12, shape=rect, style="rounded, diagonals, filled", fillcolor="#feeeee", color=red];
                            legend_axon [label="Axon\nLocation", fontsize=12, shape=rect, style="rounded, filled, dashed", fillcolor="#ecf1fe" color=black];
                            legend_soma [label="Soma\nLocation", fontsize=12, shape=rect, style="rounded, filled", fillcolor="#eefaec", color=black];
                        }
                    }`
  
  const div = document.createElement('div');

  div.id = "graphLegend"; div.style="display: flex; justify-content: center;"
  const graphSVG = Viz(vizLegend); //calling the Viz constructor from GraphViz's viz.js
  div.innerHTML = graphSVG;
  
  return div;
}

function createNeuronDataRow(neuronMetaData)
{
  const neuronDataRow = createTableRow();
  neuronDataRow.style.backgroundColor = "#ffffff";
  neuronDataRow.style.borderBottom = "none";

  const neuronMetaDataCell = createTableData();
  neuronMetaDataCell.colSpan = 7;
  neuronMetaDataCell.style.paddingTop = "4px";
  neuronMetaDataCell.style.paddingBottom = "0px";
  neuronMetaDataCell.style.borderBottom = "none";
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
    "Via",
    "Via ID",
    "Terminal",
    "Terminal ID",
    "Target Organ",
  ];

  for (const headerText of headers) {
    const headerCell = createTableHeader();
    headerCell.innerText = headerText;
    if (headerText === "Origin ID" || headerText === "Via ID" || headerText === "Terminal ID")
    {
       headerCell.classList.add('hide-col');
    }
    headerCell.style.border = "1px solid black";
    locationHeaderRow.appendChild(headerCell);
  }

  return locationHeaderRow;
}

// To create unique rows for each population.
function createDataRows(neuronData) 
{
  const uniqueData = new Set();

  let rowIndex = 0;
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
      ].join("|");
      if (uniqueData.has(key)) {
        return false;
      } else {
        uniqueData.add(key);
        return true;
      }
    })
    .map(datum => {
      const dataRow = createTableRow();
      // Add alternating row class for zebra striping
      if (rowIndex % 2 === 1) {
        dataRow.classList.add('alt-row');
      }
      rowIndex++;
      // Origin label as clickable link (region/layer aware)

      // Origin label as clickable link using the same logic as the ID column (region/layer aware)
      dataRow.appendChild(createTableData(createLink(datum.origin.ID, datum.origin.Label)));
      // Origin ID as before (CURIE/ID), hidden
      const originIdCell = createTableData(createLink(datum.origin.ID, datum.origin.ID));
      originIdCell.classList.add('hide-col');
      dataRow.appendChild(originIdCell);
      // Via label as clickable link using the same logic as the ID column (region/layer aware)
      if (datum.via && datum.via.Label) {
        dataRow.appendChild(createTableData(createLink(datum.via.ID, datum.via.Label)));
      } else {
        dataRow.appendChild(createTableData("-"));
      }
      // Via ID as before (CURIE/ID), hidden
      if (datum.via && datum.via.ID) {
        const viaIdCell = createTableData(createLink(datum.via.ID, datum.via.ID));
        viaIdCell.classList.add('hide-col');
        dataRow.appendChild(viaIdCell);
      } else {
        const emptyViaIdCell = createTableData("");
        emptyViaIdCell.classList.add('hide-col');
        dataRow.appendChild(emptyViaIdCell);
      }
      // Terminal label as clickable link using the same logic as the ID column (region/layer aware)
      dataRow.appendChild(createTableData(createLink(datum.destination.ID, datum.destination.Label || "-")));
      // Terminal ID as before (CURIE/ID), hidden
      const terminalIdCell = createTableData(createLink(datum.destination.ID, datum.destination.ID));
      terminalIdCell.classList.add('hide-col');
      dataRow.appendChild(terminalIdCell);

      // dataRow.appendChild(createTableData(createLink(datum.origin.IRI, datum.origin.Label)));
      // // Origin ID as before
      // dataRow.appendChild(createTableData(createLink(datum.origin.IRI, datum.origin.ID)));
      // // Via label as clickable link (region/layer aware)
      // if (datum.via && datum.via.Label) {
      //   dataRow.appendChild(createTableData(createLink(datum.via.IRI, datum.via.Label)));
      // } else {
      //   dataRow.appendChild(createTableData("-"));
      // }
      // // Via ID as before
      // if (datum.via && datum.via.ID) {
      //   dataRow.appendChild(createTableData(createLink(datum.via.IRI, datum.via.ID)));
      // } else {
      //   dataRow.appendChild(createTableData(""));
      // }
      // // Terminal label as clickable link (region/layer aware)
      // dataRow.appendChild(createTableData(createLink(datum.destination.IRI, datum.destination.Label || "-")));
      // Terminal ID as before
     // dataRow.appendChild(createTableData(createLink(datum.destination.IRI, datum.destination.ID)));
      // Target Organ column: comma-separated clickable links, one cell only
      let organsToShow = [];
      if (datum.destination && datum.destination.ID) {
        const matchingRows = neuronData.filter(d => d.destination && d.destination.ID === datum.destination.ID);
        const seen = new Set();
        for (const d of matchingRows) {
          if (d.targetOrgan && d.targetOrgan.IRI && d.targetOrgan.Label) {
            const key = d.targetOrgan.IRI + '|' + d.targetOrgan.Label;
            if (!seen.has(key)) {
              organsToShow.push({ IRI: d.targetOrgan.IRI, Label: d.targetOrgan.Label });
              seen.add(key);
            }
          }
        }
      }
      let targetOrganCell = "-";
      if (organsToShow.length > 0) {
        targetOrganCell = organsToShow.map(org => `<a href="${org.IRI}" target="_blank">${org.Label}</a>`).join(", ");
      }
      dataRow.appendChild(createTableData(targetOrganCell));
      return dataRow;
    });
  
    // ...existing code...
}

function createEmptyRow()
{
  const emptyRow = createTableRow();
  const emptyData = createTableData();
  emptyData.colSpan = 7;
  emptyData.style.border = "1px solid transparent";
  emptyRow.appendChild(emptyData);
  return emptyRow;
}

function getFormattedNeuronMetaData(nmdata)
{
  let table = `<table class="metadata-header-table" style="width: 100%;">`;
  let citationId = null;
  let buttonId = null;

  table += `<tr><td style="font-weight: bold; width: 25px;">Label</td>`;
  table += `<td style="width:90%">${nmdata.neuronLabel}</td></tr>`;

  // Will need to consider if we want the label to be displayed in title case
  // table += `<td style="width:90%">${convertToTitleCase(nmdata.neuronLabel)}</td></tr>`;

  if (nmdata.neuronPrefLabel !== "")
  {
    table += `<tr><td style="font-weight: bold;">Preferred Label</td>`;
    table += `<td>${convertToTitleCase(nmdata.neuronPrefLabel)}</td></tr>`;
    //table += `<td>${getFormattedNeuronLabel(nmdata.neuronPrefLabel)}</td></tr>`;


    // Will need to consider if we want the pref label to be displayed in title case
    // table += `<td>${convertToTitleCase(nmdata.neuronPrefLabel)}</td></tr>`;
  }

  table += `<tr><td style="font-weight: bold;">Phenotype(s)</td>`;
  table += `<td>${nmdata.phenotypes}`;

  if (nmdata.species !== "")
  {
    table += `; <b>Species: </b>${nmdata.species}`;
    if (nmdata.sex !== "")
      table += `; <b>Sex: </b> ${convertToTitleCase(nmdata.sex)}`;
  }
  table += `</td></tr>`;

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
     // table += `<td>${addHyperlinksToURIs(nmdata.diagramLink)}</td></tr>`;
      table += `<td><a href="${nmdata.diagramLink}" target="_blank">Link to SVG Diagram</a></td></tr>`;

  }

  // this.expert = expert;
    //         this.composerURI = composer_uri;
    //         this.curationNote = curation_note;

  if (nmdata.expert !== "")
  {
    table += `<tr><td style="font-weight: bold;">Expert Consultant</td>`;
    table += `<td>${addHyperlinksToURIs(nmdata.expert)}</td></tr>`;
  }


  if (nmdata.reference !== "")
  {
    table += `<tr><td style="font-weight: bold;">Reference</td>`;
    table += `<td>${addHyperlinksToURIs(nmdata.reference)}</td></tr>`;
  }

  if (nmdata.citation !== "")
    {
      citationId = `citation-${Math.random().toString(36).substring(2, 11)}`;
      buttonId = `btn-${citationId}`;

      // Split citations into array
      const citationsArray = nmdata.citation.split(',').map(c => c.trim());
      const maxVisible = 5;
      const hasMore = citationsArray.length > maxVisible;

      // Get visible and hidden citations
      const visibleCitations = citationsArray.slice(0, maxVisible).join(', ');
      const hiddenCitations = hasMore ? citationsArray.slice(maxVisible).join(', ') : '';

      table += `<tr><td style="font-weight: bold;">Citations</td>`;
      table += `<td>
        <div id="${citationId}">
          <span class="citation-visible">${addHyperlinksToCitationURIs(visibleCitations)}</span>
          ${hasMore ? `<span class="citation-hidden" style="display: none;">, ${addHyperlinksToCitationURIs(hiddenCitations)}</span>` : ''}
        </div>
        ${hasMore ? `<button id="${buttonId}" onclick="toggleCitations(event, '${citationId}')" style="margin-top: 4px; font-size: 12px; padding: 4px 8px; background-color: #2E9AFE; color: white; border: none; border-radius: 4px; cursor: pointer;">
          <b>Show ${citationsArray.length - maxVisible} more ▼</b>
        </button>` : ''}
      </td></tr>`;
    }

  if (nmdata.alert !== "")
  {
    table += `<tr><td style="font-weight: bold;">Alert Note</td>`;
    table += `<td>${nmdata.alert}</td></tr>`;
  }

  if (nmdata.curationNote !== "")
    {
      table += `<tr><td style="font-weight: bold;">Curation Note</td>`; 
      table += `<td>${nmdata.curationNote}</td></tr>`;
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
  const words = sentence.split(/\s+/); // Split by whitespace

  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    // Keep NTS and CNS unchanged (case-insensitive match)
    if (word.toUpperCase() === 'NTS' || word.toUpperCase() === 'CNS') {
      words[i] = word.toUpperCase();
      continue;
    }
    // Bold 'to' and 'via' (case-insensitive)
    if (word.toLowerCase() === 'to' || word.toLowerCase() === 'via') {
      words[i] = '<b>' + word.toLowerCase() + '</b>';
      continue;
    }
    // check for patterns like "S2‒S4" or "L1-L2" with any type of dash
    if (/^[A-Za-z]\d+[-‒–][A-Za-z]?\d+$/.test(word)) {
      words[i] = word.replace(/([A-Za-z]\d+[-‒–][A-Za-z]?\d+)/, match => match.toUpperCase());
    } else if (i === 0 || !smallWords.includes(word.toLowerCase())) {
      // convert to title case if it's not in the list of small words
      words[i] = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    } else {
      // Convert small words to lowercase
      words[i] = word.toLowerCase();
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

function addHyperlinksToCitationURIs(urisString) 
{
    // Split the comma-separated string into an array of URIs
    const urisArray = urisString.split(',');

    const hyperlinksArray = urisArray.map(uri => 
    {
        const trimmedURI = uri.trim();  // Remove any extra spaces
        return `<a href="${trimmedURI}" target="_blank">${trimmedURI}</a>`;
    });

    // Join the array of hyperlinks back into a single string
    return hyperlinksArray.join(', ');
}


function togglePanel(panelBodyRow)
{
  panelBodyRow.style.display = panelBodyRow.style.display === 'none' ? 'table-row' : 'none';
}

function createTableRow(className)
{
  const row = document.createElement("tr");
  if (className)
  {
    row.classList.add(className);
  }
  return row;
}

function createTableHeader(className)
{
  const header = document.createElement("th");
  if (className)
  {
    header.classList.add(className);
  }
  return header;
}

function createTableData(content)
{
  const data = document.createElement("td");
  data.style.border = "1px solid black";
  if (content)
  {
    data.innerHTML = content;
  }
  return data;
}

function createLink(href, text)
{
  
  // Robust region(layer) link logic
  const regionLayerPattern = /^(.+?) \((.+?)\)$/;
  let matchLabel = text.match(regionLayerPattern);
  let matchHref = href.match(regionLayerPattern);
  // If href is region(layer) form, always split and use both IRIs (convert CURIEs to IRIs if needed)
  if (matchHref) {
    let regionIRI = matchHref[1].trim();
    let layerIRI = matchHref[2].trim();
    // Convert CURIEs to IRIs if needed
    if (regionIRI.includes(":") && !regionIRI.startsWith("http")) {
      try { regionIRI = getIRIFromCurie(regionIRI); } catch (e) {}
    }
    if (layerIRI.includes(":") && !layerIRI.startsWith("http")) {
      try { layerIRI = getIRIFromCurie(layerIRI); } catch (e) {}
    }
    let regionLabel = text;
    let layerLabel = text;
    if (matchLabel) {
      regionLabel = matchLabel[1].trim();
      layerLabel = matchLabel[2].trim();
    }
    return `<a href="${regionIRI}" target="_blank">${regionLabel}</a> (<a href="${layerIRI}" target="_blank">${layerLabel}</a>)`;
  }
  // If label is region(layer), href is a single CURIE or IRI: use getIRIFromCurie for each part
  if (matchLabel && typeof getIRIFromCurie === 'function') {
    const regionCurie = matchLabel[1].trim();
    const layerCurie = matchLabel[2].trim();
    let regionIRI = '#';
    let layerIRI = '#';
    try { regionIRI = getIRIFromCurie(regionCurie); } catch (e) {}
    try { layerIRI = getIRIFromCurie(layerCurie); } catch (e) {}
    return `<a href="${regionIRI}" target="_blank">${regionCurie}</a> (<a href="${layerIRI}" target="_blank">${layerCurie}</a>)`;
  }
  // Defensive: if no href or text, return empty string
  if (!href || !text) return '';
  // If href is a CURIE, convert to IRI
  let finalHref = href;
  if (href.includes(":") && !href.startsWith("http") && typeof getIRIFromCurie === 'function') {
    try { finalHref = getIRIFromCurie(href); } catch (e) {}
  }
  // Otherwise, simple link
  return `<a href="${finalHref}" target="_blank">${text}</a>`;
}

  // get label from npo_neuron_metadata
function getNeuronPrefLabelFromID(neuron_id)
  {
    console.log(`Searching for neuron ID: '${neuron_id}'`);

    //const neuronData = NEURON_DATA_MAP.get(neuron_id);
    console.log("Neuron Data" + NEURON_DATA[0].neuronMetaData.neuronPrefLabel);


    return "TESTING"; // Return null if neuronId not found
}

function updateSearchProgress(percent)
{
  const progressBar = document.getElementById("search-progress-bar");
  progressBar.style.width = percent + '%';
  // Show percent as text, centered
  progressBar.textContent = Math.floor(percent) + '%';
  progressBar.style.textAlign = 'center';
  progressBar.style.color = 'white';
  progressBar.style.fontWeight = 'bold';
  progressBar.style.fontSize = '10px';
  progressBar.style.lineHeight = progressBar.style.height || '6px';
}

function wait(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Toggle citations expand/collapse
function toggleCitations(event, citationId) {
  const citationDiv = document.getElementById(citationId);
  const button = event.target.closest('button');
  const hiddenSpan = citationDiv.querySelector('.citation-hidden');

  if (hiddenSpan) {
    if (hiddenSpan.style.display === 'none') {
      hiddenSpan.style.display = 'inline';
      button.innerHTML = '<b>Show less ▲</b>';
    } else {
      hiddenSpan.style.display = 'none';
      const totalHidden = hiddenSpan.textContent.split(',').length - 1; // -1 because first char is comma
      button.innerHTML = `<b>Show ${totalHidden} more ▼</b>`;
    }
  }
}
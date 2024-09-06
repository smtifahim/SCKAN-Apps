// To load all the locations based on NPO's locational phenotypes for its neuron types. 

var soma_locations = new Array();
var terminal_locations = new Array();
var via_locations = new Array();

// const databaseName = 'NPO';
// const qry0 = npo_all_locations;

// const databaseName = 'NPO';
// const storedQueryName = npo_all_locations;

// Load data directly from generated query results in json instead.
// async function getNPOLocations() 
// {
//    try
//    {
//       var queryResults = await executeDBQuery(conn, databaseName, qry0);
//       return queryResults;
//    } 
//    catch (error)
//    {
//      console.error(error);
//      alert("Satrdog is not responding with query results.");
//    }
//  }

const json_dir = "./json/explorer-data/sckan-data/";

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

class AutoCompleteEntity
{
   constructor (id, iri, label = "", dl = "")
   {
      this.ID = id;
      this.IRI = iri;
      this.Label = label;
      this.displayLabel = dl;
   }
}

// for auto complete search.
async function loadAllLocations()
{
   // const data  = await getNPOLocations();
   const data = loadJSONFromFile(json_dir + "sckan-all-locations.json")
   //var locationsDropDown = document.getElementById("locationsDropDown");
 
   for (let i = 0; i <data.length; i++)
   {
      var connection_id = getCurieFromIRI(data[i].Connection_Type.value);
      var location_label = data[i].Location_Label.value;
      var location_IRI = data[i].Location_IRI.value;
      var location_ID = getCurieFromIRI(location_IRI);
      var display_label = location_label + " | " + location_ID;


      var entity = new AutoCompleteEntity (location_ID, location_IRI, location_label, display_label);
      
      if (connection_id === "ilxtr:hasSomaLocation")
      {
         if (soma_locations.indexOf(entity)===-1) //just a test for duplicate
            soma_locations.push (entity);

      }

      if (connection_id === "ilxtr:hasAxonLocation")
      {
         if (via_locations.indexOf(entity)===-1) //just a test
             via_locations.push (entity);
      }

      if (connection_id === "ilxtr:hasAxonTerminalLocation" 
         || connection_id === "ilxtr:hasAxonSensoryLocation")
      {
         if (terminal_locations.indexOf(entity)===-1) //just a test
             terminal_locations.push (entity);
      }

   }
      
   //remove all duplicates from the list of selectable options.
   let origins = [...new Set(soma_locations.map(entity => entity.displayLabel))];
   let terminals = [...new Set(terminal_locations.map(entity => entity.displayLabel))];
   let vias = [...new Set(via_locations.map(entity => entity.displayLabel))];

   autocomplete(document.getElementById("conn-origin"), origins);
   autocomplete(document.getElementById("conn-dest"), terminals);
   autocomplete(document.getElementById("conn-via"), vias);

return true;
} //End of function loadAllLocations()
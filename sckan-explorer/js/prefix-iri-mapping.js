// Prefix-IRI-Mappings for ontology classes and properties.
const Prefix_IRI_Mapping = [
  { prefix: "BIRNLEX:", iri: "http://uri.neuinfo.org/nif/nifstd/birnlex_" },
  { prefix: "UBERON:", iri: "http://purl.obolibrary.org/obo/UBERON_" },
  { prefix: "CL:", iri: "http://purl.obolibrary.org/obo/CL_" },
  { prefix: "ILX:", iri: "http://uri.interlex.org/base/ilx_" },
  { prefix: "mmset1:", iri: "http://uri.interlex.org/tgbugs/uris/readable/sparc-nlp/mmset1/" },
  { prefix: "mmset2cn:", iri: "http://uri.interlex.org/tgbugs/uris/readable/sparc-nlp/mmset2cn/" },
  { prefix: "mmset4:", iri: "http://uri.interlex.org/tgbugs/uris/readable/sparc-nlp/mmset4/" },
  { prefix: "semves:", iri: "http://uri.interlex.org/tgbugs/uris/readable/sparc-nlp/semves/" },
  { prefix: "femrep:", iri: "http://uri.interlex.org/tgbugs/uris/readable/sparc-nlp/femrep/" },
  { prefix: "prostate:", iri: "http://uri.interlex.org/tgbugs/uris/readable/sparc-nlp/prostate/" },
  { prefix: "kidney:", iri: "http://uri.interlex.org/tgbugs/uris/readable/sparc-nlp/kidney/" },
  { prefix: "liver:", iri: "http://uri.interlex.org/tgbugs/uris/readable/sparc-nlp/liver/" },
  { prefix: "senmot:", iri: "http://uri.interlex.org/tgbugs/uris/readable/sparc-nlp/senmot/" },
  { prefix: "swglnd:", iri: "http://uri.interlex.org/tgbugs/uris/readable/sparc-nlp/swglnd/" },
  { prefix: "gastint:", iri: "http://uri.interlex.org/composer/uris/set/gastint/" },
  { prefix: "portal:", iri: "http://uri.interlex.org/composer/uris/set/portal/" },
  { prefix: "TEMP:", iri: "http://uri.interlex.org/temp/uris/" },
  { prefix: "ilxcr:", iri: "http://uri.interlex.org/composer/uris/readable/" },
  { prefix: "ilxtr:", iri: "http://uri.interlex.org/tgbugs/uris/readable/" },
  { prefix: "npokb:", iri: "http://uri.interlex.org/npo/uris/neurons/" },
  { prefix: "PAXRAT:", iri: "http://uri.interlex.org/paxinos/uris/rat/labels/" },
  { prefix: "MBA:", iri: "http://api.brain-map.org/api/v2/data/Structure/" },
  { prefix: "NLX:", iri: "http://uri.neuinfo.org/nif/nifstd/nlx_" },
  { prefix: "NIFSTD:", iri: "http://uri.neuinfo.org/nif/nifstd/" },
];

// Convert a single IRI to CURIE
function convertIRIToCurie(iri) {
  for (const mapping of Prefix_IRI_Mapping) {
    if (iri.startsWith(mapping.iri)) {
      const id = iri.slice(mapping.iri.length);
      return mapping.prefix + id;
    }
  }
  // If no match was found, return the original IRI
  return iri;
}

// Get curie from a given URI, handles both simple IRIs and region(layer) forms
function getCurieFromIRI(uri) 
{
  // Handles single URI, 'URI (URI)', and comma-separated IRIs
  if (typeof uri !== 'string') return uri;
  // If comma-separated, treat as region,layer or multiple IRIs
  if (uri.includes(',')) {
    const parts = uri.split(',').map(s => s.trim());
    if (parts.length === 2) {
      const regionIRI = parts[0];
      const layerIRI = parts[1];
      const regionCurie = convertIRIToCurie(regionIRI);
      const layerCurie = convertIRIToCurie(layerIRI);
      return `${regionCurie} (${layerCurie})`;
    } else {
      // More than 2, join all as CURIEs
      return parts.map(iri => convertIRIToCurie(iri)).join(', ');
    }
  }
  // Check for the pattern: URI (URI)
  const layerPattern = /^(.+?) \((.+?)\)$/;
  const match = uri.match(layerPattern);
  if (match) {
    const regionIRI = match[1].trim();
    const layerIRI = match[2].trim();
    const regionCurie = convertIRIToCurie(regionIRI);
    const layerCurie = convertIRIToCurie(layerIRI);
    return `${regionCurie} (${layerCurie})`;
  } else {
    // Simple IRI without layer
    const iri = uri.trim();
    const curie = convertIRIToCurie(iri);
    return curie;
  }
}

// Example usage:
// getCurieFromIRI("http://purl.obolibrary.org/obo/UBERON_0002078")
// Returns: "UBERON:0002078"

// getCurieFromIRI("http://purl.obolibrary.org/obo/UBERON_0002078 (http://purl.obolibrary.org/obo/UBERON_0002165)")
// Returns: "UBERON:0002078 (UBERON:0002165)"


// // to get curie from a given URI.
// function getCurieFromIRI(uri) 
// {
//   for (const mapping of Prefix_IRI_Mapping) 
//   {
//     if (uri.startsWith(mapping.iri)) 
//     {
//       const id = uri.slice(mapping.iri.length);
//       return mapping.prefix + id;
//     }
//   }
//   // If no match was found, return the original URI
//   return uri;
// }

function getIRIFromCurie(curie)
{
  const prefix = curie.split(':')[0] + ':';
  const iri = Prefix_IRI_Mapping.find(mapping => mapping.prefix === prefix)?.iri;
  if (!iri)
  {
    throw new Error(`No mapping found for prefix ${prefix}`);
  }
  const id = curie.split(':')[1];
  return iri + id;
}

function getPrefixFromIRI(iri)
{
  for (i=0; i<Prefix_IRI_Mapping.length; i++)
    if (Prefix_IRI_Mapping[i].iri === iri)
      return Prefix_IRI_Mapping[i].prefix;
}

function getIRIFromPrefix(prefix)
{
  for (i = 0; i < Prefix_IRI_Mapping.length; i++)
    if (Prefix_IRI_Mapping[i].prefix === prefix)
      return Prefix_IRI_Mapping[i].iri;
}

// console.log(getCurieFromIRI("http://purl.obolibrary.org/obo/UBERON_0002078"));
// console.log(getCurieFromIRI("http://purl.obolibrary.org/obo/UBERON_0002078 (http://purl.obolibrary.org/obo/UBERON_0002165)"));
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
  { prefix: "TEMP:", iri: "http://uri.interlex.org/temp/uris/" },
  { prefix: "ilxtr:", iri: "http://uri.interlex.org/tgbugs/uris/readable/" },
  { prefix: "npokb:", iri: "http://uri.interlex.org/npo/uris/neurons/" },
  { prefix: "PAXRAT:", iri: "http://uri.interlex.org/paxinos/uris/rat/labels/" },
  { prefix: "MBA:", iri: "http://api.brain-map.org/api/v2/data/Structure/" },
  { prefix: "NLX:", iri: "http://uri.neuinfo.org/nif/nifstd/nlx_" },
  { prefix: "NIFSTD:", iri: "http://uri.neuinfo.org/nif/nifstd/" },
];

// to get curie from a given URI.
function getCurieFromIRI(uri) 
{
  for (const mapping of Prefix_IRI_Mapping) 
  {
    if (uri.startsWith(mapping.iri)) 
    {
      const id = uri.slice(mapping.iri.length);
      return mapping.prefix + id;
    }
  }
  // If no match was found, return the original URI
  return uri;
}

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
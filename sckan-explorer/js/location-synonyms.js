// Utility to build a Location IRI to synonyms mapping from sckan-all-locations.json
// Returns an object: { iri1: [label1, label2, ...], iri2: [...], ... }
function buildLocationSynonymMap(locationsJson) {
    const iriToLabels = {};
    if (!locationsJson || !locationsJson.results || !locationsJson.results.bindings) return iriToLabels;
    locationsJson.results.bindings.forEach(entry => {
        const iri = entry.Location_IRI.value;
        const label = entry.Location_Label.value;
        if (!iriToLabels[iri]) iriToLabels[iri] = new Set();
        iriToLabels[iri].add(label);
    });
    // Convert sets to arrays
    Object.keys(iriToLabels).forEach(iri => {
        iriToLabels[iri] = Array.from(iriToLabels[iri]);
    });
    return iriToLabels;
}

// Loads the sckan-all-locations.json and builds the synonym map (synchronously)
function getLocationSynonymMap() {
    const locationsJson = loadJSONFromFile('./json/explorer-data/sckan-data/sckan-all-locations.json');
    return buildLocationSynonymMap(locationsJson);
}

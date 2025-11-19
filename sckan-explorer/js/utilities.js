// Utility classes for SCKAN Explorer.
class AdjTableData
    {
        constructor (nt, v1, v2)
        {
            this.neuron = nt;
            this.v1 = v1;
            this.v2 = v2;
        }
    }

class AdjTable
    {
        constructor (nt, v1, v1_type, v2, v2_type, is_synapse)
        {
            this.neuron = nt;
            this.v1 = v1;
            this.v1_type = v1_type;
            this.v2 = v2;
            this.v2_type = v2_type;
            this.is_synapse = is_synapse;
        }
    }

class NeuronPathDiGraph
    {
        constructor (neuron_id, diGraph)
        {
        this.neuronID = neuron_id;
        this.axonalPath = diGraph;
        }
    }

class NeuronWithSynapse 
    {
        constructor (neuron_id, next_neurons)
        {
            this.neuronID = neuron_id;
            this.next_neurons = next_neurons;
        }
    }

class AtoBviaC
    {
        constructor (nt, a, b=null, c=null, neuron_metadata, target_organ, di_graph = "", 
                    di_graph_synapse = "", synapsed_neurons= "")
        {
            this.neuron = nt;
            this.origin = a;
            this.destination = b;
            this.via = c;
            this.neuronMetaData = neuron_metadata;
            this.targetOrgan = target_organ;
            this.diGraph = di_graph;
            this.diGraphSynapse = di_graph_synapse;
            this.synapsedNeurons = synapsed_neurons;
        }
    }
  
class ClassEntity
    {
        constructor (id, iri, label = "")
        {
            this.ID = id;
            this.IRI = iri;
            this.Label = label;
        }
    }

class NeuronMetaData
    {
        constructor (neuron_id, neuron_label, neuron_pref_label, species, sex, phenotypes, 
                    forward_connections, expert="", composer_uri, curation_note="", alert, diagram_link="", reference="", citation="")
        {
            this.neuronID = neuron_id;
            this.neuronLabel = neuron_label;
            this.neuronPrefLabel = neuron_pref_label;
            this.species = species;
            this.sex = sex;
            this.phenotypes = phenotypes;
            this.forwardConnections = forward_connections;
            this.expert = expert;
            this.composerURI = composer_uri;
            this.curationNote = curation_note;
            this.alert = alert;
            this.diagramLink = diagram_link;
            this.reference = reference;
            this.citation = citation;
        }
    }

// Prevent CSS :hover visual changes inside tables (except buttons)
// DISABLED: This entire hover prevention code has been disabled
// The code was applying inline styles that were causing unwanted visual effects
/*
(() => {
    const hoveredNodes = new WeakMap();

    function applyNeutralInlineStyles(el) {
        if (!el || el.tagName === 'BUTTON') return;
        if (!hoveredNodes.has(el)) {
            hoveredNodes.set(el, {
                bg: el.style.backgroundColor || '',
                color: el.style.color || '',
                textDec: el.style.textDecoration || '',
                boxShadow: el.style.boxShadow || '',
                outline: el.style.outline || '',
                borderColor: el.style.borderColor || '',
                transition: el.style.transition || ''
            });
        }
        const comp = window.getComputedStyle(el);
        try {
            el.style.backgroundColor = comp.backgroundColor;
            el.style.color = comp.color;
            el.style.textDecoration = 'none';
            el.style.boxShadow = 'none';
            el.style.outline = 'none';
            el.style.borderColor = comp.borderColor || 'transparent';
            el.style.transition = 'none';
        } catch (e) {
            // ignore
        }
    }

    function restoreInlineStyles(el) {
        const prev = hoveredNodes.get(el);
        if (!prev) return;
        try {
            el.style.backgroundColor = prev.bg;
            el.style.color = prev.color;
            el.style.textDecoration = prev.textDec;
            el.style.boxShadow = prev.boxShadow;
            el.style.outline = prev.outline;
            el.style.borderColor = prev.borderColor;
            el.style.transition = prev.transition;
        } catch (e) {}
        hoveredNodes.delete(el);
    }

    document.addEventListener('mouseover', function (ev) {
        const t = ev.target;
        const table = t.closest && t.closest('table');
        if (!table) return; // only care about elements inside tables
        // do nothing for buttons
        if (t.closest && t.closest('button')) return;
        // do nothing for input form table
        const form = t.closest && t.closest('#myForm');
        if (form) return;
        // do nothing for metadata table or location table
        if (table.classList.contains('metadata-header-table') || table.classList.contains('location-table')) return;
        // do nothing if the target contains a metadata or location table
        if (t.querySelector && (t.querySelector('.metadata-header-table') || t.querySelector('.location-table'))) return;

        // apply neutral styles to target and its ancestors up to the table
        let cur = t;
        while (cur && cur !== table.parentNode) {
            applyNeutralInlineStyles(cur);
            if (cur === table) break;
            cur = cur.parentNode;
        }
    }, true);

    document.addEventListener('mouseout', function (ev) {
        const t = ev.target;
        const table = t.closest && t.closest('table');
        if (!table) return;
        if (t.closest && t.closest('button')) return;
        // do nothing for input form table
        const form = t.closest && t.closest('#myForm');
        if (form) return;
        // do nothing for metadata table or location table
        if (table.classList.contains('metadata-header-table') || table.classList.contains('location-table')) return;
        // do nothing if the target contains a metadata or location table
        if (t.querySelector && (t.querySelector('.metadata-header-table') || t.querySelector('.location-table'))) return;

        // restore inline styles for target and its ancestors up to the table
        let cur = t;
        while (cur && cur !== table.parentNode) {
            restoreInlineStyles(cur);
            if (cur === table) break;
            cur = cur.parentNode;
        }
    }, true);
})();
*/

//  NeuronMetaData (neuron_id, neuron_label, neuron_pref_label, neuron_species, neuron_sex, 
//                  neuron_phenotypes, neuron_forward_connections, neuron_expert, composer_uri,
//                  curation_note, neuron_alert, neuron_diagram_link, neuron_reference, neuron_citation);
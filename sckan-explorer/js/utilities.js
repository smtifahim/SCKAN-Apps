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

class NeuronPathDiGraph
    {
        constructor (neuron_id, diGraph)
        {
        this.neuronID = neuron_id;
        this.axonalPath = diGraph;
        }
    }


class AtoBviaC
    {
        constructor (nt, a, b=null, c=null, neuron_metadata, target_organ, di_graph = "")
        {
            this.neuron = nt;
            this.origin = a;
            this.destination = b;
            this.via = c;
            this.neuronMetaData = neuron_metadata;
            this.targetOrgan = target_organ;
            this.diGraph = di_graph;
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
        constructor (neuron_id, neuron_label, neuron_pref_label, species, sex, phenotypes, forward_connections, alert, reference)
        {
            this.neuronID = neuron_id;
            this.neuronLabel = neuron_label;
            this.neuronPrefLabel = neuron_pref_label;
            this.species = species;
            this.sex = sex;
            this.phenotypes = phenotypes;
            this.forwardConnections = forward_connections;
            this.alert = alert;
            this.reference = reference;   
        }
    }
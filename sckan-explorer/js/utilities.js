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
        constructor (neuron_id, neuron_label, neuron_pref_label, species, sex, phenotypes, forward_connections, alert, diagram_link, reference, citation)
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
            this.citation = citation;
            this.diagramLink = diagram_link;   
        }
    }
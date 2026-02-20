// To load the model names and the phenotype values for the listbox on the interface.
// Ideally, these should come from a sparql query generated json files. Will update in the future.
function loadModelNames()
{
    const models = {
        "Bolser-Lewis Model of Defensive Breathing": "bolew",
        "Keast Model of Bladder Innervation": "keast",
        "SAWG Model of Bronchomotor Control": "bromo",
        "SAWG Model of the Descending Colon": "sdcol",
        "SAWG Model of the Pancreas": "pancr",
        "SAWG Model of the Spleen": "splen",
        "SAWG Model of the Stomach": "sstom",
        "UCLA Model of the Heart": "aacar",
        "Cranial Nerve Connections": "mmset2cn",
        "Female Reproductive System": "femrep",
        "Gastro-Intestinal Connections": "gastint",
        "Kidney Connections": "kidney",
        "Liver Connections": "liver",
        "Male Reproductive System (Prostate)": "prostate",
        "Male Reproductive System (Seminal Vesicles)": "semves",
        "SPARC Portal Connections" : "portal",
        "Sensory-Motor Connections": "senmot",
        "Sweat Gland Connections": "swglnd",
        "Nociceptive Pain Connections": "pain1",
        "Uncategorized Connections (Set 1)": "mmset1",
        "Uncategorized Connections (Set 4)": "mmset4"
    };

    const modelList = document.getElementById('modelList');

    // Populate datalist with model options
    for (let model in models) 
    {
        let option = document.createElement('option');
        option.value = `${model}  | ${models[model]}`;
        modelList.appendChild(option);
    }
    
    return true;
}

function loadPhenotypeValues()
{
    const phenotypes = [
        "ANS: Parasympathetic",
        "ANS: Parasympathetic Pre-Ganglionic",
        "ANS: Parasympathetic Post-Ganglionic",
        "ANS: Sympathetic",
        "ANS: Sympathetic Pre-Ganglionic",
        "ANS: Sympathetic Post-Ganglionic",
        "ANS: Enteric",
        "Circuit Role: Sensory",
        "Circuit Role: Motor",
        "Circuit Role: Intrinsic",
        "Circuit Role: Projection",
        "Functional Circuit Role: Inhibitory",
        "Functional Circuit Role: Excitatory",
        "Projection: Spinal cord ascending projection phenotype",
        "Projection: Spinal cord descending projection phenotype",
        "Projection: Anterior projecting",
        "Projection: Posterior projecting",
        "Projection: Intestino fugal projection phenotype",
        "Axon Phenotype: type Aδ (delta) nerve fiber",
        "Axon Phenotype: type C nerve fiber",
        "Circuit Membership: nociceptive circuit"
    ];

    const phenotypeList = document.getElementById('phenotypeList');
    phenotypes.forEach(phenotype =>
    {
        let option = document.createElement('option');
        option.value = phenotype;
        phenotypeList.appendChild(option);
    });

    return true;
}
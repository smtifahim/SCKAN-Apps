// To load the model names and the phenotype values for the listbox on the interface.
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
        "Kidney Connections": "kidney",
        "Liver Connections": "liver",
        "Male Reproductive System (Prostate)": "prostate",
        "Male Reproductive System (Seminal Vesicles)": "semves",
        "Sensory-Motor Connections": "senmot",
        "Sweat Gland Connections": "swglnd",
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
        "Functional Circuit Role: Inhibitory",
        "Functional Circuit Role: Excitatory",
        "Projection: Spinal cord ascending projection phenotype",
        "Projection: Spinal cord descending projection phenotype",
        "Projection: Anterior projecting",
        "Projection: Posterior projecting",
        "Projection: Intestino fugal projection phenotype"
    ];

    const phenotypeList = document.getElementById('phenotypeList');
    phenotypes.forEach(phenotype => {
        let option = document.createElement('option');
        option.value = phenotype;
        phenotypeList.appendChild(option);
    });

}
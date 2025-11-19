function loadPhenotypes()
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
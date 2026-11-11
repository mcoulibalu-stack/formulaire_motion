// ==========================================================================
// 1. CONFIGURATION ET NAVIGATION DE BASE
// ==========================================================================
const steps = document.querySelectorAll('.form-step');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const currentStepText = document.getElementById('current-step-text');
const form = document.getElementById('multi-step-form');

let currentStep = 1;
const totalSteps = steps.length;

function updateForm() {
    // Gérer l'affichage des blocs d'étapes
    steps.forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        if (stepNum === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    // Mettre à jour le texte du compteur
    currentStepText.textContent = currentStep;

    // Gérer l'affichage du bouton précédent
    if (currentStep === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }

    // Masquer le bouton "Suivant" générique à la toute dernière étape (l'étape 12)
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'block';
        nextBtn.textContent = "SUIVANT →";
    }
}

// Validation des champs obligatoires de l'étape en cours
function isCurrentStepValid() {
    const currentStepContainer = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const requiredFields = currentStepContainer.querySelectorAll('[required]');
    
    let allValid = true;
    requiredFields.forEach(field => {
        if (!field.reportValidity()) {
            allValid = false;
        }
    });
    return allValid;
}

// Écouteur sur le bouton SUIVANT
nextBtn.addEventListener('click', () => {
    if (isCurrentStepValid()) {
        if (currentStep < totalSteps) {
            currentStep++;
            updateForm();
            
            // CORRECTION CRUCIALE : Si on vient d'arriver sur l'étape 12, on génère le récapitulatif immédiatement
            if (currentStep === totalSteps) {
                renderRecap();
            }
        }
    }
});

// Écouteur sur le bouton PRÉCÉDENT
prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        updateForm();
    }
});

// ==========================================================================
// 2. LOGIQUE COLLECTE DES DONNÉES & RECAPITULATIF (ÉTAPE 12)
// ==========================================================================

function getFormDataSummary() {
    // Récupération des coordonnées (Étape 1)
    const nom = document.querySelector('input[placeholder="Votre nom"]')?.value || "Non renseigné";
    const entreprise = document.querySelector('input[placeholder="Votre société"]')?.value || "Non renseignée";
    const whatsapp = document.querySelector('input[placeholder="Votre numéro"]')?.value || "Non renseigné";
    const pays = document.querySelector('input[placeholder="Votre pays"]')?.value || "Non renseigné";

    // Récupération des choix uniques (Radio boutons avec protections si non cochés)
    const typeProjet = document.querySelector('input[name="project_type"]:checked')?.nextElementSibling?.querySelector('h3')?.textContent || "Non sélectionné";
    const objectif = document.querySelector('input[name="objectif"]:checked')?.nextElementSibling?.querySelector('h3')?.textContent || "Non sélectionné";
    const duree = document.querySelector('input[name="duree"]:checked')?.nextElementSibling?.querySelector('h3')?.textContent || "Non sélectionné";
    const voix = document.querySelector('input[name="voix"]:checked')?.nextElementSibling?.querySelector('h3')?.textContent || "Non sélectionné";
    const script = document.querySelector('input[name="script"]:checked')?.nextElementSibling?.querySelector('h3')?.textContent || "Non sélectionné";
    const styleArt = document.querySelector('input[name="style_art"]:checked')?.nextElementSibling?.querySelector('h3')?.textContent || "Non sélectionné";
    const complexite = document.querySelector('input[name="complexity"]:checked')?.nextElementSibling?.querySelector('.card-text-wrapper h3')?.textContent || "Non sélectionné";
    const budget = document.querySelector('input[name="budget"]:checked')?.closest('.option-bud')?.querySelector('span:last-child')?.textContent.trim() || "Non précisé";
    
    // Récupération des Textareas
    const description = document.querySelector('textarea[placeholder*="projet"]')?.value || "Aucune description";
    const question = document.querySelector('textarea[placeholder*="Ex: Quel est"]')?.value || "Aucune question";

    // Récupération des formats cochés (Checkboxes)
    const formatsCoches = [];
    document.querySelectorAll('input[name="formats"]:checked').forEach(cb => {
        formatsCoches.push(cb.nextElementSibling.querySelector('h3').textContent);
    });
    const formatsText = formatsCoches.length > 0 ? formatsCoches.join(', ') : "Aucun format sélectionné";

    return {
        nom, entreprise, whatsapp, pays,
        typeProjet, objectif, duree, voix, script, styleArt, complexite, budget,
        description, question, formatsText
    };
}

function renderRecap() {
    const data = getFormDataSummary();
    const recapClient = document.getElementById('recap-client');
    const recapProject = document.getElementById('recap-project');

    if (recapClient && recapProject) {
        recapClient.innerHTML = `
            <p><strong>Nom :</strong> ${data.nom}</p>
            <p><strong>Entreprise :</strong> ${data.entreprise}</p>
            <p><strong>WhatsApp :</strong> ${data.whatsapp}</p>
            <p><strong>Pays :</strong> ${data.pays}</p>
        `;

        recapProject.innerHTML = `
            <p><strong>Type de projet :</strong> ${data.typeProjet}</p>
            <p><strong>Objectif :</strong> ${data.objectif}</p>
            <p><strong>Durée du spot :</strong> ${data.duree}</p>
            <p><strong>Voix off & Script :</strong> ${data.voix} — ${data.script}</p>
            <p><strong>Style :</strong> ${data.styleArt}</p>
            <p><strong>Niveau de complexité :</strong> ${data.complexite}</p>
            <p><strong>Budget estimé :</strong> ${data.budget}</p>
            <p><strong>Formats demandés :</strong> ${data.formatsText}</p>
            <p><strong>Description du projet :</strong> ${data.description}</p>
            ${data.question !== "Aucune question" ? `<p><strong>Question posée :</strong> ${data.question}</p>` : ''}
        `;
    }
}

// ==========================================================================
// 3. ENVOI WHATSAPP & TELECHARGEMENT PDF
// ==========================================================================

// Action : Soumettre via WhatsApp
const whatsappBtn = document.querySelector('.btn-whatsapp');
if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // METS TON NUMERO ICI (Ex: 22370000000 pour le Mali, sans + ni 00)
        const monNumeroWhatsApp = "22376363216"; 

        const data = getFormDataSummary();

        // Mise en page du message WhatsApp avec de belles puces et du gras
        let message = `*✨ NOUVEAU BRIEF CREATIF - INFORMAGICIEN ✨*\n\n`;
        message += `*👤 COORDONNÉES CLIENT :*\n`;
        message += `• *Nom :* ${data.nom}\n`;
        message += `• *Entreprise :* ${data.entreprise}\n`;
        message += `• *WhatsApp :* ${data.whatsapp}\n`;
        message += `• *Pays :* ${data.pays}\n\n`;
        message += `*🎬 CONFIGURATION DU PROJET :*\n`;
        message += `• *Type :* ${data.typeProjet}\n`;
        message += `• *Objectif :* ${data.objectif}\n`;
        message += `• *Durée du spot :* ${data.duree}\n`;
        message += `• *Voix & Script :* ${data.voix} (${data.script})\n`;
        message += `• *Direction artistique :* ${data.styleArt}\n`;
        message += `• *Complexité :* ${data.complexite}\n`;
        message += `• *Formats requis :* ${data.formatsText}\n\n`;
        message += `*📝 DESCRIPTION :*\n${data.description}\n\n`;
        message += `*Budget estimé :* ${data.budget}\n`;
        if (data.question !== "Aucune question") {
            message += `*❓ QUESTION SOUMISE :*\n${data.question}\n`;
        }

        const urlMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${monNumeroWhatsApp}?text=${urlMessage}`, '_blank');
    });
}

// Action : Télécharger une copie (Impression PDF)
const pdfBtn = document.querySelector('.btn-download-pdf');
if (pdfBtn) {
    pdfBtn.addEventListener('click', () => {
        renderRecap();
        window.print();
    });
}

// Bloquer la soumission par défaut du formulaire (évite les rechargements de page accidentels)
form.addEventListener('submit', (e) => {
    e.preventDefault();
});

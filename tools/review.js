// tools/review.js
document.addEventListener('DOMContentLoaded', () => {
    const paperText = document.getElementById('paper-text');
    const checkStructureButton = document.getElementById('check-structure');
    const structureResult = document.getElementById('structure-result');
    const detectInconsistenciesButton = document.getElementById('detect-inconsistencies');
    const inconsistenciesResult = document.getElementById('inconsistencies-result');
    const checkLengthButton = document.getElementById('check-length');
    const lengthResult = document.getElementById('length-result');
    const saveChecklistButton = document.getElementById('save-checklist');
    const loadChecklistButton = document.getElementById('load-checklist');
    const checklistItems = document.querySelectorAll('#checklist input[type="checkbox"]');

    // Secciones típicas
    const typicalSections = ['Abstract', 'Introduction', 'Methods', 'Results', 'Discussion', 'Conclusion', 'References'];

    if (checkStructureButton && paperText && structureResult) {
        checkStructureButton.addEventListener('click', () => {
            const text = paperText.value.trim();
            if (!text) return;
            const foundSections = typicalSections.filter(sec => new RegExp(`^${sec}$`, 'mgi').test(text));
            const missingSections = typicalSections.filter(sec => !foundSections.includes(sec));
            let result = '<p>Secciones encontradas: ' + (foundSections.length ? foundSections.join(', ') : 'Ninguna') + '</p>';
            if (missingSections.length) {
                result += '<p>Secciones faltantes sugeridas: ' + missingSections.join(', ') + '</p>';
            }
            structureResult.innerHTML = result;
        });
    }

    if (detectInconsistenciesButton && paperText && inconsistenciesResult) {
        detectInconsistenciesButton.addEventListener('click', () => {
            const text = paperText.value.trim();
            if (!text) return;
            // Extraer citas in-text
            const inTextCites = text.match(/\(([^)]+?)\s*,\s*\d{4}(?:;\s*[^)]+?,\s*\d{4})*\)/g) || [];
            const uniqueInText = new Set(inTextCites.map(cite => cite.replace(/[()]/g, '').trim()));
            // Extraer referencias (asumir sección References al final)
            const refSection = text.match(/References\s*([\s\S]*)$/i);
            const refs = refSection ? refSection[1].match(/[^.\n]+?\.\s*\d{4}\.\s*[^.\n]+?\./g) || [] : [];
            const uniqueRefs = new Set(refs.map(ref => ref.match(/([^.]+?)\.\s*(\d{4})/)?.[1] + ', ' + ref.match(/([^.]+?)\.\s*(\d{4})/)?.[2]));
            // Inconsistencias: citas no en refs, refs no citadas
            const missingRefs = Array.from(uniqueInText).filter(cite => !uniqueRefs.has(cite));
            const unusedRefs = Array.from(uniqueRefs).filter(ref => !uniqueInText.has(ref));
            let result = '';
            if (missingRefs.length) result += '<p>Citas sin referencia: ' + missingRefs.join(', ') + '</p>';
            if (unusedRefs.length) result += '<p>Referencias no citadas: ' + unusedRefs.join(', ') + '</p>';
            if (!result) result = '<p>No se detectaron inconsistencias mayores.</p>';
            inconsistenciesResult.innerHTML = result;
        });
    }

    if (checkLengthButton && paperText && lengthResult) {
        checkLengthButton.addEventListener('click', () => {
            const text = paperText.value.trim();
            if (!text) return;
            const sections = text.split(/^(Abstract|Introduction|Methods|Results|Discussion|Conclusion|References)$/mgi);
            let result = '';
            for (let i = 1; i < sections.length; i += 2) {
                const secName = sections[i].trim();
                const secContent = sections[i + 1].trim();
                const wordCount = secContent ? secContent.split(/\s+/).length : 0;
                result += `<p>${secName}: ${wordCount} palabras</p>`;
            }
            lengthResult.innerHTML = result || '<p>No se detectaron secciones.</p>';
        });
    }

    if (saveChecklistButton && checklistItems.length) {
        saveChecklistButton.addEventListener('click', () => {
            const state = Array.from(checklistItems).map(chk => chk.checked);
            localStorage.setItem('academicChecklist', JSON.stringify(state));
            alert('Checklist guardado.');
        });
    }

    if (loadChecklistButton && checklistItems.length) {
        loadChecklistButton.addEventListener('click', () => {
            const state = JSON.parse(localStorage.getItem('academicChecklist'));
            if (state) {
                checklistItems.forEach((chk, idx) => { chk.checked = state[idx]; });
            } else {
                alert('No hay checklist guardado.');
            }
        });
    }
});
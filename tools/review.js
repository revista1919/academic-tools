// tools/review.js
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const paperText = document.getElementById('paper-text');
    const fileUpload = document.getElementById('file-upload');
    const checkStructureButton = document.getElementById('check-structure');
    const structureResult = document.getElementById('structure-result');
    const detectInconsistenciesButton = document.getElementById('detect-inconsistencies');
    const inconsistenciesResult = document.getElementById('inconsistencies-result');
    const checkLengthButton = document.getElementById('check-length');
    const lengthResult = document.getElementById('length-result');
    const generateReportButton = document.getElementById('generate-report');
    const reportOutput = document.getElementById('report-output');
    const saveChecklistButton = document.getElementById('save-checklist');
    const loadChecklistButton = document.getElementById('load-checklist');
    const addChecklistItemButton = document.getElementById('add-checklist-item');
    const newItemInput = document.getElementById('new-checklist-item');
    const checklistContainer = document.getElementById('checklist');
    const citationStyleSelect = document.getElementById('citation-style');
    const exportResultsButton = document.getElementById('export-results');
    const undoButton = document.getElementById('undo');
    const redoButton = document.getElementById('redo');

    // Estado para undo/redo
    let textHistory = [];
    let historyIndex = -1;
    const MAX_HISTORY = 50;

    // Secciones típicas con variaciones y orden esperado
    const sectionVariants = {
        'Abstract': ['Abstract', 'Resumen', 'Summary'],
        'Introduction': ['Introduction', 'Introducción', 'Background'],
        'Literature Review': ['Literature Review', 'Revisión de Literatura', 'Related Work'],
        'Methods': ['Methods', 'Materials and Methods', 'Methodology', 'Métodos', 'Materiales y Métodos'],
        'Results': ['Results', 'Resultados', 'Findings'],
        'Discussion': ['Discussion', 'Discusión', 'Analysis'],
        'Conclusion': ['Conclusion', 'Conclusions', 'Conclusión', 'Conclusiones'],
        'References': ['References', 'Bibliography', 'Referencias', 'Bibliografía']
    };
    const expectedOrder = Object.keys(sectionVariants);

    // Recomendaciones de longitud por sección
    const lengthRecommendations = {
        'Abstract': { min: 150, max: 300 },
        'Introduction': { min: 400, max: 1000 },
        'Literature Review': { min: 500, max: 2000 },
        'Methods': { min: 300, max: 1500 },
        'Results': { min: 500, max: 2000 },
        'Discussion': { min: 600, max: 2000 },
        'Conclusion': { min: 200, max: 500 },
        'References': { min: 10, max: Infinity } // Conteo de referencias
    };

    // Patrones de citas por estilo
    const citationPatterns = {
        'APA': {
            inText: /\(([^)]+?),\s*(\d{4})(?:;\s*[^)]+?,\s*\d{4})*\)/g,
            ref: /([^.]+?)\.\s*(\d{4})\.\s*([^.]+?)\./g,
            extractInText: cite => cite.replace(/[()]/g, '').trim().split(';').map(c => c.trim()),
            extractRef: ref => {
                const match = ref.match(/([^.]+?)\.\s*(\d{4})/);
                return match ? match[1].trim() + ', ' + match[2] : '';
            }
        },
        'MLA': {
            inText: /\(([^)]+?)\s*(\d+)(?:;\s*[^)]+?\s*\d+)*\)/g,
            ref: /([^,]+?),\s*([^.]+?)\.\s*([^,]+?),\s*(\d{4})\./g,
            extractInText: cite => cite.replace(/[()]/g, '').trim().split(';').map(c => c.trim()),
            extractRef: ref => {
                const match = ref.match(/([^,]+?),\s*[^.]+?\.\s*[^,]+?,\s*(\d{4})/);
                return match ? match[1].trim() + ' ' + match[2] : '';
            }
        },
        'Chicago': {
            inText: /\(([^)]+?)\s*(\d{4})(?:;\s*[^)]+?,\s*\d{4})*\)/g,
            ref: /([^.]+?)\.\s*(\d{4})\.\s*([^.]+?)\./g,
            extractInText: cite => cite.replace(/[()]/g, '').trim().split(';').map(c => c.trim()),
            extractRef: ref => {
                const match = ref.match(/([^.]+?)\.\s*(\d{4})/);
                return match ? match[1].trim() + ', ' + match[2] : '';
            }
        },
        'IEEE': {
            inText: /\[\d+\]/g,
            ref: /\[\d+\]\s*([^.]+?),\s*"([^"]+?)",\s*[^,]+?,\s*vol\.\s*\d+,\s*no\.\s*\d+,\s*pp\.\s*\d+-\d+,\s*\w+\.\s*(\d{4})\./gi,
            extractInText: cite => cite.replace(/[\[\]]/g, '').trim(),
            extractRef: ref => {
                const match = ref.match(/\[\d+\]\s*([^.]+?),\s*"[^"]+?",\s*[^,]+?,\s*vol\.\s*\d+,\s*no\.\s*\d+,\s*pp\.\s*\d+-\d+,\s*\w+\.\s*(\d{4})/i);
                return match ? match[1].trim() + ' ' + match[2] : '';
            }
        }
    };

    // Función para guardar en historia
    function saveToHistory(text) {
        if (historyIndex < textHistory.length - 1) {
            textHistory = textHistory.slice(0, historyIndex + 1);
        }
        textHistory.push(text);
        if (textHistory.length > MAX_HISTORY) textHistory.shift();
        historyIndex = textHistory.length - 1;
    }

    // Inicializar historia
    if (paperText) {
        paperText.addEventListener('input', () => {
            saveToHistory(paperText.value);
        });
        saveToHistory(paperText.value || '');
    }

    // Undo / Redo
    if (undoButton) {
        undoButton.addEventListener('click', () => {
            if (historyIndex > 0) {
                historyIndex--;
                paperText.value = textHistory[historyIndex];
            }
        });
    }
    if (redoButton) {
        redoButton.addEventListener('click', () => {
            if (historyIndex < textHistory.length - 1) {
                historyIndex++;
                paperText.value = textHistory[historyIndex];
            }
        });
    }

    // Cargar archivo (TXT, MD, PDF)
    if (fileUpload) {
        fileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();

            reader.onload = (evt) => {
                let text = evt.target.result;
                if (typeof text === 'string') {
                    paperText.value = text;
                    saveToHistory(text);
                    alert('Archivo cargado exitosamente.');
                }
            };

            reader.onerror = () => alert('Error al cargar el archivo.');

            if (file.type === 'text/plain' || file.name.endsWith('.md')) {
                reader.readAsText(file);
            } else if (file.type === 'application/pdf' && typeof pdfjsLib !== 'undefined') {
                reader.readAsArrayBuffer(file);
                reader.onload = async (evt) => {
                    try {
                        const loadingTask = pdfjsLib.getDocument({ data: evt.target.result });
                        const pdf = await loadingTask.promise;
                        let text = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const content = await page.getTextContent();
                            text += content.items.map(item => item.str).join(' ') + '\n';
                        }
                        paperText.value = text;
                        saveToHistory(text);
                        alert('PDF cargado exitosamente.');
                    } catch (err) {
                        alert('Error al procesar el PDF: ' + err.message);
                    }
                };
            } else {
                alert('Formato no soportado. Usa TXT, MD o PDF.');
            }
        });
    }

    // === Verificador de Estructura ===
    if (checkStructureButton && paperText && structureResult) {
        checkStructureButton.addEventListener('click', () => {
            const text = paperText.value.trim();
            if (!text) return alert('Ingresa o carga texto primero.');

            const lines = text.split('\n');
            const foundSections = [];
            const sectionOrder = [];

            lines.forEach(line => {
                const trimmed = line.trim();
                if (!trimmed) return;
                for (const [key, variants] of Object.entries(sectionVariants)) {
                    if (variants.some(v => new RegExp(`^${v}$`, 'i').test(trimmed))) {
                        if (!foundSections.includes(key)) {
                            foundSections.push(key);
                            sectionOrder.push(key);
                        }
                        break;
                    }
                }
            });

            const missingSections = expectedOrder.filter(sec => !foundSections.includes(sec));

            let result = `<p><strong>Secciones encontradas:</strong> ${foundSections.length ? foundSections.join(', ') : 'Ninguna'}</p>`;
            if (missingSections.length) {
                result += `<p><strong>Secciones faltantes sugeridas:</strong> ${missingSections.join(', ')}</p>`;
            }

            // Verificar orden
            let orderCorrect = true;
            for (let i = 0; i < sectionOrder.length - 1; i++) {
                if (expectedOrder.indexOf(sectionOrder[i]) > expectedOrder.indexOf(sectionOrder[i + 1])) {
                    orderCorrect = false;
                    break;
                }
            }
            result += orderCorrect
                ? '<p><strong>Orden de secciones:</strong> Correcto.</p>'
                : `<p><strong>Advertencia:</strong> El orden no sigue el estándar esperado (${expectedOrder.join(' → ')}).</p>`;

            // Subsecciones
            const subSectionCount = (text.match(/^\d+\.\d+\s+/gm) || []).length;
            result += `<p><strong>Subsecciones detectadas:</strong> ${subSectionCount} (verifica consistencia en numeración).</p>`;

            structureResult.innerHTML = result;
        });
    }

    // === Detector de Inconsistencias ===
    if (detectInconsistenciesButton && paperText && inconsistenciesResult) {
        detectInconsistenciesButton.addEventListener('click', () => {
            const text = paperText.value.trim();
            if (!text) return alert('Ingresa texto primero.');

            const style = citationStyleSelect?.value || 'APA';
            const patterns = citationPatterns[style] || citationPatterns['APA'];

            // Citas in-text
            const inTextMatches = [...text.matchAll(patterns.inText)];
            const uniqueInText = new Set();
            inTextMatches.forEach(match => {
                patterns.extractInText(match[0]).forEach(c => {
                    if (c) uniqueInText.add(c);
                });
            });

            // Referencias
            const refSectionMatch = text.match(/(References|Bibliography|Referencias|Bibliografía)\s*([\s\S]*)$/i);
            const refSection = refSectionMatch ? refSectionMatch[2] : '';
            const refMatches = [...refSection.matchAll(patterns.ref)];
            const uniqueRefs = new Set();
            const allRefs = [];
            refMatches.forEach(match => {
                const key = patterns.extractRef(match[0]);
                if (key) {
                    uniqueRefs.add(key);
                    allRefs.push(match[0]);
                }
            });

            // Duplicados
            const seen = new Set();
            const duplicates = allRefs.filter(ref => {
                const key = patterns.extractRef(ref);
                if (seen.has(key)) return true;
                seen.add(key);
                return false;
            });

            let result = '';
            const missingRefs = [...uniqueInText].filter(c => !uniqueRefs.has(c));
            const unusedRefs = [...uniqueRefs].filter(r => !uniqueInText.has(r));

            if (missingRefs.length) result += `<p><strong>Citas sin referencia:</strong> ${missingRefs.join('; ')}</p>`;
            if (unusedRefs.length) result += `<p><strong>Referencias no citadas:</strong> ${unusedRefs.join('; ')}</p>`;
            if (duplicates.length) result += `<p><strong>Referencias duplicadas:</strong> ${duplicates.length} detectadas.</p>`;

            // Abreviaturas sin definición
            const abbrMatches = text.match(/\b[A-Z]{2,}\b/g) || [];
            const uniqueAbbr = [...new Set(abbrMatches)];
            const undefinedAbbr = uniqueAbbr.filter(abbr => {
                return !new RegExp(`\\b[A-Za-z\\s]+\\s*\\(${abbr}\\)`).test(text);
            });
            if (undefinedAbbr.length) result += `<p><strong>Abreviaturas sin definición:</strong> ${undefinedAbbr.join(', ')}</p>`;

            // Inconsistencias ortográficas comunes
            const variants = ['analyse', 'analyze', 'organisation', 'organization', 'colour', 'color'];
            const inconsistencies = [];
            for (let i = 0; i < variants.length; i += 2) {
                const v1 = new RegExp(variants[i], 'gi');
                const v2 = new RegExp(variants[i + 1], 'gi');
                if (v1.test(text) && v2.test(text)) {
                    inconsistencies.push(`${variants[i]} vs ${variants[i + 1]}`);
                }
            }
            if (inconsistencies.length) result += `<p><strong>Inconsistencias ortográficas:</strong> ${inconsistencias.join('; ')}</p>`;

            if (!result) result = '<p>No se detectaron inconsistencias mayores.</p>';
            inconsistenciesResult.innerHTML = result;
        });
    }

    // === Control de Longitud ===
    if (checkLengthButton && paperText && lengthResult) {
        checkLengthButton.addEventListener('click', () => {
            const text = paperText.value.trim();
            if (!text) return alert('Ingresa texto primero.');

            const sectionNames = Object.values(sectionVariants).flat();
            const sectionRegex = new RegExp(`^(${sectionNames.join('|')})$`, 'mgi');
            const parts = text.split(sectionRegex);

            let result = `<table style="width:100%; border-collapse:collapse;">
                <thead><tr style="background:#f0f0f0;">
                    <th style="border:1px solid #ccc; padding:8px;">Sección</th>
                    <th style="border:1px solid #ccc; padding:8px;">Palabras</th>
                    <th style="border:1px solid #ccc; padding:8px;">Caracteres</th>
                    <th style="border:1px solid #ccc; padding:8px;">Oraciones</th>
                    <th style="border:1px solid #ccc; padding:8px;">Recomendación</th>
                </tr></thead><tbody>`;

            for (let i = 1; i < parts.length; i += 2) {
                let secName = parts[i].trim();
                let standardName = secName;
                for (const [key, variants] of Object.entries(sectionVariants)) {
                    if (variants.some(v => new RegExp(`^${v}$`, 'i').test(secName))) {
                        standardName = key;
                        break;
                    }
                }

                const content = (parts[i + 1] || '').trim();
                if (!content) continue;

                const words = content.split(/\s+/).filter(w => w.length).length;
                const chars = content.length;
                const sentences = content.split(/[.!?]+/).filter(s => s.trim()).length;

                const rec = lengthRecommendations[standardName] || { min: 0, max: Infinity };
                let status = 'Adecuado';
                if (standardName === 'References') {
                    const refCount = content.split('\n').filter(line => line.trim()).length;
                    status = refCount < rec.min ? 'Pocas referencias' : 'Adecuado';
                    result += `<tr>
                        <td style="border:1px solid #ccc; padding:8px;">${standardName}</td>
                        <td style="border:1px solid #ccc; padding:8px;">${refCount} refs</td>
                        <td style="border:1px solid #ccc; padding:8px;">—</td>
                        <td style="border:1px solid #ccc; padding:8px;">—</td>
                        <td style="border:1px solid #ccc; padding:8px;">${status}</td>
                    </tr>`;
                } else {
                    if (words < rec.min) status = 'Demasiado corto';
                    else if (words > rec.max && rec.max !== Infinity) status = 'Demasiado largo';
                    result += `<tr>
                        <td style="border:1px solid #ccc; padding:8px;">${standardName}</td>
                        <td style="border:1px solid #ccc; padding:8px;">${words}</td>
                        <td style="border:1px solid #ccc; padding:8px;">${chars}</td>
                        <td style="border:1px solid #ccc; padding:8px;">${sentences}</td>
                        <td style="border:1px solid #ccc; padding:8px;">${status} (${rec.min}–${rec.max === Infinity ? '∞' : rec.max})</td>
                    </tr>`;
                }
            }
            result += '</tbody></table>';
            if (parts.length <= 1) result = '<p>No se detectaron secciones claras.</p>';
            lengthResult.innerHTML = result;
        });
    }

    // === Generar Reporte Completo ===
    if (generateReportButton && reportOutput) {
        generateReportButton.addEventListener('click', () => {
            checkStructureButton?.click();
            detectInconsistenciesButton?.click();
            checkLengthButton?.click();

            const checked = checklistContainer.querySelectorAll('input[type="checkbox"]:checked').length;
            const total = checklistContainer.querySelectorAll('input[type="checkbox"]').length;

            const score = 100 -
                (structureResult.textContent?.includes('faltantes') ? 15 : 0) -
                (inconsistenciesResult.textContent?.match(/(sin|no citadas|duplicadas|sin definición)/g)?.length || 0) * 8 -
                (lengthResult.textContent?.match(/(corto|largo|Pocas)/g)?.length || 0) * 10 +
                (checked / total) * 30;

            const finalScore = Math.max(0, Math.round(score));

            reportOutput.innerHTML = `
                <h3>Reporte de Revisión Académica</h3>
                <p><strong>Puntuación general:</strong> ${finalScore}/100</p>
                <p><strong>Checklist:</strong> ${checked}/${total} ítems completados</p>
                <hr>
                ${structureResult.innerHTML}
                <hr>
                ${inconsistenciesResult.innerHTML}
                <hr>
                ${lengthResult.innerHTML}
                <hr>
                <p><em>Recomendación final:</em> ${finalScore >= 80 ? 'Listo para envío' : finalScore >= 60 ? 'Requiere revisiones menores' : 'Necesita mejoras importantes'}</p>
            `;
        });
    }

    // === Checklist Dinámico ===
    function updateChecklistItems() {
        // Actualiza eventos de eliminación si es necesario
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.onclick = () => btn.parentElement.remove();
        });
    }

    if (addChecklistItemButton && newItemInput && checklistContainer) {
        addChecklistItemButton.addEventListener('click', () => {
            const text = newItemInput.value.trim();
            if (!text) return alert('Escribe el texto del nuevo ítem.');

            const id = 'chk-' + Date.now();
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" id="${id}">
                <label for="${id}">${text}</label>
                <button class="remove-item" style="margin-left:10px; color:red;">Eliminar</button>
            `;
            checklistContainer.appendChild(li);
            newItemInput.value = '';
            updateChecklistItems();
        });
    }

    if (saveChecklistButton) {
        saveChecklistButton.addEventListener('click', () => {
            const items = Array.from(checklistContainer.querySelectorAll('li')).map(li => ({
                text: li.querySelector('label').textContent,
                checked: li.querySelector('input').checked,
                id: li.querySelector('input').id
            }));
            localStorage.setItem('academicChecklist', JSON.stringify(items));
            alert('Checklist guardado correctamente.');
        });
    }

    if (loadChecklistButton) {
        loadChecklistButton.addEventListener('click', () => {
            const saved = localStorage.getItem('academicChecklist');
            if (!saved) return alert('No hay checklist guardado.');

            const items = JSON.parse(saved);
            checklistContainer.innerHTML = '';
            items.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <input type="checkbox" id="${item.id}" ${item.checked ? 'checked' : ''}>
                    <label for="${item.id}">${item.text}</label>
                    <button class="remove-item" style="margin-left:10px; color:red;">Eliminar</button>
                `;
                checklistContainer.appendChild(li);
            });
            updateChecklistItems();
            alert('Checklist cargado.');
        });
    }

    // === Exportar Reporte ===
    if (exportResultsButton && generateReportButton && reportOutput) {
        exportResultsButton.addEventListener('click', () => {
            generateReportButton.click();
            setTimeout(() => {
                const text = reportOutput.innerText || 'Reporte vacío';
                const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'reporte_revision_academica_' + new Date().toISOString().slice(0,10) + '.txt';
                a.click();
                URL.revokeObjectURL(url);
            }, 500);
        });
    }

    // Inicializar eliminación de ítems existentes
    updateChecklistItems();
});
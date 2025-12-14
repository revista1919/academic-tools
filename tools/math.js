// tools/math.js
document.addEventListener('DOMContentLoaded', async () => {
    const katex = window.katex;
    const math = window.math;
    const Chart = window.Chart;
    const Tesseract = window.Tesseract;
    const ComputeEngine = window.ComputeEngine;
    const nerdamer = window.nerdamer;

    // ==================== INICIALIZACIÓN DE TESSERACT (OCR) - CORREGIDO PARA ECUACIONES ====================
    let worker = null;
    try {
        worker = await Tesseract.createWorker('eng+equ', 0, {
            workerPath: 'https://unpkg.com/tesseract.js@v5/dist/worker.min.js',
            corePath: 'https://unpkg.com/tesseract.js-core@v5/tesseract-core.wasm.js',
            langPath: 'https://github.com/tesseract-ocr/tessdata_best/raw/main/'
        });
        window.tesseractWorker = worker;
        console.log('Tesseract inicializado correctamente con soporte para ecuaciones (eng+equ, legacy engine)');
    } catch (e) {
        console.warn('Tesseract no disponible (OCR deshabilitado):', e);
        window.tesseractWorker = null;
    }

    // ==================== OBJETO DE SÍMBOLOS COMPLETO ====================
    const symbols = {
        basic: {
            '\\frac{a}{b}': 'Fracción',
            '\\sqrt{a}': 'Raíz cuadrada',
            'a^{b}': 'Exponente',
            'a_{b}': 'Subíndice',
            '\\pm': 'Plus minus',
            '\\mp': 'Minus plus',
            '\\times': 'Multiplicación',
            '\\div': 'División',
            '\\cdot': 'Punto centrado',
            '\\ast': 'Asterisco',
            '\\star': 'Estrella',
            '\\dagger': 'Daga',
            '\\ddagger': 'Daga doble',
            '\\cap': 'Intersección',
            '\\cup': 'Unión',
            '\\uplus': 'Adición multiset',
            '\\sqcap': 'Cap cuadrado',
            '\\sqcup': 'Cup cuadrado',
            '\\vee': 'O lógico',
            '\\wedge': 'Y lógico',
            '\\bullet': 'Bala',
            '\\circ': 'Círculo pequeño',
            '\\diamond': 'Diamante',
            '\\oplus': 'Plus circulado',
            '\\ominus': 'Minus circulado',
            '\\otimes': 'Times circulado',
            '\\oslash': 'Slash circulado',
            '\\odot': 'Dot circulado',
            '\\wr': 'Producto corona',
            '\\amalg': 'Unión amalgamada'
        },
        calculus: {
            '\\int a dx': 'Integral',
            '\\sum_{i=1}^{n}': 'Suma',
            '\\lim_{x \\to a}': 'Límite',
            '\\frac{d}{dx}': 'Derivada',
            '\\oint': 'Integral contorno',
            '\\prod': 'Producto',
            '\\coprod': 'Coproducción',
            '\\partial': 'Derivada parcial'
        },
        greek: {
            '\\Alpha': 'Alpha mayúscula',
            '\\alpha': 'Alpha minúscula',
            '\\Beta': 'Beta mayúscula',
            '\\beta': 'Beta minúscula',
            '\\Gamma': 'Gamma mayúscula',
            '\\gamma': 'Gamma minúscula',
            '\\Delta': 'Delta mayúscula',
            '\\delta': 'Delta minúscula',
            '\\Epsilon': 'Epsilon mayúscula',
            '\\epsilon': 'Epsilon minúscula',
            '\\varepsilon': 'Epsilon variante',
            '\\Zeta': 'Zeta mayúscula',
            '\\zeta': 'Zeta minúscula',
            '\\Eta': 'Eta mayúscula',
            '\\eta': 'Eta minúscula',
            '\\Theta': 'Theta mayúscula',
            '\\theta': 'Theta minúscula',
            '\\vartheta': 'Theta variante',
            '\\Iota': 'Iota mayúscula',
            '\\iota': 'Iota minúscula',
            '\\Kappa': 'Kappa mayúscula',
            '\\kappa': 'Kappa minúscula',
            '\\varkappa': 'Kappa variante',
            '\\Lambda': 'Lambda mayúscula',
            '\\lambda': 'Lambda minúscula',
            '\\Mu': 'Mu mayúscula',
            '\\mu': 'Mu minúscula',
            '\\Nu': 'Nu mayúscula',
            '\\nu': 'Nu minúscula',
            '\\Xi': 'Xi mayúscula',
            '\\xi': 'Xi minúscula',
            '\\Omicron': 'Omicron mayúscula',
            '\\omicron': 'Omicron minúscula',
            '\\Pi': 'Pi mayúscula',
            '\\pi': 'Pi minúscula',
            '\\varpi': 'Pi variante',
            '\\Rho': 'Rho mayúscula',
            '\\rho': 'Rho minúscula',
            '\\varrho': 'Rho variante',
            '\\Sigma': 'Sigma mayúscula',
            '\\sigma': 'Sigma minúscula',
            '\\varsigma': 'Sigma variante',
            '\\Tau': 'Tau mayúscula',
            '\\tau': 'Tau minúscula',
            '\\Upsilon': 'Upsilon mayúscula',
            '\\upsilon': 'Upsilon minúscula',
            '\\Phi': 'Phi mayúscula',
            '\\phi': 'Phi minúscula',
            '\\varphi': 'Phi variante',
            '\\Chi': 'Chi mayúscula',
            '\\chi': 'Chi minúscula',
            '\\Psi': 'Psi mayúscula',
            '\\psi': 'Psi minúscula',
            '\\Omega': 'Omega mayúscula',
            '\\omega': 'Omega minúscula',
            '\\Digamma': 'Digamma mayúscula',
            '\\digamma': 'Digamma minúscula'
        },
        operators: {
            '+': 'Plus',
            '-': 'Minus',
            '!': 'Factorial',
            '\\#': 'Primorial',
            '\\neg': 'Negación lógica'
        },
        relations: {
            '<': 'Menor que',
            '>': 'Mayor que',
            '\\nless': 'No menor que',
            '\\ngtr': 'No mayor que',
            '\\leq': 'Menor o igual',
            '\\geq': 'Mayor o igual',
            '\\leqslant': 'Menor o igual (variante)',
            '\\geqslant': 'Mayor o igual (variante)',
            '\\nleq': 'Ni menor ni igual',
            '\\ngeq': 'Ni mayor ni igual',
            '\\nleqslant': 'Ni menor ni igual (variante)',
            '\\ngeqslant': 'Ni mayor ni igual (variante)',
            '\\prec': 'Precede',
            '\\succ': 'Sucede',
            '\\nprec': 'No precede',
            '\\nsucc': 'No sucede',
            '\\preceq': 'Precede o igual',
            '\\succeq': 'Sucede o igual',
            '\\npreceq': 'Ni precede ni igual',
            '\\nsucceq': 'Ni sucede ni igual',
            '\\ll': 'Mucho menor que',
            '\\gg': 'Mucho mayor que',
            '\\lll': 'Triple menor que',
            '\\ggg': 'Triple mayor que',
            '\\subset': 'Subconjunto propio',
            '\\supset': 'Superconjunto propio',
            '\\not\\subset': 'No subconjunto propio',
            '\\not\\supset': 'No superconjunto propio',
            '\\subseteq': 'Subconjunto',
            '\\supseteq': 'Superconjunto',
            '\\nsubseteq': 'No subconjunto',
            '\\nsupseteq': 'No superconjunto',
            '\\sqsubset': 'Subconjunto cuadrado',
            '\\sqsupset': 'Superconjunto cuadrado',
            '\\sqsubseteq': 'Subconjunto cuadrado o igual',
            '\\sqsupseteq': 'Superconjunto cuadrado o igual',
            '=': 'Igual',
            '\\doteq': 'Igual con punto',
            '\\equiv': 'Equivalente',
            '\\approx': 'Aproximadamente',
            '\\cong': 'Congruente',
            '\\simeq': 'Similar o igual',
            '\\sim': 'Similar',
            '\\propto': 'Proporcional',
            '\\neq': 'No igual',
            '\\ne': 'No igual (variante)',
            '\\parallel': 'Paralelo',
            '\\nparallel': 'No paralelo',
            '\\asymp': 'Asintótico',
            '\\bowtie': 'Bowtie',
            '\\vdash': 'Se convierte en',
            '\\dashv': 'Dashv',
            '\\in': 'Miembro de',
            '\\ni': 'Posee miembro',
            '\\smile': 'Smile',
            '\\frown': 'Frown',
            '\\models': 'Modela',
            '\\notin': 'No miembro de',
            '\\perp': 'Perpendicular',
            '\\mid': 'Divide'
        },
        negated_relations: {
            '\\neq': 'No igual',
            '\\notin': 'No miembro de',
            '\\nless': 'No menor que',
            '\\ngtr': 'No mayor que',
            '\\nleq': 'No menor o igual',
            '\\ngeq': 'No mayor o igual',
            '\\nleqslant': 'Ni menor ni igual (variante)',
            '\\ngeqslant': 'Ni mayor ni igual (variante)',
            '\\nleqq': 'No menor o igual (variante)',
            '\\ngeqq': 'No mayor o igual (variante)',
            '\\lneq': 'Menor pero no igual',
            '\\gneq': 'Mayor pero no igual',
            '\\lneqq': 'Menor pero no igual (variante)',
            '\\gneqq': 'Mayor pero no igual (variante)',
            '\\lvertneqq': 'Menor con barra vertical pero no igual',
            '\\gvertneqq': 'Mayor con barra vertical pero no igual',
            '\\lnsim': 'Menor no similar',
            '\\gnsim': 'Mayor no similar',
            '\\lnapprox': 'Menor no aproximado',
            '\\gnapprox': 'Mayor no aproximado',
            '\\nprec': 'No precede',
            '\\nsucc': 'No sucede',
            '\\npreceq': 'Ni precede ni igual',
            '\\nsucceq': 'Ni sucede ni igual',
            '\\precneqq': 'Precede pero no igual',
            '\\succneqq': 'Sucede pero no igual',
            '\\precnsim': 'Precede no similar',
            '\\succnsim': 'Sucede no similar',
            '\\precnapprox': 'Precede no aproximado',
            '\\succnapprox': 'Sucede no aproximado',
            '\\nsim': 'No similar',
            '\\ncong': 'No congruente',
            '\\nshortmid': 'No divide (corto)',
            '\\nshortparallel': 'No paralelo (corto)',
            '\\nmid': 'No divide',
            '\\nparallel': 'No paralelo',
            '\\nvdash': 'No se convierte en',
            '\\nvDash': 'No modela',
            '\\nVdash': 'No dashv',
            '\\nVDash': 'No dash vertical',
            '\\ntriangleleft': 'No triángulo izquierdo',
            '\\ntriangleright': 'No triángulo derecho',
            '\\ntrianglelefteq': 'No triángulo izquierdo igual',
            '\\ntrianglerighteq': 'No triángulo derecho igual',
            '\\nsubseteq': 'No subconjunto',
            '\\nsupseteq': 'No superconjunto',
            '\\nsubseteqq': 'No subconjunto (variante)',
            '\\nsupseteqq': 'No superconjunto (variante)',
            '\\subsetneq': 'Subconjunto propio (no igual)',
            '\\supsetneq': 'Superconjunto propio (no igual)',
            '\\varsubsetneq': 'Subconjunto propio variable (no igual)',
            '\\varsupsetneq': 'Superconjunto propio variable (no igual)',
            '\\subsetneqq': 'Subconjunto propio no igual (variante)',
            '\\supsetneqq': 'Superconjunto propio no igual (variante)',
            '\\varsubsetneqq': 'Subconjunto propio variable no igual (variante)',
            '\\varsupsetneqq': 'Superconjunto propio variable no igual (variante)'
        },
        sets_logic: {
            '\\emptyset': 'Conjunto vacío',
            '\\varnothing': 'Conjunto vacío (variante)',
            '\\mathbb{N}': 'Números naturales',
            '\\mathbb{Z}': 'Enteros',
            '\\mathbb{Q}': 'Racionales',
            '\\mathbb{A}': 'Algebraicos',
            '\\mathbb{R}': 'Reales',
            '\\mathbb{C}': 'Complejos',
            '\\mathbb{H}': 'Cuaterniones',
            '\\mathbb{O}': 'Octoniones',
            '\\mathbb{S}': 'Sedeniones',
            '\\in': 'Miembro de',
            '\\notin': 'No miembro de',
            '\\ni': 'Posee',
            '\\subset': 'Subconjunto propio',
            '\\subseteq': 'Subconjunto',
            '\\supset': 'Superconjunto propio',
            '\\supseteq': 'Superconjunto',
            '\\cup': 'Unión',
            '\\cap': 'Intersección',
            '\\setminus': 'Diferencia',
            '\\exists': 'Existe',
            '\\exists!': 'Existe único',
            '\\nexists': 'No existe',
            '\\forall': 'Para todo',
            '\\neg': 'No lógico',
            '\\lor': 'O lógico',
            '\\land': 'Y lógico',
            '\\Longrightarrow': 'Implica',
            '\\implies': 'Implica (variante)',
            '\\Rightarrow': 'Implica (derecha)',
            '\\Longleftarrow': 'Es implicado por',
            '\\Leftarrow': 'Es implicado por (izquierda)',
            '\\iff': 'Si y solo si',
            '\\Leftrightarrow': 'Equivalente',
            '\\top': 'Top',
            '\\bot': 'Bottom'
        },
        geometry: {
            '\\overline{AB}': 'Segmento',
            '\\overrightarrow{AB}': 'Rayo',
            '\\angle': 'Ángulo',
            '\\measuredangle': 'Ángulo medido',
            '\\triangle': 'Triángulo',
            '\\square': 'Cuadrado',
            '\\cong': 'Congruente',
            '\\ncong': 'No congruente',
            '\\sim': 'Similar',
            '\\nsim': 'No similar',
            '\\parallel': 'Paralelo',
            '\\perp': 'Perpendicular'
        },
        arrows: {
            '\\leftarrow': 'Flecha izquierda',
            '\\Leftarrow': 'Flecha doble izquierda',
            '\\rightarrow': 'Flecha derecha',
            '\\Rightarrow': 'Flecha doble derecha',
            '\\leftrightarrow': 'Flecha izquierda-derecha',
            '\\rightleftharpoons': 'Equilibrio',
            '\\uparrow': 'Flecha arriba',
            '\\downarrow': 'Flecha abajo',
            '\\Uparrow': 'Flecha doble arriba',
            '\\Downarrow': 'Flecha doble abajo',
            '\\Leftrightarrow': 'Flecha doble izquierda-derecha',
            '\\Updownarrow': 'Flecha doble arriba-abajo',
            '\\mapsto': 'Mapea a',
            '\\longmapsto': 'Mapea largo a',
            '\\nearrow': 'Flecha noreste',
            '\\searrow': 'Flecha sureste',
            '\\swarrow': 'Flecha suroeste',
            '\\nwarrow': 'Flecha noroeste',
            '\\leftharpoonup': 'Arpón izquierda arriba',
            '\\leftharpoondown': 'Arpón izquierda abajo',
            '\\rightharpoonup': 'Arpón derecha arriba',
            '\\rightharpoondown': 'Arpón derecha abajo',
            '\\ncurvearrowdownup': 'No flecha curva abajo-arriba',
            '\\nlhooknwarrow': 'No hook izquierda noroeste',
            '\\downharpoonccw': 'Arpón abajo antihorario',
            '\\downharpooncw': 'Arpón abajo horario',
            '\\leftharpoonccw': 'Arpón izquierda antihorario',
            '\\leftharpooncw': 'Arpón izquierda horario',
            '\\rightharpoonccw': 'Arpón derecha antihorario',
            '\\rightharpooncw': 'Arpón derecha horario',
            '\\upharpoonccw': 'Arpón arriba antihorario',
            '\\upharpooncw': 'Arpón arriba horario'
        },
        miscellaneous: {
            '\\infty': 'Infinito',
            '\\forall': 'Para todo',
            '\\Re': 'Parte real',
            '\\Im': 'Parte imaginaria',
            '\\nabla': 'Nabla',
            '\\exists': 'Existe',
            '\\nexists': 'No existe',
            '\\partial': 'Parcial',
            '\\emptyset': 'Vacío',
            '\\varnothing': 'Vacío variante',
            '\\wp': 'Weierstrass p',
            '\\complement': 'Complemento',
            '\\neg': 'Negación',
            '\\cdots': 'Puntos centrados',
            '\\square': 'Cuadrado',
            '\\surd': 'Raíz',
            '\\blacksquare': 'Cuadrado negro',
            '\\triangle': 'Triángulo',
            '\\Box': 'Caja',
            '\\boxtimes': 'Caja con x',
            '\\perp': 'Perpendicular',
            '\\simeq': 'Similar igual',
            '\\approx': 'Aproximado',
            '\\equiv': 'Equivalente',
            '\\cong': 'Congruente'
        },
        accents_diacritics: {
            '\\\"{}': 'Diéresis',
            '\\\'{}': 'Agudo',
            '\\\~{}': 'Tilde',
            '\\u{}': 'Breve',
            '\\.{}': 'Punto',
            '\\b{}': 'Barra debajo',
            '\\c{}': 'Cedilla',
            '\\^{}': 'Circunflejo',
            '\\k{}': 'Ogonek',
            '\\v{}': 'Carón',
            '\\d{}': 'Punto debajo',
            '\\r{}': 'Anillo',
            '\\textcircled{}': 'Circulado',
            '\\textacutemacron{}': 'Agudo + macrón',
            '\\textbrevemacron{}': 'Breve + macrón',
            '\\textcircumacute{}': 'Circunflejo + agudo',
            '\\overarc{}': 'Arco sobre',
            '\\underarc{}': 'Arco debajo'
        }
    };

    // ==================== EDITOR DE ECUACIONES ====================
    const mathField = document.getElementById('math-field');
    const latexOutput = document.getElementById('latex-output');
    const symbolCategory = document.getElementById('symbol-category');
    const symbolSelect = document.getElementById('symbol-select');
    const insertSymbol = document.getElementById('insert-symbol');
    const templateSelect = document.getElementById('template-select');
    const insertTemplate = document.getElementById('insert-template');
    const copyLatex = document.getElementById('copy-latex');

    function populateSymbols(category) {
        if (!symbolSelect) return;
        symbolSelect.innerHTML = '<option value="" disabled selected>Selecciona símbolo</option>';
        const catSymbols = symbols[category] || {};
        Object.keys(catSymbols).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = catSymbols[key];
            symbolSelect.appendChild(opt);
        });
    }

    if (symbolCategory) {
        symbolCategory.addEventListener('change', () => populateSymbols(symbolCategory.value));
        populateSymbols('basic');
    }

    function updateLatexPreview() {
        if (!latexOutput || !mathField) return;
        const latex = mathField.value.trim();
        latexOutput.innerHTML = '';
        if (latex) {
            try {
                katex.render(latex, latexOutput, {
                    throwOnError: false,
                    displayMode: true
                });
            } catch (e) {
                latexOutput.innerHTML = `<span style="color:red;">Error LaTeX: ${e.message}</span>`;
            }
        } else {
            latexOutput.innerHTML = '<p style="color:#666;">Escribe algo para ver el preview...</p>';
        }
    }

    if (mathField) {
        mathField.addEventListener('input', updateLatexPreview);
        updateLatexPreview();
    }

    if (insertSymbol && mathField && symbolSelect) {
        insertSymbol.addEventListener('click', () => {
            const sym = symbolSelect.value;
            if (sym) {
                mathField.insert(sym);
                mathField.focus();
                updateLatexPreview();
            } else {
                alert('Selecciona un símbolo');
            }
        });
    }

    if (insertTemplate && mathField && templateSelect) {
        insertTemplate.addEventListener('click', () => {
            const temp = templateSelect.value;
            if (temp) {
                mathField.insert(temp);
                mathField.focus();
                updateLatexPreview();
            }
        });
    }

    if (copyLatex && mathField) {
        copyLatex.addEventListener('click', () => {
            const latex = mathField.value;
            if (!latex.trim()) {
                alert('No hay LaTeX para copiar');
                return;
            }
            navigator.clipboard.writeText(latex).then(() => {
                alert('¡LaTeX copiado al portapapeles!');
            }).catch(err => {
                console.error('Error al copiar:', err);
                alert('Error al copiar');
            });
        });
    }

    // ==================== FÓRMULA A IMAGEN ====================
    const formulaButton = document.getElementById('formula-to-image');
    const formulaCanvas = document.getElementById('formula-canvas');
    const downloadImage = document.getElementById('download-image');
    const colorSelect = document.getElementById('color-select');
    const sizeSelect = document.getElementById('size-select');

    if (formulaButton && mathField && formulaCanvas && window.html2canvas && katex) {
        formulaButton.addEventListener('click', async () => {
            const latex = mathField.value.trim();
            if (!latex) {
                alert('Escribe una fórmula primero');
                return;
            }
            try {
                const tempDiv = document.createElement('div');
                tempDiv.style.cssText = 'position: absolute; left: -9999px; padding: 20px; background: transparent;';
                document.body.appendChild(tempDiv);
                katex.render(latex, tempDiv, { throwOnError: true, displayMode: true });
                const katexEl = tempDiv.firstElementChild;
                if (!katexEl) throw new Error('No se generó KaTeX');
                const canvas = await html2canvas(katexEl, { scale: 2, backgroundColor: null, useCORS: true });
                formulaCanvas.width = canvas.width;
                formulaCanvas.height = canvas.height;
                const ctx = formulaCanvas.getContext('2d');
                ctx.drawImage(canvas, 0, 0);
                const dataUrl = formulaCanvas.toDataURL('image/png');
                downloadImage.href = dataUrl;
                downloadImage.download = 'formula.png';
                downloadImage.textContent = 'Descargar PNG';
                downloadImage.style.display = 'inline-block';
                document.body.removeChild(tempDiv);
            } catch (e) {
                console.error(e);
                alert(`Error generando imagen: ${e.message}`);
            }
        });
    }

    // ==================== OCR ====================
    const ocrInput = document.getElementById('ocr-input');
    const ocrButton = document.getElementById('ocr-button');
    const ocrOutput = document.getElementById('ocr-output');
    const ocrPreview = document.getElementById('ocr-preview');
    const ocrImagePreview = document.getElementById('ocr-image-preview');
    const copyOcr = document.getElementById('copy-ocr');
    const importOcrToEditor = document.getElementById('import-ocr-to-editor');

    if (ocrInput && ocrImagePreview) {
        ocrInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                ocrImagePreview.src = URL.createObjectURL(file);
                ocrImagePreview.style.display = 'block';
                ocrImagePreview.alt = 'Vista previa de imagen';
            }
        });
    }

    if (ocrButton && ocrOutput && worker) {
        ocrButton.addEventListener('click', async () => {
            const file = ocrInput?.files[0];
            if (!file) {
                alert('Selecciona una imagen primero');
                return;
            }
            ocrOutput.textContent = 'Procesando OCR...';
            ocrPreview.innerHTML = '';
            try {
                const { data: { text } } = await worker.recognize(file);
                const cleanedText = text.trim().replace(/\s+/g, ' ');
                ocrOutput.textContent = cleanedText;
                if (cleanedText) {
                    try {
                        katex.render(cleanedText, ocrPreview, { throwOnError: false, displayMode: true });
                    } catch (renderErr) {
                        ocrPreview.innerHTML = `<span style="color:orange;">Texto extraído: ${cleanedText}<br>No se pudo renderizar como LaTeX (edita manualmente)</span>`;
                    }
                }
            } catch (err) {
                console.error('OCR error:', err);
                ocrOutput.textContent = `Error en OCR: ${err.message}`;
            }
        });
    } else if (ocrButton) {
        ocrButton.disabled = true;
        ocrButton.textContent = 'OCR no disponible';
    }

    if (copyOcr && ocrOutput) {
        copyOcr.addEventListener('click', () => {
            const text = ocrOutput.textContent;
            if (!text || text.startsWith('Error') || text === 'Procesando OCR...') {
                alert('No hay texto válido para copiar');
                return;
            }
            navigator.clipboard.writeText(text).then(() => alert('Texto OCR copiado'));
        });
    }

    if (importOcrToEditor && mathField && ocrOutput) {
        importOcrToEditor.addEventListener('click', () => {
            const text = ocrOutput.textContent;
            if (!text || text.startsWith('Error')) {
                alert('No hay texto válido para importar');
                return;
            }
            mathField.value = text;
            mathField.focus();
            updateLatexPreview();
        });
    }

    // ==================== CONVERSOR DE UNIDADES ====================
    const unitCategory = document.getElementById('unit-category');
    const unitValue = document.getElementById('unit-value');
    const unitFrom = document.getElementById('unit-from');
    const unitTo = document.getElementById('unit-to');
    const convertButton = document.getElementById('convert-unit');
    const unitResult = document.getElementById('unit-result');

    const unitExamples = {
        length: ['m', 'cm', 'km', 'ft', 'in', 'mile'],
        mass: ['kg', 'g', 'lb', 'oz'],
        temperature: ['celsius', 'fahrenheit', 'kelvin'],
        energy: ['joule', 'calorie', 'kwh']
    };

    function populateUnits(category) {
        const units = unitExamples[category] || [];
        [unitFrom, unitTo].forEach(select => {
            if (select) {
                select.innerHTML = '';
                units.forEach(u => {
                    const opt = document.createElement('option');
                    opt.value = u;
                    opt.textContent = u.toUpperCase();
                    select.appendChild(opt);
                });
            }
        });
    }

    if (unitCategory) {
        unitCategory.addEventListener('change', () => populateUnits(unitCategory.value));
        populateUnits('length');
    }

    if (convertButton && unitResult && math) {
        convertButton.addEventListener('click', () => {
            const valueStr = unitValue?.value.trim();
            const from = unitFrom?.value;
            const to = unitTo?.value;
            if (!valueStr || !from || !to) {
                unitResult.textContent = 'Ingresa valor y selecciona unidades';
                return;
            }
            try {
                const result = math.evaluate(`${valueStr} ${from} to ${to}`);
                unitResult.innerHTML = `<strong>${result.toPrecision(10)}</strong> ${to}`;
            } catch (e) {
                unitResult.textContent = `Error: ${e.message}`;
            }
        });
    }

    // ==================== SOLUCIONADOR DE ECUACIONES ====================
    const equationInput = document.getElementById('equation-input');
    const solveButton = document.getElementById('solve-equation');
    const equationResult = document.getElementById('equation-result');

    if (solveButton && equationResult && nerdamer) {
        solveButton.addEventListener('click', () => {
            const expr = equationInput?.value.trim();
            if (!expr) {
                equationResult.textContent = 'Escribe una ecuación o expresión (ej: x^2 - 4 = 0, sin(x))';
                return;
            }

            try {
                const solution = nerdamer.solve(expr, 'x');
                if (solution === undefined || solution.toString() === 'false') {
                    const result = math.evaluate(expr);
                    equationResult.innerHTML = `<strong>Evaluación: ${result.toString()}</strong><br><small>(No es ecuación resoluble simbólicamente)</small>`;
                } else {
                    equationResult.innerHTML = `<strong>Solución: ${solution.toString()}</strong>`;
                }
            } catch (e) {
                equationResult.textContent = `Error: ${e.message}`;
            }
        });
    }

    // ==================== GRAFICADOR DE FUNCIONES Y ECUACIONES ====================
    const functionField = document.getElementById('function-field');
    const xMinInput = document.getElementById('x-min');
    const xMaxInput = document.getElementById('x-max');
    const stepsInput = document.getElementById('steps');
    const plotButton = document.getElementById('plot-function');
    const plotCanvas = document.getElementById('plot-canvas');

    let chartInstance = null;

    if (plotButton && functionField && plotCanvas && ComputeEngine && Chart && nerdamer) {
        plotCanvas.style.width = '100%';
        plotCanvas.style.height = '400px';
        plotCanvas.style.border = '1px solid #ccc';
        plotCanvas.style.backgroundColor = '#fff';

        plotButton.addEventListener('click', () => {
            const rawFuncs = functionField.value.trim();
            if (!rawFuncs) {
                alert('Ingresa al menos una función o ecuación (ej: sin(x); x^2 + y^2 = 1)');
                return;
            }
            const inputs = rawFuncs.split(';').map(f => f.trim()).filter(f => f);
            if (inputs.length === 0) return;

            const xMin = parseFloat(xMinInput?.value) || -10;
            const xMax = parseFloat(xMaxInput?.value) || 10;
            const steps = Math.max(50, parseInt(stepsInput?.value) || 200);

            if (xMin >= xMax) {
                alert('x Min debe ser menor que x Max');
                return;
            }

            const step = (xMax - xMin) / steps;
            const xValues = [];
            for (let i = 0; i <= steps; i++) {
                xValues.push(xMin + i * step);
            }

            const ce = new ComputeEngine.ComputeEngine();
            const datasets = [];
            const colors = ['#007bff', '#dc3545', '#28a745', '#ffc107', '#6f42c1', '#fd7e14', '#20c997'];

            let validFunctions = false;

            inputs.forEach((input, idx) => {
                let funcsToPlot = [input]; // Por default, asumir función y = input

                if (input.includes('=')) {
                    try {
                        const solutions = nerdamer.solve(input, 'y');
                        if (solutions && solutions.toString().length > 0) {
                            funcsToPlot = solutions.toString().split(',');
                        } else {
                            console.warn(`No se pudo resolver ecuación "${input}" para y.`);
                            return;
                        }
                    } catch (e) {
                        console.warn(`Error resolviendo ecuación "${input}":`, e);
                        return;
                    }
                }

                funcsToPlot.forEach((func, subIdx) => {
                    let expr;
                    try {
                        expr = ce.parse(func.trim());
                    } catch (e) {
                        console.warn(`Error parseando "${func}":`, e);
                        return;
                    }

                    const yValues = xValues.map(x => {
                        try {
                            const val = expr.evaluate({ x: ce.number(x) });
                            const num = val.numericValue;
                            return isFinite(num) ? num : null;
                        } catch {
                            return null;
                        }
                    });

                    const validY = yValues.filter(y => y !== null);
                    if (validY.length > 0) {
                        datasets.push({
                            label: `${input} (sol ${subIdx + 1})`,
                            data: yValues,
                            borderColor: colors[(idx + subIdx) % colors.length],
                            backgroundColor: colors[(idx + subIdx) % colors.length] + '40',
                            fill: false,
                            tension: 0.1,
                            pointRadius: 0
                        });
                        validFunctions = true;
                    }
                });
            });

            if (!validFunctions) {
                alert('No se pudieron generar puntos válidos para ninguna función o ecuación. Revisa la sintaxis (ej: sin(x), x^2 + y^2 = 1)');
                return;
            }

            if (chartInstance) chartInstance.destroy();

            chartInstance = new Chart(plotCanvas, {
                type: 'line',
                data: { labels: xValues, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        x: {
                            type: 'linear',
                            title: { display: true, text: 'x' },
                            min: xMin,
                            max: xMax
                        },
                        y: { title: { display: true, text: 'y' } }
                    },
                    plugins: {
                        title: { display: true, text: 'Gráfica de funciones y ecuaciones' },
                        legend: { display: true },
                        zoom: {
                            zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' },
                            pan: { enabled: true, mode: 'xy' }
                        }
                    }
                }
            });
        });

        if (functionField) {
            functionField.setAttribute('placeholder', 'Ej: sin(x); x^2; x^2 + y^2 = 1');
        }
    }

    console.log('Academic Tools Math cargado correctamente');
});
// tools/math.js
document.addEventListener('DOMContentLoaded', async () => {
    const katex = window.katex;
    const math = window.math;
    const Chart = window.Chart;
    const Tesseract = window.Tesseract;
    const ComputeEngine = window.ComputeEngine;

    // ==================== INICIALIZACIÓN DE TESSERACT (OCR) ====================
    let worker = null;
    try {
        worker = await Tesseract.createWorker({
            workerPath: 'https://unpkg.com/tesseract.js@v5/dist/worker.min.js',
            corePath: 'https://unpkg.com/tesseract.js-core@v5/tesseract-core.wasm.js',
            langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        });
        await worker.load();
        await worker.loadLanguage('eng+equ');
        await worker.initialize('eng+equ');
        window.tesseractWorker = worker;
        console.log('Tesseract inicializado correctamente con soporte para ecuaciones');
    } catch (e) {
        console.warn('Tesseract no disponible (OCR deshabilitado):', e);
        window.tesseractWorker = null;
    }

    // ==================== OBJETO DE SÍMBOLOS ====================
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
            '\\Alpha': 'Alpha mayúscula', '\\alpha': 'Alpha minúscula',
            '\\Beta': 'Beta mayúscula', '\\beta': 'Beta minúscula',
            '\\Gamma': 'Gamma mayúscula', '\\gamma': 'Gamma minúscula',
            '\\Delta': 'Delta mayúscula', '\\delta': 'Delta minúscula',
            '\\Epsilon': 'Epsilon mayúscula', '\\epsilon': 'Epsilon minúscula',
            '\\varepsilon': 'Epsilon variante',
            '\\Zeta': 'Zeta mayúscula', '\\zeta': 'Zeta minúscula',
            '\\Eta': 'Eta mayúscula', '\\eta': 'Eta minúscula',
            '\\Theta': 'Theta mayúscula', '\\theta': 'Theta minúscula',
            '\\vartheta': 'Theta variante',
            '\\Iota': 'Iota mayúscula', '\\iota': 'Iota minúscula',
            '\\Kappa': 'Kappa mayúscula', '\\kappa': 'Kappa minúscula',
            '\\varkappa': 'Kappa variante',
            '\\Lambda': 'Lambda mayúscula', '\\lambda': 'Lambda minúscula',
            '\\Mu': 'Mu mayúscula', '\\mu': 'Mu minúscula',
            '\\Nu': 'Nu mayúscula', '\\nu': 'Nu minúscula',
            '\\Xi': 'Xi mayúscula', '\\xi': 'Xi minúscula',
            '\\Omicron': 'Omicron mayúscula', '\\omicron': 'Omicron minúscula',
            '\\Pi': 'Pi mayúscula', '\\pi': 'Pi minúscula',
            '\\varpi': 'Pi variante',
            '\\Rho': 'Rho mayúscula', '\\rho': 'Rho minúscula',
            '\\varrho': 'Rho variante',
            '\\Sigma': 'Sigma mayúscula', '\\sigma': 'Sigma minúscula',
            '\\varsigma': 'Sigma variante',
            '\\Tau': 'Tau mayúscula', '\\tau': 'Tau minúscula',
            '\\Upsilon': 'Upsilon mayúscula', '\\upsilon': 'Upsilon minúscula',
            '\\Phi': 'Phi mayúscula', '\\phi': 'Phi minúscula',
            '\\varphi': 'Phi variante',
            '\\Chi': 'Chi mayúscula', '\\chi': 'Chi minúscula',
            '\\Psi': 'Psi mayúscula', '\\psi': 'Psi minúscula',
            '\\Omega': 'Omega mayúscula', '\\omega': 'Omega minúscula'
        },
        operators: { '+': 'Plus', '-': 'Minus', '!': 'Factorial', '\\#': 'Primorial', '\\neg': 'Negación lógica' },
        relations: {
            '<': 'Menor que', '>': 'Mayor que', '\\leq': 'Menor o igual', '\\geq': 'Mayor o igual',
            '=': 'Igual', '\\neq': 'No igual', '\\equiv': 'Equivalente', '\\approx': 'Aproximadamente',
            '\\cong': 'Congruente', '\\sim': 'Similar', '\\propto': 'Proporcional', '\\parallel': 'Paralelo',
            '\\perp': 'Perpendicular', '\\in': 'Miembro de', '\\ni': 'Posee miembro'
        },
        negated_relations: {
            '\\neq': 'No igual', '\\notin': 'No miembro de', '\\nless': 'No menor que', '\\ngtr': 'No mayor que',
            '\\nleq': 'No menor o igual', '\\ngeq': 'No mayor o igual', '\\nsim': 'No similar', '\\ncong': 'No congruente'
        },
        sets_logic: {
            '\\emptyset': 'Conjunto vacío', '\\varnothing': 'Conjunto vacío (variante)',
            '\\mathbb{N}': 'Naturales', '\\mathbb{Z}': 'Enteros', '\\mathbb{Q}': 'Racionales',
            '\\mathbb{R}': 'Reales', '\\mathbb{C}': 'Complejos',
            '\\subset': 'Subconjunto propio', '\\subseteq': 'Subconjunto', '\\supset': 'Superconjunto propio',
            '\\supseteq': 'Superconjunto', '\\cup': 'Unión', '\\cap': 'Intersección',
            '\\exists': 'Existe', '\\forall': 'Para todo', '\\neg': 'Negación', '\\lor': 'O lógico', '\\land': 'Y lógico'
        },
        geometry: {
            '\\overline{AB}': 'Segmento', '\\overrightarrow{AB}': 'Rayo', '\\angle': 'Ángulo',
            '\\triangle': 'Triángulo', '\\square': 'Cuadrado', '\\cong': 'Congruente', '\\sim': 'Similar'
        },
        arrows: {
            '\\leftarrow': 'Izquierda', '\\rightarrow': 'Derecha', '\\Leftarrow': 'Doble izquierda',
            '\\Rightarrow': 'Doble derecha', '\\leftrightarrow': 'Bidireccional', '\\Leftrightarrow': 'Equivalente'
        },
        miscellaneous: {
            '\\infty': 'Infinito', '\\partial': 'Parcial', '\\nabla': 'Nabla', '\\Re': 'Parte real',
            '\\Im': 'Parte imaginaria', '\\wp': 'Weierstrass p', '\\blacksquare': 'Cuadrado negro'
        },
        accents_diacritics: {
            '\\^{}': 'Circunflejo', '\\~{}': 'Tilde', '\\.{}': 'Punto', '\\u{}': 'Breve', '\\v{}': 'Carón'
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
        Object.keys(symbols[category] || {}).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = symbols[category][key];
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
            if (symbolSelect.value) {
                mathField.insert(symbolSelect.value);
                mathField.focus();
            }
        });
    }

    if (insertTemplate && mathField) {
        insertTemplate.addEventListener('click', () => {
            if (templateSelect.value) {
                mathField.insert(templateSelect.value);
                mathField.focus();
            }
        });
    }

    if (copyLatex && mathField) {
        copyLatex.addEventListener('click', () => {
            navigator.clipboard.writeText(mathField.value)
                .then(() => alert('¡LaTeX copiado al portapapeles!'))
                .catch(() => alert('Error al copiar al portapapeles'));
        });
    }

    // ==================== FÓRMULA A IMAGEN ====================
    const formulaButton = document.getElementById('formula-to-image');
    const formulaCanvas = document.getElementById('formula-canvas');
    const downloadImage = document.getElementById('download-image');
    const colorSelect = document.getElementById('color-select');
    const sizeSelect = document.getElementById('size-select');

    if (formulaButton && mathField && formulaCanvas && window.html2canvas) {
        formulaButton.addEventListener('click', async () => {
            const latex = mathField.value.trim();
            if (!latex) {
                alert('No hay fórmula para convertir');
                return;
            }
            try {
                const tempDiv = document.createElement('div');
                tempDiv.style.position = 'absolute';
                tempDiv.style.left = '-9999px';
                tempDiv.style.padding = '20px';
                tempDiv.style.backgroundColor = 'transparent';
                document.body.appendChild(tempDiv);

                katex.render(latex, tempDiv, {
                    throwOnError: true,
                    displayMode: true,
                    output: 'html'
                });

                const katexEl = tempDiv.querySelector('.katex');
                const canvas = await html2canvas(katexEl, { scale: 2, backgroundColor: null });
                formulaCanvas.width = canvas.width;
                formulaCanvas.height = canvas.height;
                formulaCanvas.getContext('2d').drawImage(canvas, 0, 0);

                const url = canvas.toDataURL('image/png');
                downloadImage.href = url;
                downloadImage.download = 'formula.png';
                downloadImage.style.display = 'block';

                document.body.removeChild(tempDiv);
            } catch (e) {
                alert('Error generando imagen: ' + e.message);
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
    const importOcr = document.getElementById('import-ocr-to-editor');

    if (ocrInput) {
        ocrInput.addEventListener('change', () => {
            const file = ocrInput.files[0];
            if (file && ocrImagePreview) {
                ocrImagePreview.src = URL.createObjectURL(file);
                ocrImagePreview.style.display = 'block';
            }
        });
    }

    if (ocrButton && worker) {
        ocrButton.addEventListener('click', async () => {
            if (!ocrInput?.files[0]) {
                alert('Selecciona una imagen primero');
                return;
            }
            if (!ocrOutput) return;
            ocrOutput.textContent = 'Procesando OCR...';
            try {
                const { data: { text } } = await worker.recognize(ocrInput.files[0]);
                const cleaned = text.trim().replace(/\r?\n/g, ' ');
                ocrOutput.textContent = cleaned;

                if (ocrPreview) {
                    try {
                        katex.render(cleaned, ocrPreview, { throwOnError: false, displayMode: true });
                    } catch {
                        ocrPreview.innerHTML = '<span style="color:orange;">No se pudo renderizar como LaTeX (edita manualmente)</span>';
                    }
                }
            } catch (err) {
                ocrOutput.textContent = 'Error OCR: ' + err.message;
            }
        });
    } else if (ocrButton) {
        ocrButton.disabled = true;
        ocrButton.textContent = 'OCR no disponible';
    }

    if (copyOcr && ocrOutput) {
        copyOcr.addEventListener('click', () => {
            navigator.clipboard.writeText(ocrOutput.textContent).then(() => alert('Texto OCR copiado'));
        });
    }

    if (importOcr && mathField && ocrOutput) {
        importOcr.addEventListener('click', () => {
            mathField.value = ocrOutput.textContent;
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
        length: ['m', 'cm', 'km', 'mm', 'ft', 'in', 'mile'],
        mass: ['kg', 'g', 'mg', 'lb', 'oz', 'ton'],
        temperature: ['celsius', 'fahrenheit', 'kelvin'],
        energy: ['J', 'cal', 'kcal', 'kWh', 'eV']
    };

    function populateUnits(cat) {
        const units = unitExamples[cat] || [];
        [unitFrom, unitTo].forEach(select => {
            if (!select) return;
            select.innerHTML = '';
            units.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u;
                opt.textContent = u;
                select.appendChild(opt);
            });
        });
    }

    if (unitCategory) {
        unitCategory.addEventListener('change', () => populateUnits(unitCategory.value));
        populateUnits(unitCategory.value || 'length');
    }

    if (convertButton && math) {
        convertButton.addEventListener('click', () => {
            if (!unitResult) return;
            const val = unitValue?.value.trim();
            const from = unitFrom?.value;
            const to = unitTo?.value;
            if (!val || !from || !to) {
                unitResult.textContent = 'Ingresa valor y unidades';
                return;
            }
            try {
                const result = math.evaluate(`${val} ${from} to ${to}`);
                unitResult.textContent = result.toString();
            } catch (e) {
                unitResult.textContent = 'Error: ' + e.message;
            }
        });
    }

    // ==================== SOLUCIONADOR DE ECUACIONES ====================
    const equationInput = document.getElementById('equation-input');
    const solveButton = document.getElementById('solve-equation');
    const equationResult = document.getElementById('equation-result');

    if (solveButton && math) {
        solveButton.addEventListener('click', () => {
            if (!equationResult) return;
            const expr = equationInput?.value.trim();
            if (!expr) {
                equationResult.textContent = 'Escribe una expresión';
                return;
            }
            try {
                const result = math.evaluate(expr);
                equationResult.textContent = result.toString();
            } catch (e) {
                equationResult.textContent = 'Error: ' + e.message;
            }
        });
    }

    // ==================== GRAFICADOR DE FUNCIONES (CORREGIDO Y ROBUSTO) ====================
    const functionField = document.getElementById('function-field');
    const xMinInput = document.getElementById('x-min');
    const xMaxInput = document.getElementById('x-max');
    const stepsInput = document.getElementById('steps');
    const plotButton = document.getElementById('plot-function');
    const plotCanvas = document.getElementById('plot-canvas');

    let chartInstance = null;

    if (plotButton && functionField && plotCanvas && ComputeEngine) {
        plotButton.addEventListener('click', () => {
            const raw = functionField.value.trim();
            if (!raw) {
                alert('Ingresa al menos una función (separadas por ;)');
                return;
            }

            const functions = raw.split(';').map(f => f.trim()).filter(f => f);
            const xMin = parseFloat(xMinInput?.value) || -10;
            const xMax = parseFloat(xMaxInput?.value) || 10;
            const steps = Math.max(50, parseInt(stepsInput?.value) || 200);

            if (xMin >= xMax) {
                alert('x Min debe ser menor que x Max');
                return;
            }

            const step = (xMax - xMin) / steps;
            const xValues = Array.from({ length: steps + 1 }, (_, i) => xMin + i * step);

            const ce = new ComputeEngine.ComputeEngine();
            const datasets = [];
            const colors = ['#007bff', '#dc3545', '#28a745', '#ffc107', '#6f42c1', '#fd7e14', '#20c997'];

            functions.forEach((func, idx) => {
                let expr;
                try {
                    expr = ce.parse(func);
                } catch (e) {
                    alert(`Error al parsear "${func}": ${e.message}`);
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

                datasets.push({
                    label: func,
                    data: yValues,
                    borderColor: colors[idx % colors.length],
                    backgroundColor: colors[idx % colors.length] + '40',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0
                });
            });

            if (datasets.length === 0) {
                alert('No se pudo procesar ninguna función válida');
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
                        x: { type: 'linear', title: { display: true, text: 'x' }, min: xMin, max: xMax },
                        y: { title: { display: true, text: 'y' } }
                    },
                    plugins: {
                        title: { display: true, text: 'Gráfica de funciones' },
                        legend: { display: true },
                        zoom: {
                            zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' },
                            pan: { enabled: true, mode: 'xy' }
                        }
                    }
                }
            });

            // Estilo visual del canvas
            plotCanvas.style.border = '1px solid #ccc';
            plotCanvas.style.backgroundColor = '#fff';
        });

        // Placeholder para el campo de funciones
        if (functionField) {
            functionField.placeholder = "Ej: sin(x); x^2; cos(x); \\sqrt{x}";
        }
    }

    console.log('Academic Tools Math cargado correctamente');
});
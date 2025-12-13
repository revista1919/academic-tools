// tools/math.js
document.addEventListener('DOMContentLoaded', () => {
    const katex = window.katex;
    const math = window.math;
    const Chart = window.Chart;
    const Tesseract = window.Tesseract;

    // Render LaTeX en tiempo real con editor visual usando MathLive
    const mathField = document.getElementById('math-field');
    const latexOutput = document.getElementById('latex-output');
    const symbolCategory = document.getElementById('symbol-category');
    const symbolSelect = document.getElementById('symbol-select');
    const insertSymbol = document.getElementById('insert-symbol');
    const templateSelect = document.getElementById('template-select');
    const insertTemplate = document.getElementById('insert-template');
    const copyLatex = document.getElementById('copy-latex');

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
            // Añadir más de las negadas y arpones si es necesario, pero para evitar exceso, seleccionar principales
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
            // Añadir más de las listas de accents si relevante para math, pero muchos son text-mode
            '\\overarc{}': 'Arco sobre',
            '\\underarc{}': 'Arco debajo'
        }
        // Puedes añadir más categorías si necesitas, como fonéticos, pero para math principal es suficiente
    };

    function populateSymbols(category) {
        symbolSelect.innerHTML = '';
        Object.keys(symbols[category] || {}).forEach(sym => {
            const opt = document.createElement('option');
            opt.value = sym;
            opt.textContent = symbols[category][sym];
            symbolSelect.appendChild(opt);
        });
    }

    if (symbolCategory) {
        symbolCategory.addEventListener('change', () => populateSymbols(symbolCategory.value));
        populateSymbols(symbolCategory.value);
    }

    if (mathField) {
        mathField.addEventListener('input', () => {
            const latex = mathField.value;
            latexOutput.innerHTML = '';
            if (latex) {
                try {
                    katex.render(latex, latexOutput, { throwOnError: false, displayMode: true });
                } catch (e) {
                    latexOutput.innerHTML = `<span class="error">Error en LaTeX: ${e.message}</span>`;
                }
            }
        });
    }

    if (insertSymbol && mathField) {
        insertSymbol.addEventListener('click', () => {
            mathField.insert(symbolSelect.value, { focus: true, feedback: true });
        });
    }

    if (insertTemplate && mathField) {
        insertTemplate.addEventListener('click', () => {
            mathField.insert(templateSelect.value, { focus: true, feedback: true });
        });
    }

    if (copyLatex && mathField) {
        copyLatex.addEventListener('click', () => {
            navigator.clipboard.writeText(mathField.value).then(() => alert('LaTeX copiado!'));
        });
    }

    // Fórmula a imagen con opciones
    const formulaButton = document.getElementById('formula-to-image');
    const formulaCanvas = document.getElementById('formula-canvas');
    const downloadImage = document.getElementById('download-image');
    const colorSelect = document.getElementById('color-select');
    const sizeSelect = document.getElementById('size-select');

    if (formulaButton && mathField && formulaCanvas) {
        formulaButton.addEventListener('click', () => {
            const latex = mathField.value.trim();
            if (!latex) return;
            try {
                const tempDiv = document.createElement('div');
                const options = { throwOnError: true, output: 'html', color: colorSelect.value, fontSize: parseInt(sizeSelect.value) };
                katex.render(latex, tempDiv, options);
                const mathElement = tempDiv.querySelector('.katex-html');
                html2canvas(mathElement, { scale: 2 }).then(canvas => {
                    formulaCanvas.width = canvas.width;
                    formulaCanvas.height = canvas.height;
                    formulaCanvas.getContext('2d').drawImage(canvas, 0, 0);
                    const dataUrl = formulaCanvas.toDataURL('image/png');
                    downloadImage.href = dataUrl;
                    downloadImage.download = 'formula.png';
                    downloadImage.style.display = 'block';
                });
            } catch (e) {
                alert(`Error generando imagen: ${e.message}`);
            }
        });
    }

    // OCR Imagen a LaTeX (básico, usando Tesseract para texto, usuario edita)
    const ocrInput = document.getElementById('ocr-input');
    const ocrButton = document.getElementById('ocr-button');
    const ocrOutput = document.getElementById('ocr-output');
    const ocrPreview = document.getElementById('ocr-preview');
    const copyOcr = document.getElementById('copy-ocr');

    if (ocrButton && ocrInput) {
        ocrButton.addEventListener('click', () => {
            const file = ocrInput.files[0];
            if (!file) return;
            ocrOutput.textContent = 'Procesando...';
            const url = URL.createObjectURL(file);
            Tesseract.recognize(url, 'eng', { logger: m => console.log(m) }).then(({ data: { text } }) => {
                ocrOutput.textContent = text.trim();
                try {
                    katex.render(text, ocrPreview, { throwOnError: false });
                } catch {
                    ocrPreview.innerHTML = '<span class="error">No se pudo renderizar como LaTeX. Edita el texto.</span>';
                }
            }).catch(err => {
                ocrOutput.textContent = `Error: ${err.message}`;
            });
        });
    }

    if (copyOcr) {
        copyOcr.addEventListener('click', () => {
            navigator.clipboard.writeText(ocrOutput.textContent).then(() => alert('Texto OCR copiado!'));
        });
    }

    // Handwriting recognition: Dibujo en canvas, OCR
    const drawCanvas = document.getElementById('draw-canvas');
    const clearDraw = document.getElementById('clear-draw');
    const ocrDrawButton = document.getElementById('ocr-draw');
    const drawOutput = document.getElementById('draw-output');
    const drawPreview = document.getElementById('draw-preview');
    const copyDraw = document.getElementById('copy-draw');
    let drawing = false;

    if (drawCanvas) {
        const ctx = drawCanvas.getContext('2d');
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';

        drawCanvas.addEventListener('mousedown', () => drawing = true);
        drawCanvas.addEventListener('mouseup', () => drawing = false);
        drawCanvas.addEventListener('mousemove', (e) => {
            if (drawing) {
                ctx.lineTo(e.offsetX, e.offsetY);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(e.offsetX, e.offsetY);
            }
        });
    }

    if (clearDraw) {
        clearDraw.addEventListener('click', () => {
            const ctx = drawCanvas.getContext('2d');
            ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        });
    }

    if (ocrDrawButton) {
        ocrDrawButton.addEventListener('click', () => {
            drawOutput.textContent = 'Procesando...';
            drawCanvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                Tesseract.recognize(url, 'eng').then(({ data: { text } }) => {
                    drawOutput.textContent = text.trim();
                    try {
                        katex.render(text, drawPreview, { throwOnError: false });
                    } catch {
                        drawPreview.innerHTML = '<span class="error">No se pudo renderizar. Edita.</span>';
                    }
                }).catch(err => {
                    drawOutput.textContent = `Error: ${err.message}`;
                });
            });
        });
    }

    if (copyDraw) {
        copyDraw.addEventListener('click', () => {
            navigator.clipboard.writeText(drawOutput.textContent).then(() => alert('Texto dibujado copiado!'));
        });
    }

    // Conversor de unidades con math.js, categorías dinámicas
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
        energy: ['joule', 'calorie', 'kwh'],
        // Añadir más
    };

    function populateUnits(category) {
        const units = unitExamples[category] || [];
        unitFrom.innerHTML = '';
        unitTo.innerHTML = '';
        units.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u;
            opt.textContent = u;
            unitFrom.appendChild(opt.cloneNode(true));
            unitTo.appendChild(opt);
        });
    }

    if (unitCategory) {
        unitCategory.addEventListener('change', () => populateUnits(unitCategory.value));
        populateUnits(unitCategory.value);
    }

    if (convertButton) {
        convertButton.addEventListener('click', () => {
            const value = unitValue.value.trim();
            const from = unitFrom.value;
            const to = unitTo.value;
            if (!value || !from || !to) return;
            try {
                const result = math.evaluate(`${value} ${from} to ${to}`);
                unitResult.textContent = result.toString();
            } catch (e) {
                unitResult.textContent = `Error: ${e.message}`;
            }
        });
    }

    // Solucionador de ecuaciones con math.js
    const equationInput = document.getElementById('equation-input');
    const solveButton = document.getElementById('solve-equation');
    const equationResult = document.getElementById('equation-result');

    if (solveButton && equationInput) {
        solveButton.addEventListener('click', () => {
            const eq = equationInput.value.trim();
            if (!eq) return;
            try {
                const result = math.evaluate(eq);
                equationResult.textContent = result.toString();
            } catch (e) {
                equationResult.textContent = `Error: ${e.message}`;
            }
        });
    }

    // Graficador de funciones
    const functionInput = document.getElementById('function-input');
    const plotButton = document.getElementById('plot-function');
    const plotCanvas = document.getElementById('plot-canvas');

    if (plotButton && functionInput && plotCanvas) {
        let chart;
        plotButton.addEventListener('click', () => {
            const func = functionInput.value.trim();
            if (!func) return;
            const xValues = Array.from({length: 100}, (_, i) => i / 10 - 5);
            const yValues = xValues.map(x => {
                try {
                    return math.evaluate(func.replace(/x/g, `(${x})`));
                } catch {
                    return null;
                }
            });
            if (chart) chart.destroy();
            chart = new Chart(plotCanvas, {
                type: 'line',
                data: {
                    labels: xValues,
                    datasets: [{ label: func, data: yValues, borderColor: 'blue', fill: false }]
                },
                options: { scales: { x: { title: { display: true, text: 'x' } }, y: { title: { display: true, text: 'y' } } } }
            });
        });
    }
});
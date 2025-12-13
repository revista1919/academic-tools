// tools/math.js
document.addEventListener('DOMContentLoaded', () => {
    const katex = window.katex;

    // Render LaTeX en tiempo real
    const latexInput = document.getElementById('latex-input');
    const latexOutput = document.getElementById('latex-output');

    if (latexInput && latexOutput) {
        latexInput.addEventListener('input', () => {
            const latex = latexInput.value.trim();
            if (!latex) {
                latexOutput.innerHTML = '';
                return;
            }
            try {
                katex.render(latex, latexOutput, { throwOnError: false, displayMode: true });
            } catch (e) {
                latexOutput.innerHTML = '<p>Error en LaTeX: ' + e.message + '</p>';
            }
        });
    }

    // Fórmula a imagen
    const formulaButton = document.getElementById('formula-to-image');
    const formulaCanvas = document.getElementById('formula-canvas');
    const downloadImage = document.getElementById('download-image');

    if (formulaButton && latexInput && formulaCanvas) {
        formulaButton.addEventListener('click', () => {
            const latex = latexInput.value.trim();
            if (!latex) return;
            try {
                // Render to temp div
                const tempDiv = document.createElement('div');
                katex.render(latex, tempDiv, { throwOnError: true, output: 'html' });
                const mathElement = tempDiv.querySelector('.katex-html');
                // Get bounds
                const bbox = mathElement.getBoundingClientRect();
                formulaCanvas.width = bbox.width * 2; // Hi-res
                formulaCanvas.height = bbox.height * 2;
                const ctx = formulaCanvas.getContext('2d');
                ctx.scale(2, 2);
                // Use html2canvas or manual draw (simplified)
                html2canvas(mathElement, { canvas: formulaCanvas, scale: 2 }).then(() => {
                    const dataUrl = formulaCanvas.toDataURL('image/png');
                    downloadImage.href = dataUrl;
                    downloadImage.download = 'formula.png';
                    downloadImage.style.display = 'block';
                    downloadImage.textContent = 'Descargar Imagen';
                });
            } catch (e) {
                alert('Error generando imagen: ' + e.message);
            }
        });
    }

    // Editor rápido de ecuaciones
    const equationEditor = document.getElementById('equation-editor');
    const insertButton = document.getElementById('insert-symbol');
    const symbolSelect = document.getElementById('symbol-select');
    const equationPreview = document.getElementById('equation-preview');

    if (insertButton && symbolSelect && equationEditor) {
        insertButton.addEventListener('click', () => {
            const symbol = symbolSelect.value;
            const cursorPos = equationEditor.selectionStart;
            const text = equationEditor.value;
            equationEditor.value = text.slice(0, cursorPos) + symbol + text.slice(cursorPos);
            equationEditor.focus();
            equationEditor.selectionStart = cursorPos + symbol.length;
            equationEditor.selectionEnd = cursorPos + symbol.length;
            // Trigger preview
            equationEditor.dispatchEvent(new Event('input'));
        });
    }

    if (equationEditor && equationPreview) {
        equationEditor.addEventListener('input', () => {
            const latex = equationEditor.value.trim();
            if (!latex) {
                equationPreview.innerHTML = '';
                return;
            }
            try {
                katex.render(latex, equationPreview, { throwOnError: false });
            } catch (e) {
                equationPreview.innerHTML = '<p>Error: ' + e.message + '</p>';
            }
        });
    }

    // Conversor de unidades
    const unitValue = document.getElementById('unit-value');
    const unitFrom = document.getElementById('unit-from');
    const unitTo = document.getElementById('unit-to');
    const convertButton = document.getElementById('convert-unit');
    const unitResult = document.getElementById('unit-result');

    // Factores de conversión (a unidad base: m para longitud, kg para masa, etc.)
    const conversions = {
        // Longitud
        m: { base: 'm', factor: 1 },
        cm: { base: 'm', factor: 0.01 },
        km: { base: 'm', factor: 1000 },
        ft: { base: 'm', factor: 0.3048 },
        in: { base: 'm', factor: 0.0254 },
        // Masa
        kg: { base: 'kg', factor: 1 },
        g: { base: 'kg', factor: 0.001 },
        lb: { base: 'kg', factor: 0.453592 },
        // Agrega más categorías como tiempo, energía, etc.
    };

    if (convertButton && unitValue && unitFrom && unitTo && unitResult) {
        convertButton.addEventListener('click', () => {
            const value = parseFloat(unitValue.value);
            if (isNaN(value)) {
                unitResult.innerHTML = 'Valor inválido.';
                return;
            }
            const fromUnit = unitFrom.value;
            const toUnit = unitTo.value;
            if (!conversions[fromUnit] || !conversions[toUnit]) {
                unitResult.innerHTML = 'Unidades no soportadas.';
                return;
            }
            if (conversions[fromUnit].base !== conversions[toUnit].base) {
                unitResult.innerHTML = 'Unidades incompatibles (diferentes categorías).';
                return;
            }
            const baseValue = value * conversions[fromUnit].factor;
            const result = baseValue / conversions[toUnit].factor;
            unitResult.innerHTML = `${value} ${fromUnit} = ${result.toFixed(4)} ${toUnit}`;
        });
    }
});
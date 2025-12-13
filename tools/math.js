// tools/math.js
document.addEventListener('DOMContentLoaded', () => {
    const katex = window.katex;

    // Render LaTeX
    const latexInput = document.getElementById('latex-input');
    const latexOutput = document.getElementById('latex-output');

    if (latexInput && latexOutput) {
        latexInput.addEventListener('input', () => {
            const latex = latexInput.value.trim();
            if (!latex) return;
            try {
                katex.render(latex, latexOutput, { throwOnError: false, displayMode: true });
            } catch (e) {
                latexOutput.innerHTML = '<p>Error: ' + e.message + '</p>';
            }
        });
    }

    // Formula to image
    const formulaButton = document.getElementById('formula-to-image');
    const formulaCanvas = document.getElementById('formula-canvas');
    const downloadImage = document.getElementById('download-image');

    if (formulaButton && latexInput && formulaCanvas) {
        formulaButton.addEventListener('click', () => {
            const latex = latexInput.value.trim();
            if (!latex) return;
            const tempDiv = document.createElement('div');
            katex.render(latex, tempDiv, { throwOnError: true, output: 'html' });
            const mathElement = tempDiv.querySelector('.katex-html');
            html2canvas(mathElement, { scale: 2 }).then(canvas => {
                const dataUrl = canvas.toDataURL('image/png');
                downloadImage.href = dataUrl;
                downloadImage.download = 'formula.png';
                downloadImage.style.display = 'block';
            });
        });
    }

    // Editor symbols
    const equationEditor = document.getElementById('equation-editor');
    const insertButton = document.getElementById('insert-symbol');
    const symbolSelect = document.getElementById('symbol-select');
    const equationPreview = document.getElementById('equation-preview');

    if (insertButton && symbolSelect && equationEditor) {
        insertButton.addEventListener('click', () => {
            const symbol = symbolSelect.value;
            const pos = equationEditor.selectionStart;
            equationEditor.value = equationEditor.value.slice(0, pos) + symbol + equationEditor.value.slice(pos);
            equationEditor.dispatchEvent(new Event('input'));
        });
    }

    if (equationEditor && equationPreview) {
        equationEditor.addEventListener('input', () => {
            const latex = equationEditor.value.trim();
            if (!latex) return;
            try {
                katex.render(latex, equationPreview, { throwOnError: false });
            } catch (e) {
                equationPreview.innerHTML = '<p>Error: ' + e.message + '</p>';
            }
        });
    }

    // Unit converter (unchanged)
    // ...

    // Math OCR from image
    const ocrInput = document.getElementById('ocr-input');
    const ocrButton = document.getElementById('ocr-formula');
    if (ocrButton && ocrInput && latexInput) {
        ocrButton.addEventListener('click', () => {
            const file = ocrInput.files[0];
            if (!file) return;
            Tesseract.recognize(file, 'eng', { logger: e => console.log(e) }).then(({ data: { text } }) => {
                // Simple post-process to LaTeX, e.g., replace integral with \int
                let latex = text.replace(/integral/g, '\\int').replace(/sum/g, '\\sum'); // Add more rules
                latexInput.value = latex;
                latexInput.dispatchEvent(new Event('input'));
            });
        });
    }
});
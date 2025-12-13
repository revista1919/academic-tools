// tools/text.js
document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const textCount = document.getElementById('text-count');
    const cleanButton = document.getElementById('clean-text');
    const convertButton = document.getElementById('convert-to-latex');
    const latexOutput = document.getElementById('latex-output');
    const renderButton = document.getElementById('render-latex');
    const latexRender = document.getElementById('latex-render');

    if (textInput && textCount) {
        textInput.addEventListener('input', updateCount);
        function updateCount() {
            const text = textInput.value.trim();
            const words = text ? text.split(/\s+/).length : 0;
            const chars = text.length;
            const paras = text ? text.split(/\n\s*\n/).length : 0;
            const citations = (text.match(/\(([^)]+?)\s*,\s*\d{4}(?:\s*;\s*[^)]+?,\s*\d{4})*\)/g) || []).length; // Detecta citas como (Autor, 2020) o múltiples
            textCount.innerHTML = `Palabras: ${words} | Caracteres: ${chars} | Párrafos: ${paras} | Citas aproximadas: ${citations}`;
        }
        updateCount();
    }

    if (cleanButton && textInput) {
        cleanButton.addEventListener('click', () => {
            let text = textInput.value;
            // Corregir hyphenation: eliminar guiones al final de línea
            text = text.replace(/-\s*\n/g, '');
            // Reemplazar múltiples saltos de línea por uno
            text = text.replace(/\n+/g, '\n');
            // Eliminar espacios extras
            text = text.replace(/\s+/g, ' ');
            // Corregir saltos de línea rotos: si una línea termina sin punto y la siguiente empieza con minúscula, unir
            text = text.replace(/([a-záéíóú])\n([a-záéíóú])/g, '$1 $2');
            textInput.value = text.trim();
            updateCount();
        });
    }

    if (convertButton && textInput && latexOutput) {
        convertButton.addEventListener('click', () => {
            let text = textInput.value.trim();
            // Escapar caracteres especiales para LaTeX
            text = text.replace(/&/g, '\\&').replace(/%/g, '\\%').replace(/\$/g, '\\$').replace(/_/g, '\\_').replace(/#/g, '\\#');
            // Convertir comillas a LaTeX
            text = text.replace(/"([^"]*)"/g, '``$1\'\'');
            // Envolver en \text{} para texto simple
            latexOutput.textContent = `\\text{${text}}`;
        });
    }

    if (renderButton && latexOutput && latexRender) {
        renderButton.addEventListener('click', () => {
            const latex = latexOutput.textContent;
            try {
                katex.render(latex, latexRender, { throwOnError: false, displayMode: true });
            } catch (e) {
                latexRender.innerHTML = '<p>Error en renderizado LaTeX: ' + e.message + '</p>';
            }
        });
    }
});
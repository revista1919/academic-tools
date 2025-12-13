// tools/references.js
document.addEventListener('DOMContentLoaded', () => {
    // Funciones de formateo
    function formatAPA(parts) {
        const [author, year, title, journal, volume, pages, doi] = parts;
        let formatted = `${author} (${year}). ${title}. `;
        if (journal) formatted += `<i>${journal}</i>, `;
        if (volume) formatted += `<i>${volume}</i>`;
        if (pages) formatted += `, ${pages}`;
        if (doi) formatted += `. https://doi.org/${doi}`;
        return formatted + '.';
    }

    function formatChicago(parts) {
        const [author, year, title, journal, volume, pages, doi] = parts;
        let formatted = `${author}. ${year}. "${title}." `;
        if (journal) formatted += `<i>${journal}</i> `;
        if (volume) formatted += `${volume}`;
        if (pages) formatted += `:${pages}`;
        if (doi) formatted += `, https://doi.org/${doi}`;
        return formatted + '.';
    }

    function formatMLA(parts) {
        const [author, title, journal, volume, year, pages, doi] = parts;
        let formatted = `${author}. "${title}." `;
        if (journal) formatted += `<i>${journal}</i>, `;
        if (volume) formatted += `vol. ${volume}, `;
        formatted += `${year}, `;
        if (pages) formatted += `pp. ${pages}. `;
        if (doi) formatted += `DOI: ${doi}.`;
        return formatted;
    }

    // Parsing de input: asumir formato "Autor| Año| Título| Journal| Volumen| Páginas| DOI"
    function parseRef(input) {
        return input.split('|').map(p => p.trim());
    }

    // Formateador single
    const styleSelect = document.getElementById('style-select');
    const refInput = document.getElementById('ref-input');
    const formatButton = document.getElementById('format-ref');
    const formattedRef = document.getElementById('formatted-ref');

    if (formatButton) {
        formatButton.addEventListener('click', () => {
            const input = refInput.value.trim();
            if (!input) return;
            const parts = parseRef(input);
            let output = '';
            const style = styleSelect.value;
            if (style === 'apa') output = formatAPA(parts);
            else if (style === 'chicago') output = formatChicago(parts);
            else if (style === 'mla') output = formatMLA(parts);
            formattedRef.innerHTML = output;
        });
    }

    // Conversión entre estilos
    const fromStyle = document.getElementById('from-style');
    const toStyle = document.getElementById('to-style');
    const convInput = document.getElementById('conv-input');
    const convertButton = document.getElementById('convert-style');
    const convertedRef = document.getElementById('converted-ref');

    if (convertButton) {
        convertButton.addEventListener('click', () => {
            const input = convInput.value.trim();
            if (!input) return;
            // Parsing básico de estilos existentes para extraer parts
            let parts = [];
            const from = fromStyle.value;
            if (from === 'apa') {
                const match = input.match(new RegExp("^(.*?) \\((.*?)\\)\\. (.*?)\\. <i>(.*?)</i>,<i>(.*?)</i>, (.*?)\\. (.*)$"));
                if (match) parts = [match[1], match[2], match[3], match[4], match[5], match[6], match[7].replace('https://doi.org/', '')];
            } else if (from === 'chicago') {
                const match = input.match(new RegExp("^(.*?)\\. (.*?)\\. \"(.*?)\\.\" <i>(.*?)</i> (.*?):(.*?), (.*)$"));
                if (match) parts = [match[1], match[2], match[3], match[4], match[5], match[6], match[7].replace('https://doi.org/', '')];
            } else if (from === 'mla') {
                const match = input.match(new RegExp("^(.*?)\\. \"(.*?)\\.\" <i>(.*?)</i>, vol\\. (.*?), (.*?), pp\\. (.*?)\\. DOI: (.*)\\.?$"));
                if (match) parts = [match[1], match[5], match[2], match[3], match[4], match[6], match[7]];
            }
            if (parts.length < 7) {
                convertedRef.innerHTML = 'Error al parsear la referencia de origen.';
                return;
            }
            const to = toStyle.value;
            let output = '';
            if (to === 'apa') output = formatAPA(parts);
            else if (to === 'chicago') output = formatChicago(parts);
            else if (to === 'mla') output = formatMLA(parts);
            convertedRef.innerHTML = output;
        });
    }

    // Generador de bibliografía
    const bibInput = document.getElementById('bib-input');
    const bibStyle = document.getElementById('bib-style');
    const generateButton = document.getElementById('generate-bib');
    const bibOutput = document.getElementById('bib-output');

    if (generateButton) {
        generateButton.addEventListener('click', () => {
            const inputs = bibInput.value.trim().split('\n').filter(line => line.trim());
            if (!inputs.length) return;
            const style = bibStyle.value;
            let outputs = inputs.map(input => {
                const parts = parseRef(input);
                if (style === 'apa') return formatAPA(parts);
                else if (style === 'chicago') return formatChicago(parts);
                else if (style === 'mla') return formatMLA(parts);
            });
            // Ordenar alfabéticamente por autor
            outputs.sort((a, b) => {
                const authorA = a.split(' ')[0];
                const authorB = b.split(' ')[0];
                return authorA.localeCompare(authorB);
            });
            bibOutput.innerHTML = outputs.join('<br><br>');
        });
    }

    // Limpieza de referencias
    const cleanInput = document.getElementById('clean-ref-input');
    const cleanButton = document.getElementById('clean-ref');
    const cleanedRef = document.getElementById('cleaned-ref');

    if (cleanButton) {
        cleanButton.addEventListener('click', () => {
            let text = cleanInput.value.trim();
            // Eliminar números de página o footnotes como [1], (pdf page 5)
            text = text.replace(/\[\d+\]/g, '').replace(/\(pdf page \d+\)/g, '');
            // Eliminar URLs sucias o extras
            text = text.replace(/http[s]?:\/\/.*?(\s|$)/g, (match, p1) => {
                if (match.includes('doi.org')) return match;
                return p1;
            });
            // Normalizar espacios
            text = text.replace(/\s+/g, ' ');
            // Intentar parsear a parts y reconstruir
            const potentialParts = text.match(/(.*?)\. (\d{4})\. (.*?)\. (.*?),\ (\d+),\ (.*?)\. (.*)/);
            if (potentialParts) {
                const parts = [potentialParts[1], potentialParts[2], potentialParts[3], potentialParts[4], potentialParts[5], potentialParts[6], potentialParts[7]];
                cleanedRef.innerHTML = parts.join(' | ');
            } else {
                cleanedRef.innerHTML = text;
            }
        });
    }
});
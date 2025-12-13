console.log("tools/text.js cargado - Versión simplificada con configurador visual de preamble");

document.addEventListener('DOMContentLoaded', () => {
    // Elementos
    const preambleEditorElem = document.getElementById('preamble-editor');
    const mainEditorElem = document.getElementById('main-editor');
    const bibEditorElem = document.getElementById('bib-editor');
    const sidebar = document.getElementById('sidebar');
    const wordCountElem = document.getElementById('word-count');

    // Botones y configurador
    const applyPreambleBtn = document.getElementById('apply-preamble');
    const copyPreambleBtn = document.getElementById('copy-preamble');
    const templateSelect = document.getElementById('template-select');

    // Modales
    const tableModal = document.getElementById('table-modal');
    const equationModal = document.getElementById('equation-modal');
    const citationModal = document.getElementById('citation-modal');

    let preambleEditor, mainEditor, bibEditor;
    let bibEntries = {};

    // Inicializar editores
    preambleEditor = CodeMirror(preambleEditorElem, {
        value: '\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{graphicx}\n',
        mode: "stex",
        lineNumbers: true,
        matchBrackets: true
    });

    mainEditor = CodeMirror(mainEditorElem, {
        value: '\\begin{document}\n\n\\section{Introducción}\nEscribe aquí tu contenido...\n\n\\end{document}',
        mode: "stex",
        lineNumbers: true,
        matchBrackets: true
    });

    bibEditor = CodeMirror(bibEditorElem, {
        value: '',
        mode: "stex",
        lineNumbers: true
    });

    bibEditor.on('change', parseBib);

    // Generar preamble
    applyPreambleBtn.addEventListener('click', generatePreamble);
    copyPreambleBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(preambleEditor.getValue());
        alert('Preamble copiado al portapapeles');
    });

    function generatePreamble() {
        let preamble = '';

        // Documentclass
        const docClass = templateSelect.value;
        const fontSize = document.getElementById('font-size').value;
        const paperSize = document.getElementById('paper-size').value;
        preamble += `\\documentclass[${fontSize},${paperSize}]{${docClass}}\n`;

        // Paquetes básicos
        preamble += '\\usepackage[utf8]{inputenc}\n';
        preamble += '\\usepackage[T1]{fontenc}\n';

        // Fuente
        const font = document.getElementById('font-family').value;
        if (font === 'times') preamble += '\\usepackage{newtxtext,newtxmath}\n';
        if (font === 'palatino') preamble += '\\usepackage{newpxtext,newpxmath}\n';
        if (font === 'libertine') preamble += '\\usepackage{libertine}\n';
        if (font === 'fourier') preamble += '\\usepackage{fourier}\n';

        // Márgenes
        const top = document.getElementById('margin-top').value;
        const bottom = document.getElementById('margin-bottom').value;
        const left = document.getElementById('margin-left').value;
        const right = document.getElementById('margin-right').value;
        preamble += '\\usepackage[';
        preamble += `top=${top}cm,bottom=${bottom}cm,left=${left}cm,right=${right}cm`;
        preamble += ']{geometry}\n';

        // Interlineado
        const spacing = document.getElementById('linespacing').value;
        if (spacing !== 'singlespacing') {
            preamble += '\\usepackage{setspace}\n';
            preamble += `\\${spacing}\n`;
        }

        // Paquetes opcionales
        if (document.getElementById('pkg-graphicx').checked) preamble += '\\usepackage{graphicx}\n';
        if (document.getElementById('pkg-amsmath').checked) preamble += '\\usepackage{amsmath}\n';
        if (document.getElementById('pkg-booktabs').checked) preamble += '\\usepackage{booktabs}\n';
        if (document.getElementById('pkg-hyperref').checked) preamble += '\\usepackage{hyperref}\n';
        if (document.getElementById('pkg-natbib').checked) preamble += '\\usepackage{natbib}\n';
        if (document.getElementById('pkg-babel-spanish').checked) preamble += '\\usepackage[spanish]{babel}\n';

        // Manual
        const manual = document.getElementById('manual-preamble').value.trim();
        if (manual) preamble += manual + '\n';

        preambleEditor.setValue(preamble);
    }

    // Sidebar
    function updateSidebar() {
        if (!sidebar) return;
        sidebar.innerHTML = '<strong>Secciones:</strong>';
        const lines = mainEditor.getValue().split('\n');
        lines.forEach((line, i) => {
            const match = line.match(/\\(section|subsection|subsubsection|chapter){(.*)}/);
            if (match) {
                const level = match[1] === 'chapter' ? 0 : match[1] === 'section' ? 1 : match[1] === 'subsection' ? 2 : 3;
                const title = match[2] || match[1];
                const item = document.createElement('div');
                item.textContent = title;
                item.classList.add('sidebar-item');
                item.style.paddingLeft = `${level * 20}px`;
                item.onclick = () => {
                    mainEditor.scrollIntoView({line: i, ch: 0});
                    mainEditor.setCursor(i, 0);
                    mainEditor.focus();
                };
                sidebar.appendChild(item);
            }
        });
    }

    // Conteo palabras
    function updateWordCount() {
        const text = mainEditor.getValue().replace(/\\[^\s{}]*/g, '').replace(/[\s\n]+/g, ' ').trim();
        const words = text.split(' ').filter(w => w).length;
        wordCountElem.textContent = `Palabras: ${words}`;
    }

    mainEditor.on('change', () => {
        updateSidebar();
        updateWordCount();
    });

    // Modales tablas
    document.getElementById('open-table-modal').onclick = () => tableModal.style.display = 'block';
    document.getElementById('close-table-modal').onclick = () => tableModal.style.display = 'none';
    document.getElementById('generate-table-grid').onclick = () => {
        const rows = parseInt(document.getElementById('table-rows').value);
        const cols = parseInt(document.getElementById('table-cols').value);
        const grid = document.getElementById('table-grid');
        grid.innerHTML = '';
        for (let i = 0; i < rows; i++) {
            const tr = document.createElement('tr');
            for (let j = 0; j < cols; j++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Celda ${i+1},${j+1}`;
                td.appendChild(input);
                tr.appendChild(td);
            }
            grid.appendChild(tr);
        }
    };

    document.getElementById('insert-table-code').onclick = () => {
        const rows = document.querySelectorAll('#table-grid tr');
        let latex = '\\begin{tabular}{|';
        const cols = rows[0]?.querySelectorAll('td').length || 2;
        latex += 'c|'.repeat(cols) + '}\n\\hline\n';
        rows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('input')).map(inp => inp.value.trim() || '');
            latex += cells.join(' & ') + ' \\\\\n\\hline\n';
        });
        latex += '\\end{tabular}';
        insertAtCursor(mainEditor, latex);
        tableModal.style.display = 'none';
    };

    // Ecuaciones
    document.getElementById('open-equation-modal').onclick = () => {
        document.getElementById('equation-input').value = '';
        document.getElementById('equation-preview').innerHTML = '';
        equationModal.style.display = 'block';
    };
    document.getElementById('close-equation-modal').onclick = () => equationModal.style.display = 'none';
    document.getElementById('equation-input').oninput = () => {
        const math = document.getElementById('equation-input').value;
        const preview = document.getElementById('equation-preview');
        try {
            katex.render(math, preview, {displayMode: true, throwOnError: false});
        } catch (e) {
            preview.textContent = 'Error: ' + e.message;
        }
    };
    document.getElementById('insert-equation-code').onclick = () => {
        const math = document.getElementById('equation-input').value;
        if (math) {
            const latex = `\\[\n${math}\n\\]`;
            insertAtCursor(mainEditor, latex);
        }
        equationModal.style.display = 'none';
    };

    // Citas
    document.getElementById('open-citation-modal').onclick = openCitationModal;
    document.getElementById('close-citation-modal').onclick = () => citationModal.style.display = 'none';
    document.getElementById('insert-citation-code').onclick = () => {
        const key = document.getElementById('citation-select').value;
        if (key) insertAtCursor(mainEditor, `\\cite{${key}}`);
        citationModal.style.display = 'none';
    };

    function openCitationModal() {
        const select = document.getElementById('citation-select');
        select.innerHTML = '';
        Object.keys(bibEntries).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = `${key} (${bibEntries[key].author || '??'}, ${bibEntries[key].year || '??'})`;
            select.appendChild(opt);
        });
        citationModal.style.display = 'block';
    }

    function parseBib() {
        const text = bibEditor.getValue();
        bibEntries = {};
        const regex = /@[\w]+\{([^,]+),[\s\S]*?author\s*=\s*\{([^}]+)\}.*?year\s*=\s*\{([^}]+)\}/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            bibEntries[match[1].trim()] = {author: match[2], year: match[3]};
        }
    }

    // Utilidades
    function insertAtCursor(editor, text) {
        const cursor = editor.getCursor();
        editor.replaceRange(text, cursor);
        editor.focus();
    }

    // Exportaciones (mantengo las mismas que tenías)
    document.getElementById('export-tex').onclick = () => {
        const full = preambleEditor.getValue() + '\n' + mainEditor.getValue();
        const blob = new Blob([full], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'document.tex'; a.click();
    };

    // Resto de funcionalidades (DOI, ISBN, ZIP, versiones, etc.) puedes mantenerlas del código original si las necesitas.
    // Aquí están simplificadas al mínimo necesario.

    updateSidebar();
    updateWordCount();
});

// Tabs del configurador
function openTab(evt, tabName) {
    document.querySelectorAll('.tabcontent').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.tablinks').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.classList.add('active');
}
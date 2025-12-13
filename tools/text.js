// tools/text.js
import { EditorView, basicSetup } from "@codemirror/basic-setup";
import { EditorState } from "@codemirror/state";
import { autocomplete } from "@codemirror/autocomplete";
import { latex } from "codemirror-lang-latex";
import { bibtex } from "@citedrive/codemirror-lang-bibtex";

document.addEventListener('DOMContentLoaded', () => {
    const templates = {
        'APA': `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{geometry}\n\\geometry{margin=1in}\n\\usepackage{setspace}\n\\doublespacing\n\\usepackage{natbib}\n\\bibpunct{(}{)}{;}{a}{,}{,}\n`,
        'Chicago': `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{geometry}\n\\geometry{margin=1in}\n\\usepackage{chicago}\n`,
        'IEEE': `\\documentclass[conference]{IEEEtran}\n\\usepackage[utf8]{inputenc}\n\\usepackage{cite}\n`,
        'Springer': `\\documentclass{svjour3}\n\\usepackage[utf8]{inputenc}\n\\usepackage{natbib}\n`,
        'Elsevier': `\\documentclass{elsarticle}\n\\usepackage[utf8]{inputenc}\n\\usepackage{natbib}\n`,
        'Tesis Chilena': `\\documentclass{book}\n\\usepackage[spanish]{babel}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage{geometry}\n\\geometry{a4paper, margin=2.5cm}\n\\usepackage{natbib}\n`,
        // Agrega más plantillas con paquetes comunes para cada estilo
    };

    // Elementos del DOM
    const templateSelect = document.getElementById('template-select');
    const generateStructureButton = document.getElementById('generate-structure');
    const preambleEditorElem = document.getElementById('preamble-editor');
    const mainEditorElem = document.getElementById('main-editor');
    const bibEditorElem = document.getElementById('bib-editor');
    const sidebar = document.getElementById('sidebar');
    const doiInput = document.getElementById('doi-input');
    const fetchBibButton = document.getElementById('fetch-bib');
    const isbnInput = document.getElementById('isbn-input');
    const fetchIsbnButton = document.getElementById('fetch-isbn');
    const compileButton = document.getElementById('compile-pdf');
    const pdfPreview = document.getElementById('pdf-preview');
    const exportTexButton = document.getElementById('export-tex');
    const exportZipButton = document.getElementById('export-zip');
    const saveVersionButton = document.getElementById('save-version');
    const versionsList = document.getElementById('versions-list');
    const analyzeButton = document.getElementById('analyze-text');
    const analysisOutput = document.getElementById('analysis-output');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const expandButton = document.getElementById('expand-paragraph');
    const rewriteButton = document.getElementById('rewrite-intro');
    let preambleEditor, mainEditor, bibEditor;
    let versions = JSON.parse(localStorage.getItem('versions')) || [];
    let images = []; // Array de {name, base64}
    let pdftex = new PDFTeX(); // Inicializa el compilador local



    // Editor para preamble (LaTeX mode)
    if (preambleEditorElem) {
        const preambleState = EditorState.create({
            doc: '',
            extensions: [
                basicSetup,
                autocomplete,
                latex({ biblatex: false, smartSuggest: true, syntaxLinter: true })
            ]
        });
        preambleEditor = new EditorView({
            state: preambleState,
            parent: preambleEditorElem
        });
    }

    // Editor principal para LaTeX body
    if (mainEditorElem) {
        const mainState = EditorState.create({
            doc: '',
            extensions: [
                basicSetup,
                autocomplete,
                latex({ biblatex: false, smartSuggest: true, syntaxLinter: true })
            ]
        });
        mainEditor = new EditorView({
            state: mainState,
            parent: mainEditorElem
        });
        mainEditor.dom.addEventListener('change', updateSidebar); // Actualiza sidebar en cambios
    }

    // Editor para BibTeX
    if (bibEditorElem) {
        const bibState = EditorState.create({
            doc: '',
            extensions: [
                basicSetup,
                autocomplete,
                bibtex({ biblatex: false, smartSuggest: true, syntaxLinter: true })
            ]
        });
        bibEditor = new EditorView({
            state: bibState,
            parent: bibEditorElem
        });
    }

    // Modo oscuro
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            const theme = document.body.classList.contains('dark') ? EditorView.theme({ "&": { backgroundColor: "#1e1e1e", color: "#fff" } }) : EditorView.theme({ "&": { backgroundColor: "#fff", color: "#000" } });
            preambleEditor.dispatch({ effects: EditorView.updateListener.of(() => {}) }); // Actualiza tema, pero CM6 necesita extensión personal para tema
            // Nota: Para tema completo, agregar extensión theme en extensions
            localStorage.setItem('darkMode', document.body.classList.contains('dark'));
        });
        if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');
    }

    // Generar estructura de proyecto
    if (generateStructureButton && templateSelect) {
        generateStructureButton.addEventListener('click', () => {
            const template = templateSelect.value;
            preambleEditor.dispatch({ changes: { from: 0, to: preambleEditor.state.doc.length, insert: templates[template] || templates['APA'] } });
            mainEditor.dispatch({ changes: { from: 0, to: mainEditor.state.doc.length, insert: '\\begin{document}\n\\maketitle\n\n\\section{Introducci\\on}\nEscribe aqu\\i...\n\n\\section{Metodolog\\ia}\n...\n\n\\section{Conclusiones}\n...\n\n\\bibliographystyle{plainnat}\n\\bibliography{refs}\n\\end{document}' } });
            bibEditor.dispatch({ changes: { from: 0, to: bibEditor.state.doc.length, insert: '' } });
            updateSidebar();
        });
    }

    // Inserciones rápidas en main editor
    if (insertSectionBtn) insertSectionBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\section{}'));
    if (insertCiteBtn) insertCiteBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\cite{}'));
    if (insertMathBtn) insertMathBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\[\n\\]'));
    if (insertFigureBtn) insertFigureBtn.addEventListener('click', () => insertFigure(mainEditor));
    if (insertTableBtn) insertTableBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\begin{table}[h]\n\\centering\n\\begin{tabular}{cc}\n a & b \\\\ \n c & d \\\\ \n\\end{tabular}\n\\caption{}\n\\label{}\n\\end{table}'));

    function insertAtCursor(editorView, text) {
        const state = editorView.state;
        const transaction = state.update({ changes: { from: state.selection.main.head, insert: text } });
        editorView.dispatch(transaction);
        editorView.focus();
    }

    function insertFigure(editorView) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (r) => {
                const name = sanitizeFilename(file.name);
                images.push({name, data: r.target.result.split(',')[1]});
                insertAtCursor(editorView, `\\begin{figure}[h]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{${name}}\n\\caption{}\n\\label{}\n\\end{figure}`);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    function sanitizeFilename(name) {
        return name.replace(/[^a-zA-Z0-9.-]/g, '_');
    }

    // Actualizar sidebar con estructura LaTeX
    function updateSidebar() {
        if (sidebar) {
            sidebar.innerHTML = '';
            const latex = mainEditor.state.doc.toString();
            const matches = latex.matchAll(/\\(chapter|section|subsection|subsubsection)\{([^{}]+)\}/g);
            for (const match of matches) {
                const level = {chapter: 0, section: 1, subsection: 2, subsubsection: 3}[match[1]];
                const title = match[2];
                const item = document.createElement('div');
                item.textContent = title;
                item.classList.add('sidebar-item');
                item.style.paddingLeft = `${level * 15}px`;
                item.addEventListener('click', () => {
                    const pos = latex.indexOf(match[0]);
                    mainEditor.dispatch({ selection: { anchor: pos } });
                    mainEditor.focus();
                });
                sidebar.appendChild(item);
            }
        }
    }

    // Fetch BibTeX desde DOI y agregar a bib editor
    if (fetchBibButton && doiInput) {
        fetchBibButton.addEventListener('click', async () => {
            const doi = doiInput.value.trim();
            if (!doi) return;
            try {
                const response = await fetch(`https://api.crossref.org/works/${doi}/transform/application/x-bibtex`);
                if (!response.ok) throw new Error('Failed to fetch');
                const bibtext = await response.text();
                const currentBib = bibEditor.state.doc.toString();
                bibEditor.dispatch({ changes: { from: currentBib.length, insert: (currentBib ? '\n' : '') + bibtext } });
            } catch (e) {
                alert('Error al obtener BibTeX: ' + e.message);
            }
        });
    }

    // Fetch desde ISBN
    if (fetchIsbnButton && isbnInput) {
        fetchIsbnButton.addEventListener('click', async () => {
            const isbn = isbnInput.value.trim();
            if (!isbn) return;
            try {
                const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                const year = data.publish_date ? data.publish_date.split(' ').pop() : new Date().getFullYear();
                const author = data.authors ? data.authors.map(a => a.name).join(' and ') : 'Unknown';
                const publisher = data.publishers ? data.publishers[0] : 'Unknown';
                const key = (author.split(' ')[0] + year).toLowerCase();
                const bib = `@book{${key},\n  author = {${author}},\n  title = {${data.title}},\n  year = {${year}},\n  publisher = {${publisher}},\n}\n`;
                const currentBib = bibEditor.state.doc.toString();
                bibEditor.dispatch({ changes: { from: currentBib.length, insert: (currentBib ? '\n' : '') + bib } });
            } catch (e) {
                alert('Error al obtener ISBN: ' + e.message);
            }
        });
    }

    // Compilar LaTeX a PDF localmente
    if (compileButton && pdfPreview) {
        compileButton.addEventListener('click', async () => {
            const preamble = preambleEditor.state.doc.toString();
            const body = mainEditor.state.doc.toString();
            const bib = bibEditor.state.doc.toString();
            const fullLatex = preamble + body;
            // Agregar archivos al filesystem virtual de PDFTeX
            pdftex.set_TEXINPUTS(".:/texmf:");
            if (bib) pdftex.add_file('refs.bib', new Uint8Array(new TextEncoder().encode(bib)));
            images.forEach(img => {
                const binary = atob(img.data);
                const array = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
                pdftex.add_file(img.name, array);
            });
            try {
                const pdfBytes = await pdftex.compile(fullLatex);
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                pdfPreview.src = URL.createObjectURL(blob);
                pdfPreview.style.display = 'block';
            } catch (e) {
                alert('Error en compilación: ' + e.message);
            }
        });
    }

    // Exportar .tex
    if (exportTexButton) {
        exportTexButton.addEventListener('click', () => {
            const full = preambleEditor.state.doc.toString() + mainEditor.state.doc.toString();
            const blob = new Blob([full], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'document.tex';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // Exportar .zip con proyecto
    if (exportZipButton) {
        exportZipButton.addEventListener('click', async () => {
            const zip = new JSZip();
            zip.file('document.tex', preambleEditor.state.doc.toString() + mainEditor.state.doc.toString());
            zip.file('refs.bib', bibEditor.state.doc.toString());
            images.forEach(img => zip.file(img.name, atob(img.data), { base64: true }));
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'latex_project.zip';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // Historial de versiones
    if (saveVersionButton && versionsList) {
        saveVersionButton.addEventListener('click', () => {
            versions.push({
                preamble: preambleEditor.state.doc.toString(),
                main: mainEditor.state.doc.toString(),
                bib: bibEditor.state.doc.toString()
            });
            localStorage.setItem('versions', JSON.stringify(versions));
            renderVersions();
        });
        renderVersions();
    }

    function renderVersions() {
        versionsList.innerHTML = '';
        versions.forEach((v, i) => {
            const btn = document.createElement('button');
            btn.textContent = `Versión ${i + 1}`;
            btn.addEventListener('click', () => {
                preambleEditor.dispatch({ changes: { from: 0, to: preambleEditor.state.doc.length, insert: v.preamble } });
                mainEditor.dispatch({ changes: { from: 0, to: mainEditor.state.doc.length, insert: v.main } });
                bibEditor.dispatch({ changes: { from: 0, to: bibEditor.state.doc.length, insert: v.bib } });
                updateSidebar();
            });
            versionsList.appendChild(btn);
        });
    }

    // Análisis de texto (repeticiones, consistencia)
    if (analyzeButton && analysisOutput) {
        analyzeButton.addEventListener('click', () => {
            const text = mainEditor.state.doc.toString().replace(/\\[a-zA-Z]+/g, '').replace(/[{}\[\]]/g, ''); // Quitar comandos LaTeX
            const words = text.split(/\s+/).filter(w => w.length > 3);
            const freq = {};
            words.forEach(w => freq[w] = (freq[w] || 0) + 1);
            const reps = Object.entries(freq).filter(([, c]) => c > 5).map(([w, c]) => `${w}: ${c}`).join(', ');
            const longSent = text.split(/[.!?]/).filter(s => s.split(/\s+/).length > 30).length;
            analysisOutput.innerHTML = `Repeticiones frecuentes: ${reps || 'Ninguna'}<br>Oraciones largas: ${longSent}`;
            // Agregar más análisis como densidad (palabras únicas / total)
        });
    }

    // "IA" simple: expandir y reescribir (basado en reglas)
    if (expandButton) {
        expandButton.addEventListener('click', () => {
            const selected = mainEditor.state.selection.main;
            const text = mainEditor.state.doc.sliceString(selected.from, selected.to);
            if (text) {
                const expanded = text + '\n% Expansión: Además, esto implica que... [agrega detalles académicos]';
                mainEditor.dispatch({ changes: { from: selected.from, to: selected.to, insert: expanded } });
            }
        });
    }

    if (rewriteButton) {
        rewriteButton.addEventListener('click', () => {
            const selected = mainEditor.state.selection.main;
            const text = mainEditor.state.doc.sliceString(selected.from, selected.to);
            if (text) {
                const rewritten = `% Reescritura como intro: Este trabajo presenta ${text}. Las secciones siguientes exploran...`;
                mainEditor.dispatch({ changes: { from: selected.from, to: selected.to, insert: rewritten } });
            }
        });
    }
});
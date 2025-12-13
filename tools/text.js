// tools/text.js
// @ts-nocheck
import { EditorView } from "@codemirror/view";
import { basicSetup } from "@codemirror/basic-setup";
import { EditorState } from "@codemirror/state";
import { autocompletion } from "@codemirror/autocomplete";
import { latex } from "codemirror-lang-latex";
import { bibtex } from "@citedrive/codemirror-lang-bibtex";

document.addEventListener('DOMContentLoaded', () => {
  const templates = {
    'APA': `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{geometry}\n\\geometry{margin=1in}\n\\usepackage{setspace}\n\\doublespacing\n\\usepackage{natbib}\n\\bibpunct{(}{)}{;}{a}{,}{,}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
    'Chicago': `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{geometry}\n\\geometry{margin=1in}\n\\usepackage{chicago}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
    'IEEE': `\\documentclass[conference]{IEEEtran}\n\\usepackage[utf8]{inputenc}\n\\usepackage{cite}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
    'Springer': `\\documentclass{svjour3}\n\\usepackage[utf8]{inputenc}\n\\usepackage{natbib}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
    'Elsevier': `\\documentclass{elsarticle}\n\\usepackage[utf8]{inputenc}\n\\usepackage{natbib}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
    'Tesis Chilena': `\\documentclass{book}\n\\usepackage[spanish]{babel}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage{geometry}\n\\geometry{a4paper, margin=2.5cm}\n\\usepackage{natbib}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
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
  const insertSectionBtn = document.getElementById('insert-section');
  const insertCiteBtn = document.getElementById('insert-cite');
  const insertMathBtn = document.getElementById('insert-math');
  const insertFigureBtn = document.getElementById('insert-figure');
  const insertTableBtn = document.getElementById('insert-table');
  const insertBoldBtn = document.getElementById('insert-bold');
  const insertItalicBtn = document.getElementById('insert-italic');
  const insertItemizeBtn = document.getElementById('insert-itemize');
  const insertEnumerateBtn = document.getElementById('insert-enumerate');
  const insertEquationBtn = document.getElementById('insert-equation');
  const insertHyperlinkBtn = document.getElementById('insert-hyperlink');
  const insertFootnoteBtn = document.getElementById('insert-footnote');
  const insertSubsectionBtn = document.getElementById('insert-subsection');
  const insertSubsubsectionBtn = document.getElementById('insert-subsubsection');
  const importZip = document.getElementById('import-zip');
  const importTex = document.getElementById('import-tex');
  const importBib = document.getElementById('import-bib');
  const compileLog = document.getElementById('compile-log');

  let preambleEditor, mainEditor, bibEditor;
  let versions = JSON.parse(localStorage.getItem('versions')) || [];
  let images = []; // Array de {name, base64}
  let texlive;
  try {
    texlive = new TeXLive(compileLog); // Inicializa el compilador local con log
  } catch (e) {
    console.error('Error inicializando TeXLive:', e);
    alert('Error al inicializar el compilador LaTeX. Verifica la librería texlive.js.');
  }

  // Editor para preamble (LaTeX mode)
  if (preambleEditorElem) {
    try {
      const preambleState = EditorState.create({
        doc: '\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{graphicx}\n',
        extensions: [
          basicSetup,
          autocompletion(),
          latex({ biblatex: false, smartSuggest: true, syntaxLinter: true })
        ]
      });
      preambleEditor = new EditorView({
        state: preambleState,
        parent: preambleEditorElem
      });
    } catch (e) {
      console.error('Error creando preamble editor:', e);
    }
  }

  // Editor principal para LaTeX body
  if (mainEditorElem) {
    try {
      const updateListener = EditorView.updateListener.of(update => {
        if (update.docChanged) updateSidebar();
      });
      const mainState = EditorState.create({
        doc: '\\begin{document}\nHola mundo\n\\end{document}',
        extensions: [
          basicSetup,
          autocompletion(),
          latex({ biblatex: false, smartSuggest: true, syntaxLinter: true }),
          updateListener
        ]
      });
      mainEditor = new EditorView({
        state: mainState,
        parent: mainEditorElem
      });
    } catch (e) {
      console.error('Error creando main editor:', e);
    }
  }

  // Editor para BibTeX
  if (bibEditorElem) {
    try {
      const bibState = EditorState.create({
        doc: '',
        extensions: [
          basicSetup,
          autocompletion(),
          bibtex({ biblatex: false, smartSuggest: true, syntaxLinter: true })
        ]
      });
      bibEditor = new EditorView({
        state: bibState,
        parent: bibEditorElem
      });
    } catch (e) {
      console.error('Error creando bib editor:', e);
    }
  }

  // Modo oscuro
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('darkMode', document.body.classList.contains('dark'));
    });
    if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');
  }

  // Generar estructura de proyecto
  if (generateStructureButton && templateSelect) {
    generateStructureButton.addEventListener('click', () => {
      const template = templateSelect.value;
      if (preambleEditor) {
        preambleEditor.dispatch({
          changes: { from: 0, to: preambleEditor.state.doc.length, insert: templates[template] || templates['APA'] }
        });
      }
      if (mainEditor) {
        mainEditor.dispatch({
          changes: { from: 0, to: mainEditor.state.doc.length, insert: '\\begin{document}\n\\maketitle\n\n\\section{Introducci\\\'on}\nEscribe aqu\\\'i...\n\n\\section{Metodolog\\\'ia}\n...\n\n\\section{Conclusiones}\n...\n\n\\bibliographystyle{plainnat}\n\\bibliography{refs}\n\\end{document}' }
        });
      }
      if (bibEditor) {
        bibEditor.dispatch({
          changes: { from: 0, to: bibEditor.state.doc.length, insert: '' }
        });
      }
      updateSidebar();
    });
  }

  // Inserciones rápidas en main editor
  if (insertSectionBtn) insertSectionBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\section{}'));
  if (insertSubsectionBtn) insertSubsectionBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\subsection{}'));
  if (insertSubsubsectionBtn) insertSubsubsectionBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\subsubsection{}'));
  if (insertCiteBtn) insertCiteBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\cite{}'));
  if (insertMathBtn) insertMathBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\[\n\\]'));
  if (insertEquationBtn) insertEquationBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\begin{equation}\n\\end{equation}'));
  if (insertFigureBtn) insertFigureBtn.addEventListener('click', () => insertFigure(mainEditor));
  if (insertTableBtn) insertTableBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\begin{table}[h]\n\\centering\n\\begin{tabular}{cc}\n a & b \\\\ \n c & d \\\\ \n\\end{tabular}\n\\caption{}\n\\label{}\n\\end{table}'));
  if (insertBoldBtn) insertBoldBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\textbf{}'));
  if (insertItalicBtn) insertItalicBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\textit{}'));
  if (insertItemizeBtn) insertItemizeBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\begin{itemize}\n\\item \n\\end{itemize}'));
  if (insertEnumerateBtn) insertEnumerateBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\begin{enumerate}\n\\item \n\\end{enumerate}'));
  if (insertHyperlinkBtn) insertHyperlinkBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\href{}{}'));
  if (insertFootnoteBtn) insertFootnoteBtn.addEventListener('click', () => insertAtCursor(mainEditor, '\\footnote{}'));

  function insertAtCursor(editorView, text) {
    if (!editorView) return;
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
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (r) => {
        const name = sanitizeFilename(file.name);
        images.push({ name, data: r.target.result.split(',')[1] });
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
    if (sidebar && mainEditor) {
      sidebar.innerHTML = '';
      const latex = mainEditor.state.doc.toString();
      const matches = latex.matchAll(/\\(chapter|section|subsection|subsubsection){([^{}]+)}/g);
      for (const match of matches) {
        const level = { chapter: 0, section: 1, subsection: 2, subsubsection: 3 }[match[1]];
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
        bibEditor.dispatch({
          changes: { from: currentBib.length, insert: (currentBib ? '\n' : '') + bibtext }
        });
      } catch (e) {
        console.error('Error fetching BibTeX:', e);
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
        bibEditor.dispatch({
          changes: { from: currentBib.length, insert: (currentBib ? '\n' : '') + bib }
        });
      } catch (e) {
        console.error('Error fetching ISBN:', e);
        alert('Error al obtener ISBN: ' + e.message);
      }
    });
  }

  // Importar .zip
  if (importZip) {
    importZip.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const zip = await JSZip.loadAsync(file);
        const texFiles = zip.file(/\\.tex$/i);
        let texFile;
        if (texFiles.length > 0) texFile = texFiles[0]; // Toma el primero
        else texFile = zip.file('document.tex');
        if (texFile) {
          const text = await texFile.async('string');
          const parts = text.split('\\begin{document}');
          if (preambleEditor) {
            preambleEditor.dispatch({
              changes: { from: 0, to: preambleEditor.state.doc.length, insert: parts[0] || '' }
            });
          }
          if (mainEditor) {
            mainEditor.dispatch({
              changes: { from: 0, to: mainEditor.state.doc.length, insert: (parts.length > 1 ? '\\begin{document}' + parts.slice(1).join('\\begin{document}') : text) }
            });
          }
        }
        const bibFiles = zip.file(/\\.bib$/i);
        let bibFile;
        if (bibFiles.length > 0) bibFile = bibFiles[0];
        else bibFile = zip.file('refs.bib');
        if (bibFile) {
          const bibText = await bibFile.async('string');
          if (bibEditor) {
            bibEditor.dispatch({
              changes: { from: 0, to: bibEditor.state.doc.length, insert: bibText }
            });
          }
        }
        images = [];
        await zip.forEach(async (path, entry) => {
          if (!entry.dir && /\\.(png|jpg|jpeg|gif|svg|pdf|eps)$/i.test(path)) {
            const base64 = await entry.async('base64');
            images.push({ name: sanitizeFilename(path), data: base64 });
          }
        });
        updateSidebar();
        alert('Proyecto importado exitosamente.');
      } catch (e) {
        console.error('Error importando .zip:', e);
        alert('Error al importar .zip: ' + e.message);
      }
    });
  }

  // Importar .tex
  if (importTex) {
    importTex.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (r) => {
        const text = r.target.result;
        const parts = text.split('\\begin{document}');
        if (preambleEditor) {
          preambleEditor.dispatch({
            changes: { from: 0, to: preambleEditor.state.doc.length, insert: parts[0] || '' }
          });
        }
        if (mainEditor) {
          mainEditor.dispatch({
            changes: { from: 0, to: mainEditor.state.doc.length, insert: (parts.length > 1 ? '\\begin{document}' + parts.slice(1).join('\\begin{document}') : text) }
          });
        }
        updateSidebar();
        alert('Archivo .tex importado.');
      };
      reader.readAsText(file);
    });
  }

  // Importar .bib
  if (importBib) {
    importBib.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (r) => {
        const text = r.target.result;
        if (bibEditor) {
          bibEditor.dispatch({
            changes: { from: 0, to: bibEditor.state.doc.length, insert: text }
          });
        }
        alert('Archivo .bib importado.');
      };
      reader.readAsText(file);
    });
  }

  // Compilar LaTeX a PDF localmente
  if (compileButton && pdfPreview) {
    compileButton.addEventListener('click', async () => {
      if (!preambleEditor || !mainEditor || !texlive) return;
      const preamble = preambleEditor.state.doc.toString();
      const body = mainEditor.state.doc.toString();
      const fullLatex = preamble + body;
      const bib = bibEditor ? bibEditor.state.doc.toString() : '';
      try {
        texlive.FS.writeFile('main.tex', fullLatex);
        if (bib) texlive.FS.writeFile('refs.bib', bib);
        images.forEach(img => {
          const binary = atob(img.data);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
          texlive.FS.writeFile(img.name, array);
        });
        await new Promise((resolve) => texlive.run('pdflatex -interaction=nonstopmode main.tex', resolve));
        if (bib) await new Promise((resolve) => texlive.run('bibtex main', resolve));
        await new Promise((resolve) => texlive.run('pdflatex -interaction=nonstopmode main.tex', resolve));
        await new Promise((resolve) => texlive.run('pdflatex -interaction=nonstopmode main.tex', resolve));
        const pdfBytes = texlive.FS.readFile('main.pdf', { encoding: 'binary' });
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        pdfPreview.src = URL.createObjectURL(blob);
        pdfPreview.style.display = 'block';
      } catch (e) {
        console.error('Error en compilación:', e);
        alert('Error en compilación: ' + e.message);
      }
    });
  }

  // Exportar .tex
  if (exportTexButton) {
    exportTexButton.addEventListener('click', () => {
      if (!preambleEditor || !mainEditor) return;
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
      if (!preambleEditor || !mainEditor) return;
      const zip = new JSZip();
      zip.file('document.tex', preambleEditor.state.doc.toString() + mainEditor.state.doc.toString());
      zip.file('refs.bib', bibEditor ? bibEditor.state.doc.toString() : '');
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
      if (!preambleEditor || !mainEditor || !bibEditor) return;
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
        if (preambleEditor) {
          preambleEditor.dispatch({
            changes: { from: 0, to: preambleEditor.state.doc.length, insert: v.preamble }
          });
        }
        if (mainEditor) {
          mainEditor.dispatch({
            changes: { from: 0, to: mainEditor.state.doc.length, insert: v.main }
          });
        }
        if (bibEditor) {
          bibEditor.dispatch({
            changes: { from: 0, to: bibEditor.state.doc.length, insert: v.bib }
          });
        }
        updateSidebar();
      });
      versionsList.appendChild(btn);
    });
  }

  // Análisis de texto (repeticiones, consistencia)
  if (analyzeButton && analysisOutput && mainEditor) {
    analyzeButton.addEventListener('click', () => {
      const text = mainEditor.state.doc.toString().replace(/\\[a-zA-Z]+/g, '').replace(/[{}[]]/g, ''); // Quitar comandos LaTeX
      const words = text.split(/\s+/).filter(w => w.length > 3);
      const freq = {};
      words.forEach(w => freq[w] = (freq[w] || 0) + 1);
      const reps = Object.entries(freq).filter(([, c]) => c > 5).map(([w, c]) => `${w}: ${c}`).join(', ');
      const longSent = text.split(/[.!?]/).filter(s => s.split(/\s+/).length > 30).length;
      analysisOutput.innerHTML = `Repeticiones frecuentes: ${reps || 'Ninguna'}<br>Oraciones largas: ${longSent}`; // Agregar más análisis como densidad (palabras únicas / total)
    });
  }
});
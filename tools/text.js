// tools/text.js
console.log("tools/text.js cargado correctamente (CodeMirror 5)");

document.addEventListener('DOMContentLoaded', () => {
  console.log("tools/text.js - Inicio de DOMContentLoaded");

  const templates = {
    'APA': `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{geometry}\n\\geometry{margin=1in}\n\\usepackage{setspace}\n\\doublespacing\n\\usepackage{natbib}\n\\bibpunct{(}{)}{;}{a}{,}{,}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
    'Chicago': `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{geometry}\n\\geometry{margin=1in}\n\\usepackage{chicago}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
    'IEEE': `\\documentclass[conference]{IEEEtran}\n\\usepackage[utf8]{inputenc}\n\\usepackage{cite}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
    'Springer': `\\documentclass{svjour3}\n\\usepackage[utf8]{inputenc}\n\\usepackage{natbib}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
    'Elsevier': `\\documentclass{elsarticle}\n\\usepackage[utf8]{inputenc}\n\\usepackage{natbib}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
    'Tesis Chilena': `\\documentclass{book}\n\\usepackage[spanish]{babel}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage{geometry}\n\\geometry{a4paper, margin=2.5cm}\n\\usepackage{natbib}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
  };
  console.log("Templates cargados correctamente");

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

  console.log("Elementos DOM capturados:", {
    preambleEditorElem: !!preambleEditorElem,
    mainEditorElem: !!mainEditorElem,
    bibEditorElem: !!bibEditorElem
  });

  let preambleEditor, mainEditor, bibEditor;
  let versions = JSON.parse(localStorage.getItem('versions')) || [];
  console.log("Versiones cargadas del localStorage:", versions.length);
  let images = []; // Array de {name, base64}
  let texlive;
  try {
    texlive = new TeXLive(compileLog); // Inicializa el compilador local con log
    console.log("TeXLive inicializado correctamente");
  } catch (e) {
    console.error('Error inicializando TeXLive:', e);
    alert('Error al inicializar el compilador LaTeX. Verifica la librería texlive.js en consola.');
  }

  // Opciones comunes para CodeMirror 5
  const editorOptions = {
    lineNumbers: true,
    matchBrackets: true,
    styleActiveLine: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    mode: "stex" // Modo LaTeX para preamble y main
  };

  // Editor para preamble
  if (preambleEditorElem) {
    preambleEditor = CodeMirror(preambleEditorElem, {
      value: '\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{graphicx}\n',
      ...editorOptions
    });
    console.log("Preamble editor creado");
  }

  // Editor principal
  if (mainEditorElem) {
    mainEditor = CodeMirror(mainEditorElem, {
      value: '\\begin{document}\nHola mundo\n\\end{document}',
      ...editorOptions
    });
    mainEditor.on("change", updateSidebar);
    console.log("Main editor creado");
  }

  // Editor para BibTeX (fallback a stex para highlight básico)
  if (bibEditorElem) {
    bibEditor = CodeMirror(bibEditorElem, {
      value: '',
      lineNumbers: true,
      matchBrackets: true,
      mode: "stex" // Usamos stex para highlight similar
    });
    console.log("Bib editor creado");
  }

  // Modo oscuro
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('darkMode', document.body.classList.contains('dark'));
      [preambleEditor, mainEditor, bibEditor].forEach(ed => ed.refresh());
      console.log("Modo oscuro toggled");
    });
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
    }
  }

  // Generar estructura
  if (generateStructureButton && templateSelect) {
    generateStructureButton.addEventListener('click', () => {
      const template = templateSelect.value;
      preambleEditor.setValue(templates[template] || templates['APA']);
      mainEditor.setValue('\\begin{document}\n\\maketitle\n\n\\section{Introducci\\\'on}\nEscribe aqu\\\'i...\n\n\\section{Metodolog\\\'ia}\n...\n\n\\section{Conclusiones}\n...\n\n\\bibliographystyle{plainnat}\n\\bibliography{refs}\n\\end{document}');
      bibEditor.setValue('');
      updateSidebar();
      console.log("Estructura generada con template:", template);
    });
  }

  // Inserciones rápidas
  const insertButtons = {
    'insert-section': '\\section{}',
    'insert-subsection': '\\subsection{}',
    'insert-subsubsection': '\\subsubsection{}',
    'insert-cite': '\\cite{}',
    'insert-math': '\\[\n\\]',
    'insert-equation': '\\begin{equation}\n\\end{equation}',
    'insert-table': '\\begin{table}[h]\n\\centering\n\\begin{tabular}{cc}\n a & b \\\\ \n c & d \\\\ \n\\end{tabular}\n\\caption{}\n\\label{}\n\\end{table}',
    'insert-bold': '\\textbf{}',
    'insert-italic': '\\textit{}',
    'insert-itemize': '\\begin{itemize}\n\\item \n\\end{itemize}',
    'insert-enumerate': '\\begin{enumerate}\n\\item \n\\end{enumerate}',
    'insert-hyperlink': '\\href{}{}',
    'insert-footnote': '\\footnote{}'
  };

  Object.keys(insertButtons).forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => insertAtCursor(mainEditor, insertButtons[id]));
  });

  if (insertFigureBtn) insertFigureBtn.addEventListener('click', () => insertFigure(mainEditor));

  function insertAtCursor(editor, text) {
    if (!editor) return;
    const cursor = editor.getCursor();
    editor.replaceRange(text, cursor);
    editor.focus();
    console.log("Insertado:", text);
  }

  function insertFigure(editor) {
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
        insertAtCursor(editor, `\\begin{figure}[h]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{${name}}\n\\caption{}\n\\label{}\n\\end{figure}`);
        console.log("Imagen insertada:", name);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  // Actualizar sidebar
  function updateSidebar() {
    if (!sidebar || !mainEditor) return;
    sidebar.innerHTML = '<strong>Secciones:</strong><br>';
    const lines = mainEditor.getValue().split("\n");
    let count = 0;
    lines.forEach((line, i) => {
      const match = line.match(/\\(chapter|section|subsection|subsubsection){([^{}]+)}/);
      if (match) {
        const level = { chapter: 0, section: 1, subsection: 2, subsubsection: 3 }[match[1]];
        const title = match[2];
        const item = document.createElement('div');
        item.textContent = title;
        item.classList.add('sidebar-item');
        item.style.paddingLeft = `${level * 15}px`;
        item.onclick = () => {
          mainEditor.scrollIntoView({ line: i, ch: 0 });
          mainEditor.focus();
        };
        sidebar.appendChild(item);
        count++;
      }
    });
    console.log("Sidebar actualizada con", count, "items");
  }

  // Fetch BibTeX desde DOI
  if (fetchBibButton && doiInput) {
    fetchBibButton.addEventListener('click', async () => {
      const doi = doiInput.value.trim();
      if (!doi) return;
      try {
        const response = await fetch(`https://api.crossref.org/works/${doi}/transform/application/x-bibtex`);
        if (!response.ok) throw new Error('Failed to fetch');
        const bibtext = await response.text();
        const currentBib = bibEditor.getValue();
        bibEditor.setValue(currentBib + (currentBib ? '\n' : '') + bibtext);
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
        const currentBib = bibEditor.getValue();
        bibEditor.setValue(currentBib + (currentBib ? '\n' : '') + bib);
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
        const texFiles = Object.keys(zip.files).filter(path => path.toLowerCase().endsWith('.tex'));
        let texFileContent = '';
        if (texFiles.length > 0) {
          texFileContent = await zip.files[texFiles[0]].async('string');
        }
        const parts = texFileContent.split('\\begin{document}');
        preambleEditor.setValue(parts[0] || '');
        mainEditor.setValue(parts.length > 1 ? '\\begin{document}' + parts.slice(1).join('\\begin{document}') : texFileContent);
        const bibFiles = Object.keys(zip.files).filter(path => path.toLowerCase().endsWith('.bib'));
        let bibFileContent = '';
        if (bibFiles.length > 0) {
          bibFileContent = await zip.files[bibFiles[0]].async('string');
          bibEditor.setValue(bibFileContent);
        }
        images = [];
        const promises = [];
        for (const path in zip.files) {
          const entry = zip.files[path];
          if (!entry.dir && /\.(png|jpg|jpeg|gif|svg|pdf|eps)$/i.test(path)) {
            promises.push(entry.async('base64').then(base64 => images.push({ name: sanitizeFilename(path), data: base64 })));
          }
        }
        await Promise.all(promises);
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
        preambleEditor.setValue(parts[0] || '');
        mainEditor.setValue(parts.length > 1 ? '\\begin{document}' + parts.slice(1).join('\\begin{document}') : text);
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
        bibEditor.setValue(text);
        alert('Archivo .bib importado.');
      };
      reader.readAsText(file);
    });
  }

 // Compilar LaTeX a PDF localmente (corregido para PDFTeX actual)
if (compileButton && pdfPreview) {
  compileButton.addEventListener('click', async () => {
    console.log("Iniciando compilación con PDFTeX");
    if (!preambleEditor || !mainEditor) {
      alert("Faltan editores");
      return;
    }

    let pdftex;
    try {
      pdftex = new PDFTeX();  // Aquí está la corrección: PDFTeX en vez de TeXLive
      console.log("PDFTeX inicializado correctamente");
    } catch (e) {
      console.error("Error creando PDFTeX:", e);
      alert("Error al inicializar el compilador. Verifica que texlive.js cargue bien.");
      return;
    }

    const fullLatex = preambleEditor.getValue() + mainEditor.getValue();
    const bib = bibEditor ? bibEditor.getValue() : '';

    try {
      // Escribir archivos en el filesystem virtual
      pdftex.FS.writeFile('main.tex', fullLatex);
      if (bib) pdftex.FS.writeFile('refs.bib', bib);

      images.forEach(img => {
        const binary = atob(img.data);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
        pdftex.FS.writeFile(img.name, array);
        console.log("Imagen escrita:", img.name);
      });

      // Compilar (PDFTeX maneja pdflatex + bibtex internamente si hay refs.bib)
      console.log("Compilando LaTeX...");
      const pdfUrl = await pdftex.compile(fullLatex);  // Devuelve data URL directamente

      pdfPreview.src = pdfUrl;
      pdfPreview.style.display = 'block';
      console.log("¡Compilación exitosa! PDF mostrado");
    } catch (e) {
      console.error('Error en compilación:', e);
      alert('Error en compilación: ' + e.message + '\nRevisa la consola para más detalles. Puede ser un error de LaTeX o paquete no soportado.');
    }
  });
}
  // Export .tex
  if (exportTexButton) {
    exportTexButton.addEventListener('click', () => {
      const full = preambleEditor.getValue() + mainEditor.getValue();
      const blob = new Blob([full], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.tex';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Export .zip
  if (exportZipButton) {
    exportZipButton.addEventListener('click', async () => {
      const zip = new JSZip();
      zip.file('document.tex', preambleEditor.getValue() + mainEditor.getValue());
      zip.file('refs.bib', bibEditor.getValue());
      images.forEach(img => zip.file(img.name, atob(img.data), {base64: true}));
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'latex_project.zip';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Versiones
  if (saveVersionButton && versionsList) {
    saveVersionButton.addEventListener('click', () => {
      versions.push({
        preamble: preambleEditor.getValue(),
        main: mainEditor.getValue(),
        bib: bibEditor.getValue()
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
        preambleEditor.setValue(v.preamble);
        mainEditor.setValue(v.main);
        bibEditor.setValue(v.bib);
        updateSidebar();
      });
      versionsList.appendChild(btn);
    });
  }

  // Análisis
  if (analyzeButton && analysisOutput && mainEditor) {
    analyzeButton.addEventListener('click', () => {
      const text = mainEditor.getValue().replace(/\\[a-zA-Z]+/g, '').replace(/[{}[]]/g, '');
      const words = text.split(/\s+/).filter(w => w.length > 3);
      const freq = {};
      words.forEach(w => freq[w] = (freq[w] || 0) + 1);
      const reps = Object.entries(freq).filter(([, c]) => c > 5).map(([w, c]) => `${w}: ${c}`).join(', ');
      const longSent = text.split(/[.!?]/).filter(s => s.split(/\s+/).length > 30).length;
      analysisOutput.innerHTML = `Repeticiones frecuentes: ${reps || 'Ninguna'}<br>Oraciones largas: ${longSent}`;
    });
  }

  console.log("tools/text.js - Fin de DOMContentLoaded");
});
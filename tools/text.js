// tools/text.js
console.log("tools/text.js cargado correctamente (CodeMirror 5)");

document.addEventListener('DOMContentLoaded', () => {
  console.log("tools/text.js - Inicio de DOMContentLoaded");

  const templates = {
    'APA': `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{margin=1in}
\\usepackage{setspace}
\\doublespacing
\\usepackage{natbib}
\\bibpunct{(}{)}{;}{a}{,}{,}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{amsmath}
\\usepackage{booktabs}
\\usepackage{caption}
\\usepackage{subcaption}
`,
    'Chicago': `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{margin=1in}
\\usepackage{chicago}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{amsmath}
\\usepackage{booktabs}
\\usepackage{caption}
\\usepackage{subcaption}
`,
    'IEEE': `\\documentclass[conference]{IEEEtran}
\\usepackage[utf8]{inputenc}
\\usepackage{cite}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{amsmath}
\\usepackage{booktabs}
\\usepackage{caption}
\\usepackage{subcaption}
`,
    'Springer': `\\documentclass{svjour3}
\\usepackage[utf8]{inputenc}
\\usepackage{natbib}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{amsmath}
\\usepackage{booktabs}
\\usepackage{caption}
\\usepackage{subcaption}
`,
    'Elsevier': `\\documentclass{elsarticle}
\\usepackage[utf8]{inputenc}
\\usepackage{natbib}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{amsmath}
\\usepackage{booktabs}
\\usepackage{caption}
\\usepackage{subcaption}
`,
    'Tesis Chilena': `\\documentclass{book}
\\usepackage[spanish]{babel}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\geometry{a4paper, margin=2.5cm}
\\usepackage{natbib}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{amsmath}
\\usepackage{booktabs}
\\usepackage{caption}
\\usepackage{subcaption}
`,
  };

  console.log("Templates cargados correctamente");

  // Elementos DOM
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
  const insertFigureBtn = document.getElementById('insert-figure');
  const importZip = document.getElementById('import-zip');
  const importTex = document.getElementById('import-tex');
  const importBib = document.getElementById('import-bib');
  const compileLog = document.getElementById('compile-log');

  let preambleEditor, mainEditor, bibEditor;
  let versions = JSON.parse(localStorage.getItem('versions')) || [];
  let images = [];

  // CodeMirror options
  const editorOptions = {
    lineNumbers: true,
    matchBrackets: true,
    styleActiveLine: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    mode: "stex"
  };

  if (preambleEditorElem) {
    preambleEditor = CodeMirror(preambleEditorElem, {
      value: '\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{graphicx}\n',
      ...editorOptions
    });
    console.log("Preamble editor creado");
  }

  if (mainEditorElem) {
    mainEditor = CodeMirror(mainEditorElem, {
      value: '\\begin{document}\nHola mundo\n\\end{document}',
      ...editorOptions
    });
    mainEditor.on("change", updateSidebar);
    console.log("Main editor creado");
  }

  if (bibEditorElem) {
    bibEditor = CodeMirror(bibEditorElem, {
      value: '',
      lineNumbers: true,
      matchBrackets: true,
      mode: "stex"
    });
    console.log("Bib editor creado");
  }

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

  // Helper: cargar un script dinámicamente con timeout
  function loadScript(url, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      let done = false;
      s.src = url;
      s.async = true;
      s.onload = () => { if (!done) { done = true; resolve(); } };
      s.onerror = (e) => { if (!done) { done = true; reject(new Error('Failed to load ' + url)); } };
      document.head.appendChild(s);
      setTimeout(() => { if (!done) { done = true; reject(new Error('Timeout loading ' + url)); } }, timeout);
    });
  }

  // Intenta localizar un constructor PDFTeX en el entorno global
  function findPDFTeXConstructor() {
    // Nombres comunes
    const names = ['PDFTeX', 'PdfTeX', 'pdftex', 'PDFTex', 'TeXLive', 'TexLive', 'PdfTex'];
    for (const n of names) {
      try {
        if (typeof window[n] === 'function') {
          console.log('Encontrado constructor PDFTeX en window.' + n);
          return window[n];
        }
      } catch (e) {}
    }
    // Buscar en Module (muchos builds exponen API ahí)
    try {
      if (window.Module) {
        if (typeof window.Module.PDFTeX === 'function') {
          console.log('Encontrado constructor PDFTeX en window.Module.PDFTeX');
          return window.Module.PDFTeX;
        }
        // algunas builds colocan la función en Module.exports o Module.pdftex
        if (window.Module.exports && typeof window.Module.exports.PDFTeX === 'function') {
          console.log('Encontrado constructor PDFTeX en window.Module.exports.PDFTeX');
          return window.Module.exports.PDFTeX;
        }
        if (typeof window.Module.pdftex === 'function') {
          console.log('Encontrado constructor PDFTeX en window.Module.pdftex');
          return window.Module.pdftex;
        }
      }
    } catch (e) {}
    // Exploración amplia por seguridad: buscar cualquier global cuyo nombre sugiera pdf+tex
    for (const k in window) {
      try {
        if (k && k.toLowerCase().includes('pdf') && k.toLowerCase().includes('tex') && typeof window[k] === 'function') {
          console.log('Encontrado constructor PDFTeX por heurística en window.' + k);
          return window[k];
        }
      } catch (e) {}
    }
    return null;
  }

  // Intentar asegurar que PDFTeX esté definido: probar rutas comunes/candidatas
  async function ensurePDFTeX() {
    if (typeof PDFTeX !== 'undefined' && typeof PDFTeX === 'function') return;
    const candidates = [
      './texlive.js',
      '/texlive.js',
      // CDN fallback (puede variar según disponibilidad)
      'https://unpkg.com/pdftex-wasm@latest/dist/pdftex.js',
      'https://cdn.jsdelivr.net/npm/pdftex-wasm@latest/dist/pdftex.js'
    ];
    let lastErr = null;
    for (const url of candidates) {
      try {
        console.log('Intentando cargar librería desde', url);
        await loadScript(url);
        // tras cargar, intentar encontrar constructor
        const ctor = findPDFTeXConstructor();
        if (ctor) {
          // normalizar export bajo window.PDFTeX
          window.PDFTeX = ctor;
          console.log('PDFTeX normalizado en window.PDFTeX');
          return;
        } else {
          console.warn('Script cargado pero no se detectó constructor PDFTeX en globals tras cargar', url);
        }
      } catch (e) {
        lastErr = e;
        console.warn('Carga fallida desde', url, e);
      }
    }

    // Si no se encontró, dar info de depuración ligera (no exponer demasiado)
    try {
      console.info('Keys relevantes de window para depuración (resumen):');
      const sampleKeys = Object.keys(window).filter(k => /pdf|tex|texlive|module/i.test(k)).slice(0, 30);
      console.info(sampleKeys);
    } catch (e) {}

    throw new Error('PDFTeX no disponible. Último error: ' + (lastErr && lastErr.message));
  }

  // Compilar LaTeX a PDF localmente
  if (compileButton && pdfPreview) {
    compileButton.addEventListener('click', async () => {
      console.log("Iniciando compilación con PDFTeX");
      if (!preambleEditor || !mainEditor) {
        alert("Faltan editores");
        return;
      }

      try {
        await ensurePDFTeX();
      } catch (e) {
        console.error('Error asegurando PDFTeX:', e);
        // Mostrar mensaje claro en UI y en consola
        const msg = [
          'No se pudo inicializar el compilador local (PDFTeX no está definido).',
          'Sugerencias:',
          '- Asegura que tu build de texlive/pdftex exponga un constructor global (PDFTeX).',
          "- -o- Coloca un bundle llamado ./texlive.js o /texlive.js que exponga PDFTeX, o usa un paquete wasm (pdftex-wasm) disponible desde CDN.",
          '- Alternativa: exporta el .tex y compílalo externamente.'
        ].join('\n');
        alert(msg + '\n\nDetalles técnicos: ' + e.message);
        return;
      }

      let pdftex;
      try {
        pdftex = new PDFTeX();
        console.log("PDFTeX inicializado correctamente");
      } catch (e) {
        console.error("Error creando PDFTeX:", e);
        alert("Error al inicializar el compilador después de cargar la librería: " + e.message);
        return;
      }

      const fullLatex = preambleEditor.getValue() + mainEditor.getValue();
      const bib = bibEditor ? bibEditor.getValue() : '';

      try {
        pdftex.FS.writeFile('main.tex', fullLatex);
        if (bib) pdftex.FS.writeFile('refs.bib', bib);

        images.forEach(img => {
          const binary = atob(img.data);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
          pdftex.FS.writeFile(img.name, array);
          console.log("Imagen escrita:", img.name);
        });

        console.log("Compilando LaTeX...");
        const pdfUrl = await pdftex.compile(fullLatex);

        pdfPreview.src = pdfUrl;
        pdfPreview.style.display = 'block';
        console.log("¡Compilación exitosa! PDF mostrado");
      } catch (e) {
        console.error('Error en compilación:', e);
        alert('Error en compilación: ' + e.message + '\nRevisa la consola para más detalles. Puede ser un error de LaTeX o paquete no soportado.');
      }
    });
  }
});

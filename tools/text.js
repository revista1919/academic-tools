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
  const exportTexButton = document.getElementById('export-tex');
  const exportZipButton = document.getElementById('export-zip');
  const saveVersionButton = document.getElementById('save-version');
  const versionsList = document.getElementById('versions-list');
  const analyzeButton = document.getElementById('analyze-text');
  const analysisOutput = document.getElementById('analysis-output');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const insertFigureBtn = document.getElementById('insert-figure');
  const insertVisualTableBtn = document.getElementById('insert-visual-table');
  const importZip = document.getElementById('import-zip');
  const importTex = document.getElementById('import-tex');
  const importBib = document.getElementById('import-bib');
  const tableModal = document.getElementById('table-modal');
  const tableRowsInput = document.getElementById('table-rows');
  const tableColsInput = document.getElementById('table-cols');
  const generateTableGridBtn = document.getElementById('generate-table-grid');
  const tableGrid = document.getElementById('table-grid');
  const insertTableCodeBtn = document.getElementById('insert-table-code');
  const closeTableModalBtn = document.getElementById('close-table-modal');
  const insertVisualEquationBtn = document.getElementById('insert-visual-equation');
  const equationModal = document.getElementById('equation-modal');
  const equationInput = document.getElementById('equation-input');
  const equationPreview = document.getElementById('equation-preview');
  const insertEquationCodeBtn = document.getElementById('insert-equation-code');
  const closeEquationModalBtn = document.getElementById('close-equation-modal');
  const wordCountElem = document.getElementById('word-count');
  const findReplaceBtn = document.getElementById('find-replace-btn');
  const findInput = document.getElementById('find-input');
  const replaceInput = document.getElementById('replace-input');
  const findReplaceModal = document.getElementById('find-replace-modal');
  const closeFindReplaceModalBtn = document.getElementById('close-find-replace-modal');
  const performFindReplaceBtn = document.getElementById('perform-find-replace');
  const richTextEditorElem = document.getElementById('rich-text-editor');
  const insertRichTextBtn = document.getElementById('insert-rich-text');
  const richTextModal = document.getElementById('rich-text-modal');
  const closeRichTextModalBtn = document.getElementById('close-rich-text-modal');
  const insertRichTextCodeBtn = document.getElementById('insert-rich-text-code');
  const overleafExportBtn = document.getElementById('export-to-overleaf');
  const texpageExportBtn = document.getElementById('export-to-texpage');
  const papeeriaExportBtn = document.getElementById('export-to-papeeria');
  const cocalcExportBtn = document.getElementById('export-to-cocalc');
  const latexOnlineExportBtn = document.getElementById('export-to-latexonline');

  let preambleEditor, mainEditor, bibEditor, quill;
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
    mode: "stex",
    extraKeys: {
      "Ctrl-B": () => insertAtCursor(mainEditor, '\\textbf{}'),
      "Ctrl-I": () => insertAtCursor(mainEditor, '\\textit{}'),
      "Ctrl-U": () => insertAtCursor(mainEditor, '\\underline{}'),
      "Ctrl-S": () => insertAtCursor(mainEditor, '\\section{}'),
      "Ctrl-Shift-S": () => insertAtCursor(mainEditor, '\\subsection{}'),
      "Ctrl-Alt-S": () => insertAtCursor(mainEditor, '\\subsubsection{}'),
      "Ctrl-E": () => insertAtCursor(mainEditor, '\\begin{equation}\n\\end{equation}'),
      "Ctrl-M": () => insertAtCursor(mainEditor, '\\[\n\\]'),
      "Ctrl-L": () => insertAtCursor(mainEditor, '\\begin{itemize}\n\\item \n\\end{itemize}'),
      "Ctrl-Shift-L": () => insertAtCursor(mainEditor, '\\begin{enumerate}\n\\item \n\\end{enumerate}'),
      "Ctrl-T": () => openVisualTableModal(),
      "Ctrl-F": () => insertFigure(mainEditor),
      "Ctrl-C": () => insertAtCursor(mainEditor, '\\cite{}'),
      "Ctrl-H": () => insertAtCursor(mainEditor, '\\href{}{}'),
      "Ctrl-N": () => insertAtCursor(mainEditor, '\\footnote{}'),
      "Ctrl-Alt-T": () => insertAtCursor(mainEditor, '\\begin{table}[h]\n\\centering\n\\begin{tabular}{cc}\n a & b \\\\ \n c & d \\\\ \n\\end{tabular}\n\\caption{}\n\\label{}\n\\end{table}'),
      "Ctrl-Alt-F": () => insertAtCursor(mainEditor, '\\begin{figure}[h]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{}\n\\caption{}\n\\label{}\n\\end{figure}'),
      "Ctrl-Alt-E": () => insertAtCursor(mainEditor, '\\begin{align}\n\\end{align}'),
      "Ctrl-Alt-M": () => insertAtCursor(mainEditor, '\\begin{bmatrix}\n\\end{bmatrix}'),
      "Ctrl-Alt-P": () => insertAtCursor(mainEditor, '\\begin{pmatrix}\n\\end{pmatrix}'),
      "Ctrl-Alt-V": () => insertAtCursor(mainEditor, '\\vec{}'),
      "Ctrl-Alt-H": () => insertAtCursor(mainEditor, '\\hat{}'),
      "Ctrl-Alt-B": () => insertAtCursor(mainEditor, '\\bar{}'),
      "Ctrl-Alt-D": () => insertAtCursor(mainEditor, '\\dot{}'),
      "Ctrl-Alt-O": () => insertAtCursor(mainEditor, '\\overline{}'),
      "Ctrl-Alt-U": () => insertAtCursor(mainEditor, '\\underbrace{}{}'),
      "Ctrl-Alt-I": () => insertAtCursor(mainEditor, '\\int'),
      "Ctrl-Alt-Sum": () => insertAtCursor(mainEditor, '\\sum'),
      "Ctrl-Alt-Prod": () => insertAtCursor(mainEditor, '\\prod'),
      "Ctrl-Alt-Lim": () => insertAtCursor(mainEditor, '\\lim'),
      "Ctrl-Alt-Inf": () => insertAtCursor(mainEditor, '\\infty'),
      "Ctrl-Q": () => openVisualEquationModal(),
      "Ctrl-R": () => openRichTextModal(),
      "Ctrl-Z": "undo",
      "Ctrl-Y": "redo",
      "Ctrl-Find": () => openFindReplaceModal()
    }
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
    mainEditor.on("change", () => {
      updateSidebar();
      updateWordCount();
    });
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

  // Inicializar Quill para editor de texto enriquecido
  if (richTextEditorElem) {
    quill = new Quill(richTextEditorElem, {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'direction': 'rtl' }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'font': [] }],
          [{ 'align': [] }],
          ['clean']
        ]
      }
    });
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

  function updateWordCount() {
    if (!wordCountElem || !mainEditor) return;
    const text = mainEditor.getValue().replace(/\\[^ ]+/g, '').replace(/\s+/g, ' ').trim();
    const wordCount = text.split(' ').length;
    wordCountElem.textContent = `Palabras: ${wordCount}`;
  }

  // Modo oscuro
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('darkMode', document.body.classList.contains('dark'));
      [preambleEditor, mainEditor, bibEditor].forEach(ed => ed ? ed.refresh() : null);
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
      updateWordCount();
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
    'insert-footnote': '\\footnote{}',
    'insert-align': '\\begin{align}\n\\end{align}',
    'insert-matrix': '\\begin{bmatrix}\n\\end{bmatrix}',
    'insert-pmatrix': '\\begin{pmatrix}\n\\end{pmatrix}',
    'insert-vector': '\\vec{}',
    'insert-hat': '\\hat{}',
    'insert-bar': '\\bar{}',
    'insert-dot': '\\dot{}',
    'insert-overline': '\\overline{}',
    'insert-underbrace': '\\underbrace{}{}',
    'insert-integral': '\\int',
    'insert-sum': '\\sum',
    'insert-prod': '\\prod',
    'insert-lim': '\\lim',
    'insert-infty': '\\infty',
    'insert-abstract': '\\begin{abstract}\n\\end{abstract}',
    'insert-theorem': '\\begin{theorem}\n\\end{theorem}',
    'insert-lemma': '\\begin{lemma}\n\\end{lemma}',
    'insert-proof': '\\begin{proof}\n\\end{proof}',
    'insert-description': '\\begin{description}\n\\item[] \n\\end{description}',
    'insert-verbatim': '\\begin{verbatim}\n\\end{verbatim}',
    'insert-quote': '\\begin{quote}\n\\end{quote}',
    'insert-center': '\\begin{center}\n\\end{center}',
    'insert-flushleft': '\\begin{flushleft}\n\\end{flushleft}',
    'insert-flushright': '\\begin{flushright}\n\\end{flushright}',
    'insert-minipage': '\\begin{minipage}{0.5\\textwidth}\n\\end{minipage}',
    'insert-framebox': '\\fbox{}',
    'insert-color': '\\textcolor{}{}',
    'insert-pagebreak': '\\pagebreak',
    'insert-newpage': '\\newpage',
    'insert-chapter': '\\chapter{}',
    'insert-part': '\\part{}',
    'insert-paragraph': '\\paragraph{}',
    'insert-subparagraph': '\\subparagraph{}',
    'insert-label': '\\label{}',
    'insert-ref': '\\ref{}',
    'insert-pageref': '\\pageref{}',
    'insert-index': '\\index{}',
    'insert-glossary': '\\glossary{}',
    'insert-emph': '\\emph{}',
    'insert-texttt': '\\texttt{}',
    'insert-textsc': '\\textsc{}',
    'insert-textsf': '\\textsf{}',
    'insert-textmd': '\\textmd{}',
    'insert-textup': '\\textup{}',
    'insert-textsl': '\\textsl{}',
    'insert-roman': '\\roman{}',
    'insert-Roman': '\\Roman{}',
    'insert-alph': '\\alph{}',
    'insert-Alph': '\\Alph{}',
    'insert-arabic': '\\arabic{}'
  };

  Object.keys(insertButtons).forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => insertAtCursor(mainEditor, insertButtons[id]));
  });

  if (insertFigureBtn) insertFigureBtn.addEventListener('click', () => insertFigure(mainEditor));

  if (insertVisualTableBtn) insertVisualTableBtn.addEventListener('click', openVisualTableModal);

  if (insertVisualEquationBtn) insertVisualEquationBtn.addEventListener('click', openVisualEquationModal);

  if (findReplaceBtn) findReplaceBtn.addEventListener('click', openFindReplaceModal);

  if (insertRichTextBtn) insertRichTextBtn.addEventListener('click', openRichTextModal);

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

  // Visual Table Designer
  function openVisualTableModal() {
    if (tableModal) tableModal.style.display = 'block';
    tableGrid.innerHTML = '';
  }

  if (generateTableGridBtn) {
    generateTableGridBtn.addEventListener('click', () => {
      const rows = parseInt(tableRowsInput.value) || 2;
      const cols = parseInt(tableColsInput.value) || 2;
      tableGrid.innerHTML = '';
      for (let i = 0; i < rows; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
          const cell = document.createElement('td');
          const input = document.createElement('input');
          input.type = 'text';
          input.placeholder = `Celda ${i+1},${j+1}`;
          cell.appendChild(input);
          row.appendChild(cell);
        }
        tableGrid.appendChild(row);
      }
    });
  }

  if (insertTableCodeBtn) {
    insertTableCodeBtn.addEventListener('click', () => {
      const rows = tableGrid.querySelectorAll('tr');
      let tableCode = '\\begin{table}[h]\n\\centering\n\\begin{tabular}{';
      const cols = rows[0] ? rows[0].children.length : 0;
      tableCode += 'c'.repeat(cols) + '}\n';
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('input')).map(input => input.value || '');
        tableCode += cells.join(' & ') + ' \\\\ \n';
      });
      tableCode += '\\end{tabular}\n\\caption{}\n\\label{}\n\\end{table}';
      insertAtCursor(mainEditor, tableCode);
      closeTableModal();
    });
  }

  if (closeTableModalBtn) {
    closeTableModalBtn.addEventListener('click', closeTableModal);
  }

  function closeTableModal() {
    if (tableModal) tableModal.style.display = 'none';
    tableGrid.innerHTML = '';
    tableRowsInput.value = '';
    tableColsInput.value = '';
  }

  // Visual Equation Designer
  function openVisualEquationModal() {
    if (equationModal) equationModal.style.display = 'block';
    equationPreview.innerHTML = '';
  }

  if (equationInput) {
    equationInput.addEventListener('input', () => {
      const math = equationInput.value;
      equationPreview.innerHTML = `$$${math}$$`;
      MathJax.typesetPromise([equationPreview]);
    });
  }

  if (insertEquationCodeBtn) {
    insertEquationCodeBtn.addEventListener('click', () => {
      const math = equationInput.value;
      if (math) {
        insertAtCursor(mainEditor, `\\begin{equation}\n${math}\n\\end{equation}`);
      }
      closeEquationModal();
    });
  }

  if (closeEquationModalBtn) {
    closeEquationModalBtn.addEventListener('click', closeEquationModal);
  }

  function closeEquationModal() {
    if (equationModal) equationModal.style.display = 'none';
    equationInput.value = '';
    equationPreview.innerHTML = '';
  }

  // Rich Text Modal
  function openRichTextModal() {
    if (richTextModal) richTextModal.style.display = 'block';
    quill.setContents([]); // Limpiar contenido
  }

  if (insertRichTextCodeBtn) {
    insertRichTextCodeBtn.addEventListener('click', () => {
      const delta = quill.getContents();
      const latexText = deltaToLatex(delta);
      insertAtCursor(mainEditor, latexText);
      closeRichTextModal();
    });
  }

  function deltaToLatex(delta) {
    let latex = '';
    delta.ops.forEach(op => {
      if (op.insert) {
        let text = op.insert;
        if (op.attributes) {
          if (op.attributes.bold) text = `\\textbf{${text}}`;
          if (op.attributes.italic) text = `\\textit{${text}}`;
          if (op.attributes.underline) text = `\\underline{${text}}`;
          // Agregar más mapeos según sea necesario: listas, etc.
          if (op.attributes.list === 'bullet') {
            latex += '\\begin{itemize}\n\\item ' + text + '\n\\end{itemize}\n';
            return;
          }
          if (op.attributes.list === 'ordered') {
            latex += '\\begin{enumerate}\n\\item ' + text + '\n\\end{enumerate}\n';
            return;
          }
        }
        latex += text;
      }
    });
    return latex;
  }

  if (closeRichTextModalBtn) {
    closeRichTextModalBtn.addEventListener('click', closeRichTextModal);
  }

  function closeRichTextModal() {
    if (richTextModal) richTextModal.style.display = 'none';
  }

  // Find and Replace
  function openFindReplaceModal() {
    if (findReplaceModal) findReplaceModal.style.display = 'block';
  }

  if (performFindReplaceBtn) {
    performFindReplaceBtn.addEventListener('click', () => {
      const find = findInput.value;
      const replace = replaceInput.value;
      if (find && mainEditor) {
        let text = mainEditor.getValue();
        text = text.replace(new RegExp(find, 'g'), replace);
        mainEditor.setValue(text);
      }
      closeFindReplaceModal();
    });
  }

  if (closeFindReplaceModalBtn) {
    closeFindReplaceModalBtn.addEventListener('click', closeFindReplaceModal);
  }

  function closeFindReplaceModal() {
    if (findReplaceModal) findReplaceModal.style.display = 'none';
    findInput.value = '';
    replaceInput.value = '';
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
        updateWordCount();
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
        updateWordCount();
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

  // Guardar versión
  if (saveVersionButton) {
    saveVersionButton.addEventListener('click', () => {
      const version = {
        preamble: preambleEditor.getValue(),
        main: mainEditor.getValue(),
        bib: bibEditor.getValue(),
        images: images.map(img => ({ name: img.name, data: img.data })),
        timestamp: new Date().toISOString()
      };
      versions.push(version);
      localStorage.setItem('versions', JSON.stringify(versions));
      updateVersionsList();
    });
  }

  function updateVersionsList() {
    if (!versionsList) return;
    versionsList.innerHTML = '';
    versions.forEach((v, i) => {
      const btn = document.createElement('button');
      btn.textContent = `Versión ${i+1} - ${v.timestamp}`;
      btn.onclick = () => {
        preambleEditor.setValue(v.preamble);
        mainEditor.setValue(v.main);
        bibEditor.setValue(v.bib);
        images = v.images;
        updateSidebar();
        updateWordCount();
      };
      versionsList.appendChild(btn);
    });
  }

  updateVersionsList();

  // Export .tex
  if (exportTexButton) {
    exportTexButton.addEventListener('click', () => {
      const fullTex = preambleEditor.getValue() + '\n\\begin{document}\n' + mainEditor.getValue() + '\n\\end{document}';
      const blob = new Blob([fullTex], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.tex';
      a.click();
    });
  }

  // Export .zip
  if (exportZipButton) {
    exportZipButton.addEventListener('click', async () => {
      const zip = new JSZip();
      const fullTex = preambleEditor.getValue() + '\n\\begin{document}\n' + mainEditor.getValue() + '\n\\end{document}';
      zip.file('main.tex', fullTex);
      zip.file('refs.bib', bibEditor.getValue());
      images.forEach(img => {
        zip.file(img.name, Uint8Array.from(atob(img.data), c => c.charCodeAt(0)));
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project.zip';
      a.click();
    });
  }

  // Export to online compilers (simulated with prompt to copy LaTeX)
  function exportToOnline(serviceUrl) {
    const fullTex = preambleEditor.getValue() + '\n\\begin{document}\n' + mainEditor.getValue() + '\n\\end{document}';
    navigator.clipboard.writeText(fullTex).then(() => {
      alert('Código LaTeX copiado al portapapeles. Pégalo en el editor de ' + serviceUrl);
      window.open(serviceUrl, '_blank');
    });
  }

  if (overleafExportBtn) overleafExportBtn.addEventListener('click', () => exportToOnline('https://www.overleaf.com/project/new'));
  if (texpageExportBtn) texpageExportBtn.addEventListener('click', () => exportToOnline('https://texpage.com/'));
  if (papeeriaExportBtn) papeeriaExportBtn.addEventListener('click', () => exportToOnline('https://www.papeeria.com/'));
  if (cocalcExportBtn) cocalcExportBtn.addEventListener('click', () => exportToOnline('https://cocalc.com/'));
  if (latexOnlineExportBtn) latexOnlineExportBtn.addEventListener('click', () => exportToOnline('https://latexonline.cc/'));

  // Análisis de texto
  if (analyzeButton && analysisOutput) {
    analyzeButton.addEventListener('click', () => {
      const text = mainEditor.getValue();
      const words = text.split(/\s+/).length;
      const sentences = text.split(/[.!?]+/).length;
      const paragraphs = text.split(/\n\n+/).length;
      analysisOutput.innerHTML = `Palabras: ${words}<br>Oraciones: ${sentences}<br>Párrafos: ${paragraphs}`;
    });
  }
});
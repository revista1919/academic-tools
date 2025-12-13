// tools/text.js
console.log("tools/text.js cargado correctamente (CodeMirror 5 con Quill WYSIWYG)");
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
  const mainEditorElem = document.getElementById('main-editor'); // Para modo código
  const visualEditorElem = document.getElementById('visual-editor'); // Para modo visual WYSIWYG
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
  const overleafExportBtn = document.getElementById('export-to-overleaf');
  const texpageExportBtn = document.getElementById('export-to-texpage');
  const papeeriaExportBtn = document.getElementById('export-to-papeeria');
  const cocalcExportBtn = document.getElementById('export-to-cocalc');
  const latexOnlineExportBtn = document.getElementById('export-to-latexonline');
  const toggleModeBtn = document.getElementById('toggle-mode');
  const citationModal = document.getElementById('citation-modal');
  const citationSelect = document.getElementById('citation-select');
  const insertCitationCodeBtn = document.getElementById('insert-citation-code');
  const closeCitationModalBtn = document.getElementById('close-citation-modal');
  let preambleEditor, mainEditor, bibEditor, quill;
  let versions = JSON.parse(localStorage.getItem('versions')) || [];
  let images = [];
  let bibEntries = {};
  let isVisualMode = true;
  let currentEditIndex = null;
  let currentEditType = null;
  const Parchment = Quill.import('parchment');
  const BlockEmbed = Quill.import('blots/block/embed');
  const Inline = Quill.import('blots/inline');
  class EquationBlot extends BlockEmbed {
    static blotName = 'equation';
    static tagName = 'div';
    static className = 'equation';
    static create(value) {
      let node = super.create();
      node.setAttribute('data-latex', value);
      node.contentEditable = false;
      katex.render(value, node, {throwOnError: false, displayMode: true});
      node.addEventListener('dblclick', () => {
        currentEditType = 'equation';
        currentEditIndex = quill.getIndex(Parchment.find(node));
        equationInput.value = value;
        openVisualEquationModal();
      });
      return node;
    }
    static value(node) {
      return node.getAttribute('data-latex');
    }
  }
  Quill.register(EquationBlot);
  class TableBlot extends BlockEmbed {
    static blotName = 'table';
    static tagName = 'table';
    static create(value) {
      let node = super.create();
      node.innerHTML = value.html;
      node.contentEditable = false;
      node.addEventListener('dblclick', () => {
        currentEditType = 'table';
        currentEditIndex = quill.getIndex(Parchment.find(node));
        openVisualTableModalWith(value.html);
      });
      return node;
    }
    static value(node) {
      return {html: node.innerHTML};
    }
  }
  Quill.register(TableBlot);
  class CitationBlot extends Inline {
    static blotName = 'citation';
    static tagName = 'span';
    static className = 'citation';
    static create(value) {
      let node = super.create();
      node.setAttribute('data-key', value);
      node.innerText = getCitationText(value);
      node.contentEditable = false;
      node.style.color = '#007acc';
      node.style.cursor = 'pointer';
      node.addEventListener('dblclick', () => {
        currentEditType = 'citation';
        currentEditIndex = quill.getIndex(Parchment.find(node));
        openCitationModal(value); // Preselect
      });
      return node;
    }
    static formats(node) {
      return node.getAttribute('data-key');
    }
  }
  Quill.register(CitationBlot);
  function getCitationText(key) {
    const entry = bibEntries[key] || {author: 'Unknown', year: '????'};
    const authors = entry.author.split(' and ');
    const authorStr = authors[0] + (authors.length > 1 ? ' et al.' : '');
    return `(${authorStr}, ${entry.year})`;
  }
  // Opciones para CodeMirror (para preamble, bib y modo código)
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
      value: 'Hola mundo',
      ...editorOptions
    });
    mainEditorElem.style.display = 'none'; // Comenzar en modo visual
    mainEditor.on("change", () => {
      if (!isVisualMode) {
        updateSidebar();
        updateWordCount();
      }
    });
    console.log("Main code editor creado");
  }
  if (bibEditorElem) {
    bibEditor = CodeMirror(bibEditorElem, {
      value: '',
      ...editorOptions
    });
    bibEditor.on('change', parseBib);
    console.log("Bib editor creado");
  }
  // Inicializar Quill para editor visual principal (como Word)
  if (visualEditorElem) {
    quill = new Quill(visualEditorElem, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'font': [] }],
          [{ 'align': [] }],
          ['link', 'image', 'code-block'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          ['blockquote', 'clean'],
          ['equation', 'table', 'citation'] // Custom buttons
        ],
        keyboard: {
          bindings: {
            bold: { key: 'B', ctrl: true, handler: range => quill.format('bold', true) },
            italic: { key: 'I', ctrl: true, handler: range => quill.format('italic', true) },
            underline: { key: 'U', ctrl: true, handler: range => quill.format('underline', true) },
            section: { key: 'S', ctrl: true, handler: range => quill.format('header', 1) },
            subsection: { key: 'S', shift: true, ctrl: true, handler: range => quill.format('header', 2) },
            subsubsection: { key: 'S', alt: true, ctrl: true, handler: range => quill.format('header', 3) },
            equation: { key: 'E', ctrl: true, handler: openVisualEquationModal.bind(null, '') },
            math_inline: { key: 'M', ctrl: true, handler: openVisualEquationModal.bind(null, '') },
            itemize: { key: 'L', ctrl: true, handler: range => quill.format('list', 'bullet') },
            enumerate: { key: 'L', shift: true, ctrl: true, handler: range => quill.format('list', 'ordered') },
            table: { key: 'T', ctrl: true, handler: openVisualTableModal },
            cite: { key: 'C', ctrl: true, handler: openCitationModal },
            hyperlink: { key: 'H', ctrl: true, handler: range => quill.format('link', prompt('URL:')) },
            footnote: { key: 'N', ctrl: true, handler: range => insertFootnote() },
            align: { key: 'Alt-E', ctrl: true, handler: openVisualEquationModal.bind(null, '\\begin{align}\\end{align}') },
            bmatrix: { key: 'Alt-M', ctrl: true, handler: openVisualEquationModal.bind(null, '\\begin{bmatrix}\\end{bmatrix}') },
            pmatrix: { key: 'Alt-P', ctrl: true, handler: openVisualEquationModal.bind(null, '\\begin{pmatrix}\\end{pmatrix}') },
            vec: { key: 'Alt-V', ctrl: true, handler: openVisualEquationModal.bind(null, '\\vec{}') },
            hat: { key: 'Alt-H', ctrl: true, handler: openVisualEquationModal.bind(null, '\\hat{}') },
            bar: { key: 'Alt-B', ctrl: true, handler: openVisualEquationModal.bind(null, '\\bar{}') },
            dot: { key: 'Alt-D', ctrl: true, handler: openVisualEquationModal.bind(null, '\\dot{}') },
            overline: { key: 'Alt-O', ctrl: true, handler: openVisualEquationModal.bind(null, '\\overline{}') },
            underbrace: { key: 'Alt-U', ctrl: true, handler: openVisualEquationModal.bind(null, '\\underbrace{}{}') },
            integral: { key: 'Alt-I', ctrl: true, handler: openVisualEquationModal.bind(null, '\\int') },
            sum: { key: 'Alt-Sum', ctrl: true, handler: openVisualEquationModal.bind(null, '\\sum') },
            prod: { key: 'Alt-Prod', ctrl: true, handler: openVisualEquationModal.bind(null, '\\prod') },
            lim: { key: 'Alt-Lim', ctrl: true, handler: openVisualEquationModal.bind(null, '\\lim') },
            infty: { key: 'Alt-Inf', ctrl: true, handler: openVisualEquationModal.bind(null, '\\infty') },
            find: { key: 'Find', ctrl: true, handler: openFindReplaceModal },
            undo: { key: 'Z', ctrl: true, handler: () => quill.history.undo() },
            redo: { key: 'Y', ctrl: true, handler: () => quill.history.redo() }
          }
        }
      }
    });
    const toolbar = quill.getModule('toolbar');
    toolbar.addHandler('equation', () => openVisualEquationModal(''));
    toolbar.addHandler('table', openVisualTableModal);
    toolbar.addHandler('citation', openCitationModal);
    toolbar.addHandler('image', insertImage);
    quill.on('text-change', () => {
      if (isVisualMode) {
        updateSidebar();
        updateWordCount();
      }
      autoSave();
    });
    console.log("Visual editor (Quill) creado");
  }
  // Auto-guardado cada 60 segundos
  function autoSave() {
    const project = {
      preamble: preambleEditor.getValue(),
      body: isVisualMode ? quill.getContents() : mainEditor.getValue(),
      bib: bibEditor.getValue(),
      images,
      isVisualMode
    };
    localStorage.setItem('currentProject', JSON.stringify(project));
  }
  setInterval(autoSave, 60000);
  // Cargar auto-guardado si existe
  const savedProject = JSON.parse(localStorage.getItem('currentProject'));
  if (savedProject) {
    preambleEditor.setValue(savedProject.preamble || '');
    bibEditor.setValue(savedProject.bib || '');
    images = savedProject.images || [];
    isVisualMode = savedProject.isVisualMode !== false;
    if (isVisualMode) {
      quill.setContents(savedProject.body || []);
      visualEditorElem.style.display = 'block';
      mainEditorElem.style.display = 'none';
    } else {
      mainEditor.setValue(savedProject.body || '');
      visualEditorElem.style.display = 'none';
      mainEditorElem.style.display = 'block';
    }
    toggleModeBtn.textContent = isVisualMode ? 'Cambiar a Modo Código' : 'Cambiar a Modo Visual';
    parseBib();
    updateSidebar();
    updateWordCount();
  }
  function insertImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (r) => {
        const range = quill.getSelection() || {index: quill.getLength()};
        quill.insertEmbed(range.index, 'image', r.target.result);
        quill.setSelection(range.index + 1);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }
  function insertFootnote() {
    // Para footnotes, insertar como superscript número, pero simple text por ahora
    const range = quill.getSelection();
    const num = quill.getLength(); // Simple counter
    quill.insertText(range.index, `${num}`, {script: 'super'});
  }
  function parseBib() {
    const text = bibEditor.getValue();
    bibEntries = {};
    const entryRegex = /@[\w]+\s*{\s*([^,]+),\s*([\s\S]*?)\s*}/g;
    let match;
    while ((match = entryRegex.exec(text)) !== null) {
      const key = match[1].trim();
      const fields = match[2];
      const authorMatch = fields.match(/author\s*=\s*{(.*?)}/);
      const yearMatch = fields.match(/year\s*=\s*{(.*?)}/);
      bibEntries[key] = {
        author: authorMatch ? authorMatch[1] : 'Unknown',
        year: yearMatch ? yearMatch[1] : '????'
      };
    }
  }
  function updateSidebar() {
    if (!sidebar) return;
    sidebar.innerHTML = '<strong>Secciones:</strong><br>';
    let count = 0;
    if (isVisualMode) {
      const headings = quill.root.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(el => {
        const level = parseInt(el.tagName[1]);
        const title = el.innerText;
        const item = document.createElement('div');
        item.textContent = title;
        item.classList.add('sidebar-item');
        item.style.paddingLeft = `${(level - 1) * 15}px`;
        item.onclick = () => {
          const blot = Parchment.find(el);
          const index = quill.getIndex(blot);
          quill.setSelection(index, 0);
          quill.focus();
        };
        sidebar.appendChild(item);
        count++;
      });
    } else {
      const lines = mainEditor.getValue().split("\n");
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
    }
    console.log("Sidebar actualizada con", count, "items");
  }
  function updateWordCount() {
    if (!wordCountElem) return;
    let text;
    if (isVisualMode) {
      text = quill.getText().replace(/\s+/g, ' ').trim();
    } else {
      text = mainEditor.getValue().replace(/\\[^ ]+/g, '').replace(/\s+/g, ' ').trim();
    }
    const wordCount = text.split(' ').length;
    wordCountElem.textContent = `Palabras: ${wordCount}`;
  }
  // Modo oscuro
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('darkMode', document.body.classList.contains('dark'));
      [preambleEditor, mainEditor, bibEditor].forEach(ed => ed ? ed.refresh() : null);
      // Para Quill
      if (quill) {
        quill.root.classList.toggle('dark-editor');
      }
      console.log("Modo oscuro toggled");
    });
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
      if (quill) quill.root.classList.add('dark-editor');
    }
  }
  // Toggle modo visual/código
  if (toggleModeBtn) {
    toggleModeBtn.addEventListener('click', () => {
      isVisualMode = !isVisualMode;
      if (isVisualMode) {
        visualEditorElem.style.display = 'block';
        mainEditorElem.style.display = 'none';
        quill.setContents(latexToDelta(mainEditor.getValue()));
        toggleModeBtn.textContent = 'Cambiar a Modo Código';
      } else {
        visualEditorElem.style.display = 'none';
        mainEditorElem.style.display = 'block';
        mainEditor.setValue(deltaToLatex(quill.getContents()));
        mainEditor.refresh();
        toggleModeBtn.textContent = 'Cambiar a Modo Visual';
      }
      updateSidebar();
      updateWordCount();
    });
  }
  // Generar estructura
  if (generateStructureButton && templateSelect) {
    generateStructureButton.addEventListener('click', () => {
      const template = templateSelect.value;
      preambleEditor.setValue(templates[template] || templates['APA']);
      if (isVisualMode) {
        quill.setContents([
          {insert: 'Introducción\n', attributes: {header: 1}},
          {insert: 'Escribe aquí...\n\n'},
          {insert: 'Metodología\n', attributes: {header: 1}},
          {insert: '...\n\n'},
          {insert: 'Conclusiones\n', attributes: {header: 1}},
          {insert: '...\n'}
        ]);
      } else {
        mainEditor.setValue('\\maketitle\n\n\\section{Introducci\\\'on}\nEscribe aqu\\\'i...\n\n\\section{Metodolog\\\'ia}\n...\n\n\\section{Conclusiones}\n...');
      }
      bibEditor.setValue('');
      updateSidebar();
      updateWordCount();
      console.log("Estructura generada con template:", template);
    });
  }
  // Visual Table Designer
  function openVisualTableModal() {
    if (tableModal) tableModal.style.display = 'block';
    tableGrid.innerHTML = '';
    tableRowsInput.value = 2;
    tableColsInput.value = 2;
  }
  function openVisualTableModalWith(html) {
    const table = new DOMParser().parseFromString(`<table>${html}</table>`, 'text/html').querySelector('table');
    tableRowsInput.value = table.rows.length;
    tableColsInput.value = table.rows[0] ? table.rows[0].cells.length : 2;
    tableGrid.innerHTML = '';
    for (let i = 0; i < table.rows.length; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < table.rows[i].cells.length; j++) {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = table.rows[i].cells[j].innerText;
        cell.appendChild(input);
        row.appendChild(cell);
      }
      tableGrid.appendChild(row);
    }
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
          row.appendChild(row);
        }
        tableGrid.appendChild(row);
      }
    });
  }
  if (insertTableCodeBtn) {
    insertTableCodeBtn.addEventListener('click', () => {
      const rows = tableGrid.querySelectorAll('tr');
      let html = '<tbody>';
      rows.forEach(row => {
        html += '<tr>';
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
          html += `<td>${input.value || ''}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody>';
      const range = quill.getSelection() || {index: quill.getLength()};
      if (currentEditType === 'table') {
        quill.deleteText(currentEditIndex, 1);
        quill.insertEmbed(currentEditIndex, 'table', {html});
        quill.setSelection(currentEditIndex + 1);
        currentEditType = null;
        currentEditIndex = null;
      } else {
        quill.insertEmbed(range.index, 'table', {html});
        quill.setSelection(range.index + 1);
      }
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
  function openVisualEquationModal(defaultLatex = '') {
    if (equationModal) equationModal.style.display = 'block';
    equationInput.value = defaultLatex;
    equationPreview.innerHTML = '';
  }
  if (equationInput) {
    equationInput.addEventListener('input', () => {
      const math = equationInput.value;
      if (math) {
        equationPreview.innerHTML = '';
        katex.render(math, equationPreview, {throwOnError: false, displayMode: true});
      }
    });
  }
  if (insertEquationCodeBtn) {
    insertEquationCodeBtn.addEventListener('click', () => {
      const math = equationInput.value;
      if (math) {
        const range = quill.getSelection() || {index: quill.getLength()};
        if (currentEditType === 'equation') {
          quill.deleteText(currentEditIndex, 1);
          quill.insertEmbed(currentEditIndex, 'equation', math);
          quill.setSelection(currentEditIndex + 1);
          currentEditType = null;
          currentEditIndex = null;
        } else {
          quill.insertEmbed(range.index, 'equation', math);
          quill.setSelection(range.index + 1);
        }
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
  // Citation Modal
  function openCitationModal(preselect = '') {
    if (citationModal) citationModal.style.display = 'block';
    citationSelect.innerHTML = '';
    Object.keys(bibEntries).forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = `${key}: ${getCitationText(key)}`;
      if (key === preselect) option.selected = true;
      citationSelect.appendChild(option);
    });
  }
  if (insertCitationCodeBtn) {
    insertCitationCodeBtn.addEventListener('click', () => {
      const key = citationSelect.value;
      if (key) {
        const range = quill.getSelection() || {index: quill.getLength()};
        if (currentEditType === 'citation') {
          quill.deleteText(currentEditIndex, 1);
          quill.insertText(currentEditIndex, '\uFEFF', 'citation', key);
          quill.setSelection(currentEditIndex + 1);
          currentEditType = null;
          currentEditIndex = null;
        } else {
          quill.insertText(range.index, '\uFEFF', 'citation', key);
          quill.setSelection(range.index + 1);
        }
      }
      closeCitationModal();
    });
  }
  if (closeCitationModalBtn) {
    closeCitationModalBtn.addEventListener('click', closeCitationModal);
  }
  function closeCitationModal() {
    if (citationModal) citationModal.style.display = 'none';
  }
  // Find and Replace (simple, pierde formatos en replace)
  function openFindReplaceModal() {
    if (findReplaceModal) findReplaceModal.style.display = 'block';
  }
  if (performFindReplaceBtn) {
    performFindReplaceBtn.addEventListener('click', () => {
      const find = findInput.value;
      const replace = replaceInput.value;
      if (find && isVisualMode) {
        let index = 0;
        let text = quill.getText();
        while ((index = text.indexOf(find, index)) !== -1) {
          quill.deleteText(index, find.length);
          quill.insertText(index, replace);
          index += replace.length;
          text = quill.getText();
        }
      } else if (find && !isVisualMode) {
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
        parseBib();
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
        const bib = `@book{${key},\n author = {${author}},\n title = {${data.title}},\n year = {${year}},\n publisher = {${publisher}},\n}\n`;
        const currentBib = bibEditor.getValue();
        bibEditor.setValue(currentBib + (currentBib ? '\n' : '') + bib);
        parseBib();
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
        const bodyLatex = parts.length > 1 ? parts[1] : texFileContent;
        if (isVisualMode) {
          quill.setContents(latexToDelta(bodyLatex));
        } else {
          mainEditor.setValue(bodyLatex);
        }
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
            promises.push(entry.async('base64').then(base64 => {
              const dataurl = `data:image/${path.split('.').pop()};base64,${base64}`;
              images.push({name: sanitizeFilename(path), data: base64, dataurl});
            }));
          }
        }
        await Promise.all(promises);
        parseBib();
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
        const bodyLatex = parts.length > 1 ? parts[1] : text;
        if (isVisualMode) {
          quill.setContents(latexToDelta(bodyLatex));
        } else {
          mainEditor.setValue(bodyLatex);
        }
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
        parseBib();
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
        body: isVisualMode ? quill.getContents() : mainEditor.getValue(),
        bib: bibEditor.getValue(),
        images: images.map(img => ({ name: img.name, data: img.data })),
        isVisualMode,
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
        bibEditor.setValue(v.bib);
        images = v.images;
        if (v.isVisualMode) {
          quill.setContents(v.body);
          visualEditorElem.style.display = 'block';
          mainEditorElem.style.display = 'none';
          isVisualMode = true;
          toggleModeBtn.textContent = 'Cambiar a Modo Código';
        } else {
          mainEditor.setValue(v.body);
          visualEditorElem.style.display = 'none';
          mainEditorElem.style.display = 'block';
          isVisualMode = false;
          toggleModeBtn.textContent = 'Cambiar a Modo Visual';
        }
        parseBib();
        updateSidebar();
        updateWordCount();
      };
      versionsList.appendChild(btn);
    });
  }
  updateVersionsList();
  // Función para convertir Delta a LaTeX
  function deltaToLatex(delta) {
    let latex = '';
    let listType = null;
    let listItems = [];
    let quote = false;
    let code = false;
    images = []; // Recolectar imágenes durante export
    function flushList() {
      if (listItems.length) {
        latex += '\\begin{' + listType + '}\n' + listItems.map(item => '\\item ' + item).join('\n') + '\n\\end{' + listType + '}\n';
        listItems = [];
        listType = null;
      }
    }
    delta.ops.forEach((op, idx) => {
      if (op.insert) {
        if (typeof op.insert === 'string') {
          let text = op.insert.replace(/\n/g, '\\\\\n');
          if (op.attributes) {
            if (op.attributes.citation) {
              text = '\\cite{' + op.attributes.citation + '}';
            }
            if (op.attributes.bold) text = '\\textbf{' + text + '}';
            if (op.attributes.italic) text = '\\textit{' + text + '}';
            if (op.attributes.underline) text = '\\underline{' + text + '}';
            if (op.attributes.strike) text = '\\sout{' + text + '}'; // need soul package
            if (op.attributes.link) text = '\\href{' + op.attributes.link + '}{' + text + '}';
            if (op.attributes.code) text = '\\texttt{' + text + '}';
            if (op.attributes.script === 'super') text = '^{' + text + '}';
            if (op.attributes.script === 'sub') text = '_{' + text + '}';
            if (op.attributes.header) {
              flushList();
              const level = op.attributes.header;
              const tag = level === 1 ? 'section' : level === 2 ? 'subsection' : level === 3 ? 'subsubsection' : 'paragraph';
              text = '\\' + tag + '{' + text.trim() + '}\n';
            }
            if (op.attributes.blockquote) {
              if (!quote) {
                flushList();
                latex += '\\begin{quote}\n';
                quote = true;
              }
              text = text;
              if (delta.ops[idx + 1] && !delta.ops[idx + 1].attributes?.blockquote) {
                latex += text + '\\end{quote}\n';
                quote = false;
              } else {
                latex += text;
                return;
              }
            } else if (quote) {
              latex += '\\end{quote}\n';
              quote = false;
            }
            if (op.attributes['code-block']) {
              if (!code) {
                flushList();
                latex += '\\begin{verbatim}\n';
                code = true;
              }
              text = text;
              if (delta.ops[idx + 1] && !delta.ops[idx + 1].attributes?.['code-block']) {
                latex += text + '\\end{verbatim}\n';
                code = false;
              } else {
                latex += text;
                return;
              }
            } else if (code) {
              latex += '\\end{verbatim}\n';
              code = false;
            }
            if (op.attributes.list) {
              const type = op.attributes.list === 'ordered' ? 'enumerate' : 'itemize';
              if (type !== listType) {
                flushList();
                listType = type;
              }
              listItems.push(text.trim());
              return;
            } else {
              flushList();
            }
          } else {
            flushList();
          }
          latex += text;
        } else if (op.insert.image) {
          flushList();
          const dataurl = op.insert.image;
          if (dataurl.startsWith('data:')) {
            const base64 = dataurl.split(',')[1];
            const mime = dataurl.match(/:(.*?);/)[1];
            const ext = mime.split('/')[1];
            const name = `image${images.length}.${ext}`;
            images.push({name, data: base64});
            latex += '\\begin{figure}[h]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{images/' + name + '}\n\\caption{}\n\\label{}\n\\end{figure}\n';
          } else {
            latex += '\\includegraphics{' + dataurl + '}';
          }
        } else if (op.insert.equation) {
          flushList();
          latex += '\\begin{equation}\n' + op.insert.equation + '\n\\end{equation}\n';
        } else if (op.insert.table) {
          flushList();
          const table = new DOMParser().parseFromString(`<table>${op.insert.table.html}</table>`, 'text/html').querySelector('table');
          const cols = table.rows[0].cells.length;
          latex += '\\begin{table}[h]\n\\centering\n\\begin{tabular}{' + 'c'.repeat(cols) + '}\n';
          for (let i = 0; i < table.rows.length; i++) {
            const cells = Array.from(table.rows[i].cells).map(cell => cell.innerText);
            latex += cells.join(' & ') + ' \\\\ \n';
          }
          latex += '\\end{tabular}\n\\caption{}\n\\label{}\n\\end{table}\n';
        }
      }
    });
    flushList();
    if (quote) latex += '\\end{quote}\n';
    if (code) latex += '\\end{verbatim}\n';
    return latex;
  }
  // Función simple para convertir LaTeX a Delta (básico, no perfecto)
  function latexToDelta(latex) {
    const delta = new Quill.Delta();
    latex = latex.replace(/\\begin{document}|\\end{document}/g, '');
    const lines = latex.split('\n');
    lines.forEach(line => {
      line = line.trim();
      if (!line) {
        delta.insert('\n');
        return;
      }
      if (line.startsWith('\\section{')) {
        const title = line.match(/\\section{(.*)}/)[1];
        delta.insert(title + '\n', {header: 1});
      } else if (line.startsWith('\\subsection{')) {
        const title = line.match(/\\subsection{(.*)}/)[1];
        delta.insert(title + '\n', {header: 2});
      } else if (line.startsWith('\\subsubsection{')) {
        const title = line.match(/\\subsubsection{(.*)}/)[1];
        delta.insert(title + '\n', {header: 3});
      } else if (line.startsWith('\\textbf{')) {
        const text = line.match(/\\textbf{(.*)}/)[1];
        delta.insert(text, {bold: true});
      } else if (line.startsWith('\\textit{')) {
        const text = line.match(/\\textit{(.*)}/)[1];
        delta.insert(text, {italic: true});
      } else if (line.startsWith('\\underline{')) {
        const text = line.match(/\\underline{(.*)}/)[1];
        delta.insert(text, {underline: true});
      } else if (line.startsWith('\\cite{')) {
        const key = line.match(/\\cite{(.*)}/)[1];
        delta.insert('\uFEFF', {citation: key});
      } else if (line.startsWith('\\begin{equation}')) {
        const math = lines.splice(lines.indexOf(line) + 1, lines.indexOf('\\end{equation}') - lines.indexOf(line) - 1).join('\n');
        delta.insert({equation: math});
      } else if (line.startsWith('\\begin{table}')) {
        // Simple skip for now, or parse tabular
        delta.insert(line + '\n');
      } else {
        delta.insert(line + '\n');
      }
    });
    return delta;
  }
  function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9.-]/g, '_');
  }
  // Export .tex
  if (exportTexButton) {
    exportTexButton.addEventListener('click', () => {
      const body = isVisualMode ? deltaToLatex(quill.getContents()) : mainEditor.getValue();
      const fullTex = preambleEditor.getValue() + '\n\\begin{document}\n' + body + '\n\\bibliographystyle{plainnat}\n\\bibliography{refs}\n\\end{document}';
      const blob = new Blob([fullTex], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.tex';
      a.click();
    });
  }
  // Export .zip estructurado
  if (exportZipButton) {
    exportZipButton.addEventListener('click', async () => {
      const zip = new JSZip();
      const body = isVisualMode ? deltaToLatex(quill.getContents()) : mainEditor.getValue();
      const fullTex = preambleEditor.getValue() + '\n\\begin{document}\n' + body + '\n\\bibliographystyle{plainnat}\n\\bibliography{refs}\n\\end{document}';
      zip.file('main.tex', fullTex);
      zip.file('refs.bib', bibEditor.getValue());
      const imgFolder = zip.folder('images');
      images.forEach(img => {
        imgFolder.file(img.name, Uint8Array.from(atob(img.data), c => c.charCodeAt(0)));
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project.zip';
      a.click();
    });
  }
  // Export to online compilers
  function exportToOnline(serviceUrl) {
    const body = isVisualMode ? deltaToLatex(quill.getContents()) : mainEditor.getValue();
    const fullTex = preambleEditor.getValue() + '\n\\begin{document}\n' + body + '\n\\bibliographystyle{plainnat}\n\\bibliography{refs}\n\\end{document}';
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
      let text;
      if (isVisualMode) {
        text = quill.getText();
      } else {
        text = mainEditor.getValue();
      }
      const words = text.split(/\s+/).length;
      const sentences = text.split(/[.!?]+/).length;
      const paragraphs = text.split(/\n\n+/).length;
      analysisOutput.innerHTML = `Palabras: ${words}<br>Oraciones: ${sentences}<br>Párrafos: ${paragraphs}`;
    });
  }
});
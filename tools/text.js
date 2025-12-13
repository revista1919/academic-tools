// tools/text.js
console.log("tools/text.js cargado correctamente (CodeMirror 5 con Quill WYSIWYG mejorado)");
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
    'MLA': `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{mla}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{amsmath}
\\usepackage{booktabs}
\\usepackage{caption}
\\usepackage{subcaption}
`,
    'Harvard': `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{harvard}
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
  const visualEditorElem = document.getElementById('visual-editor');
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
  const addPackageBtn = document.getElementById('add-package');
  const codeTools = document.getElementById('code-tools');
  let preambleEditor, mainEditor, bibEditor, quill;
  let versions = JSON.parse(localStorage.getItem('versions')) || [];
  let images = [];
  let bibEntries = {};
  let isVisualMode = true;
  let currentEditIndex = null;
  let currentEditType = null;
  let Delta = Quill.import('delta');
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
      try {
        katex.render(value, node, {throwOnError: false, displayMode: true});
      } catch (e) {
        node.innerText = value;
      }
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
        openCitationModal(value);
      });
      return node;
    }
    static formats(node) {
      return node.getAttribute('data-key');
    }
  }
  Quill.register(CitationBlot);
  class FigureBlot extends BlockEmbed {
    static blotName = 'figure';
    static tagName = 'div';
    static className = 'figure';
    static create(value) {
      let node = super.create();
      const img = document.createElement('img');
      img.src = value.src;
      node.appendChild(img);
      const caption = document.createElement('div');
      caption.className = 'caption';
      caption.contentEditable = true;
      caption.innerText = value.caption || 'Caption';
      node.appendChild(caption);
      node.contentEditable = false;
      node.addEventListener('dblclick', () => {
        caption.focus();
      });
      return node;
    }
    static value(node) {
      return {
        src: node.querySelector('img').src,
        caption: node.querySelector('.caption').innerText
      };
    }
  }
  Quill.register(FigureBlot);
  class AbstractBlot extends BlockEmbed {
    static blotName = 'abstract';
    static tagName = 'div';
    static className = 'abstract';
    static create(value) {
      let node = super.create();
      node.innerHTML = '<strong>Abstract</strong><br>';
      const content = document.createElement('div');
      content.innerHTML = value || '';
      content.contentEditable = true;
      node.appendChild(content);
      return node;
    }
    static value(node) {
      return node.querySelector('div').innerHTML;
    }
  }
  Quill.register(AbstractBlot);
  class TheoremBlot extends BlockEmbed {
    static blotName = 'theorem';
    static tagName = 'div';
    static className = 'theorem';
    static create(value) {
      let node = super.create();
      node.innerHTML = '<strong>Theorem</strong><br>';
      const content = document.createElement('div');
      content.innerHTML = value || '';
      content.contentEditable = true;
      node.appendChild(content);
      return node;
    }
    static value(node) {
      return node.querySelector('div').innerHTML;
    }
  }
  Quill.register(TheoremBlot);
  class LemmaBlot extends BlockEmbed {
    static blotName = 'lemma';
    static tagName = 'div';
    static className = 'lemma';
    static create(value) {
      let node = super.create();
      node.innerHTML = '<strong>Lemma</strong><br>';
      const content = document.createElement('div');
      content.innerHTML = value || '';
      content.contentEditable = true;
      node.appendChild(content);
      return node;
    }
    static value(node) {
      return node.querySelector('div').innerHTML;
    }
  }
  Quill.register(LemmaBlot);
  class ProofBlot extends BlockEmbed {
    static blotName = 'proof';
    static tagName = 'div';
    static className = 'proof';
    static create(value) {
      let node = super.create();
      node.innerHTML = '<strong>Proof</strong><br>';
      const content = document.createElement('div');
      content.innerHTML = value || '';
      content.contentEditable = true;
      node.appendChild(content);
      return node;
    }
    static value(node) {
      return node.querySelector('div').innerHTML;
    }
  }
  Quill.register(ProofBlot);
  function getCitationText(key) {
    const entry = bibEntries[key] || {author: 'Unknown', year: '????'};
    const authors = entry.author.split(' and ');
    const authorStr = authors[0] + (authors.length > 1 ? ' et al.' : '');
    return `(${authorStr}, ${entry.year})`;
  }
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
    mainEditorElem.style.display = 'none';
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
          ['equation', 'table', 'citation', 'abstract', 'theorem', 'lemma', 'proof']
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
            align: { key: 'E', shift: true, ctrl: true, handler: openVisualEquationModal.bind(null, '\\begin{align}\\end{align}') },
            bmatrix: { key: 'M', shift: true, ctrl: true, handler: openVisualEquationModal.bind(null, '\\begin{bmatrix}\\end{bmatrix}') },
            pmatrix: { key: 'P', shift: true, ctrl: true, handler: openVisualEquationModal.bind(null, '\\begin{pmatrix}\\end{pmatrix}') },
            vec: { key: 'V', shift: true, ctrl: true, handler: openVisualEquationModal.bind(null, '\\vec{}') },
            hat: { key: 'H', shift: true, ctrl: true, handler: openVisualEquationModal.bind(null, '\\hat{}') },
            bar: { key: 'B', shift: true, ctrl: true, handler: openVisualEquationModal.bind(null, '\\bar{}') },
            dot: { key: 'D', shift: true, ctrl: true, handler: openVisualEquationModal.bind(null, '\\dot{}') },
            overline: { key: 'O', shift: true, ctrl: true, handler: openVisualEquationModal.bind(null, '\\overline{}') },
            underbrace: { key: 'U', shift: true, ctrl: true, handler: openVisualEquationModal.bind(null, '\\underbrace{}{}') },
            integral: { key: 'I', shift: true, ctrl: true, handler: openVisualEquationModal.bind(null, '\\int') },
            sum: { key: 'S', shift: true, ctrl: true, handler: openVisualEquationModal.bind(null, '\\sum') },
            prod: { key: 'P', ctrl: true, alt: true, handler: openVisualEquationModal.bind(null, '\\prod') },
            lim: { key: 'L', ctrl: true, alt: true, handler: openVisualEquationModal.bind(null, '\\lim') },
            infty: { key: 'I', ctrl: true, alt: true, handler: openVisualEquationModal.bind(null, '\\infty') },
            find: { key: 'F', ctrl: true, handler: openFindReplaceModal },
            undo: { key: 'Z', ctrl: true, handler: () => quill.history.undo() },
            redo: { key: 'Y', ctrl: true, handler: () => quill.history.redo() }
          }
        }
      }
    });
    quill.root.setAttribute('spellcheck', 'true');
    const toolbar = quill.getModule('toolbar');
    toolbar.addHandler('equation', () => openVisualEquationModal(''));
    toolbar.addHandler('table', openVisualTableModal);
    toolbar.addHandler('citation', openCitationModal);
    toolbar.addHandler('image', insertFigure);
    toolbar.addHandler('abstract', () => {
      const range = quill.getSelection() || {index: quill.getLength()};
      quill.insertEmbed(range.index, 'abstract', '');
      quill.setSelection(range.index + 1);
    });
    toolbar.addHandler('theorem', () => {
      const range = quill.getSelection() || {index: quill.getLength()};
      quill.insertEmbed(range.index, 'theorem', '');
      quill.setSelection(range.index + 1);
    });
    toolbar.addHandler('lemma', () => {
      const range = quill.getSelection() || {index: quill.getLength()};
      quill.insertEmbed(range.index, 'lemma', '');
      quill.setSelection(range.index + 1);
    });
    toolbar.addHandler('proof', () => {
      const range = quill.getSelection() || {index: quill.getLength()};
      quill.insertEmbed(range.index, 'proof', '');
      quill.setSelection(range.index + 1);
    });
    quill.on('text-change', () => {
      if (isVisualMode) {
        updateSidebar();
        updateWordCount();
      }
      autoSave();
    });
    console.log("Visual editor (Quill) creado con más características");
  }
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
  setInterval(autoSave, 30000); // Cada 30 seg para mejor UX
  const savedProject = JSON.parse(localStorage.getItem('currentProject'));
  if (savedProject) {
    preambleEditor.setValue(savedProject.preamble || '');
    bibEditor.setValue(savedProject.bib || '');
    images = savedProject.images || [];
    isVisualMode = savedProject.isVisualMode !== false;
    if (isVisualMode) {
      quill.setContents(savedProject.body || new Delta());
      visualEditorElem.style.display = 'block';
      mainEditorElem.style.display = 'none';
    } else {
      mainEditor.setValue(savedProject.body || '');
      visualEditorElem.style.display = 'none';
      mainEditorElem.style.display = 'block';
    }
    if (codeTools) codeTools.style.display = isVisualMode ? 'none' : 'block';
    toggleModeBtn.textContent = isVisualMode ? 'Cambiar a Modo Código' : 'Cambiar a Modo Visual';
    parseBib();
    updateSidebar();
    updateWordCount();
  }
  function insertFigure() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (r) => {
        const range = quill.getSelection() || {index: quill.getLength()};
        quill.insertEmbed(range.index, 'figure', {src: r.target.result, caption: ''});
        quill.setSelection(range.index + 1);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }
  function insertFootnote() {
    const range = quill.getSelection();
    const num = quill.getLength(); // Simple, mejorar con contador real
    quill.insertText(range.index, num.toString(), {script: 'super'});
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
      const headings = quill.root.querySelectorAll('h1, h2, h3, h4, h5, h6, .abstract, .theorem, .lemma, .proof');
      headings.forEach(el => {
        let level = 1;
        let title = el.innerText.split('\n')[0];
        if (el.classList.contains('abstract')) {
          level = 0;
          title = 'Abstract';
        } else if (el.classList.contains('theorem')) {
          level = 1;
          title = 'Theorem';
        } else if (el.classList.contains('lemma')) {
          level = 2;
          title = 'Lemma';
        } else if (el.classList.contains('proof')) {
          level = 3;
          title = 'Proof';
        } else {
          level = parseInt(el.tagName[1]);
          title = el.innerText;
        }
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
        const match = line.match(/\\(chapter|section|subsection|subsubsection|abstract|theorem|lemma|proof){([^{}]+)}/);
        if (match) {
          const level = { chapter: 0, section: 1, subsection: 2, subsubsection: 3, abstract: 0, theorem: 1, lemma: 2, proof: 3 }[match[1]];
          const title = match[2] || match[1];
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
    const wordCount = text.split(' ').filter(w => w).length;
    wordCountElem.textContent = `Palabras: ${wordCount}`;
  }
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('darkMode', document.body.classList.contains('dark'));
      [preambleEditor, mainEditor, bibEditor].forEach(ed => ed ? ed.refresh() : null);
      if (quill) quill.root.classList.toggle('dark-editor');
      console.log("Modo oscuro toggled");
    });
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
      if (quill) quill.root.classList.add('dark-editor');
    }
  }
  if (toggleModeBtn) {
    toggleModeBtn.addEventListener('click', () => {
      isVisualMode = !isVisualMode;
      let body;
      if (isVisualMode) {
        body = latexToDelta(mainEditor.getValue());
        quill.setContents(body);
        visualEditorElem.style.display = 'block';
        mainEditorElem.style.display = 'none';
        if (codeTools) codeTools.style.display = 'none';
        toggleModeBtn.textContent = 'Cambiar a Modo Código';
      } else {
        body = deltaToLatex(quill.getContents());
        mainEditor.setValue(body);
        visualEditorElem.style.display = 'none';
        mainEditorElem.style.display = 'block';
        if (codeTools) codeTools.style.display = 'block';
        mainEditor.refresh();
        toggleModeBtn.textContent = 'Cambiar a Modo Visual';
      }
      updateSidebar();
      updateWordCount();
    });
  }
  if (generateStructureButton && templateSelect) {
    generateStructureButton.addEventListener('click', () => {
      const template = templateSelect.value;
      preambleEditor.setValue(templates[template] || templates['APA']);
      if (isVisualMode) {
        quill.setContents(new Delta().insert({abstract: 'Resumen aquí...\n'}).insert('\nIntroducción\n', {header: 1}).insert('Escribe aquí...\n\n').insert('Metodología\n', {header: 1}).insert('...\n\n').insert('Conclusiones\n', {header: 1}).insert('...\n'));
      } else {
        mainEditor.setValue('\\begin{abstract}\nResumen aquí...\n\\end{abstract}\n\\maketitle\n\n\\section{Introducci\\\'on}\nEscribe aqu\\\'i...\n\n\\section{Metodolog\\\'ia}\n...\n\n\\section{Conclusiones}\n...');
      }
      bibEditor.setValue('');
      updateSidebar();
      updateWordCount();
      console.log("Estructura generada con template:", template);
    });
  }
  function openVisualTableModal() {
    if (tableModal) tableModal.style.display = 'block';
    tableGrid.innerHTML = '';
    tableRowsInput.value = 2;
    tableColsInput.value = 2;
  }
  function openVisualTableModalWith(html) {
    try {
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
    } catch (e) {
      console.error('Error abriendo modal de tabla:', e);
      alert('Error al editar tabla. Intenta de nuevo.');
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
          row.appendChild(cell);
        }
        tableGrid.appendChild(row);
      }
    });
  }
  if (insertTableCodeBtn) {
    insertTableCodeBtn.addEventListener('click', () => {
      const rows = tableGrid.querySelectorAll('tr');
      if (rows.length === 0) return closeTableModal();
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
        try {
          katex.render(math, equationPreview, {throwOnError: false, displayMode: true});
        } catch (e) {
          equationPreview.innerText = 'Error en LaTeX: ' + e.message;
        }
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
    if (Object.keys(bibEntries).length === 0) {
      alert('No hay entradas bibliográficas. Añade desde DOI/ISBN o importa .bib.');
    }
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
  function openFindReplaceModal() {
    if (findReplaceModal) findReplaceModal.style.display = 'block';
  }
  if (performFindReplaceBtn) {
    performFindReplaceBtn.addEventListener('click', () => {
      const find = findInput.value;
      const replace = replaceInput.value;
      if (find) {
        if (isVisualMode) {
          let index = 0;
          let text = quill.getText();
          while ((index = text.indexOf(find, index)) !== -1) {
            quill.deleteText(index, find.length);
            quill.insertText(index, replace);
            index += replace.length;
            text = quill.getText();
          }
        } else if (!isVisualMode) {
          let text = mainEditor.getValue();
          text = text.replace(new RegExp(find, 'g'), replace);
          mainEditor.setValue(text);
        }
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
  if (fetchBibButton && doiInput) {
    fetchBibButton.addEventListener('click', async () => {
      const doi = doiInput.value.trim();
      if (!doi) return alert('Ingresa un DOI válido.');
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
  if (fetchIsbnButton && isbnInput) {
    fetchIsbnButton.addEventListener('click', async () => {
      const isbn = isbnInput.value.trim();
      if (!isbn) return alert('Ingresa un ISBN válido.');
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
        const bodyLatex = parts.length > 1 ? parts[1].split('\\end{document}')[0] : texFileContent;
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
              const ext = path.split('.').pop();
              const dataurl = `data:image/${ext};base64,${base64}`;
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
  if (importTex) {
    importTex.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (r) => {
        const text = r.target.result;
        const parts = text.split('\\begin{document}');
        preambleEditor.setValue(parts[0] || '');
        const bodyLatex = parts.length > 1 ? parts[1].split('\\end{document}')[0] : text;
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
      alert('Versión guardada.');
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
        if (codeTools) codeTools.style.display = isVisualMode ? 'none' : 'block';
        parseBib();
        updateSidebar();
        updateWordCount();
      };
      versionsList.appendChild(btn);
    });
  }
  updateVersionsList();
  function deltaToLatex(delta) {
    try {
      let latex = '';
      let listType = null;
      let listItems = [];
      let quote = false;
      let code = false;
      images = []; // Reset y recolectar
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
              if (op.attributes.citation) text = '\\cite{' + op.attributes.citation + '}';
              if (op.attributes.bold) text = '\\textbf{' + text + '}';
              if (op.attributes.italic) text = '\\textit{' + text + '}';
              if (op.attributes.underline) text = '\\underline{' + text + '}';
              if (op.attributes.strike) text = '\\sout{' + text + '}';
              if (op.attributes.link) text = '\\href{' + op.attributes.link + '}{' + text + '}';
              if (op.attributes.code) text = '\\texttt{' + text + '}';
              if (op.attributes.script === 'super') text = '^{' + text + '}';
              if (op.attributes.script === 'sub') text = '_{' + text + '}';
              if (op.attributes.header) {
                flushList();
                const level = op.attributes.header;
                const tag = level === 1 ? 'section' : level === 2 ? 'subsection' : level === 3 ? 'subsubsection' : level === 4 ? 'paragraph' : 'subparagraph';
                text = '\\' + tag + '{' + text.trim() + '}\n';
              }
              if (op.attributes.blockquote) {
                if (!quote) {
                  flushList();
                  latex += '\\begin{quote}\n';
                  quote = true;
                }
                latex += text;
                if (!delta.ops[idx + 1] || !delta.ops[idx + 1].attributes?.blockquote) {
                  latex += '\\end{quote}\n';
                  quote = false;
                }
                return;
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
                latex += text;
                if (!delta.ops[idx + 1] || !delta.ops[idx + 1].attributes?.['code-block']) {
                  latex += '\\end{verbatim}\n';
                  code = false;
                }
                return;
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
              if (op.attributes.color) text = '\\textcolor{' + op.attributes.color + '}{' + text + '}';
              if (op.attributes.background) text = '\\colorbox{' + op.attributes.background + '}{' + text + '}';
              if (op.attributes.align) text = '\\begin{' + op.attributes.align + '}\n' + text + '\\end{' + op.attributes.align + '}\n';
            } else {
              flushList();
            }
            latex += text;
          } else if (typeof op.insert === 'object') {
            flushList();
            const key = Object.keys(op.insert)[0];
            const value = op.insert[key];
            switch (key) {
              case 'equation':
                latex += '\\begin{equation}\n' + value + '\n\\end{equation}\n';
                break;
              case 'table':
                const html = value.html;
                const table = new DOMParser().parseFromString(`<table>${html}</table>`, 'text/html').querySelector('table');
                let cols = 0;
                if (table.rows.length > 0) {
                  cols = table.rows[0].cells.length;
                }
                latex += '\\begin{table}[h]\n\\centering\n\\begin{tabular}{' + 'c'.repeat(cols) + '}\n';
                for (let i = 0; i < table.rows.length; i++) {
                  const cells = Array.from(table.rows[i].cells).map(cell => cell.innerText);
                  latex += cells.join(' & ') + ' \\\\ \n';
                }
                latex += '\\end{tabular}\n\\caption{}\n\\label{}\n\\end{table}\n';
                break;
              case 'figure':
                let src = value.src;
                let caption = value.caption;
                if (src.startsWith('data:')) {
                  const base64 = src.split(',')[1];
                  const mime = src.match(/:(.*?);/)[1];
                  const ext = mime.split('/')[1];
                  const name = `image${images.length}.${ext}`;
                  images.push({name, data: base64});
                  src = 'images/' + name;
                }
                latex += '\\begin{figure}[h]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{' + src + '}\n\\caption{' + caption + '}\n\\label{}\n\\end{figure}\n';
                break;
              case 'abstract':
                latex += '\\begin{abstract}\n' + value + '\n\\end{abstract}\n';
                break;
              case 'theorem':
                latex += '\\begin{theorem}\n' + value + '\n\\end{theorem}\n';
                break;
              case 'lemma':
                latex += '\\begin{lemma}\n' + value + '\n\\end{lemma}\n';
                break;
              case 'proof':
                latex += '\\begin{proof}\n' + value + '\n\\end{proof}\n';
                break;
            }
          }
        }
      });
      flushList();
      if (quote) latex += '\\end{quote}\n';
      if (code) latex += '\\end{verbatim}\n';
      return latex;
    } catch (e) {
      console.error('Error convirtiendo Delta a LaTeX:', e);
      return '';
    }
  }
  function latexToDelta(latex) {
    try {
      const delta = new Delta();
      latex = latex.replace(/\\begin{document}|\\end{document}/g, '');
      const lines = latex.split('\n');
      let inEnv = null;
      let envContent = [];
      lines.forEach(line => {
        line = line.trim();
        if (!line) {
          delta.insert('\n');
          return;
        }
        if (line.startsWith('\\begin{')) {
          inEnv = line.match(/\\begin{(.+)}/)[1];
          envContent = [];
          return;
        } else if (line.startsWith('\\end{') && inEnv) {
          const content = envContent.join('\n');
          switch (inEnv) {
            case 'equation':
              delta.insert({equation: content});
              break;
            case 'table':
              // Parse tabular to html
              let html = '<tbody>';
              const tabularLines = content.split('\\\\');
              tabularLines.forEach(tl => {
                if (tl.trim()) {
                  html += '<tr><td>' + tl.split('&').join('</td><td>') + '</td></tr>';
                }
              });
              html += '</tbody>';
              delta.insert({table: {html}});
              break;
            case 'figure':
              // Simple, assume \includegraphics{src} \caption{cap}
              const srcMatch = content.match(/\\includegraphics.*{(.+)}/);
              const capMatch = content.match(/\\caption{(.+)}/);
              delta.insert({figure: {src: srcMatch ? srcMatch[1] : '', caption: capMatch ? capMatch[1] : ''}});
              break;
            case 'abstract':
              delta.insert({abstract: content});
              break;
            case 'theorem':
              delta.insert({theorem: content});
              break;
            case 'lemma':
              delta.insert({lemma: content});
              break;
            case 'proof':
              delta.insert({proof: content});
              break;
            default:
              delta.insert(content + '\n');
          }
          inEnv = null;
          return;
        } else if (inEnv) {
          envContent.push(line);
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
        } else if (line.startsWith('\\paragraph{')) {
          const title = line.match(/\\paragraph{(.*)}/)[1];
          delta.insert(title + '\n', {header: 4});
        } else if (line.startsWith('\\subparagraph{')) {
          const title = line.match(/\\subparagraph{(.*)}/)[1];
          delta.insert(title + '\n', {header: 5});
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
        } else if (line.startsWith('\\href{')) {
          const match = line.match(/\\href{(.+)}{(.+)}/);
          delta.insert(match[2], {link: match[1]});
        } else if (line.startsWith('\\footnote{')) {
          const text = line.match(/\\footnote{(.*)}/)[1];
          delta.insert(text, {script: 'super'});
        } else {
          delta.insert(line + '\n');
        }
      });
      return delta;
    } catch (e) {
      console.error('Error convirtiendo LaTeX a Delta:', e);
      return new Delta().insert(latex);
    }
  }
  function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9.-]/g, '_');
  }
  if (exportTexButton) {
    exportTexButton.addEventListener('click', () => {
      try {
        const body = isVisualMode ? deltaToLatex(quill.getContents()) : mainEditor.getValue();
        const fullTex = preambleEditor.getValue() + '\n\\begin{document}\n' + body + '\n\\bibliographystyle{plainnat}\n\\bibliography{refs}\n\\end{document}';
        const blob = new Blob([fullTex], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.tex';
        a.click();
      } catch (e) {
        alert('Error exportando .tex: ' + e.message);
      }
    });
  }
  if (exportZipButton) {
    exportZipButton.addEventListener('click', async () => {
      try {
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
      } catch (e) {
        alert('Error exportando .zip: ' + e.message);
      }
    });
  }
  function exportToOnline(serviceUrl) {
    try {
      const body = isVisualMode ? deltaToLatex(quill.getContents()) : mainEditor.getValue();
      const fullTex = preambleEditor.getValue() + '\n\\begin{document}\n' + body + '\n\\bibliographystyle{plainnat}\n\\bibliography{refs}\n\\end{document}';
      navigator.clipboard.writeText(fullTex).then(() => {
        alert('Código LaTeX copiado al portapapeles. Pégalo en el editor de ' + serviceUrl);
        window.open(serviceUrl, '_blank');
      });
    } catch (e) {
      alert('Error exportando a online: ' + e.message);
    }
  }
  if (overleafExportBtn) overleafExportBtn.addEventListener('click', () => exportToOnline('https://www.overleaf.com/project/new'));
  if (texpageExportBtn) texpageExportBtn.addEventListener('click', () => exportToOnline('https://texpage.com/'));
  if (papeeriaExportBtn) papeeriaExportBtn.addEventListener('click', () => exportToOnline('https://www.papeeria.com/'));
  if (cocalcExportBtn) cocalcExportBtn.addEventListener('click', () => exportToOnline('https://cocalc.com/'));
  if (latexOnlineExportBtn) latexOnlineExportBtn.addEventListener('click', () => exportToOnline('https://latexonline.cc/'));
  if (analyzeButton && analysisOutput) {
    analyzeButton.addEventListener('click', () => {
      let text;
      if (isVisualMode) {
        text = quill.getText();
      } else {
        text = mainEditor.getValue();
      }
      const words = text.split(/\s+/).filter(w => w).length;
      const sentences = text.split(/[.!?]+/).length - 1;
      const paragraphs = text.split(/\n\n+/).length;
      analysisOutput.innerHTML = `Palabras: ${words}<br>Oraciones: ${sentences}<br>Párrafos: ${paragraphs}`;
    });
  }
  if (addPackageBtn) {
    addPackageBtn.addEventListener('click', () => {
      const name = prompt('Nombre del paquete a añadir:');
      if (name) {
        preambleEditor.setValue(preambleEditor.getValue() + `\n\\usepackage{${name}}`);
        preambleEditor.refresh();
      }
    });
  }
  // Preservar inserciones para modo código
  const insertButtons = {
    'insert-section': '\\section{}',
    'insert-subsection': '\\subsection{}',
    'insert-subsubsection': '\\subsubsection{}',
    'insert-chapter': '\\chapter{}',
    'insert-part': '\\part{}',
    'insert-paragraph': '\\paragraph{}',
    'insert-subparagraph': '\\subparagraph{}',
    'insert-cite': '\\cite{}',
    'insert-math': '\\[\n\\]',
    'insert-equation': '\\begin{equation}\n\\end{equation}',
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
    'insert-figure': insertFigureCode,
    'insert-table': '\\begin{table}[h]\n\\centering\n\\begin{tabular}{cc}\n a & b \\\\ \n c & d \\\\ \n\\end{tabular}\n\\caption{}\n\\label{}\n\\end{table}',
    'insert-bold': '\\textbf{}',
    'insert-italic': '\\textit{}',
    'insert-emph': '\\emph{}',
    'insert-texttt': '\\texttt{}',
    'insert-textsc': '\\textsc{}',
    'insert-textsf': '\\textsf{}',
    'insert-textmd': '\\textmd{}',
    'insert-textup': '\\textup{}',
    'insert-textsl': '\\textsl{}',
    'insert-itemize': '\\begin{itemize}\n\\item \n\\end{itemize}',
    'insert-enumerate': '\\begin{enumerate}\n\\item \n\\end{enumerate}',
    'insert-description': '\\begin{description}\n\\item[] \n\\end{description}',
    'insert-hyperlink': '\\href{}{}',
    'insert-footnote': '\\footnote{}',
    'insert-abstract': '\\begin{abstract}\n\\end{abstract}',
    'insert-theorem': '\\begin{theorem}\n\\end{theorem}',
    'insert-lemma': '\\begin{lemma}\n\\end{lemma}',
    'insert-proof': '\\begin{proof}\n\\end{proof}',
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
    'insert-label': '\\label{}',
    'insert-ref': '\\ref{}',
    'insert-pageref': '\\pageref{}',
    'insert-index': '\\index{}',
    'insert-glossary': '\\glossary{}',
    'insert-roman': '\\roman{}',
    'insert-Roman': '\\Roman{}',
    'insert-alph': '\\alph{}',
    'insert-Alph': '\\Alph{}',
    'insert-arabic': '\\arabic{}'
  };
  Object.keys(insertButtons).forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => {
      if (typeof insertButtons[id] === 'function') {
        insertButtons[id]();
      } else {
        insertAtCursor(mainEditor, insertButtons[id]);
      }
    });
  });
  function insertAtCursor(editor, text) {
    if (!editor) return;
    const cursor = editor.getCursor();
    editor.replaceRange(text, cursor);
    editor.focus();
    console.log("Insertado en código:", text);
  }
  function insertFigureCode() {
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
        insertAtCursor(mainEditor, `\\begin{figure}[h]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{${name}}\n\\caption{}\n\\label{}\n\\end{figure}`);
        console.log("Imagen insertada en código:", name);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }
  if (addPackageBtn) {
    addPackageBtn.addEventListener('click', () => {
      const name = prompt('Nombre del paquete:');
      if (name) {
        preambleEditor.setValue(preambleEditor.getValue() + `\n\\usepackage{${name}}`);
      }
    });
  }
  // Más mejoras: drag drop imágenes en visual
  visualEditorElem.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (r) => {
        const range = quill.getSelection() || {index: quill.getLength()};
        quill.insertEmbed(range.index, 'figure', {src: r.target.result, caption: ''});
        quill.setSelection(range.index + 1);
      };
      reader.readAsDataURL(file);
    }
  });
  visualEditorElem.addEventListener('dragover', (e) => e.preventDefault());
});
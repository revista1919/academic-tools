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
  const exportPdfButton = document.getElementById('export-pdf');
  const exportDocxButton = document.getElementById('export-docx');
  const saveVersionButton = document.getElementById('save-version');
  const versionsList = document.getElementById('versions-list');
  const analyzeButton = document.getElementById('analyze-text');
  const analysisOutput = document.getElementById('analysis-output');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const importZip = document.getElementById('import-zip');
  const importTex = document.getElementById('import-tex');
  const importBib = document.getElementById('import-bib');
  const importDocx = document.getElementById('import-docx');
  const importPdf = document.getElementById('import-pdf');
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
  const ambiguityModal = document.getElementById('ambiguity-modal');
  const ambiguitiesList = document.getElementById('ambiguities-list');
  const ignoreAmbiguitiesBtn = document.getElementById('ignore-ambiguities');
  const treatAsTextBtn = document.getElementById('treat-as-text');
  const closeAmbiguityModalBtn = document.getElementById('close-ambiguity-modal');
  const statusMessages = document.getElementById('status-messages');
  const paperSizeSelect = document.getElementById('paper-size');
  const orientationSelect = document.getElementById('orientation');
  const marginTopInput = document.getElementById('margin-top');
  const marginBottomInput = document.getElementById('margin-bottom');
  const marginLeftInput = document.getElementById('margin-left');
  const marginRightInput = document.getElementById('margin-right');
  const lineSpacingSelect = document.getElementById('line-spacing');
  const paragraphAlignSelect = document.getElementById('paragraph-align');
  const applyPageSettingsBtn = document.getElementById('apply-page-settings');
  const customSizeDiv = document.getElementById('custom-size');
  const customWidthInput = document.getElementById('custom-width');
  const customHeightInput = document.getElementById('custom-height');
  let preambleEditor, mainEditor, bibEditor, quill;
  let versions = JSON.parse(localStorage.getItem('versions')) || [];
  let images = [];
  let bibEntries = {};
  let isVisualMode = true;
  let currentEditIndex = null;
  let currentEditType = null;
  let currentAmbiguities = [];
  let pageSettings = JSON.parse(localStorage.getItem('pageSettings')) || {
    size: 'a4',
    orientation: 'portrait',
    margins: {top: 2.5, bottom: 2.5, left: 2.5, right: 2.5},
    lineSpacing: '1.5',
    align: 'justify',
    customWidth: 21,
    customHeight: 29.7
  };
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
  // Aplicar page settings inicial
  applyPageSettings();
  // Mostrar custom size si selected
  paperSizeSelect.addEventListener('change', () => {
    customSizeDiv.style.display = paperSizeSelect.value === 'custom' ? 'block' : 'none';
  });
  if (paperSizeSelect.value === 'custom') customSizeDiv.style.display = 'block';
  // Aplicar settings
  if (applyPageSettingsBtn) {
    applyPageSettingsBtn.addEventListener('click', () => {
      pageSettings.size = paperSizeSelect.value;
      pageSettings.orientation = orientationSelect.value;
      pageSettings.margins = {
        top: parseFloat(marginTopInput.value),
        bottom: parseFloat(marginBottomInput.value),
        left: parseFloat(marginLeftInput.value),
        right: parseFloat(marginRightInput.value)
      };
      pageSettings.lineSpacing = lineSpacingSelect.value;
      pageSettings.align = paragraphAlignSelect.value;
      pageSettings.customWidth = parseFloat(customWidthInput.value);
      pageSettings.customHeight = parseFloat(customHeightInput.value);
      localStorage.setItem('pageSettings', JSON.stringify(pageSettings));
      applyPageSettings();
      updatePreambleFromPageSettings();
    });
  }
  function applyPageSettings() {
    const {size, orientation, margins, lineSpacing, align, customWidth, customHeight} = pageSettings;
    const sizes = {
      a4: {portrait: {width: '21cm', height: '29.7cm'}, landscape: {width: '29.7cm', height: '21cm'}},
      letter: {portrait: {width: '21.59cm', height: '27.94cm'}, landscape: {width: '27.94cm', height: '21.59cm'}},
      legal: {portrait: {width: '21.59cm', height: '35.56cm'}, landscape: {width: '35.56cm', height: '21.59cm'}},
      custom: {portrait: {width: `${customWidth}cm`, height: `${customHeight}cm`}, landscape: {width: `${customHeight}cm`, height: `${customWidth}cm`}}
    };
    const dim = sizes[size] ? sizes[size][orientation] : sizes['a4']['portrait'];
    const pageContainer = document.querySelector('.page-container');
    pageContainer.style.width = dim.width;
    pageContainer.style.height = 'auto'; // Continuous flow
    const qlEditor = document.querySelector('.ql-editor');
    qlEditor.style.paddingTop = `${margins.top}cm`;
    qlEditor.style.paddingBottom = `${margins.bottom}cm`;
    qlEditor.style.paddingLeft = `${margins.left}cm`;
    qlEditor.style.paddingRight = `${margins.right}cm`;
    qlEditor.style.lineHeight = lineSpacing;
    qlEditor.style.textAlign = align;
    // Update print style
    let printStyle = document.getElementById('print-style');
    if (!printStyle) {
      printStyle = document.createElement('style');
      printStyle.id = 'print-style';
      document.head.appendChild(printStyle);
    }
    printStyle.innerHTML = `
      @media print {
        @page { size: ${dim.width} ${dim.height}; margin: 0; }
        body { margin: 0; background: white; }
        .page-container { box-shadow: none; width: auto; height: auto; }
        .ql-editor { padding: ${margins.top}cm ${margins.right}cm ${margins.bottom}cm ${margins.left}cm; page-break-after: avoid; }
        #page-settings, .ql-toolbar, #sidebar, header, footer, nav { display: none; }
      }
    `;
  }
  function autoSave() {
    const project = {
      preamble: preambleEditor.getValue(),
      body: isVisualMode ? quill.getContents() : mainEditor.getValue(),
      bib: bibEditor.getValue(),
      images,
      isVisualMode,
      pageSettings
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
    pageSettings = savedProject.pageSettings || pageSettings;
    if (isVisualMode) {
      quill.setContents(savedProject.body || new Delta());
      visualEditorElem.parentNode.style.display = 'block';
      mainEditorElem.style.display = 'none';
    } else {
      mainEditor.setValue(savedProject.body || '');
      visualEditorElem.parentNode.style.display = 'none';
      mainEditorElem.style.display = 'block';
    }
    if (codeTools) codeTools.style.display = isVisualMode ? 'none' : 'block';
    toggleModeBtn.textContent = isVisualMode ? 'Cambiar a Modo Código' : 'Cambiar a Modo Visual';
    parseBib();
    updateSidebar();
    updateWordCount();
    updatePageSettingsUI();
    // Parse preamble for initial page settings if not saved
    if (!savedProject.pageSettings) updatePageSettingsFromPreamble();
    applyPageSettings();
  }
  function updatePageSettingsUI() {
    paperSizeSelect.value = pageSettings.size;
    orientationSelect.value = pageSettings.orientation;
    marginTopInput.value = pageSettings.margins.top;
    marginBottomInput.value = pageSettings.margins.bottom;
    marginLeftInput.value = pageSettings.margins.left;
    marginRightInput.value = pageSettings.margins.right;
    lineSpacingSelect.value = pageSettings.lineSpacing;
    paragraphAlignSelect.value = pageSettings.align;
    customWidthInput.value = pageSettings.customWidth;
    customHeightInput.value = pageSettings.customHeight;
    customSizeDiv.style.display = pageSettings.size === 'custom' ? 'block' : 'none';
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
        const name = sanitizeFilename(file.name);
        const base64 = r.target.result.split(',')[1];
        images.push({name, data: base64, dataurl: r.target.result});
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
        const {delta, ambiguities} = latexToDelta(mainEditor.getValue());
        quill.setContents(delta);
        visualEditorElem.parentNode.style.display = 'block';
        mainEditorElem.style.display = 'none';
        if (codeTools) codeTools.style.display = 'none';
        toggleModeBtn.textContent = 'Cambiar a Modo Código';
        applyPageSettings();
        if (ambiguities.length) showAmbiguityModal(ambiguities);
      } else {
        body = deltaToLatex(quill.getContents());
        mainEditor.setValue(body);
        visualEditorElem.parentNode.style.display = 'none';
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
      updatePageSettingsFromPreamble();
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
        const {preamble: pre, body: bodyModel, ambiguities} = parseLaTeX(texFileContent);
        preambleEditor.setValue(pre);
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
        if (isVisualMode) {
          const {delta} = modelToDelta({elements: bodyModel});
          quill.setContents(delta);
          if (ambiguities.length) showAmbiguityModal(ambiguities);
        } else {
          mainEditor.setValue(bodyModel.map(el => elToLatex(el)).join('\n'));
        }
        parseBib();
        updateSidebar();
        updateWordCount();
        updatePageSettingsFromPreamble();
        statusMessages.innerText = 'Proyecto importado. Algunas partes pueden haber sido aproximadas o perdidas.';
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
        const {preamble: pre, body: bodyModel, ambiguities} = parseLaTeX(text);
        preambleEditor.setValue(pre);
        if (isVisualMode) {
          const {delta} = modelToDelta({elements: bodyModel});
          quill.setContents(delta);
          if (ambiguities.length) showAmbiguityModal(ambiguities);
        } else {
          mainEditor.setValue(bodyModel.map(el => elToLatex(el)).join('\n'));
        }
        updateSidebar();
        updateWordCount();
        updatePageSettingsFromPreamble();
        statusMessages.innerText = 'Archivo .tex importado. Algunas partes pueden haber sido aproximadas o perdidas.';
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
  if (importDocx) {
    importDocx.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (r) => {
        try {
          const {value: html} = await mammoth.convertToHtml({arrayBuffer: r.target.result});
          if (isVisualMode) {
            quill.root.innerHTML = html;
          } else {
            mainEditor.setValue(html); // Aproximado como texto
          }
          updateSidebar();
          updateWordCount();
          statusMessages.innerText = 'DOCX importado como HTML aproximado. Estructura avanzada perdida.';
          alert('Archivo .docx importado (aproximado).');
        } catch (e) {
          alert('Error importando .docx: ' + e.message);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }
  if (importPdf) {
    importPdf.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (r) => {
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.min.js';
          const loadingTask = pdfjsLib.getDocument(r.target.result);
          const pdf = await loadingTask.promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            content.items.forEach(item => text += item.str + (item.hasEOL ? '\n\n' : ' '));
          }
          if (isVisualMode) {
            quill.setText(text);
          } else {
            mainEditor.setValue(text);
          }
          updateSidebar();
          updateWordCount();
          statusMessages.innerText = 'PDF importado solo como texto plano. Estructura, imágenes y formatos perdidos (limitación del navegador puro).';
          alert('Archivo .pdf importado (solo texto).');
        } catch (e) {
          alert('Error importando .pdf: ' + e.message);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }
  // Parser LaTeX -> model intermedio (JSON) - Limitado a soportado, tolerante a errores
  // Límite: Solo parses básicos, no anidados complejos o macros. Ambigüedades manejadas.
  function parseLaTeX(tex) {
    const documentMatch = tex.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
    const bodyText = documentMatch ? documentMatch[1] : tex;
    const preamble = tex.replace(bodyText, '').replace(/\\begin\{document\}|\\end\{document\}/g, '').trim();
    const ambiguities = [];
    const elements = [];
    // Simple tokenizer usando regex para comandos soportados
    const tokenRegex = /\\(section|subsection|subsubsection|begin|end|includegraphics|caption|cite|href|footnote|geometry)\{([^{}]*)\}|\\begin\{(equation|align|table|figure|tabular|itemize|enumerate)\}([\s\S]*?)\\end\{(equation|align|table|figure|tabular|itemize|enumerate)\}|(\$\$?[\s\S]*?\$\$?)|(\\[^ {]+(?:\{[^\}]*\})?)|([^\\/]+)/g;
    let match;
    let currentText = '';
    let inEnv = null;
    let envType = null;
    let envContent = '';
    while ((match = tokenRegex.exec(bodyText)) !== null) {
      if (match[1]) { // Command with {}
        const cmd = match[1];
        const arg = match[2];
        if (cmd === 'section') {
          if (currentText.trim()) elements.push({type: 'paragraph', text: currentText.trim()});
          currentText = '';
          elements.push({type: 'heading', level: 1, title: arg});
        } else if (cmd === 'subsection') {
          if (currentText.trim()) elements.push({type: 'paragraph', text: currentText.trim()});
          currentText = '';
          elements.push({type: 'heading', level: 2, title: arg});
        } else if (cmd === 'subsubsection') {
          if (currentText.trim()) elements.push({type: 'paragraph', text: currentText.trim()});
          currentText = '';
          elements.push({type: 'heading', level: 3, title: arg});
        } else if (cmd === 'cite') {
          currentText += ` [citation:${arg}] `;
        } else if (cmd === 'href') {
          currentText += ` [link:${arg}] `;
        } else if (cmd === 'footnote') {
          currentText += ` ^${arg}^ `;
        } else if (cmd === 'includegraphics') {
          if (inEnv === 'figure') {
            envContent.src = arg;
          } else {
            elements.push({type: 'figure', src: arg, caption: ''});
          }
        } else if (cmd === 'caption') {
          if (inEnv === 'figure') {
            envContent.caption = arg;
          } else if (inEnv === 'table') {
            envContent.caption = arg;
          }
        } else if (cmd === 'begin') {
          inEnv = arg;
          envContent = '';
        } else if (cmd === 'end') {
          if (inEnv === arg) {
            if (currentText.trim()) elements.push({type: 'paragraph', text: currentText.trim()});
            currentText = '';
            elements.push({type: inEnv, content: envContent.trim()});
            inEnv = null;
          }
        } else {
          ambiguities.push({command: `\\${cmd}{${arg}}`, suggestion: 'Unsupported command', raw: match[0]});
        }
      } else if (match[3] && match[4] && match[5]) { // \begin{env} content \end{env}
        envType = match[3];
        envContent = match[4].trim();
        if (envType === 'equation' || envType === 'align') {
          elements.push({type: 'equation', latex: envContent});
        } else if (envType === 'table' || envType === 'figure') {
          // Parse inner for tabular or img+caption
          if (envType === 'table') {
            const tabularMatch = envContent.match(/\\begin\{tabular\}\{.*\}([\s\S]*?)\\end\{tabular\}/);
            if (tabularMatch) {
              const tabular = tabularMatch[1];
              let html = '<tbody>';
              const rows = tabular.split('\\\\');
              rows.forEach(row => {
                if (row.trim()) {
                  html += '<tr><td>' + row.split('&').join('</td><td>') + '</td></tr>';
                }
              });
              html += '</tbody>';
              elements.push({type: 'table', html});
            } else {
              ambiguities.push({command: '\\begin{table}', suggestion: 'No tabular found', raw: match[0]});
            }
          } else if (envType === 'figure') {
            const imgMatch = envContent.match(/\\includegraphics\{(.*?)\}/);
            const capMatch = envContent.match(/\\caption\{(.*?)\}/);
            elements.push({type: 'figure', src: imgMatch ? imgMatch[1] : '', caption: capMatch ? capMatch[1] : ''});
          }
        } else if (envType === 'itemize' || envType === 'enumerate') {
          const items = envContent.split('\\item').map(i => i.trim()).filter(i => i);
          elements.push({type: 'list', ordered: envType === 'enumerate', items});
        } else {
          ambiguities.push({command: `\\begin{${envType}}`, suggestion: 'Unsupported environment', raw: match[0]});
        }
      } else if (match[6]) { // Math $$ or $
        elements.push({type: 'equation', latex: match[6].replace(/^\$+|\$+$/g, '').trim()});
      } else if (match[7]) { // Unsupported command
        ambiguities.push({command: match[7], suggestion: 'Unsupported command', raw: match[7]});
      } else if (match[8]) { // Text
        currentText += match[8];
      }
    }
    if (currentText.trim()) elements.push({type: 'paragraph', text: currentText.trim()});
    return {preamble, body: elements, ambiguities};
  }
  function modelToDelta(model) {
    const delta = new Delta();
    model.elements.forEach(el => {
      switch (el.type) {
        case 'heading':
          delta.insert(el.title + '\n', {header: el.level});
          break;
        case 'paragraph':
          delta.insert(el.text + '\n');
          break;
        case 'equation':
          delta.insert({equation: el.latex});
          delta.insert('\n');
          break;
        case 'table':
          delta.insert({table: {html: el.html}});
          delta.insert('\n');
          break;
        case 'figure':
          delta.insert({figure: {src: el.src, caption: el.caption}});
          delta.insert('\n');
          break;
        case 'list':
          el.items.forEach(item => {
            delta.insert(item + '\n', {list: el.ordered ? 'ordered' : 'bullet'});
          });
          break;
        case 'unsupported':
          delta.insert(el.text + '\n', {'code-block': true});
          break;
        default:
          // Ignore or log
      }
    });
    return {delta};
  }
  function latexToDelta(latex) {
    const {body: model, ambiguities} = parseLaTeX(latex);
    const {delta} = modelToDelta({elements: model});
    return {delta, ambiguities};
  }
  function deltaToModel(delta) {
    const model = [];
    let currentParagraph = '';
    let listType = null;
    let listItems = [];
    delta.ops.forEach(op => {
      if (op.insert) {
        if (typeof op.insert === 'string') {
          if (op.attributes && op.attributes.header) {
            if (currentParagraph) model.push({type: 'paragraph', text: currentParagraph});
            currentParagraph = '';
            if (listItems.length) {
              model.push({type: 'list', ordered: listType === 'ordered', items: listItems});
              listItems = [];
              listType = null;
            }
            model.push({type: 'heading', level: op.attributes.header, title: op.insert.trim()});
          } else if (op.attributes && op.attributes.list) {
            if (currentParagraph) model.push({type: 'paragraph', text: currentParagraph});
            currentParagraph = '';
            if (listType !== op.attributes.list) {
              if (listItems.length) model.push({type: 'list', ordered: listType === 'ordered', items: listItems});
              listType = op.attributes.list;
              listItems = [];
            }
            listItems.push(op.insert.trim());
          } else {
            currentParagraph += op.insert;
          }
        } else {
          if (currentParagraph) model.push({type: 'paragraph', text: currentParagraph});
          currentParagraph = '';
          if (listItems.length) {
            model.push({type: 'list', ordered: listType === 'ordered', items: listItems});
            listItems = [];
            listType = null;
          }
          const key = Object.keys(op.insert)[0];
          const value = op.insert[key];
          switch (key) {
            case 'equation':
              model.push({type: 'equation', latex: value});
              break;
            case 'table':
              model.push({type: 'table', html: value.html});
              break;
            case 'figure':
              model.push({type: 'figure', src: value.src, caption: value.caption});
              break;
            case 'abstract':
              model.push({type: 'abstract', content: value});
              break;
            case 'theorem':
              model.push({type: 'theorem', content: value});
              break;
            case 'lemma':
              model.push({type: 'lemma', content: value});
              break;
            case 'proof':
              model.push({type: 'proof', content: value});
              break;
          }
        }
      }
    });
    if (currentParagraph) model.push({type: 'paragraph', text: currentParagraph});
    if (listItems.length) model.push({type: 'list', ordered: listType === 'ordered', items: listItems});
    return model;
  }
  function elToLatex(el) {
    switch (el.type) {
      case 'heading':
        const tag = el.level === 1 ? 'section' : el.level === 2 ? 'subsection' : 'subsubsection';
        return `\\${tag}{${el.title}}`;
      case 'paragraph':
        return el.text;
      case 'equation':
        return `\\begin{equation}\n${el.latex}\n\\end{equation}`;
      case 'table':
        const table = new DOMParser().parseFromString(`<table>${el.html}</table>`, 'text/html').querySelector('table');
        let cols = table.rows[0] ? table.rows[0].cells.length : 0;
        let latex = '\\begin{table}[h]\n\\centering\n\\begin{tabular}{' + 'c'.repeat(cols) + '}\n';
        for (let i = 0; i < table.rows.length; i++) {
          const cells = Array.from(table.rows[i].cells).map(cell => cell.innerText);
          latex += cells.join(' & ') + ' \\\\ \n';
        }
        latex += '\\end{tabular}\n\\caption{}\n\\label{}\n\\end{table}';
        return latex;
      case 'figure':
        let src = el.src;
        if (src.startsWith('data:')) {
          const base64 = src.split(',')[1];
          const mime = src.match(/:(.*?);/)[1];
          const ext = mime.split('/')[1];
          const name = `image${images.length}.${ext}`;
          images.push({name, data: base64});
          src = name;
        }
        return `\\begin{figure}[h]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{${src}}\n\\caption{${el.caption}}\n\\label{}\n\\end{figure}`;
      case 'list':
        const env = el.ordered ? 'enumerate' : 'itemize';
        return `\\begin{${env}}\n` + el.items.map(item => `\\item ${item}`).join('\n') + `\n\\end{${env}}`;
      case 'abstract':
        return `\\begin{abstract}\n${el.content}\n\\end{abstract}`;
      case 'theorem':
        return `\\begin{theorem}\n${el.content}\n\\end{theorem}`;
      case 'lemma':
        return `\\begin{lemma}\n${el.content}\n\\end{lemma}`;
      case 'proof':
        return `\\begin{proof}\n${el.content}\n\\end{proof}`;
      case 'unsupported':
        return `% Normalized: approximated unsupported\n${el.text}`;
      default:
        return '';
    }
  }
  function deltaToLatex(delta) {
    const model = deltaToModel(delta);
    return model.map(elToLatex).join('\n');
  }
  function showAmbiguityModal(ambiguities) {
    currentAmbiguities = ambiguities;
    ambiguitiesList.innerHTML = ambiguities.map(a => `<li>${a.command}: ${a.suggestion}</li>`).join('');
    ambiguityModal.style.display = 'block';
  }
  if (ignoreAmbiguitiesBtn) {
    ignoreAmbiguitiesBtn.addEventListener('click', () => {
      closeAmbiguityModal();
    });
  }
  if (treatAsTextBtn) {
    treatAsTextBtn.addEventListener('click', () => {
      currentAmbiguities.forEach(a => {
        const range = quill.getSelection() || {index: quill.getLength()};
        quill.insertEmbed(range.index, 'code-block', a.raw);
        quill.insertText(range.index + 1, '\n');
      });
      closeAmbiguityModal();
    });
  }
  if (closeAmbiguityModalBtn) {
    closeAmbiguityModalBtn.addEventListener('click', closeAmbiguityModal);
  }
  function closeAmbiguityModal() {
    ambiguityModal.style.display = 'none';
    currentAmbiguities = [];
  }
  function updatePageSettingsFromPreamble() {
    const pre = preambleEditor.getValue();
    const geometryMatch = pre.match(/\\geometry\{(.*)\}/);
    if (geometryMatch) {
      const params = geometryMatch[1].split(',').map(p => p.trim().split('='));
      params.forEach(([key, val]) => {
        if (key === 'a4paper') pageSettings.size = 'a4';
        else if (key === 'letterpaper') pageSettings.size = 'letter';
        else if (key === 'legalpaper') pageSettings.size = 'legal';
        else if (key === 'margin') {
          const m = parseFloat(val.replace('cm', ''));
          pageSettings.margins = {top: m, bottom: m, left: m, right: m};
        } else if (key === 'top') pageSettings.margins.top = parseFloat(val.replace('cm', ''));
        else if (key === 'bottom') pageSettings.margins.bottom = parseFloat(val.replace('cm', ''));
        else if (key === 'left') pageSettings.margins.left = parseFloat(val.replace('cm', ''));
        else if (key === 'right') pageSettings.margins.right = parseFloat(val.replace('cm', ''));
      });
    }
    const docMatch = pre.match(/\\documentclass\[(.*)\]{/);
    if (docMatch && docMatch[1].includes('landscape')) pageSettings.orientation = 'landscape';
    if (pre.includes('\\doublespacing')) pageSettings.lineSpacing = '2';
    else if (pre.includes('\\onehalfspacing')) pageSettings.lineSpacing = '1.5';
    else if (pre.includes('\\singlespacing')) pageSettings.lineSpacing = '1';
    updatePageSettingsUI();
    applyPageSettings();
  }
  function updatePreambleFromPageSettings() {
    let pre = preambleEditor.getValue();
    // Remove existing geometry
    pre = pre.replace(/\\geometry\{.*\}/, '');
    let geometry = '\\geometry{';
    geometry += `${pageSettings.size}paper, `;
    geometry += `top=${pageSettings.margins.top}cm, bottom=${pageSettings.margins.bottom}cm, left=${pageSettings.margins.left}cm, right=${pageSettings.margins.right}cm`;
    geometry += '}';
    pre += `\n${geometry}`;
    // Setspace
    pre = pre.replace(/\\(double|onehalf|single)spacing/, '');
    let spacingCmd = '';
    if (pageSettings.lineSpacing === '2') spacingCmd = '\\doublespacing';
    else if (pageSettings.lineSpacing === '1.5') spacingCmd = '\\onehalfspacing';
    else spacingCmd = '\\singlespacing';
    pre += `\n${spacingCmd}`;
    // Orientation in documentclass
    pre = pre.replace(/\[landscape\]/, '');
    if (pageSettings.orientation === 'landscape') {
      pre = pre.replace(/\\documentclass\{/, '\\documentclass[landscape]{');
    }
    preambleEditor.setValue(pre);
  }
  if (saveVersionButton) {
    saveVersionButton.addEventListener('click', () => {
      const version = {
        preamble: preambleEditor.getValue(),
        body: isVisualMode ? quill.getContents() : mainEditor.getValue(),
        bib: bibEditor.getValue(),
        images: images.map(img => ({ name: img.name, data: img.data })),
        isVisualMode,
        pageSettings,
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
        pageSettings = v.pageSettings;
        if (v.isVisualMode) {
          quill.setContents(v.body);
          visualEditorElem.parentNode.style.display = 'block';
          mainEditorElem.style.display = 'none';
          isVisualMode = true;
          toggleModeBtn.textContent = 'Cambiar a Modo Código';
        } else {
          mainEditor.setValue(v.body);
          visualEditorElem.parentNode.style.display = 'none';
          mainEditorElem.style.display = 'block';
          isVisualMode = false;
          toggleModeBtn.textContent = 'Cambiar a Modo Visual';
        }
        if (codeTools) codeTools.style.display = isVisualMode ? 'none' : 'block';
        parseBib();
        updateSidebar();
        updateWordCount();
        updatePageSettingsUI();
        applyPageSettings();
      };
      versionsList.appendChild(btn);
    });
  }
  updateVersionsList();
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
  if (exportPdfButton) {
    exportPdfButton.addEventListener('click', () => {
      window.print();
    });
  }
  if (exportDocxButton) {
    exportDocxButton.addEventListener('click', async () => {
      try {
        const model = isVisualMode ? deltaToModel(quill.getContents()) : parseLaTeX(mainEditor.getValue()).body;
        const doc = new docx.Document({
          sections: [{
            properties: {
              page: {
                size: {
                  width: docx.convertMillimetersToTwip(210), // A4 default
                  height: docx.convertMillimetersToTwip(297),
                },
                margin: {
                  top: docx.convertMillimetersToTwip(pageSettings.margins.top * 10),
                  bottom: docx.convertMillimetersToTwip(pageSettings.margins.bottom * 10),
                  left: docx.convertMillimetersToTwip(pageSettings.margins.left * 10),
                  right: docx.convertMillimetersToTwip(pageSettings.margins.right * 10),
                },
              },
            },
            children: model.map(el => {
              switch (el.type) {
                case 'heading':
                  return new docx.Paragraph({
                    text: el.title,
                    heading: el.level === 1 ? docx.HeadingLevel.HEADING_1 : docx.HeadingLevel[`HEADING_${el.level}`],
                  });
                case 'paragraph':
                  return new docx.Paragraph({ text: el.text });
                case 'equation':
                  return new docx.Paragraph({ text: `[Equation: ${el.latex}]` }); // Approximation
                case 'table':
                  const table = new DOMParser().parseFromString(`<table>${el.html}</table>`, 'text/html').querySelector('table');
                  const rows = [];
                  for (let i = 0; i < table.rows.length; i++) {
                    const cells = Array.from(table.rows[i].cells).map(cell => new docx.TableCell({children: [new docx.Paragraph(cell.innerText)]}));
                    rows.push(new docx.TableRow({children: cells}));
                  }
                  return new docx.Table({rows});
                case 'figure':
                  let buffer;
                  if (el.src.startsWith('data:')) {
                    const base64 = el.src.split(',')[1];
                    buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
                  } else {
                    // Assume local, skip or warn
                    return new docx.Paragraph({ text: '[Figure]' });
                  }
                  const image = docx.Media.addImage(doc, buffer, 500, 300);
                  return new docx.Paragraph({ children: [image] });
                default:
                  return new docx.Paragraph({ text: '' });
              }
            }),
          }],
        });
        const blob = await docx.Packer.toBlob(doc);
        saveAs(blob, 'document.docx');
      } catch (e) {
        alert('Error exportando .docx: ' + e.message);
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
  // Más mejoras: drag drop imágenes en visual
  visualEditorElem.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (r) => {
        const range = quill.getSelection() || {index: quill.getLength()};
        const name = sanitizeFilename(file.name);
        const base64 = r.target.result.split(',')[1];
        images.push({name, data: base64, dataurl: r.target.result});
        quill.insertEmbed(range.index, 'figure', {src: r.target.result, caption: ''});
        quill.setSelection(range.index + 1);
      };
      reader.readAsDataURL(file);
    }
  });
  visualEditorElem.addEventListener('dragover', (e) => e.preventDefault());
});
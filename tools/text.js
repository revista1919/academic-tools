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
    // Agrega más plantillas con paquetes comunes para cada estilo
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
    alert('Error al inicializar el compilador LaTeX. Verifica la librería texlive.js.');
  }

  // Opciones comunes para CodeMirror 5
  const editorOptions = {
    lineNumbers: true,
    matchBrackets: true,
    styleActiveLine: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    mode: "stex" // Modo LaTeX perfecto para preamble y main
  };

  // Editor para preamble (LaTeX mode)
  if (preambleEditorElem) {
    try {
      console.log("Creando preamble editor con CodeMirror 5");
      preambleEditor = CodeMirror(preambleEditorElem, {
        value: '\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{graphicx}\n',
        ...editorOptions
      });
      console.log("Preamble editor creado correctamente");
    } catch (e) {
      console.error('Error creando preamble editor:', e);
    }
  } else {
    console.warn("preambleEditorElem no encontrado");
  }

  // Editor principal para LaTeX body
  if (mainEditorElem) {
    try {
      console.log("Creando main editor con CodeMirror 5");
      mainEditor = CodeMirror(mainEditorElem, {
        value: '\\begin{document}\nHola mundo\n\\end{document}',
        ...editorOptions
      });
      mainEditor.on("change", updateSidebar);
      console.log("Main editor creado correctamente");
    } catch (e) {
      console.error('Error creando main editor:', e);
    }
  } else {
    console.warn("mainEditorElem no encontrado");
  }

  // Editor para BibTeX (usamos modo texto con highlight básico, o 'stex' si aplica)
  if (bibEditorElem) {
    try {
      console.log("Creando bib editor con CodeMirror 5");
      bibEditor = CodeMirror(bibEditorElem, {
        value: '',
        lineNumbers: true,
        matchBrackets: true,
        mode: "text/x-bibtex" // Si no carga, fallback a "stex" o "text"
      });
      console.log("Bib editor creado correctamente");
    } catch (e) {
      console.error('Error creando bib editor:', e);
    }
  } else {
    console.warn("bibEditorElem no encontrado");
  }

  // Modo oscuro
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('darkMode', document.body.classList.contains('dark'));
      console.log("Modo oscuro toggled:", document.body.classList.contains('dark'));
      [preambleEditor, mainEditor, bibEditor].forEach(ed => ed.refresh());
    });
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
      console.log("Modo oscuro activado desde localStorage");
    }
  } else {
    console.warn("darkModeToggle no encontrado");
  }

  // Generar estructura de proyecto
  if (generateStructureButton && templateSelect) {
    generateStructureButton.addEventListener('click', () => {
      console.log("Botón de generar estructura clickeado");
      const template = templateSelect.value;
      console.log("Template seleccionado:", template);
      if (preambleEditor) {
        preambleEditor.setValue(templates[template] || templates['APA']);
        console.log("Preamble actualizado");
      } else {
        console.warn("preambleEditor no disponible");
      }
      if (mainEditor) {
        mainEditor.setValue('\\begin{document}\n\\maketitle\n\n\\section{Introducci\\\'on}\nEscribe aqu\\\'i...\n\n\\section{Metodolog\\\'ia}\n...\n\n\\section{Conclusiones}\n...\n\n\\bibliographystyle{plainnat}\n\\bibliography{refs}\n\\end{document}');
        console.log("Main editor actualizado");
      } else {
        console.warn("mainEditor no disponible");
      }
      if (bibEditor) {
        bibEditor.setValue('');
        console.log("Bib editor limpiado");
      } else {
        console.warn("bibEditor no disponible");
      }
      updateSidebar();
    });
  } else {
    console.warn("generateStructureButton o templateSelect no encontrado");
  }

  // Inserciones rápidas en main editor
  if (insertSectionBtn) insertSectionBtn.addEventListener('click', () => { console.log("Insert section"); insertAtCursor(mainEditor, '\\section{}'); });
  if (insertSubsectionBtn) insertSubsectionBtn.addEventListener('click', () => { console.log("Insert subsection"); insertAtCursor(mainEditor, '\\subsection{}'); });
  if (insertSubsubsectionBtn) insertSubsubsectionBtn.addEventListener('click', () => { console.log("Insert subsubsection"); insertAtCursor(mainEditor, '\\subsubsection{}'); });
  if (insertCiteBtn) insertCiteBtn.addEventListener('click', () => { console.log("Insert cite"); insertAtCursor(mainEditor, '\\cite{}'); });
  if (insertMathBtn) insertMathBtn.addEventListener('click', () => { console.log("Insert math"); insertAtCursor(mainEditor, '\\[\n\\]'); });
  if (insertEquationBtn) insertEquationBtn.addEventListener('click', () => { console.log("Insert equation"); insertAtCursor(mainEditor, '\\begin{equation}\n\\end{equation}'); });
  if (insertFigureBtn) insertFigureBtn.addEventListener('click', () => { console.log("Insert figure"); insertFigure(mainEditor); });
  if (insertTableBtn) insertTableBtn.addEventListener('click', () => { console.log("Insert table"); insertAtCursor(mainEditor, '\\begin{table}[h]\n\\centering\n\\begin{tabular}{cc}\n a & b \\\\ \n c & d \\\\ \n\\end{tabular}\n\\caption{}\n\\label{}\n\\end{table}'); });
  if (insertBoldBtn) insertBoldBtn.addEventListener('click', () => { console.log("Insert bold"); insertAtCursor(mainEditor, '\\textbf{}'); });
  if (insertItalicBtn) insertItalicBtn.addEventListener('click', () => { console.log("Insert italic"); insertAtCursor(mainEditor, '\\textit{}'); });
  if (insertItemizeBtn) insertItemizeBtn.addEventListener('click', () => { console.log("Insert itemize"); insertAtCursor(mainEditor, '\\begin{itemize}\n\\item \n\\end{itemize}'); });
  if (insertEnumerateBtn) insertEnumerateBtn.addEventListener('click', () => { console.log("Insert enumerate"); insertAtCursor(mainEditor, '\\begin{enumerate}\n\\item \n\\end{enumerate}'); });
  if (insertHyperlinkBtn) insertHyperlinkBtn.addEventListener('click', () => { console.log("Insert hyperlink"); insertAtCursor(mainEditor, '\\href{}{}'); });
  if (insertFootnoteBtn) insertFootnoteBtn.addEventListener('click', () => { console.log("Insert footnote"); insertAtCursor(mainEditor, '\\footnote{}'); });

  function insertAtCursor(editor, text) {
    if (!editor) {
      console.warn("editor no disponible para insertAtCursor");
      return;
    }
    console.log("Insertando texto en cursor:", text);
    const cursor = editor.getCursor();
    editor.replaceRange(text, cursor);
    editor.focus();
  }

  function insertFigure(editor) {
    console.log("Iniciando insertFigure");
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) {
        console.warn("No file selected in insertFigure");
        return;
      }
      console.log("Archivo seleccionado:", file.name);
      const reader = new FileReader();
      reader.onload = (r) => {
        const name = sanitizeFilename(file.name);
        images.push({ name, data: r.target.result.split(',')[1] });
        console.log("Imagen agregada:", name);
        insertAtCursor(editor, `\\begin{figure}[h]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{${name}}\n\\caption{}\n\\label{}\n\\end{figure}`);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function sanitizeFilename(name) {
    const sanitized = name.replace(/[^a-zA-Z0-9.-]/g, '_');
    console.log("Sanitizing filename:", name, "->", sanitized);
    return sanitized;
  }

  // Actualizar sidebar con estructura LaTeX
  function updateSidebar() {
    console.log("Actualizando sidebar");
    if (sidebar && mainEditor) {
      sidebar.innerHTML = '<strong>Secciones:</strong><br>';
      const lines = mainEditor.getValue().split("\n");
      lines.forEach((line, i) => {
        const match = line.match(/^\\(chapter|section|subsection|subsubsection){(.*)}/);
        if (match) {
          const level = { chapter: 0, section: 1, subsection: 2, subsubsection: 3 }[match[1]];
          const title = match[2];
          const item = document.createElement('div');
          item.textContent = title;
          item.classList.add('sidebar-item');
          item.style.paddingLeft = `${level * 15}px`;
          item.addEventListener('click', () => {
            mainEditor.scrollIntoView({ line: i, ch: 0 });
            mainEditor.focus();
            console.log("Sidebar item clickeado, navegando a linea:", i);
          });
          sidebar.appendChild(item);
        }
      });
      console.log("Sidebar actualizada");
    } else {
      console.warn("Sidebar o mainEditor no disponible");
    }
  }

  // Fetch BibTeX desde DOI y agregar a bib editor
  if (fetchBibButton && doiInput) {
    fetchBibButton.addEventListener('click', async () => {
      const doi = doiInput.value.trim();
      console.log("Fetch BibTeX con DOI:", doi);
      if (!doi) return;
      try {
        const response = await fetch(`https://api.crossref.org/works/${doi}/transform/application/x-bibtex`);
        if (!response.ok) throw new Error('Failed to fetch');
        const bibtext = await response.text();
        console.log("BibTeX obtenido:", bibtext.substring(0, 50) + "...");
        const currentBib = bibEditor.getValue();
        bibEditor.setValue(currentBib + (currentBib ? '\n' : '') + bibtext);
        console.log("BibTeX agregado al editor");
      } catch (e) {
        console.error('Error fetching BibTeX:', e);
        alert('Error al obtener BibTeX: ' + e.message);
      }
    });
  } else {
    console.warn("fetchBibButton o doiInput no encontrado");
  }

  // Fetch desde ISBN
  if (fetchIsbnButton && isbnInput) {
    fetchIsbnButton.addEventListener('click', async () => {
      const isbn = isbnInput.value.trim();
      console.log("Fetch ISBN:", isbn);
      if (!isbn) return;
      try {
        const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        console.log("Datos de ISBN obtenidos:", data.title);
        const year = data.publish_date ? data.publish_date.split(' ').pop() : new Date().getFullYear();
        const author = data.authors ? data.authors.map(a => a.name).join(' and ') : 'Unknown';
        const publisher = data.publishers ? data.publishers[0] : 'Unknown';
        const key = (author.split(' ')[0] + year).toLowerCase();
        const bib = `@book{${key},\n  author = {${author}},\n  title = {${data.title}},\n  year = {${year}},\n  publisher = {${publisher}},\n}\n`;
        const currentBib = bibEditor.getValue();
        bibEditor.setValue(currentBib + (currentBib ? '\n' : '') + bib);
        console.log("Entrada BibTeX de ISBN agregada");
      } catch (e) {
        console.error('Error fetching ISBN:', e);
        alert('Error al obtener ISBN: ' + e.message);
      }
    });
  } else {
    console.warn("fetchIsbnButton o isbnInput no encontrado");
  }

  // Importar .zip
  if (importZip) {
    importZip.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      console.log("Importando ZIP:", file ? file.name : "No file");
      if (!file) return;
      try {
        const zip = await JSZip.loadAsync(file);
        console.log("ZIP cargado");
        const texFiles = Object.keys(zip.files).filter(path => path.endsWith('.tex'));
        let texFileContent = '';
        if (texFiles.length > 0) {
          texFileContent = await zip.files[texFiles[0]].async('string');
          console.log("Texto .tex importado, longitud:", texFileContent.length);
        } else {
          console.warn("No .tex encontrado en ZIP");
        }
        const parts = texFileContent.split('\\begin{document}');
        if (preambleEditor) {
          preambleEditor.setValue(parts[0] || '');
          console.log("Preamble importado");
        }
        if (mainEditor) {
          mainEditor.setValue((parts.length > 1 ? '\\begin{document}' + parts.slice(1).join('\\begin{document}') : texFileContent));
          console.log("Main importado");
        }
        const bibFiles = Object.keys(zip.files).filter(path => path.endsWith('.bib'));
        let bibFileContent = '';
        if (bibFiles.length > 0) {
          bibFileContent = await zip.files[bibFiles[0]].async('string');
          if (bibEditor) {
            bibEditor.setValue(bibFileContent);
            console.log("Bib importado");
          }
        } else {
          console.warn("No .bib encontrado en ZIP");
        }
        images = [];
        let imageCount = 0;
        for (const path in zip.files) {
          const entry = zip.files[path];
          if (!entry.dir && /\.(png|jpg|jpeg|gif|svg|pdf|eps)$/i.test(path)) {
            const base64 = await entry.async('base64');
            images.push({ name: sanitizeFilename(path), data: base64 });
            imageCount++;
          }
        }
        console.log("Imágenes importadas:", imageCount);
        updateSidebar();
        alert('Proyecto importado exitosamente.');
      } catch (e) {
        console.error('Error importando .zip:', e);
        alert('Error al importar .zip: ' + e.message);
      }
    });
  } else {
    console.warn("importZip no encontrado");
  }

  // Importar .tex
  if (importTex) {
    importTex.addEventListener('change', (e) => {
      const file = e.target.files[0];
      console.log("Importando .tex:", file ? file.name : "No file");
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (r) => {
        const text = r.target.result;
        console.log("Texto .tex cargado, longitud:", text.length);
        const parts = text.split('\\begin{document}');
        if (preambleEditor) {
          preambleEditor.setValue(parts[0] || '');
          console.log("Preamble de .tex importado");
        }
        if (mainEditor) {
          mainEditor.setValue((parts.length > 1 ? '\\begin{document}' + parts.slice(1).join('\\begin{document}') : text));
          console.log("Main de .tex importado");
        }
        updateSidebar();
        alert('Archivo .tex importado.');
      };
      reader.readAsText(file);
    });
  } else {
    console.warn("importTex no encontrado");
  }

  // Importar .bib
  if (importBib) {
    importBib.addEventListener('change', (e) => {
      const file = e.target.files[0];
      console.log("Importando .bib:", file ? file.name : "No file");
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (r) => {
        const text = r.target.result;
        console.log("Texto .bib cargado, longitud:", text.length);
        if (bibEditor) {
          bibEditor.setValue(text);
          console.log(".bib importado");
        }
        alert('Archivo .bib importado.');
      };
      reader.readAsText(file);
    });
  } else {
    console.warn("importBib no encontrado");
  }

  // Compilar LaTeX a PDF localmente
  if (compileButton && pdfPreview) {
    compileButton.addEventListener('click', async () => {
      console.log("Compilando PDF");
      if (!preambleEditor || !mainEditor || !texlive) {
        console.warn("Faltan editores o texlive para compilar");
        return;
      }
      const preamble = preambleEditor.getValue();
      const body = mainEditor.getValue();
      const fullLatex = preamble + body;
      const bib = bibEditor ? bibEditor.getValue() : '';
      try {
        texlive.FS.writeFile('main.tex', fullLatex);
        console.log("main.tex escrito");
        if (bib) {
          texlive.FS.writeFile('refs.bib', bib);
          console.log("refs.bib escrito");
        }
        images.forEach(img => {
          const binary = atob(img.data);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
          texlive.FS.writeFile(img.name, array);
          console.log("Imagen escrita:", img.name);
        });
        await new Promise((resolve) => texlive.run('pdflatex -interaction=nonstopmode main.tex', resolve));
        console.log("Primera pdflatex ejecutada");
        if (bib) await new Promise((resolve) => texlive.run('bibtex main', resolve));
        console.log("Bibtex ejecutado");
        await new Promise((resolve) => texlive.run('pdflatex -interaction=nonstopmode main.tex', resolve));
        console.log("Segunda pdflatex ejecutada");
        await new Promise((resolve) => texlive.run('pdflatex -interaction=nonstopmode main.tex', resolve));
        console.log("Tercera pdflatex ejecutada");
        const pdfBytes = texlive.FS.readFile('main.pdf', { encoding: 'binary' });
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        pdfPreview.src = URL.createObjectURL(blob);
        pdfPreview.style.display = 'block';
        console.log("PDF preview mostrado");
      } catch (e) {
        console.error('Error en compilación:', e);
        alert('Error en compilación: ' + e.message);
      }
    });
  } else {
    console.warn("compileButton o pdfPreview no encontrado");
  }

  // Exportar .tex
  if (exportTexButton) {
    exportTexButton.addEventListener('click', () => {
      console.log("Exportando .tex");
      if (!preambleEditor || !mainEditor) {
        console.warn("Faltan editores para exportar .tex");
        return;
      }
      const full = preambleEditor.getValue() + mainEditor.getValue();
      const blob = new Blob([full], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.tex';
      a.click();
      URL.revokeObjectURL(url);
      console.log(".tex exportado");
    });
  } else {
    console.warn("exportTexButton no encontrado");
  }

  // Exportar .zip con proyecto
  if (exportZipButton) {
    exportZipButton.addEventListener('click', async () => {
      console.log("Exportando .zip");
      if (!preambleEditor || !mainEditor) {
        console.warn("Faltan editores para exportar .zip");
        return;
      }
      const zip = new JSZip();
      zip.file('document.tex', preambleEditor.getValue() + mainEditor.getValue());
      console.log("document.tex agregado a ZIP");
      zip.file('refs.bib', bibEditor ? bibEditor.getValue() : '');
      console.log("refs.bib agregado a ZIP");
      images.forEach(img => {
        zip.file(img.name, atob(img.data), { base64: true });
        console.log("Imagen agregada a ZIP:", img.name);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'latex_project.zip';
      a.click();
      URL.revokeObjectURL(url);
      console.log(".zip exportado");
    });
  } else {
    console.warn("exportZipButton no encontrado");
  }

  // Historial de versiones
  if (saveVersionButton && versionsList) {
    saveVersionButton.addEventListener('click', () => {
      console.log("Guardando versión");
      if (!preambleEditor || !mainEditor || !bibEditor) {
        console.warn("Faltan editores para guardar versión");
        return;
      }
      versions.push({
        preamble: preambleEditor.getValue(),
        main: mainEditor.getValue(),
        bib: bibEditor.getValue()
      });
      localStorage.setItem('versions', JSON.stringify(versions));
      console.log("Versión guardada, total:", versions.length);
      renderVersions();
    });
    renderVersions();
  } else {
    console.warn("saveVersionButton o versionsList no encontrado");
  }

  function renderVersions() {
    console.log("Renderizando versiones");
    versionsList.innerHTML = '';
    versions.forEach((v, i) => {
      const btn = document.createElement('button');
      btn.textContent = `Versión ${i + 1}`;
      btn.addEventListener('click', () => {
        console.log("Cargando versión:", i + 1);
        if (preambleEditor) {
          preambleEditor.setValue(v.preamble);
        }
        if (mainEditor) {
          mainEditor.setValue(v.main);
        }
        if (bibEditor) {
          bibEditor.setValue(v.bib);
        }
        updateSidebar();
      });
      versionsList.appendChild(btn);
    });
    console.log("Versiones renderizadas:", versions.length);
  }

  // Análisis de texto (repeticiones, consistencia)
  if (analyzeButton && analysisOutput && mainEditor) {
    analyzeButton.addEventListener('click', () => {
      console.log("Analizando texto");
      const text = mainEditor.getValue().replace(/\\[a-zA-Z]+/g, '').replace(/[{}[]]/g, ''); // Quitar comandos LaTeX
      const words = text.split(/\s+/).filter(w => w.length > 3);
      const freq = {};
      words.forEach(w => freq[w] = (freq[w] || 0) + 1);
      const reps = Object.entries(freq).filter(([, c]) => c > 5).map(([w, c]) => `${w}: ${c}`).join(', ');
      const longSent = text.split(/[.!?]/).filter(s => s.split(/\s+/).length > 30).length;
      analysisOutput.innerHTML = `Repeticiones frecuentes: ${reps || 'Ninguna'}<br>Oraciones largas: ${longSent}`; // Agregar más análisis como densidad (palabras únicas / total)
      console.log("Análisis completado:", { reps, longSent });
    });
  } else {
    console.warn("analyzeButton, analysisOutput o mainEditor no encontrado");
  }

  console.log("tools/text.js - Fin de DOMContentLoaded");
});
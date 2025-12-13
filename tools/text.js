// tools/text.js
console.log("tools/text.js cargado correctamente (CodeMirror 5 + PDFTeX)");

document.addEventListener('DOMContentLoaded', () => {
    console.log("tools/text.js - Inicio de DOMContentLoaded");

    // ==========================================
    // 1. CONFIGURACIÓN Y TEMPLATES
    // ==========================================
    const templates = {
        'APA': `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{geometry}\n\\geometry{margin=1in}\n\\usepackage{setspace}\n\\doublespacing\n\\usepackage{natbib}\n\\bibpunct{(}{)}{;}{a}{,}{,}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
        'Chicago': `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{geometry}\n\\geometry{margin=1in}\n\\usepackage{chicago}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
        'IEEE': `\\documentclass[conference]{IEEEtran}\n\\usepackage[utf8]{inputenc}\n\\usepackage{cite}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
        'Springer': `\\documentclass{svjour3}\n\\usepackage[utf8]{inputenc}\n\\usepackage{natbib}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
        'Elsevier': `\\documentclass{elsarticle}\n\\usepackage[utf8]{inputenc}\n\\usepackage{natbib}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
        'Tesis Chilena': `\\documentclass{book}\n\\usepackage[spanish]{babel}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage{geometry}\n\\geometry{a4paper, margin=2.5cm}\n\\usepackage{natbib}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{caption}\n\\usepackage{subcaption}\n`,
    };

    // ==========================================
    // 2. CAPTURA DE ELEMENTOS DOM
    // ==========================================
    const ui = {
        templateSelect: document.getElementById('template-select'),
        generateStructureButton: document.getElementById('generate-structure'),
        preambleEditorElem: document.getElementById('preamble-editor'),
        mainEditorElem: document.getElementById('main-editor'),
        bibEditorElem: document.getElementById('bib-editor'),
        sidebar: document.getElementById('sidebar'),
        doiInput: document.getElementById('doi-input'),
        fetchBibButton: document.getElementById('fetch-bib'),
        isbnInput: document.getElementById('isbn-input'),
        fetchIsbnButton: document.getElementById('fetch-isbn'),
        compileButton: document.getElementById('compile-pdf'),
        pdfPreview: document.getElementById('pdf-preview'),
        exportTexButton: document.getElementById('export-tex'),
        exportZipButton: document.getElementById('export-zip'),
        saveVersionButton: document.getElementById('save-version'),
        versionsList: document.getElementById('versions-list'),
        analyzeButton: document.getElementById('analyze-text'),
        analysisOutput: document.getElementById('analysis-output'),
        darkModeToggle: document.getElementById('dark-mode-toggle'),
        importZip: document.getElementById('import-zip'),
        importTex: document.getElementById('import-tex'),
        importBib: document.getElementById('import-bib'),
        compileLog: document.getElementById('compile-log'),
        // Botones de inserción
        insertFigureBtn: document.getElementById('insert-figure'),
        insertButtons: {
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
        }
    };

    // Variables de Estado
    let preambleEditor, mainEditor, bibEditor;
    let versions = JSON.parse(localStorage.getItem('versions')) || [];
    let images = []; // Array de {name, base64}
    
    // Instancia global del compilador (lazy loading)
    let pdftexInstance = null; 

    // ==========================================
    // 3. INICIALIZACIÓN DE EDITORES (CodeMirror)
    // ==========================================
    const editorOptions = {
        lineNumbers: true,
        matchBrackets: true,
        styleActiveLine: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        mode: "stex"
    };

    if (ui.preambleEditorElem) {
        preambleEditor = CodeMirror(ui.preambleEditorElem, {
            value: '\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{graphicx}\n',
            ...editorOptions
        });
    }

    if (ui.mainEditorElem) {
        mainEditor = CodeMirror(ui.mainEditorElem, {
            value: '\\begin{document}\nHola mundo\n\\end{document}',
            ...editorOptions
        });
        mainEditor.on("change", updateSidebar);
    }

    if (ui.bibEditorElem) {
        bibEditor = CodeMirror(ui.bibEditorElem, {
            value: '',
            ...editorOptions
        });
    }

    // ==========================================
    // 4. LÓGICA DE COMPILACIÓN (Integración Core)
    // ==========================================
    
    // Función auxiliar para loguear en la UI
    function logCompile(msg, type = 'info') {
        if (ui.compileLog) {
            const color = type === 'error' ? 'red' : (type === 'success' ? 'green' : 'black');
            ui.compileLog.innerHTML += `<div style="color:${color}">[${new Date().toLocaleTimeString()}] ${msg}</div>`;
            ui.compileLog.scrollTop = ui.compileLog.scrollHeight;
        }
        console.log(`[Compile]: ${msg}`);
    }

    async function runCompilation() {
        if (!preambleEditor || !mainEditor) {
            alert("Faltan los editores principales.");
            return;
        }

        // 1. UI Feedback: Bloquear botón
        const originalText = ui.compileButton.textContent;
        ui.compileButton.disabled = true;
        ui.compileButton.textContent = "⏳ Compilando...";
        ui.pdfPreview.style.opacity = "0.5";
        
        try {
            logCompile("Iniciando proceso de compilación...");

            // 2. Inicializar PDFTeX si no existe
            if (!pdftexInstance) {
                if (typeof PDFTeX === 'undefined') {
                    throw new Error("La librería PDFTeX no está cargada. Verifica los scripts.");
                }
                pdftexInstance = new PDFTeX();
                logCompile("Motor PDFTeX inicializado.");
            }

            // 3. Preparar archivos
            const fullLatex = preambleEditor.getValue() + '\n' + mainEditor.getValue();
            const bibContent = bibEditor ? bibEditor.getValue() : '';

            // Reiniciar FS virtual si es necesario (depende de la implementación de la librería,
            // pero escribir sobre los archivos suele ser seguro).
            
            // Escribir main.tex
            pdftexInstance.FS.writeFile('main.tex', fullLatex);
            
            // Escribir refs.bib si existe
            if (bibContent.trim()) {
                pdftexInstance.FS.writeFile('refs.bib', bibContent);
                logCompile("Archivo de bibliografía cargado.");
            }

            // Escribir imágenes
            if (images.length > 0) {
                logCompile(`Procesando ${images.length} imágenes...`);
                images.forEach(img => {
                    try {
                        const binaryString = atob(img.data);
                        const len = binaryString.length;
                        const bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        pdftexInstance.FS.writeFile(img.name, bytes);
                    } catch (err) {
                        console.error(`Error procesando imagen ${img.name}`, err);
                        logCompile(`Error en imagen ${img.name}`, 'error');
                    }
                });
            }

            // 4. Ejecutar Compilación
            // Nota: pdftex.compile usualmente devuelve una URL blob o un Uint8Array
            logCompile("Ejecutando pdflatex...");
            const pdfUrl = await pdftexInstance.compile(fullLatex); 
            
            // 5. Mostrar Resultado
            if (ui.pdfPreview) {
                ui.pdfPreview.src = pdfUrl;
                ui.pdfPreview.style.display = 'block';
                ui.pdfPreview.style.opacity = "1";
            }
            
            logCompile("¡Compilación exitosa!", 'success');

        } catch (e) {
            console.error(e);
            logCompile(`Error fatal: ${e.message}`, 'error');
            alert(`Error durante la compilación:\n${e.message}\nVerifica la consola para más detalles.`);
        } finally {
            // Restaurar botón
            ui.compileButton.disabled = false;
            ui.compileButton.textContent = originalText;
        }
    }

    if (ui.compileButton) {
        ui.compileButton.addEventListener('click', runCompilation);
    }

    // ==========================================
    // 5. FUNCIONES AUXILIARES Y EVENTOS
    // ==========================================

    // Generar Estructura
    if (ui.generateStructureButton && ui.templateSelect) {
        ui.generateStructureButton.addEventListener('click', () => {
            const template = ui.templateSelect.value;
            preambleEditor.setValue(templates[template] || templates['APA']);
            mainEditor.setValue('\\begin{document}\n\\maketitle\n\n\\section{Introducci\\\'on}\nEscribe aqu\\\'i...\n\n\\section{Metodolog\\\'ia}\n...\n\n\\section{Conclusiones}\n...\n\n\\bibliographystyle{plainnat}\n\\bibliography{refs}\n\\end{document}');
            if(bibEditor) bibEditor.setValue('');
            updateSidebar();
        });
    }

    // Insertar elementos
    function insertAtCursor(editor, text) {
        if (!editor) return;
        const cursor = editor.getCursor();
        editor.replaceRange(text, cursor);
        editor.focus();
    }

    Object.keys(ui.insertButtons).forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => insertAtCursor(mainEditor, ui.insertButtons[id]));
    });

    // Inserción de Imágenes
    if (ui.insertFigureBtn) {
        ui.insertFigureBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (r) => {
                    const name = sanitizeFilename(file.name);
                    // Guardamos la data pura (sin header) para el compilador, pero mostramos el tag
                    const base64Clean = r.target.result.split(',')[1];
                    images.push({ name, data: base64Clean });
                    
                    insertAtCursor(mainEditor, 
                        `\\begin{figure}[h]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{${name}}\n\\caption{Descripción de la figura}\n\\label{fig:${name.split('.')[0]}}\n\\end{figure}`
                    );
                    logCompile(`Imagen cargada en memoria: ${name}`);
                };
                reader.readAsDataURL(file);
            };
            input.click();
        });
    }

    function sanitizeFilename(name) {
        return name.replace(/[^a-zA-Z0-9.-]/g, '_');
    }

    // Actualizar Sidebar
    function updateSidebar() {
        if (!ui.sidebar || !mainEditor) return;
        ui.sidebar.innerHTML = '<strong>Navegación:</strong><br>';
        const lines = mainEditor.getValue().split("\n");
        lines.forEach((line, i) => {
            const match = line.match(/\\(chapter|section|subsection|subsubsection){([^{}]+)}/);
            if (match) {
                const level = { chapter: 0, section: 1, subsection: 2, subsubsection: 3 }[match[1]];
                const item = document.createElement('div');
                item.textContent = match[2];
                item.className = 'sidebar-item';
                item.style.paddingLeft = `${level * 10}px`;
                item.style.cursor = 'pointer';
                item.onclick = () => {
                    mainEditor.scrollIntoView({ line: i, ch: 0 });
                    mainEditor.focus();
                };
                ui.sidebar.appendChild(item);
            }
        });
    }

    // Modo Oscuro
    if (ui.darkModeToggle) {
        ui.darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('darkMode', document.body.classList.contains('dark'));
            [preambleEditor, mainEditor, bibEditor].forEach(ed => ed && ed.refresh());
        });
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark');
        }
    }

    // Fetch BibTeX (DOI/ISBN)
    async function fetchBibData(url, sourceName) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network error');
            const data = await response.text(); // o json según caso
            return data;
        } catch (e) {
            alert(`Error obteniendo datos de ${sourceName}: ${e.message}`);
            return null;
        }
    }

    if (ui.fetchBibButton && ui.doiInput) {
        ui.fetchBibButton.addEventListener('click', async () => {
            const doi = ui.doiInput.value.trim();
            if (!doi) return;
            const bib = await fetchBibData(`https://api.crossref.org/works/${doi}/transform/application/x-bibtex`, 'DOI');
            if (bib) bibEditor.setValue(bibEditor.getValue() + '\n' + bib);
        });
    }

    // Importar/Exportar Zip y Archivos (Lógica simplificada para brevedad, usando JSZip)
    if (ui.exportZipButton) {
        ui.exportZipButton.addEventListener('click', async () => {
            if (typeof JSZip === 'undefined') { alert("JSZip no cargado"); return; }
            const zip = new JSZip();
            zip.file('main.tex', preambleEditor.getValue() + '\n' + mainEditor.getValue());
            if (bibEditor) zip.file('refs.bib', bibEditor.getValue());
            images.forEach(img => zip.file(img.name, img.data, {base64: true}));
            
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'proyecto_latex.zip';
            a.click();
        });
    }

    console.log("tools/text.js - Inicialización completa");
});
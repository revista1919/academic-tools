// tools/text.js
document.addEventListener('DOMContentLoaded', () => {
    // Libraries assumed loaded: KaTeX, html2canvas (for math image), JSZip, bibtex-parse-js, pdf.js (for PDF preview if needed), texlive.js for compilation
    const templates = {
        'APA': `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{geometry}\n\\geometry{margin=1in}\n\\usepackage{setspace}\n\\doublespacing\n`,
        'Chicago': `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{geometry}\n\\geometry{margin=1in}\n`,
        'IEEE': `\\documentclass[conference]{IEEEtran}\n\\usepackage[utf8]{inputenc}\n`,
        'Springer': `\\documentclass{svjour3}\n\\usepackage[utf8]{inputenc}\n`,
        'Elsevier': `\\documentclass{elsarticle}\n\\usepackage[utf8]{inputenc}\n`,
        'Tesis Chilena': `\\documentclass{book}\n\\usepackage[spanish]{babel}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage{geometry}\n\\geometry{a4paper, margin=2.5cm}\n`,
        // Add more
    };

    const templateSelect = document.getElementById('template-select');
    const generateStructureButton = document.getElementById('generate-structure');
    const editor = document.getElementById('editor');
    const sidebar = document.getElementById('sidebar');
    const preambleTextarea = document.getElementById('preamble');
    const bibList = document.getElementById('bib-list');
    const doiInput = document.getElementById('doi-input');
    const fetchBibButton = document.getElementById('fetch-bib');
    const isbnInput = document.getElementById('isbn-input');
    const fetchIsbnButton = document.getElementById('fetch-isbn');
    const convertButton = document.getElementById('convert-to-latex');
    const latexOutput = document.getElementById('latex-output');
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
    const textCount = document.getElementById('text-count');
    const cleanButton = document.getElementById('clean-text');

    let bibEntries = []; // Array of bib objects
    let versions = JSON.parse(localStorage.getItem('versions')) || [];
    let images = []; // {name, data} for figures
    let pdftex; // PDFTeX instance

    // Init PDFTeX
    if (compileButton) {
        pdftex = new PDFTeX();
        pdftex.set_TEXINPUTS(".:/texmf:"); // Adjust if needed
    }

    // Dark mode
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('darkMode', document.body.classList.contains('dark'));
        });
        if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');
    }

    // Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey) {
            switch (e.key) {
                case 'b': document.execCommand('bold'); break;
                case 'i': document.execCommand('italic'); break;
                case '1': document.execCommand('formatBlock', false, 'h1'); break;
                case '2': document.execCommand('formatBlock', false, 'h2'); break;
                case 'l': document.execCommand('insertUnorderedList'); break;
                // Add more
            }
        }
    });

    // Update count
    if (editor && textCount) {
        editor.addEventListener('input', updateCount);
        function updateCount() {
            const text = editor.innerText.trim();
            const words = text ? text.split(/\s+/).length : 0;
            const chars = text.length;
            const paras = editor.querySelectorAll('p').length || 1;
            const citations = editor.querySelectorAll('.cite').length;
            textCount.innerHTML = `Palabras: ${words} | Caracteres: ${chars} | Párrafos: ${paras} | Citas: ${citations}`;
            updateSidebar();
        }
        updateCount();
    }

    // Update sidebar with structure
    function updateSidebar() {
        if (sidebar) {
            sidebar.innerHTML = '';
            const headings = editor.querySelectorAll('h1, h2, h3');
            headings.forEach(h => {
                const item = document.createElement('div');
                item.textContent = h.textContent;
                item.classList.add('sidebar-item', `level-${h.tagName[1]}`);
                item.addEventListener('click', () => h.scrollIntoView());
                sidebar.appendChild(item);
            });
        }
    }

    // Generate structure
    if (generateStructureButton && templateSelect && preambleTextarea && editor) {
        generateStructureButton.addEventListener('click', () => {
            const template = templateSelect.value;
            preambleTextarea.value = templates[template] || templates['APA'];
            editor.innerHTML = '<h1>Introducción</h1><p>Escribe aquí...</p><h1>Metodología</h1><p>...</p><h1>Conclusiones</h1><p>...</p>';
            updateSidebar();
        });
    }

    // Toolbar buttons
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const h1Btn = document.getElementById('h1-btn');
    const h2Btn = document.getElementById('h2-btn');
    const ulBtn = document.getElementById('ul-btn');
    const olBtn = document.getElementById('ol-btn');
    const citeBtn = document.getElementById('cite-btn');
    const mathBtn = document.getElementById('math-btn');
    const figureBtn = document.getElementById('figure-btn');

    if (boldBtn) boldBtn.addEventListener('click', () => document.execCommand('bold'));
    if (italicBtn) italicBtn.addEventListener('click', () => document.execCommand('italic'));
    if (h1Btn) h1Btn.addEventListener('click', () => document.execCommand('formatBlock', false, 'h1'));
    if (h2Btn) h2Btn.addEventListener('click', () => document.execCommand('formatBlock', false, 'h2'));
    if (ulBtn) ulBtn.addEventListener('click', () => document.execCommand('insertUnorderedList'));
    if (olBtn) olBtn.addEventListener('click', () => document.execCommand('insertOrderedList'));
    if (citeBtn) citeBtn.addEventListener('click', insertCite);
    if (mathBtn) mathBtn.addEventListener('click', insertMath);
    if (figureBtn) figureBtn.addEventListener('click', insertFigure);

    function insertCite() {
        const key = prompt('Clave de cita (e.g., autor2020)');
        if (key) {
            const span = document.createElement('span');
            span.classList.add('cite');
            span.dataset.key = key;
            span.textContent = `[\\cite{${key}}]`;
            document.execCommand('insertHTML', false, span.outerHTML);
        }
    }

    function insertMath() {
        const latex = prompt('Fórmula LaTeX');
        if (latex) {
            const span = document.createElement('span');
            span.classList.add('math');
            span.dataset.latex = latex;
            katex.render(latex, span, { throwOnError: false });
            document.execCommand('insertHTML', false, span.outerHTML);
        }
    }

    function insertFigure() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (r) => {
                const img = document.createElement('img');
                img.src = r.target.result;
                img.alt = prompt('Caption');
                img.dataset.label = prompt('Label');
                img.style.width = '200px';
                const name = file.name;
                images.push({name, data: r.target.result.split(',')[1]}); // base64
                document.execCommand('insertHTML', false, img.outerHTML);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    // Fetch Bib from DOI
    if (fetchBibButton && doiInput && bibList) {
        fetchBibButton.addEventListener('click', async () => {
            const doi = doiInput.value.trim();
            if (!doi) return;
            try {
                const response = await fetch(`https://api.crossref.org/works/${doi}/transform/application/x-bibtex`);
                const bibtext = await response.text();
                const entries = bibtexParse.toJSON(bibtext);
                bibEntries.push(...entries);
                renderBibList();
            } catch (e) {
                alert('Error fetching BibTeX: ' + e.message);
            }
        });
    }

    // Fetch from ISBN
    if (fetchIsbnButton && isbnInput && bibList) {
        fetchIsbnButton.addEventListener('click', async () => {
            const isbn = isbnInput.value.trim();
            if (!isbn) return;
            try {
                const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
                const data = await response.json();
                const entry = {
                    '@type': 'book',
                    author: data.authors.map(a => a.name).join(' and '),
                    title: data.title,
                    year: data.publish_date.split(' ')[2] || new Date().getFullYear(),
                    publisher: data.publishers[0],
                    key: (data.authors[0].name.split(' ')[1] + data.publish_date.split(' ')[2]).toLowerCase()
                };
                bibEntries.push(entry);
                renderBibList();
            } catch (e) {
                alert('Error fetching ISBN: ' + e.message);
            }
        });
    }

    function renderBibList() {
        bibList.innerHTML = '';
        bibEntries.forEach((entry, i) => {
            const div = document.createElement('div');
            div.textContent = `${entry.key}: ${entry.title} by ${entry.author} (${entry.year})`;
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Eliminar';
            removeBtn.addEventListener('click', () => {
                bibEntries.splice(i, 1);
                renderBibList();
            });
            div.appendChild(removeBtn);
            bibList.appendChild(div);
        });
    }

    // Clean text (for pasted)
    if (cleanButton && editor) {
        cleanButton.addEventListener('click', () => {
            let text = editor.innerText;
            text = text.replace(/-\s*\n/g, '');
            text = text.replace(/\n+/g, '\n');
            text = text.replace(/\s+/g, ' ');
            text = text.replace(/([a-záéíóú])\n([a-záéíóú])/g, '$1 $2');
            editor.innerText = text.trim();
            updateCount();
        });
    }

    // Convert to LaTeX
    if (convertButton && editor && latexOutput) {
        convertButton.addEventListener('click', () => {
            const latex = convertHtmlToLatex(editor);
            latexOutput.textContent = latex;
        });
    }

    function convertHtmlToLatex(node) {
        let latex = '';
        Array.from(node.childNodes).forEach(child => {
            if (child.nodeType === 3) { // Text
                latex += child.textContent.replace(/&/g, '\\&').replace(/%/g, '\\%').replace(/\$/g, '\\$').replace(/_/g, '\\_').replace(/#/g, '\\#').replace(/"([^"]*)"/g, '``$1\'\'');
            } else if (child.nodeType === 1) {
                switch (child.tagName.toLowerCase()) {
                    case 'b': case 'strong': latex += `\\textbf{${convertHtmlToLatex(child)}}`; break;
                    case 'i': case 'em': latex += `\\textit{${convertHtmlToLatex(child)}}`; break;
                    case 'h1': latex += `\\chapter{${convertHtmlToLatex(child)}}\n`; break;
                    case 'h2': latex += `\\section{${convertHtmlToLatex(child)}}\n`; break;
                    case 'h3': latex += `\\subsection{${convertHtmlToLatex(child)}}\n`; break;
                    case 'ul': latex += `\\begin{itemize}\n${Array.from(child.children).map(li => `\\item ${convertHtmlToLatex(li)}\n`).join('')}\\end{itemize}\n`; break;
                    case 'ol': latex += `\\begin{enumerate}\n${Array.from(child.children).map(li => `\\item ${convertHtmlToLatex(li)}\n`).join('')}\\end{enumerate}\n`; break;
                    case 'p': latex += `${convertHtmlToLatex(child)}\n\n`; break;
                    case 'span':
                        if (child.classList.contains('cite')) latex += `\\cite{${child.dataset.key}}`;
                        if (child.classList.contains('math')) latex += `\\(${child.dataset.latex}\\)`; 
                        break;
                    case 'img':
                        const name = images.find(img => img.data === child.src.split(',')[1]).name;
                        latex += `\\begin{figure}[h]\n\\centering\n\\includegraphics[width=\\textwidth]{${name}}\n\\caption{${child.alt}}\n\\label{${child.dataset.label}}\n\\end{figure}\n`;
                        break;
                    // Add table, etc.
                    default: latex += convertHtmlToLatex(child);
                }
            }
        });
        return latex;
    }

    // Compile to PDF
    if (compileButton && latexOutput && pdfPreview) {
        compileButton.addEventListener('click', async () => {
            const preamble = preambleTextarea.value;
            const body = convertHtmlToLatex(editor);
            const bibLatex = '\\begin{thebibliography}{99}\n' + bibEntries.map(entry => `\\bibitem{${entry.key}} ${entry.author} (${entry.year}). ${entry.title}. ${entry.journal || entry.publisher || ''}.\n`).join('') + '\\end{thebibliography}\n';
            const fullLatex = preamble + '\\begin{document}\n' + body + bibLatex + '\\end{document}';
            // Add images
            images.forEach(img => {
                const binary = atob(img.data);
                const array = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
                pdftex.add_file(img.name, array);
            });
            try {
                const pdfUrl = await pdftex.compile(fullLatex);
                pdfPreview.src = pdfUrl;
                pdfPreview.style.display = 'block';
            } catch (e) {
                alert('Error compiling: ' + e.message);
            }
        });
    }

    // Export .tex
    if (exportTexButton && latexOutput) {
        exportTexButton.addEventListener('click', () => {
            const blob = new Blob([latexOutput.textContent], { type: 'text/plain' });
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
            zip.file('document.tex', latexOutput.textContent);
            bibEntries.forEach((entry, i) => zip.file(`ref${i}.bib`, bibtexParse.toBibtex([entry])));
            images.forEach(img => zip.file(img.name, atob(img.data), {base64: true}));
            const content = await zip.generateAsync({type: 'blob'});
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'project.zip';
            a.click();
        });
    }

    // Version history
    if (saveVersionButton && versionsList && editor) {
        saveVersionButton.addEventListener('click', () => {
            versions.push(editor.innerHTML);
            localStorage.setItem('versions', JSON.stringify(versions));
            renderVersions();
        });
        renderVersions();
    }

    function renderVersions() {
        versionsList.innerHTML = '';
        versions.forEach((v, i) => {
            const btn = document.createElement('button');
            btn.textContent = `Versión ${i+1}`;
            btn.addEventListener('click', () => editor.innerHTML = v);
            versionsList.appendChild(btn);
        });
    }

    // Analysis
    if (analyzeButton && analysisOutput && editor) {
        analyzeButton.addEventListener('click', () => {
            const text = editor.innerText;
            const words = text.split(/\s+/);
            const wordFreq = {};
            words.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1);
            const repetitions = Object.entries(wordFreq).filter(([w, c]) => c > 5 && w.length > 3).map(([w, c]) => `${w}: ${c}`).join(', ');
            const sentences = text.split(/[.!?]/);
            const longParas = sentences.filter(s => s.split(/\s+/).length > 20).length;
            analysisOutput.innerHTML = `Repeticiones: ${repetitions || 'Ninguna'}<br>Párrafos largos: ${longParas}`;
            // Add more analysis
        });
    }

    // Simple "AI" expand
    if (expandButton && editor) {
        expandButton.addEventListener('click', () => {
            const selection = window.getSelection();
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                const text = range.toString();
                const expanded = `In the academic context, ${text}. Furthermore, this implies that...`; // Simple rule
                range.deleteContents();
                range.insertNode(document.createTextNode(expanded));
            }
        });
    }

    // Simple rewrite
    if (rewriteButton && editor) {
        rewriteButton.addEventListener('click', () => {
            const selection = window.getSelection();
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                const text = range.toString();
                const rewritten = `This paper introduces ${text.split('.')[0]}. The following sections explore...`; // Simple
                range.deleteContents();
                range.insertNode(document.createTextNode(rewritten));
            }
        });
    }
});
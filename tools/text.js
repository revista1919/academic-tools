console.log("text.js cargado correctamente (CodeMirror 5)");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM listo - creando editores CodeMirror 5");

    const editorOptions = {
        lineNumbers: true,
        matchBrackets: true,
        styleActiveLine: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        mode: "stex"  // Modo LaTeX perfecto
    };

    // Preamble
    const preambleEditor = CodeMirror(document.getElementById("preamble-editor"), {
        value: "\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{graphicx}\n",
        ...editorOptions
    });

    // Main
    const mainEditor = CodeMirror(document.getElementById("main-editor"), {
        value: "\\begin{document}\nHola mundo\n\\end{document}",
        ...editorOptions
    });

    // BibTeX (modo texto con highlight básico)
    const bibEditor = CodeMirror(document.getElementById("bib-editor"), {
        value: "",
        mode: "text/x-bibtex",  // Si quieres highlight BibTeX, agrega el mode si lo encuentras; por ahora texto plano funciona
        lineNumbers: true
    });

    console.log("Los 3 editores creados exitosamente");

    // Modo oscuro
    document.getElementById("dark-mode-toggle").addEventListener("click", () => {
        document.body.classList.toggle("dark");
        [preambleEditor, mainEditor, bibEditor].forEach(ed => ed.refresh());
    });

    // Generar estructura
    document.getElementById("generate-structure").addEventListener("click", () => {
        const template = document.getElementById("template-select").value;
        // Aquí puedes expandir con tus templates
        mainEditor.setValue("\\begin{document}\n\\maketitle\n\n\\section{Introducción}\nEscribe aquí...\n\n\\section{Metodología}\n...\n\n\\section{Conclusiones}\n...\n\\bibliography{refs}\n\\end{document}");
        preambleEditor.setValue("\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{graphicx}\n\\usepackage{natbib}\n");
        updateSidebar();
    });

    // Sidebar simple
    function updateSidebar() {
        const sidebar = document.getElementById("sidebar");
        sidebar.innerHTML = "<strong>Secciones:</strong><br>";
        const lines = mainEditor.getValue().split("\n");
        lines.forEach((line, i) => {
            const match = line.match(/^\\(section|subsection|subsubsection){(.*)}/);
            if (match) {
                const item = document.createElement("div");
                item.className = "sidebar-item";
                item.textContent = " " + match[2];
                item.onclick = () => mainEditor.scrollIntoView({line: i, ch: 0});
                sidebar.appendChild(item);
            }
        });
    }
    mainEditor.on("change", updateSidebar);
    updateSidebar();

    console.log("¡Todo funcionando! Deberías ver los editores con highlight LaTeX ahora.");
});
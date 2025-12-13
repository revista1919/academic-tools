console.log("text.js cargado - usando CodeMirror global");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM listo - creando editores");

    // Config común
    const commonConfig = {
        lineNumbers: true,
        matchBrackets: true,
        indentWithTabs: true,
        tabSize: 4
    };

    // Preamble editor (modo TeX/LaTeX)
    const preambleEditor = CodeMirror(document.getElementById("preamble-editor"), {
        value: "\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{graphicx}\n",
        mode: "stex",
        ...commonConfig
    });
    console.log("Preamble creado");

    // Main editor
    const mainEditor = CodeMirror(document.getElementById("main-editor"), {
        value: "\\begin{document}\nHola mundo\n\\end{document}",
        mode: "stex",
        ...commonConfig
    });
    console.log("Main creado");

    // Bib editor (modo plain text por ahora)
    const bibEditor = CodeMirror(document.getElementById("bib-editor"), {
        value: "",
        mode: "text/plain",
        ...commonConfig
    });
    console.log("Bib creado");

    // Dark mode
    document.getElementById("dark-mode-toggle").onclick = () => {
        document.body.classList.toggle("dark");
        [preambleEditor, mainEditor, bibEditor].forEach(ed => ed.refresh());
    };

    // Generar estructura (ejemplo simple)
    document.getElementById("generate-structure").onclick = () => {
        mainEditor.setValue("\\begin{document}\n\\maketitle\n\n\\section{Introducción}\nTexto aquí...\n\\end{document}");
        console.log("Estructura generada");
    };

    // Sidebar básica
    function updateSidebar() {
        const sidebar = document.getElementById("sidebar");
        sidebar.innerHTML = "<strong>Secciones detectadas:</strong><br>";
        const lines = mainEditor.getValue().split("\n");
        lines.forEach((line, i) => {
            if (line.match(/^\\section/)) {
                const item = document.createElement("div");
                item.className = "sidebar-item";
                item.textContent = line.replace(/.*\{(.*)\}.*/, "$1");
                item.onclick = () => mainEditor.scrollIntoView({line: i, ch: 0});
                sidebar.appendChild(item);
            }
        });
    }
    mainEditor.on("change", updateSidebar);
    updateSidebar();

    console.log("¡Editores listos! Deberías verlos con texto ahora.");
});
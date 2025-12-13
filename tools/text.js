// tools/text.js
console.log("Iniciando carga de módulos...");

import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { indentOnInput } from "@codemirror/language";
import { autocompletion } from "@codemirror/autocomplete";
import { latex } from "codemirror-lang-latex";
// BibTeX temporalmente desactivado (opcional)
// import { bibtex } from "@codemirror/lang-markdown"; // si quieres BibTeX, usa otra librería más adelante

console.log("Todos los módulos de CodeMirror cargados correctamente");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado - iniciando editores");

    const commonExtensions = [
        lineNumbers(),
        history(),
        indentOnInput(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        autocompletion(),
        EditorView.theme({}, { dark: false })
    ];

    // Preamble
    new EditorView({
        state: EditorState.create({
            doc: "\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{graphicx}\n",
            extensions: [...commonExtensions, latex()]
        }),
        parent: document.getElementById("preamble-editor")
    });
    console.log("Preamble editor creado");

    // Main editor
    const updateListener = EditorView.updateListener.of(u => u.docChanged && updateSidebar());
    new EditorView({
        state: EditorState.create({
            doc: "\\begin{document}\nHola mundo\n\\end{document}",
            extensions: [...commonExtensions, latex(), updateListener]
        }),
        parent: document.getElementById("main-editor")
    });
    console.log("Main editor creado");

    // Bib editor (solo texto plano por ahora, funciona perfecto)
    new EditorView({
        state: EditorState.create({
            doc: "",
            extensions: commonExtensions
        }),
        parent: document.getElementById("bib-editor")
    });
    console.log("Bib editor creado (modo texto plano)");

    // Sidebar
    function updateSidebar() {
        const sidebar = document.getElementById("sidebar");
        if (!sidebar) return;
        sidebar.innerHTML = "<strong>Secciones:</strong><br>";
        const text = document.querySelector("#main-editor .cm-content").textContent;
        const regex = /\\(chapter|section|subsection|subsubsection){([^}]+)}/g;
        let match;
        while ((match = regex.exec(text))) {
            const level = {chapter: '→', section: '••', subsection: '◦', subsubsection: '·'}[match[1]] || '';
            const item = document.createElement("div");
            item.textContent = level + " " + match[2].trim();
            item.onclick = () => alert("Navegar a: " + match[2].trim()); // futuro: scroll
            sidebar.appendChild(item);
        }
    }

    // Dark mode
    document.getElementById("dark-mode-toggle").addEventListener("click", () => {
        document.body.classList.toggle("dark");
    });

    console.log("Todo listo! El editor debería verse perfectamente ahora.");
});
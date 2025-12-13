// tools/pdf.js
document.addEventListener('DOMContentLoaded', async () => {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
    const PDFLib = window.PDFLib;
    const Sortable = window.Sortable;

    // Función helper para renderizar página en canvas
    async function renderPage(page, scale = 0.5) {
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport }).promise;
        return canvas;
    }

    // Función para detectar página en blanco (analiza si hay poco contenido)
    async function isBlankPage(page) {
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join('').trim();
        return text.length < 50; // Umbral arbitrario, ajustable
    }

    // Unir PDFs
    const mergeUpload = document.getElementById('pdf-upload-merge');
    const mergeButton = document.getElementById('merge-pdf');
    const downloadMerge = document.getElementById('download-merge');

    if (mergeButton && mergeUpload) {
        mergeButton.addEventListener('click', async () => {
            const files = mergeUpload.files;
            if (files.length < 2) {
                alert('Selecciona al menos dos PDFs.');
                return;
            }
            const pdfDoc = await PDFLib.PDFDocument.create();
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const srcDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                const copiedPages = await pdfDoc.copyPages(srcDoc, srcDoc.getPageIndices());
                copiedPages.forEach(page => pdfDoc.addPage(page));
            }
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            downloadMerge.href = URL.createObjectURL(blob);
            downloadMerge.download = 'merged_academic.pdf';
            downloadMerge.style.display = 'block';
            downloadMerge.textContent = 'Descargar PDF Unido';
        });
    }

    // Reordenar páginas
    const reorderUpload = document.getElementById('pdf-upload-reorder');
    const previewReorder = document.getElementById('pdf-preview-reorder');
    const reorderButton = document.getElementById('reorder-pdf');
    const downloadReorder = document.getElementById('download-reorder');
    let pageCanvases = [];

    if (reorderUpload && previewReorder) {
        reorderUpload.addEventListener('change', async () => {
            const file = reorderUpload.files[0];
            if (!file) return;
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            previewReorder.innerHTML = '';
            pageCanvases = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const canvas = await renderPage(page);
                canvas.dataset.pageIndex = i - 1; // 0-based
                previewReorder.appendChild(canvas);
                pageCanvases.push(canvas);
            }
            new Sortable(previewReorder, {
                animation: 150,
                onEnd: () => {
                    // Actualiza order basado en DOM
                }
            });
        });
    }

    if (reorderButton) {
        reorderButton.addEventListener('click', async () => {
            if (!reorderUpload.files[0]) return;
            const arrayBuffer = await reorderUpload.files[0].arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const newPdf = await PDFLib.PDFDocument.create();
            const children = Array.from(previewReorder.children);
            for (const canvas of children) {
                const index = parseInt(canvas.dataset.pageIndex);
                const [copiedPage] = await newPdf.copyPages(pdfDoc, [index]);
                newPdf.addPage(copiedPage);
            }
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            downloadReorder.href = URL.createObjectURL(blob);
            downloadReorder.download = 'reordered_academic.pdf';
            downloadReorder.style.display = 'block';
            downloadReorder.textContent = 'Descargar PDF Reordenado';
        });
    }

    // Seleccionar rangos y eliminar páginas
    const editUpload = document.getElementById('pdf-upload-edit');
    const previewEdit = document.getElementById('pdf-preview-edit');
    const rangeInput = document.getElementById('range-input');
    const selectRangeButton = document.getElementById('select-range');
    const removeBlanksButton = document.getElementById('remove-blanks');
    const saveEditedButton = document.getElementById('save-edited');
    const downloadEdited = document.getElementById('download-edited');
    let editPdfDoc;

    if (editUpload) {
        editUpload.addEventListener('change', async () => {
            const file = editUpload.files[0];
            if (!file) return;
            const arrayBuffer = await file.arrayBuffer();
            editPdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            previewEdit.innerHTML = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const canvas = await renderPage(page, 0.3); // Smaller for preview
                canvas.dataset.pageNum = i;
                previewEdit.appendChild(canvas);
            }
        });
    }

    if (selectRangeButton && rangeInput) {
        selectRangeButton.addEventListener('click', async () => {
            if (!editPdfDoc) return;
            const ranges = rangeInput.value.trim().split(',').map(r => r.trim());
            const pagesToKeep = new Set();
            ranges.forEach(range => {
                if (range.includes('-')) {
                    const [start, end] = range.split('-').map(Number);
                    for (let i = start; i <= end; i++) pagesToKeep.add(i - 1); // 0-based
                } else {
                    pagesToKeep.add(Number(range) - 1);
                }
            });
            const newPdf = await PDFLib.PDFDocument.create();
            const copiedPages = await newPdf.copyPages(editPdfDoc, Array.from(pagesToKeep));
            copiedPages.forEach(page => newPdf.addPage(page));
            editPdfDoc = newPdf; // Update for further edits
            alert('Rangos seleccionados. Usa "Guardar Editado" para descargar.');
        });
    }

    if (removeBlanksButton) {
        removeBlanksButton.addEventListener('click', async () => {
            if (!editUpload.files[0]) return;
            const arrayBuffer = await editUpload.files[0].arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const newPdf = await PDFLib.PDFDocument.create();
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                if (!(await isBlankPage(page))) {
                    const [copiedPage] = await newPdf.copyPages(editPdfDoc, [i - 1]);
                    newPdf.addPage(copiedPage);
                }
            }
            editPdfDoc = newPdf;
            alert('Páginas en blanco eliminadas. Usa "Guardar Editado" para descargar.');
        });
    }

    if (saveEditedButton) {
        saveEditedButton.addEventListener('click', async () => {
            if (!editPdfDoc) return;
            const pdfBytes = await editPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            downloadEdited.href = URL.createObjectURL(blob);
            downloadEdited.download = 'edited_academic.pdf';
            downloadEdited.style.display = 'block';
            downloadEdited.textContent = 'Descargar PDF Editado';
        });
    }

    // Preview simple
    const previewUpload = document.getElementById('pdf-upload-preview');
    const pdfPreview = document.getElementById('pdf-preview');

    if (previewUpload && pdfPreview) {
        previewUpload.addEventListener('change', async () => {
            const file = previewUpload.files[0];
            if (!file) return;
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            pdfPreview.innerHTML = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const canvas = await renderPage(page);
                pdfPreview.appendChild(canvas);
            }
        });
    }

    // Renombrado automático
    const renameUpload = document.getElementById('pdf-upload-rename');
    const renameButton = document.getElementById('rename-pdf');
    const downloadRenamed = document.getElementById('download-renamed');

    if (renameButton && renameUpload) {
        renameButton.addEventListener('click', async () => {
            const file = renameUpload.files[0];
            if (!file) return;
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            let title = pdfDoc.getTitle() || 'Untitled';
            let author = pdfDoc.getAuthor() || 'Unknown';
            title = title.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize for filename
            author = author.replace(/[^a-zA-Z0-9]/g, '_');
            const newName = `${author}_${title}.pdf`;
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            downloadRenamed.href = URL.createObjectURL(blob);
            downloadRenamed.download = newName;
            downloadRenamed.style.display = 'block';
            downloadRenamed.textContent = `Descargar como ${newName}`;
        });
    }
});
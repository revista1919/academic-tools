// tools/pdf.js
document.addEventListener('DOMContentLoaded', async () => {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
    const PDFLib = window.PDFLib;
    const Sortable = window.Sortable;

    // Enhanced helper functions with own ideas
    // Función helper para renderizar página en canvas con zoom support
    async function renderPage(page, scale = 0.5, rotation = 0) {
        const viewport = page.getViewport({ scale, rotation });
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport }).promise;
        return canvas;
    }

    // Función mejorada para detectar página en blanco (analiza texto e imágenes)
    async function isBlankPage(page) {
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join('').trim();
        const ops = await page.getOperatorList();
        const hasImages = ops.fnArray.some(op => op === pdfjsLib.OPS.paintImageXObject); // Detecta imágenes
        return text.length < 50 && !hasImages; // Umbral ajustable, ahora considera imágenes
    }

    // Nueva función para extraer número trailing de filename (del Python script)
    function extractTrailingNumber(filename) {
        const match = filename.match(/(\d+)(?=\.pdf$)/i);
        return match ? parseInt(match[1]) : null;
    }

    // Función para sanitizar nombres de archivos
    function sanitizeFilename(name) {
        return name.replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    // Sesión persistence usando localStorage (idea propia inspirada en Qt session)
    function saveSession(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function loadSession(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    // Unir PDFs - Enhanced con sorting por trailing number y session
    const mergeUpload = document.getElementById('pdf-upload-merge');
    const mergeButton = document.getElementById('merge-pdf');
    const downloadMerge = document.getElementById('download-merge');
    let mergeFiles = loadSession('mergeFiles') || [];

    if (mergeUpload) {
        mergeUpload.addEventListener('change', (e) => {
            const newFiles = Array.from(e.target.files);
            const numbered = [], rest = [];
            newFiles.forEach(file => {
                const num = extractTrailingNumber(file.name);
                if (num !== null) {
                    numbered.push({ num, file });
                } else {
                    rest.push(file);
                }
            });
            numbered.sort((a, b) => a.num - b.num);
            mergeFiles.push(...numbered.map(f => f.file), ...rest);
            saveSession('mergeFiles', mergeFiles.map(f => ({ name: f.name, size: f.size }))); // Solo metadata para session
            // Render dynamic list (más dinámica)
            renderMergeList();
        });
    }

    function renderMergeList() {
        const list = document.getElementById('merge-list');
        if (list) {
            list.innerHTML = '';
            mergeFiles.forEach((file, i) => {
                const item = document.createElement('div');
                item.textContent = `${i+1}: ${file.name}`;
                item.draggable = true; // Drag & drop para reordenar
                list.appendChild(item);
            });
            new Sortable(list, { animation: 150 });
        }
    }

    if (mergeButton) {
        mergeButton.addEventListener('click', async () => {
            if (mergeFiles.length < 2) {
                alert('Selecciona al menos dos PDFs.');
                return;
            }
            const pdfDoc = await PDFLib.PDFDocument.create();
            for (const file of mergeFiles) {
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
            mergeFiles = []; // Clear after merge
            saveSession('mergeFiles', []);
        });
    }

    // Reordenar páginas - Enhanced con previews zoomables y rotation
    const reorderUpload = document.getElementById('pdf-upload-reorder');
    const previewReorder = document.getElementById('pdf-preview-reorder');
    const reorderButton = document.getElementById('reorder-pdf');
    const downloadReorder = document.getElementById('download-reorder');
    let pageCanvases = [];
    let rotations = []; // Nueva: track rotations per page

    if (reorderUpload && previewReorder) {
        reorderUpload.addEventListener('change', async () => {
            const file = reorderUpload.files[0];
            if (!file) return;
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            previewReorder.innerHTML = '';
            pageCanvases = [];
            rotations = new Array(pdf.numPages).fill(0);
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const canvas = await renderPage(page, 0.5, rotations[i-1]);
                canvas.dataset.pageIndex = i - 1;
                const wrapper = document.createElement('div');
                wrapper.appendChild(canvas);
                // Botones dinámicos para rotate y zoom (idea propia)
                const rotateBtn = document.createElement('button');
                rotateBtn.textContent = 'Rotar 90°';
                rotateBtn.addEventListener('click', () => rotatePage(wrapper, i-1));
                wrapper.appendChild(rotateBtn);
                const zoomIn = document.createElement('button');
                zoomIn.textContent = '+';
                zoomIn.addEventListener('click', () => zoomPage(canvas, 1.2));
                wrapper.appendChild(zoomIn);
                const zoomOut = document.createElement('button');
                zoomOut.textContent = '-';
                zoomOut.addEventListener('click', () => zoomPage(canvas, 0.8));
                wrapper.appendChild(zoomOut);
                previewReorder.appendChild(wrapper);
                pageCanvases.push(canvas);
            }
            new Sortable(previewReorder, {
                animation: 150,
                handle: 'canvas', // Drag by canvas
            });
            saveSession('reorderState', { rotations });
        });
    }

    async function rotatePage(wrapper, index) {
        rotations[index] = (rotations[index] + 90) % 360;
        const file = reorderUpload.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(index + 1);
        const newCanvas = await renderPage(page, 0.5, rotations[index]);
        newCanvas.dataset.pageIndex = index;
        wrapper.replaceChild(newCanvas, wrapper.firstChild);
        pageCanvases[index] = newCanvas;
        saveSession('reorderState', { rotations });
    }

    function zoomPage(canvas, factor) {
        canvas.style.transform = `scale(${factor})`; // Simple CSS zoom
    }

    if (reorderButton) {
        reorderButton.addEventListener('click', async () => {
            if (!reorderUpload.files[0]) return;
            const arrayBuffer = await reorderUpload.files[0].arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const newPdf = await PDFLib.PDFDocument.create();
            const children = Array.from(previewReorder.children);
            for (const wrapper of children) {
                const canvas = wrapper.firstChild;
                const index = parseInt(canvas.dataset.pageIndex);
                const [copiedPage] = await newPdf.copyPages(pdfDoc, [index]);
                copiedPage.setRotation(rotations[index]); // Aplicar rotation
                newPdf.addPage(copiedPage);
            }
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            downloadReorder.href = URL.createObjectURL(blob);
            downloadReorder.download = 'reordered_academic.pdf';
            downloadReorder.style.display = 'block';
        });
    }

    // Seleccionar rangos y eliminar páginas - Complexified con auto-detect blanks mejorado y extract pages
    const editUpload = document.getElementById('pdf-upload-edit');
    const previewEdit = document.getElementById('pdf-preview-edit');
    const rangeInput = document.getElementById('range-input');
    const selectRangeButton = document.getElementById('select-range');
    const removeBlanksButton = document.getElementById('remove-blanks');
    const extractButton = document.getElementById('extract-pages'); // Nueva feature
    const saveEditedButton = document.getElementById('save-edited');
    const downloadEdited = document.getElementById('download-edited');
    let editPdfDoc;
    let selectedPages = new Set();

    if (editUpload) {
        editUpload.addEventListener('change', async () => {
            const file = editUpload.files[0];
            if (!file) return;
            const arrayBuffer = await file.arrayBuffer();
            editPdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            previewEdit.innerHTML = '';
            selectedPages.clear();
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const canvas = await renderPage(page, 0.3);
                canvas.dataset.pageNum = i;
                canvas.addEventListener('click', () => toggleSelect(canvas, i-1));
                previewEdit.appendChild(canvas);
            }
            saveSession('editState', Array.from(selectedPages));
        });
    }

    function toggleSelect(canvas, index) {
        if (selectedPages.has(index)) {
            selectedPages.delete(index);
            canvas.style.border = 'none';
        } else {
            selectedPages.add(index);
            canvas.style.border = '2px solid blue';
        }
        saveSession('editState', Array.from(selectedPages));
    }

    if (selectRangeButton && rangeInput) {
        selectRangeButton.addEventListener('click', async () => {
            if (!editPdfDoc) return;
            const ranges = rangeInput.value.trim().split(',').map(r => r.trim());
            selectedPages.clear();
            ranges.forEach(range => {
                if (range.includes('-')) {
                    const [start, end] = range.split('-').map(Number);
                    for (let i = start; i <= end; i++) selectedPages.add(i - 1);
                } else {
                    selectedPages.add(Number(range) - 1);
                }
            });
            // Update previews borders
            Array.from(previewEdit.children).forEach((canvas, i) => {
                canvas.style.border = selectedPages.has(i) ? '2px solid blue' : 'none';
            });
            alert('Rangos seleccionados.');
        });
    }

    if (removeBlanksButton) {
        removeBlanksButton.addEventListener('click', async () => {
            if (!editUpload.files[0]) return;
            const arrayBuffer = await editUpload.files[0].arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            selectedPages.clear();
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                if (!(await isBlankPage(page))) {
                    selectedPages.add(i - 1);
                }
            }
            // Update previews
            Array.from(previewEdit.children).forEach((canvas, i) => {
                canvas.style.display = selectedPages.has(i) ? 'block' : 'none';
            });
            alert('Páginas en blanco eliminadas de selección.');
        });
    }

    // Nueva: Extract pages to new PDF
    if (extractButton) {
        extractButton.addEventListener('click', async () => {
            if (!editPdfDoc || selectedPages.size === 0) return;
            const newPdf = await PDFLib.PDFDocument.create();
            const copiedPages = await newPdf.copyPages(editPdfDoc, Array.from(selectedPages).sort((a,b)=>a-b));
            copiedPages.forEach(page => newPdf.addPage(page));
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'extracted_pages.pdf';
            link.click();
        });
    }

    if (saveEditedButton) {
        saveEditedButton.addEventListener('click', async () => {
            if (!editPdfDoc || selectedPages.size === 0) return;
            const newPdf = await PDFLib.PDFDocument.create();
            const copiedPages = await newPdf.copyPages(editPdfDoc, Array.from(selectedPages).sort((a,b)=>a-b));
            copiedPages.forEach(page => newPdf.addPage(page));
            editPdfDoc = newPdf;
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            downloadEdited.href = URL.createObjectURL(blob);
            downloadEdited.download = 'edited_academic.pdf';
            downloadEdited.style.display = 'block';
        });
    }

    // Preview simple - Enhanced con navigation buttons
    const previewUpload = document.getElementById('pdf-upload-preview');
    const pdfPreview = document.getElementById('pdf-preview');
    let currentPage = 1;
    let previewPdf;

    if (previewUpload && pdfPreview) {
        previewUpload.addEventListener('change', async () => {
            const file = previewUpload.files[0];
            if (!file) return;
            const arrayBuffer = await file.arrayBuffer();
            previewPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            renderPreviewPage(currentPage);
            // Add navigation (idea propia)
            const nav = document.createElement('div');
            const prevBtn = document.createElement('button');
            prevBtn.textContent = 'Anterior';
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderPreviewPage(currentPage);
                }
            });
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Siguiente';
            nextBtn.addEventListener('click', () => {
                if (currentPage < previewPdf.numPages) {
                    currentPage++;
                    renderPreviewPage(currentPage);
                }
            });
            nav.appendChild(prevBtn);
            nav.appendChild(nextBtn);
            pdfPreview.appendChild(nav);
        });
    }

    async function renderPreviewPage(pageNum) {
        pdfPreview.innerHTML = ''; // Clear except nav
        const page = await previewPdf.getPage(pageNum);
        const canvas = await renderPage(page, 1.0);
        pdfPreview.appendChild(canvas);
    }

    // Renombrado automático - Enhanced con más metadata y fallback OCR si no hay metadata (simulado)
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
            let subject = pdfDoc.getSubject() || '';
            // Fallback: Si no hay title, extrae de primera página (simula OCR simple)
            if (title === 'Untitled') {
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const page = await pdf.getPage(1);
                const textContent = await page.getTextContent();
                title = textContent.items[0]?.str || 'Untitled';
            }
            const newName = sanitizeFilename(`${author}_${title}_${subject}.pdf`);
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            downloadRenamed.href = URL.createObjectURL(blob);
            downloadRenamed.download = newName;
            downloadRenamed.style.display = 'block';
            downloadRenamed.textContent = `Descargar como ${newName}`;
        });
    }

    // Cargar sessions iniciales
    renderMergeList();
});
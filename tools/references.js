// tools/references.js
document.addEventListener('DOMContentLoaded', () => {
    // Objeto con formatters por estilo y tipo de referencia
    const formatters = {
        apa: {
            article: (parts) => {
                const [author, year, title, journal, volume, issue, pages, doi] = parts;
                let formatted = `${author} (${year}). ${title}. `;
                if (journal) formatted += `<i>${journal}</i>, `;
                if (volume) formatted += `${volume}`;
                if (issue) formatted += `(${issue})`;
                if (pages) formatted += `, ${pages}`;
                if (doi) formatted += `. https://doi.org/${doi}`;
                return formatted + '.';
            },
            book: (parts) => {
                const [author, year, title, publisher, edition, doi] = parts;
                let formatted = `${author} (${year}). <i>${title}</i>`;
                if (edition) formatted += ` (${edition} ed.)`;
                if (publisher) formatted += `. ${publisher}`;
                if (doi) formatted += `. https://doi.org/${doi}`;
                return formatted + '.';
            },
            website: (parts) => {
                const [author, year, title, siteName, url] = parts;
                return `${author} (${year}). ${title}. <i>${siteName}</i>. ${url}.`;
            }
        },
        chicago: {
            article: (parts) => {
                const [author, year, title, journal, volume, issue, pages, doi] = parts;
                let formatted = `${author}. ${year}. "${title}." `;
                if (journal) formatted += `<i>${journal}</i> `;
                if (volume) formatted += `${volume}`;
                if (issue) formatted += `, no. ${issue}`;
                if (pages) formatted += ` (${pages})`;
                if (doi) formatted += `, https://doi.org/${doi}`;
                return formatted + '.';
            },
            book: (parts) => {
                const [author, year, title, publisher, edition, doi] = parts;
                let formatted = `${author}. ${year}. <i>${title}</i>`;
                if (edition) formatted += ` ${edition} ed.`;
                if (publisher) formatted += ` ${publisher}`;
                if (doi) formatted += `, https://doi.org/${doi}`;
                return formatted + '.';
            },
            website: (parts) => {
                const [author, year, title, siteName, url] = parts;
                return `${author}. ${year}. "${title}." <i>${siteName}</i>, ${url}.`;
            }
        },
        mla: {
            article: (parts) => {
                const [author, title, journal, volume, issue, year, pages, doi] = parts;
                let formatted = `${author}. "${title}." `;
                if (journal) formatted += `<i>${journal}</i>, `;
                if (volume) formatted += `vol. ${volume}, `;
                if (issue) formatted += `no. ${issue}, `;
                formatted += `${year}, `;
                if (pages) formatted += `pp. ${pages}. `;
                if (doi) formatted += `DOI: ${doi}.`;
                return formatted;
            },
            book: (parts) => {
                const [author, title, publisher, edition, year, doi] = parts;
                let formatted = `${author}. <i>${title}</i>.`;
                if (edition) formatted += ` ${edition} ed.,`;
                if (publisher) formatted += ` ${publisher},`;
                formatted += ` ${year}.`;
                if (doi) formatted += ` DOI: ${doi}.`;
                return formatted;
            },
            website: (parts) => {
                const [author, title, siteName, year, url] = parts;
                return `${author}. "${title}." <i>${siteName}</i>, ${year}, ${url}.`;
            }
        }
    };

    // Campos por tipo de referencia
    const refFields = {
        article: ['Autor', 'Año', 'Título', 'Journal', 'Volumen', 'Número', 'Páginas', 'DOI'],
        book: ['Autor', 'Año', 'Título', 'Editorial', 'Edición', 'DOI'],
        website: ['Autor', 'Año', 'Título', 'Nombre del Sitio', 'URL']
    };

    // Parsing de input pipe-separated
    function parseRef(input) {
        return input.split('|').map(p => p.trim());
    }

    // Validación básica
    function validateParts(parts, type) {
        const required = refFields[type] || [];
        return parts.length >= required.length && parts[1] && !isNaN(parts[1]); // Año numérico
    }

    // Función para copiar al portapapeles
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text.replace(/<[^>]+>/g, '')).then(() => {
            alert('Copiado al portapapeles!');
        }).catch(() => {
            alert('Error al copiar.');
        });
    }

    // Sección Formateador single con campos dinámicos y preview live
    const styleSelect = document.getElementById('style-select');
    const refTypeSelect = document.getElementById('ref-type-select');
    const refFormContainer = document.getElementById('ref-form-container');
    const formatButton = document.getElementById('format-ref');
    const formattedRef = document.getElementById('formatted-ref');
    const livePreview = document.getElementById('live-preview');
    const copySingleButton = document.getElementById('copy-single');

    function renderRefFields(type) {
        refFormContainer.innerHTML = '';
        const fields = refFields[type] || [];
        fields.forEach((label, index) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = label;
            input.classList.add('ref-field');
            input.dataset.index = index;
            input.addEventListener('input', updateLivePreview);
            refFormContainer.appendChild(input);
        });
    }

    function getRefParts() {
        const inputs = Array.from(refFormContainer.querySelectorAll('input'));
        return inputs.map(input => input.value.trim());
    }

    function updateLivePreview() {
        const parts = getRefParts();
        const style = styleSelect.value;
        const type = refTypeSelect.value;
        if (parts.some(p => p) && formatters[style] && formatters[style][type]) {
            livePreview.innerHTML = formatters[style][type](parts);
        } else {
            livePreview.innerHTML = '';
        }
    }

    if (refTypeSelect) {
        refTypeSelect.addEventListener('change', () => {
            renderRefFields(refTypeSelect.value);
            updateLivePreview();
        });
        renderRefFields(refTypeSelect.value); // Inicial
    }

    if (styleSelect) {
        styleSelect.addEventListener('change', updateLivePreview);
    }

    if (formatButton) {
        formatButton.addEventListener('click', () => {
            const parts = getRefParts();
            const style = styleSelect.value;
            const type = refTypeSelect.value;
            if (validateParts(parts, type)) {
                formattedRef.innerHTML = formatters[style][type](parts);
            } else {
                formattedRef.innerHTML = '<span class="error">Entrada inválida. Verifica los campos requeridos.</span>';
            }
        });
    }

    if (copySingleButton) {
        copySingleButton.addEventListener('click', () => {
            if (formattedRef.innerHTML) copyToClipboard(formattedRef.innerHTML);
        });
    }

    // Sección Conversión entre estilos con parsing mejorado para texto plano
    const fromStyle = document.getElementById('from-style');
    const toStyle = document.getElementById('to-style');
    const convInput = document.getElementById('conv-input');
    const convertButton = document.getElementById('convert-style');
    const convertedRef = document.getElementById('converted-ref');
    const copyConvButton = document.getElementById('copy-conv');

    // Parsers por estilo (ajustados para texto plano, más flexibles)
    const parsers = {
        apa: (input) => {
            // Article
            const matchArticle = input.match(/^(.*?) \((.*?)\)\. (.*?)\. (.*?), ?(.*?)(\((.*?)\))?, ?(.*?)\.? ?(https?:\/\/doi\.org\/(.*?)\.?)?$/);
            if (matchArticle) {
                return [matchArticle[1], matchArticle[2], matchArticle[3], matchArticle[4], matchArticle[5], matchArticle[7], matchArticle[8], matchArticle[10]];
            }
            // Book
            const matchBook = input.match(/^(.*?) \((.*?)\)\. (.*?)(\. \((.*?) ed\.\))?(\. (.*?))?(\. https?:\/\/doi\.org\/(.*?)\.?)?$/);
            if (matchBook) {
                return [matchBook[1], matchBook[2], matchBook[3], matchBook[7], matchBook[5], matchBook[9]];
            }
            // Website
            const matchWeb = input.match(/^(.*?) \((.*?)\)\. (.*?)\. (.*?). (.*?)\.?$/);
            if (matchWeb) {
                return [matchWeb[1], matchWeb[2], matchWeb[3], matchWeb[4], matchWeb[5]];
            }
            return [];
        },
        chicago: (input) => {
            // Article (flexible)
            const matchArticle = input.match(/^(.*?)\. (\d{4})\. "(.*?)\." (.*?) (\d+)(, no\. (\d+))? \((.*?)\): (.*?), ?(https?:\/\/doi\.org\/(.*?))\.?$/);
            if (matchArticle) {
                return [matchArticle[1], matchArticle[2], matchArticle[3], matchArticle[4], matchArticle[5], matchArticle[7], matchArticle[9], matchArticle[11]];
            }
            // Book
            const matchBook = input.match(/^(.*?)\. (\d{4})\. (.*?)(\. (\d+ ed\.)?)? (.*?), ?(https?:\/\/doi\.org\/(.*?))\.?$/);
            if (matchBook) {
                return [matchBook[1], matchBook[2], matchBook[3], matchBook[6], matchBook[5]?.replace(' ed.', ''), matchBook[8]];
            }
            // Website
            const matchWeb = input.match(/^(.*?)\. (\d{4})\. "(.*?)\." (.*?), (.*?)\.?$/);
            if (matchWeb) {
                return [matchWeb[1], matchWeb[2], matchWeb[3], matchWeb[4], matchWeb[5]];
            }
            return [];
        },
        mla: (input) => {
            // Article
            const matchArticle = input.match(/^(.*?)\. "(.*?)\." (.*?), vol\. (.*?), no\. (.*?), (.*?), pp\. (.*?)\. ?DOI: ?(.*?)\.?$/);
            if (matchArticle) {
                return [matchArticle[1], matchArticle[2], matchArticle[3], matchArticle[4], matchArticle[5], matchArticle[6], matchArticle[7], matchArticle[8]];
            }
            // Book
            const matchBook = input.match(/^(.*?)\. (.*?)(\. (\d+ ed\.),?)? (.*?), (\d{4})\. ?(DOI: (.*?)\.?)?$/);
            if (matchBook) {
                return [matchBook[1], matchBook[2], matchBook[5], matchBook[4]?.replace(' ed.', ''), matchBook[6], matchBook[8]];
            }
            // Website
            const matchWeb = input.match(/^(.*?)\. "(.*?)\." (.*?), (\d{4}), (.*?)\.?$/);
            if (matchWeb) {
                return [matchWeb[1], matchWeb[2], matchWeb[3], matchWeb[4], matchWeb[5]];
            }
            return [];
        }
    };

    if (convertButton) {
        convertButton.addEventListener('click', () => {
            const input = convInput.value.trim();
            if (!input) return;
            const from = fromStyle.value;
            let parts = parsers[from](input);
            if (parts.length < 5) { // Mínimo para website
                convertedRef.innerHTML = '<span class="error">Error al parsear la referencia de origen. Asegúrate de que el formato sea correcto sin etiquetas HTML.</span>';
                return;
            }
            const to = toStyle.value;
            // Inferir tipo basado en parts
            let type = 'article';
            if (parts.length <= 6 && !parts[3]) type = 'book'; // Ajustado
            if (parts.length === 5) type = 'website';
            if (formatters[to][type]) {
                convertedRef.innerHTML = formatters[to][type](parts);
            } else {
                convertedRef.innerHTML = '<span class="error">Tipo de referencia no soportado para conversión.</span>';
            }
        });
    }

    if (copyConvButton) {
        copyConvButton.addEventListener('click', () => {
            if (convertedRef.innerHTML) copyToClipboard(convertedRef.innerHTML);
        });
    }

    // Nueva sección: Generar desde DOI, ISBN o Link
    const metadataInput = document.getElementById('metadata-input');
    const metadataStyle = document.getElementById('metadata-style');
    const fetchButton = document.getElementById('fetch-metadata');
    const generatedRef = document.getElementById('generated-ref');
    const copyGenerated = document.getElementById('copy-generated');

    function formatAuthors(authors) {
        if (!authors || authors.length === 0) return '';
        const formatted = authors.map(a => {
            const givenInitial = a.given ? a.given.split(' ').map(g => g[0] + '.').join(' ') : '';
            return `${a.family}, ${givenInitial}`.trim();
        });
        if (formatted.length > 20) {
            return formatted[0] + ' et al.';
        } else if (formatted.length > 2) {
            return formatted.slice(0, -1).join(', ') + ', & ' + formatted[formatted.length - 1];
        } else if (formatted.length === 2) {
            return formatted.join(' & ');
        } else {
            return formatted[0];
        }
    }

    async function fetchMetadata(input) {
        input = input.trim();
        let doiMatch = input.match(/^(?:https?:\/\/doi\.org\/)?(.+)$/);
        if (doiMatch && doiMatch[1].startsWith('10.')) {
            return await fetchFromDoi(doiMatch[1]);
        } else if (/^(?:\d{10}|\d{13}|978\d{10}|979\d{10})$/.test(input.replace(/-/g, ''))) {
            return await fetchFromIsbn(input.replace(/-/g, ''));
        } else if (input.startsWith('http')) {
            // Intentar como URL general (puede fallar por CORS)
            try {
                const res = await fetch(input);
                const html = await res.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const title = doc.querySelector('title')?.textContent || '';
                const author = doc.querySelector('meta[name="author"]')?.content || 'Autor desconocido';
                const date = doc.querySelector('meta[name="date"]')?.content || new Date().getFullYear();
                const siteName = new URL(input).hostname;
                return {
                    refType: 'website',
                    parts: [author, date, title, siteName, input]
                };
            } catch (e) {
                throw new Error('No se pudo fetch la URL debido a restricciones CORS o error de red. Usa campos manuales para sitios web.');
            }
        } else {
            throw new Error('Formato no reconocido. Prueba con DOI (ej: 10.1234/abc), ISBN (ej: 9780140449136) o URL completa.');
        }
    }

    async function fetchFromDoi(doi) {
        const res = await fetch(`https://api.crossref.org/works/${doi}`);
        if (!res.ok) throw new Error('Error al fetch DOI: ' + res.statusText);
        const data = await res.json();
        const msg = data.message;
        let refType;
        if (msg.type === 'journal-article') refType = 'article';
        else if (msg.type.includes('book')) refType = 'book';
        else throw new Error('Tipo de referencia no soportado: ' + msg.type);
        const authors = formatAuthors(msg.author || []);
        const year = msg.published?.['date-parts']?.[0]?.[0] || msg.issued['date-parts'][0][0] || '';
        const title = msg.title?.[0] || '';
        let parts;
        if (refType === 'article') {
            const journal = msg['container-title']?.[0] || '';
            const volume = msg.volume || '';
            const issue = msg.issue || '';
            const pages = msg.page || '';
            parts = [authors, year, title, journal, volume, issue, pages, doi];
        } else if (refType === 'book') {
            const publisher = msg.publisher || '';
            const edition = msg.edition_number || '';
            parts = [authors, year, title, publisher, edition, doi];
        }
        return { refType, parts };
    }

    async function fetchFromIsbn(isbn) {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        if (!res.ok) throw new Error('Error al fetch ISBN: ' + res.statusText);
        const data = await res.json();
        if (data.totalItems === 0) throw new Error('No se encontró el libro con ese ISBN.');
        const item = data.items[0].volumeInfo;
        const authors = item.authors ? formatAuthors(item.authors.map(a => ({ family: a.split(' ').pop(), given: a.split(' ').slice(0, -1).join(' ') }))) : 'Autor desconocido';
        const year = item.publishedDate?.split('-')[0] || '';
        const title = item.title || '';
        const publisher = item.publisher || '';
        const edition = ''; // No siempre disponible en API
        let doi = '';
        if (item.industryIdentifiers) {
            const doiId = item.industryIdentifiers.find(id => id.type === 'DOI');
            if (doiId) doi = doiId.identifier;
        }
        const parts = [authors, year, title, publisher, edition, doi];
        return { refType: 'book', parts };
    }

    if (fetchButton) {
        fetchButton.addEventListener('click', async () => {
            const input = metadataInput.value.trim();
            const style = metadataStyle.value;
            if (!input) return;
            fetchButton.disabled = true;
            fetchButton.textContent = 'Cargando...';
            try {
                const { refType, parts } = await fetchMetadata(input);
                if (formatters[style][refType]) {
                    generatedRef.innerHTML = formatters[style][refType](parts);
                } else {
                    generatedRef.innerHTML = '<span class="error">Tipo no soportado para el estilo seleccionado.</span>';
                }
            } catch (e) {
                generatedRef.innerHTML = `<span class="error">${e.message}</span>`;
            } finally {
                fetchButton.disabled = false;
                fetchButton.textContent = 'Generar';
            }
        });
    }

    if (copyGenerated) {
        copyGenerated.addEventListener('click', () => {
            if (generatedRef.innerHTML) copyToClipboard(generatedRef.innerHTML);
        });
    }

    // Generador de bibliografía con lista dinámica editable
    const bibStyle = document.getElementById('bib-style');
    const bibListContainer = document.getElementById('bib-list-container');
    const addRefButton = document.getElementById('add-ref');
    const generateButton = document.getElementById('generate-bib');
    const bibOutput = document.getElementById('bib-output');
    const sortSelect = document.getElementById('sort-select');
    const exportButton = document.getElementById('export-bib');
    const importButton = document.getElementById('import-bib');
    const copyBibButton = document.getElementById('copy-bib');
    let refEntries = [];

    function renderBibEntries() {
        bibListContainer.innerHTML = '';
        refEntries.forEach((entry, index) => {
            const div = document.createElement('div');
            div.classList.add('bib-entry');
            const typeSelect = document.createElement('select');
            ['article', 'book', 'website'].forEach(t => {
                const opt = document.createElement('option');
                opt.value = t;
                opt.text = t.charAt(0).toUpperCase() + t.slice(1);
                typeSelect.add(opt);
            });
            typeSelect.value = entry.type;
            typeSelect.addEventListener('change', () => {
                entry.type = typeSelect.value;
                renderFieldsForEntry(div, entry, index);
            });
            div.appendChild(typeSelect);
            renderFieldsForEntry(div, entry, index);
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Eliminar';
            removeBtn.addEventListener('click', () => {
                refEntries.splice(index, 1);
                renderBibEntries();
            });
            div.appendChild(removeBtn);
            bibListContainer.appendChild(div);
        });
    }

    function renderFieldsForEntry(container, entry, index) {
        let fieldsContainer = container.querySelector('.fields');
        if (!fieldsContainer) {
            fieldsContainer = document.createElement('div');
            fieldsContainer.classList.add('fields');
            container.appendChild(fieldsContainer);
        }
        fieldsContainer.innerHTML = '';
        const fields = refFields[entry.type] || [];
        fields.forEach((label, fIndex) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = label;
            input.value = entry.parts[fIndex] || '';
            input.addEventListener('input', () => {
                entry.parts[fIndex] = input.value.trim();
            });
            fieldsContainer.appendChild(input);
        });
    }

    if (addRefButton) {
        addRefButton.addEventListener('click', () => {
            refEntries.push({ type: 'article', parts: [] });
            renderBibEntries();
        });
    }

    if (generateButton) {
        generateButton.addEventListener('click', () => {
            const style = bibStyle.value;
            let outputs = refEntries.map(entry => {
                if (validateParts(entry.parts, entry.type)) {
                    return formatters[style][entry.type](entry.parts);
                }
                return null;
            }).filter(o => o);
            // Ordenar
            const sortBy = sortSelect.value;
            outputs.sort((a, b) => {
                if (sortBy === 'author') {
                    const authorA = a.split(/[ .(]/)[0];
                    const authorB = b.split(/[ .(]/)[0];
                    return authorA.localeCompare(authorB);
                } else if (sortBy === 'year') {
                    const yearA = a.match(/\((.*?)\)/)?.[1] || '0';
                    const yearB = b.match(/\((.*?)\)/)?.[1] || '0';
                    return parseInt(yearA) - parseInt(yearB);
                } else if (sortBy === 'title') {
                    const titleA = a.match(/\. (.*?)(\.|")/)?.[1] || '';
                    const titleB = b.match(/\. (.*?)(\.|")/)?.[1] || '';
                    return titleA.localeCompare(titleB);
                }
                return 0;
            });
            bibOutput.innerHTML = outputs.join('<br><br>');
        });
    }

    if (exportButton) {
        exportButton.addEventListener('click', () => {
            if (bibOutput.innerHTML) {
                const blob = new Blob([bibOutput.innerText.replace(/\n/g, '\r\n')], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'bibliografia.txt';
                a.click();
                URL.revokeObjectURL(url);
            }
        });
    }

    if (importButton) {
        importButton.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const lines = ev.target.result.split(/\r?\n/).filter(line => line.trim());
                    refEntries = lines.map(line => ({ type: 'article', parts: parseRef(line) })); // Asumir article por default
                    renderBibEntries();
                };
                reader.readAsText(file);
            }
        });
    }

    if (copyBibButton) {
        copyBibButton.addEventListener('click', () => {
            if (bibOutput.innerHTML) copyToClipboard(bibOutput.innerHTML);
        });
    }

    // Limpieza de referencias con más reglas
    const cleanInput = document.getElementById('clean-ref-input');
    const cleanButton = document.getElementById('clean-ref');
    const cleanedRef = document.getElementById('cleaned-ref');
    const copyCleanButton = document.getElementById('copy-clean');

    if (cleanButton) {
        cleanButton.addEventListener('click', () => {
            let text = cleanInput.value.trim();
            // Eliminar footnotes, números de página, etc.
            text = text.replace(/(\[\d+\]|\{\d+\}|\(\d+\))|\(pdf page \d+\)|page \d+/gi, '');
            // Eliminar URLs no DOI
            text = text.replace(/http[s]?:\/\/(?!doi\.org).*?(\s|$)/gi, '$1');
            // Normalizar puntuación y espacios
            text = text.replace(/\s+/g, ' ').replace(/([.,:;])/g, '$1 ').replace(/\s+/g, ' ');
            // Intentar extraer parts con regex más inteligente
            const articleMatch = text.match(/(.*?)(?:,| et al\.)? ?\(?(\d{4})\)?\.? ?(.*?)(\. )?(.*?) ?,? ?(\d+)?(\(\d+\))?,? ?(\d+-\d+|\d+)?\.? ?(https?:\/\/doi\.org\/(.*))?$/i);
            if (articleMatch) {
                const parts = [articleMatch[1].trim(), articleMatch[2], articleMatch[3].trim(), articleMatch[5], articleMatch[6], articleMatch[7]?.replace('(', '')?.replace(')', ''), articleMatch[8], articleMatch[10]];
                cleanedRef.innerHTML = parts.filter(p => p).join(' | ');
                return;
            }
            const bookMatch = text.match(/(.*?)(?:,| et al\.)? ?\(?(\d{4})\)?\.? ?(.*?) \.? ?(\d+ ed\.)? ?(.*?)\.? ?(https?:\/\/doi\.org\/(.*))?$/i);
            if (bookMatch) {
                const parts = [bookMatch[1].trim(), bookMatch[2], bookMatch[3].trim(), bookMatch[5], bookMatch[4]?.replace(' ed.', ''), bookMatch[7]];
                cleanedRef.innerHTML = parts.filter(p => p).join(' | ');
                return;
            }
            // Si no match, solo texto limpio
            cleanedRef.innerHTML = text;
        });
    }

    if (copyCleanButton) {
        copyCleanButton.addEventListener('click', () => {
            if (cleanedRef.innerHTML) copyToClipboard(cleanedRef.innerHTML);
        });
    }
});
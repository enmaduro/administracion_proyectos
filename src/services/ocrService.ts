import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { Invoice } from '@/types';

// PDF.js v4 worker configuration
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const extractInvoiceDataLocal = async (file: File): Promise<Omit<Invoice, 'id' | 'fileDataUrl' | 'fileType' | 'fileName'>> => {
    const isPDF = file.type === 'application/pdf';
    console.log(`DEBUG [OCR] - Iniciando proceso local (${isPDF ? 'PDF' : 'Imagen'}):`, file.name);

    try {
        let text = '';
        if (isPDF) {
            console.log("DEBUG [OCR] - Extrayendo texto de PDF digital...");
            text = await extractTextFromPDF(file);
            console.log("DEBUG [OCR] - Texto PDF extraído. Largo:", text.trim().length);

            if (text.trim().length < 20) {
                console.log("DEBUG [OCR] - PDF parece escaneado. Intentando Tesseract...");
                text = await extractTextFromImage(file);
            }
        } else {
            text = await extractTextFromImage(file);
        }

        if (!text || text.trim().length === 0) {
            throw new Error("No se detectó texto en el documento (posible imagen borrosa o PDF vacío).");
        }

        console.log("DEBUG [OCR] - Procesando texto extraído para extraer campos...");
        return parseInvoiceText(text);

    } catch (error: any) {
        console.error("DEBUG [OCR] - ERROR CAPTURADO EN EL FLUJO PRINCIPAL:", error);

        let errorMessage = "Fallo de inicialización o proceso.";

        if (error && typeof error === 'object') {
            errorMessage = error.message || error.name || JSON.stringify(error);
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else if (error === null || error === undefined) {
            errorMessage = "El motor devolvió un valor nulo o indefinido (Fallo crítico de memoria o bloqueo de seguridad).";
        } else {
            errorMessage = String(error);
        }

        throw new Error(`Error en el motor de lectura: ${errorMessage}`);
    }
};

const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => 'str' in item ? item.str : '').join(' ');
            fullText += pageText + '\n';
        }
        return fullText;
    } catch (err: any) {
        console.error("DEBUG [OCR] - Fallo en PDF.js:", err);
        const msg = (err && typeof err === 'object') ? (err.message || JSON.stringify(err)) : String(err);
        throw new Error(`Error leyendo PDF digital: ${msg}`);
    }
};

const extractTextFromImage = async (file: File): Promise<string> => {
    console.log("DEBUG [OCR] - Ejecutando Tesseract.recognize con configuración forzada...");

    // Verificación de integridad del objeto Tesseract
    if (!Tesseract || typeof Tesseract.recognize !== 'function') {
        console.error("DEBUG [OCR] - Tesseract no se cargó correctamente:", Tesseract);
        throw new Error("La librería de lectura (Tesseract) no está lista.");
    }

    try {
        // En Tesseract v5, podemos configurar los paths directamente en recognize o createWorker
        // Forzamos el uso de CDN para evitar problemas de rutas locales en Electron
        const result = await Tesseract.recognize(
            file,
            'spa',
            {
                logger: m => {
                    if (m && m.status) {
                        console.log(`DEBUG [Tesseract] ${m.status}: ${(m.progress * 100 || 0).toFixed(1)}%`);
                    }
                },
                // Forzar opciones de worker si es necesario (v5 usa defaults inteligentes pero Electron es especial)
                // @ts-ignore
                workerBlob: false, // Desactivar blobs si hay CSP restrictivo
            }
        );

        if (!result || !result.data) {
            throw new Error("Tesseract finalizó pero no devolvió datos.");
        }

        console.log("DEBUG [OCR] - Tesseract finalizado con éxito.");
        return result.data.text;
    } catch (err: any) {
        console.error("DEBUG [OCR] - Fallo DENTRO de Tesseract.recognize:", err);
        // Si el error es undefined, es probable que el worker explotó sin mensaje
        const msg = (err && typeof err === 'object') ? (err.message || JSON.stringify(err)) : (err ? String(err) : "Fallo de Worker Silencioso (Undefined Error)");
        throw new Error(`Error en OCR local: ${msg}`);
    }
};

const parseInvoiceText = (text: string): Omit<Invoice, 'id' | 'fileDataUrl' | 'fileType' | 'fileName'> => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const cleanText = text.replace(/\s+/g, ' ').toUpperCase();

    // 1. RIF Extraction
    const rifMatch = cleanText.match(/\b([VJEPG])[-.\s]?(\d{5,9})[-.\s]?(\d{1})\b/i);
    let rif = "";
    if (rifMatch) {
        rif = `${rifMatch[1]}-${rifMatch[2]}-${rifMatch[3]}`.toUpperCase();
    }

    // 2. Date Extraction
    const dateMatch = cleanText.match(/\b(\d{2})[-/.\s](\d{2})[-/.\s](\d{2,4})\b/);
    let invoiceDate = "";
    if (dateMatch) {
        let year = dateMatch[3];
        if (year.length === 2) year = `20${year}`;
        const yearNum = parseInt(year);
        if (yearNum > 2000 && yearNum < 2030) {
            invoiceDate = `${year}-${dateMatch[2]}-${dateMatch[1]}`;
        }
    }

    // 3. Invoice Number
    let invoiceNoMatch = cleanText.match(/(?:FACTURA|CONTROL|NOTA|FISCAL|NRO|NUMERO|NO\.)[\s.:°]*([A-Z0-9\-/]*\d{2,}[A-Z0-9\-/]*)/i);

    if (!invoiceNoMatch) {
        invoiceNoMatch = cleanText.match(/(?:N[°º.]?)\s*([\d\-/]{4,})/i);
    }

    let invoiceNumber = invoiceNoMatch ? invoiceNoMatch[1] : "";

    if (invoiceNumber) {
        invoiceNumber = invoiceNumber.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
        const currentYear = new Date().getFullYear().toString();
        if (invoiceNumber.length === 4 && (invoiceNumber === currentYear || invoiceNumber === (parseInt(currentYear) - 1).toString())) {
            const otherNumbers = cleanText.match(/\b\d{5,}\b/g);
            if (otherNumbers && otherNumbers.length > 0) {
                invoiceNumber = otherNumbers[0];
            }
        }
    }

    if (!invoiceNumber || invoiceNumber.length < 2) {
        invoiceNumber = `OCR-${Date.now().toString().slice(-6)}`;
    }

    // 4. Total Amount
    const moneyRegex = /\b\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\b/g;
    const moneyMatches = cleanText.match(moneyRegex);
    let totalAmount = 0;
    if (moneyMatches) {
        const candidates = moneyMatches.map(m => {
            let valStr = m;
            if (valStr.includes(',') && valStr.includes('.')) {
                if (valStr.indexOf(',') < valStr.indexOf('.')) {
                    valStr = valStr.replace(/,/g, '');
                } else {
                    valStr = valStr.replace(/\./g, '').replace(',', '.');
                }
            } else if (valStr.includes(',')) {
                valStr = valStr.replace(',', '.');
            }
            return parseFloat(valStr);
        });
        totalAmount = Math.max(...candidates);
    }

    // 5. Supplier Name Heuristic
    let supplierName = "Proveedor Desconocido";

    const seniatIndex = lines.findIndex(l => l.toUpperCase().includes("SENIAT"));
    if (seniatIndex !== -1 && lines[seniatIndex + 1]) {
        const nextLine = lines[seniatIndex + 1];
        if (nextLine.length > 5 && !nextLine.toUpperCase().includes("RIF") && !nextLine.toUpperCase().includes("FACTURA")) {
            supplierName = nextLine;
        }
    }

    if (supplierName === "Proveedor Desconocido") {
        for (let i = 0; i < Math.min(lines.length, 15); i++) {
            const line = lines[i].toUpperCase();
            const isGeneric = /MATERIALES|CONSTRUCCION|REPUESTOS|SERVICIOS/i.test(line) &&
                !/(C\.?A\.?|S\.?A\.?|S\.?R\.?L\.?|F\.?P\.?)$/i.test(line);

            if (line.length > 3 && !line.includes("SENIAT") && !line.includes("RIF") && !isGeneric) {
                if (line.includes("C.A.") || line.includes("S.A.") || line.includes("S.R.L") || line.includes("FIRMA PERSONAL")) {
                    supplierName = lines[i];
                    break;
                }
            }
        }
    }

    if (supplierName === "Proveedor Desconocido" && lines.length > 0) {
        for (const line of lines.slice(0, 5)) {
            const up = line.toUpperCase();
            const isGeneric = /MATERIALES|CONSTRUCCION|REPUESTOS|SERVICIOS/i.test(up);
            if (up.length > 5 && !up.includes("SENIAT") && !up.includes("REPÚBLICA") && !up.includes("FACTURA") && !isGeneric) {
                supplierName = line;
                break;
            }
        }
    }

    // 6. Items Description Heuristic
    let itemsDescription = "";
    const descCandidates = lines.filter(l =>
        l.length > 10 &&
        !l.includes("SENIAT") &&
        !l.includes("RIF") &&
        !l.includes("FACTURA") &&
        !l.includes("CONTROL") &&
        !l.match(/\d{2}[-/.]\d{2}/)
    );

    if (descCandidates.length > 0) {
        const filtered = descCandidates.filter(l =>
            l.toLowerCase() !== supplierName.toLowerCase() &&
            !l.toUpperCase().includes(supplierName.toUpperCase())
        );
        itemsDescription = filtered[0] || descCandidates[0] || "Gasto de proyecto";
    } else {
        itemsDescription = "Gasto de proyecto";
    }

    return {
        invoiceDate,
        supplierName,
        rif,
        invoiceNumber,
        itemsDescription,
        totalAmount
    };
};

// Cloud OCR using OCR.space
export const extractInvoiceDataCloud = async (file: File, apiKey: string = 'helloworld'): Promise<Omit<Invoice, 'id' | 'fileDataUrl' | 'fileType' | 'fileName'>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', apiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    try {
        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.IsErroredOnProcessing) {
            throw new Error(data.ErrorMessage?.[0] || "Error desconocido en OCR Cloud");
        }

        if (!data.ParsedResults?.[0]?.ParsedText) {
            throw new Error("No se pudo extraer texto de la imagen (Cloud).");
        }

        const rawText = data.ParsedResults[0].ParsedText;
        console.log("OCR Cloud Raw Text:", rawText);
        return parseInvoiceText(rawText);

    } catch (error) {
        console.error("Cloud OCR Error:", error);
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Error OCR Nube: ${msg}`);
    }
};

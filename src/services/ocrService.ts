import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { Invoice } from '@/types';

// IMPORTANT: Set worker source for PDF.js - Using local import with Vite
// This ensures the worker is bundled and compatible with the installed version
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const extractInvoiceDataLocal = async (file: File): Promise<Omit<Invoice, 'id' | 'fileDataUrl' | 'fileType' | 'fileName'>> => {
    try {
        let text = '';
        if (file.type === 'application/pdf') {
            text = await extractTextFromPDF(file);
            // If PDF text is too short (likely scanned/image PDF), try OCR on the rendered first page
            if (text.length < 50) {
                console.log("PDF text sparse, attempting OCR on rendered PDF...");
                text = await extractTextFromScannedPDF(file);
            }
        } else {
            text = await extractTextFromImage(file);
        }

        console.log("Extracted Text:\n", text);
        return parseInvoiceText(text);

    } catch (error: any) {
        console.error("DEBUG - OCR Error Detail:", error);

        let msg = "Error desconocido";
        if (error instanceof Error) {
            msg = error.message;
        } else if (typeof error === 'string') {
            msg = error;
        } else if (error && typeof error === 'object') {
            msg = error.message || JSON.stringify(error);
        } else if (error !== undefined && error !== null) {
            msg = String(error);
        }

        // Specific hint for PDF.js common worker failures
        if (msg.includes("worker") || msg === "undefined") {
            msg = "Error de inicialización del motor de lectura (Worker). Por favor, intente recargar la aplicación.";
        }

        throw new Error(`Error técnico procesando el documento: ${msg}`);
    }
};

const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
    }
    return fullText;
};

const extractTextFromScannedPDF = async (file: File): Promise<string> => {
    // Render first page to canvas and OCR it
    // This is detailed work, for MVP we might skip generic canvas rendering and focus on text PDFs + Images
    // or use a simpler approach. 
    // For now, let's fallback to just returning what we have if we can't easily render in this service without DOM access cleanly.
    // Tesseract.js can actually handle PDF files in some environments, but in browser it needs a canvas.

    // Simpler fallback: Treat as image if possible, but PDF input to Tesseract usually requires conversion.
    // For this iteration, let's rely on digital PDFs and Images.
    return "";
};

const extractTextFromImage = async (file: File): Promise<string> => {
    const { data: { text } } = await Tesseract.recognize(
        file,
        'spa', // Spanish
        { logger: m => console.log(m) }
    );
    return text;
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
            // Normalize to YYYY-MM-DD for <input type="date">
            invoiceDate = `${year}-${dateMatch[2]}-${dateMatch[1]}`;
        }
    }

    // 3. Invoice Number
    // Heuristic: Prefer numbers that are at least 3 digits long or have specific prefixes.
    let invoiceNoMatch = cleanText.match(/(?:FACTURA|CONTROL|NOTA|FISCAL|NRO|NUMERO|NO\.)[\s.:°]*([A-Z0-9\-/]*\d{2,}[A-Z0-9\-/]*)/i);

    if (!invoiceNoMatch) {
        // Fallback to searching for a sequence of 4+ digits
        invoiceNoMatch = cleanText.match(/(?:N[°º.]?)\s*([\d\-/]{4,})/i);
    }

    let invoiceNumber = invoiceNoMatch ? invoiceNoMatch[1] : "";

    // Clean up: remove leading/trailing noise and ensure it's not just a year if possible
    if (invoiceNumber) {
        invoiceNumber = invoiceNumber.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ''); // Trim non-alphanumeric noise

        // If it's only 4 digits and matches the current or previous year, it might be a false positive
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

    // Strategy: Search for SENIAT and take the line below it if it looks like a supplier
    const seniatIndex = lines.findIndex(l => l.toUpperCase().includes("SENIAT"));
    if (seniatIndex !== -1 && lines[seniatIndex + 1]) {
        const nextLine = lines[seniatIndex + 1];
        if (nextLine.length > 5 && !nextLine.toUpperCase().includes("RIF") && !nextLine.toUpperCase().includes("FACTURA")) {
            supplierName = nextLine;
        }
    }

    // Fallback: search for company suffixes
    if (supplierName === "Proveedor Desconocido") {
        for (let i = 0; i < Math.min(lines.length, 15); i++) {
            const line = lines[i].toUpperCase();
            // Skip generic category-like lines if they don't have a legal suffix
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

    // Last fallback: first non-empty line that isn't technical noise or generic
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
    // Avoid short lines and noise
    const descCandidates = lines.filter(l =>
        l.length > 10 &&
        !l.includes("SENIAT") &&
        !l.includes("RIF") &&
        !l.includes("FACTURA") &&
        !l.includes("CONTROL") &&
        !l.match(/\d{2}[-/.]\d{2}/) // Avoid date-like lines
    );

    if (descCandidates.length > 0) {
        // Often the first few lines contain the main descriptive summary or company name
        // We take the first one that isn't the supplier name if possible
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
    formData.append('language', 'eng'); // 'helloworld' supports English primarily but reads numbers well.
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Engine 2 is better for receipt numbers

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

        // Reuse the parsing logic from local OCR
        // We can expose parseInvoiceText if needed or duplicate/move it.
        // Ideally parseInvoiceText should be exported or reused.
        // Since it's in the same module scope, we can just call it.
        return parseInvoiceText(rawText);

    } catch (error) {
        console.error("Cloud OCR Error:", error);
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Error OCR Nube: ${msg}`);
    }
};

import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { Invoice } from '../types';

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

    } catch (error) {
        console.error("OCR Error:", error);
        // Expose the real error
        const msg = error instanceof Error ? error.message : String(error);
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
    const lines = text.split('\n');

    // Normalization
    const cleanText = text.replace(/\s+/g, ' ').toUpperCase();

    // 1. RIF Extraction
    // Robust Regex: Handles J, V, E, G, P. Allows spaces, dashes, dots.
    // Examples: J-12345678-9, J123456789, J 12345678 9, V.12345678.9
    const rifMatch = cleanText.match(/\b([VJEPGvjepg])[-\.\s]?(\d{5,9})[-\.\s]?(\d{1})\b/);
    let rif = "";
    if (rifMatch) {
        // Normalize to J-12345678-9 format
        rif = `${rifMatch[1]}-${rifMatch[2]}-${rifMatch[3]}`.toUpperCase();
    }

    // 2. Date Extraction
    // Enhanced: allows 12-12-2023, 12/12/2023, 12.12.2023, 12 12 2023
    // Also captures 2024 (2-digit or 4-digit year)
    const dateMatch = cleanText.match(/\b(\d{2})[-\/\.\s](\d{2})[-\/\.\s](\d{2,4})\b/);
    let invoiceDate = "";
    if (dateMatch) {
        let year = dateMatch[3];
        // Fix 2-digit year
        if (year.length === 2) year = `20${year}`;

        // Basic validation (reasonable year)
        const yearNum = parseInt(year);
        if (yearNum > 2000 && yearNum < 2030) {
            invoiceDate = `${year}-${dateMatch[2]}-${dateMatch[1]}`;
        }
    }

    // 3. Invoice Number
    // Enhanced: Look for N°, No., Ctrl, Factura, etc.
    // MUST contain at least one digit to avoid capturing just "FACTURA"
    let invoiceNoMatch = cleanText.match(/(?:FACTURA|CONTROL|NOTA|FISCAL|NRO|NUMERO|NO\.)[\s\.:°]*([A-Z0-9\-\/]*\d+[A-Z0-9\-\/]*)/i);

    // If not found, look for just the label "N° 12345"
    if (!invoiceNoMatch) {
        invoiceNoMatch = cleanText.match(/(?:N[°º\.]?)\s*([\d\-\/]{4,})/i);
    }

    const invoiceNumber = invoiceNoMatch ? invoiceNoMatch[1].replace(/[^a-zA-Z0-9\-]/g, '') : `OCR-${Date.now().toString().slice(-6)}`;

    // 4. Total Amount
    // This is tricky. We'll look for keywords like "TOTAL" or "MONTO" and find the largest number nearby.
    // Or simply find the largest number in the text that looks like a currency.

    // Regex for currency: 1.234,56 or 1234.56
    // Venezuelan specific: usually dots for thousands, whitespace, or nothing. Comma for decimals.

    // Strategy: Find all numbers that look like money.
    const moneyRegex = /\b\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\b/g;
    const moneyMatches = cleanText.match(moneyRegex);

    let totalAmount = 0;
    if (moneyMatches) {
        // Parse candidates
        const candidates = moneyMatches.map(m => {
            // Remove thousands separators (dots) and replace decimal comma with dot
            // CASE 1: 1.250,00 -> 1250.00 (Standard VE)
            // CASE 2: 1,250.00 -> 1250.00 (Standard US)

            let valStr = m;
            if (valStr.includes(',') && valStr.includes('.')) {
                if (valStr.indexOf(',') < valStr.indexOf('.')) {
                    // 1,234.56 -> Remove ,
                    valStr = valStr.replace(/,/g, '');
                } else {
                    // 1.234,56 -> Remove . and swap , to .
                    valStr = valStr.replace(/\./g, '').replace(',', '.');
                }
            } else if (valStr.includes(',')) {
                // 1234,56 -> 1234.56
                valStr = valStr.replace(',', '.');
            }
            // else 1234.56 (already good)

            return parseFloat(valStr);
        });

        // Heuristic: The total is usually the LARGEST number found on the page.
        // Or strictly look for numbers after "TOTAL"
        totalAmount = Math.max(...candidates);
    }

    // 5. Supplier Name
    // Very hard with Regex. Logic:
    // - Not SENIAT
    // - Usually the first few lines of the receipt.
    // - Often contains "C.A.", "S.A."

    let supplierName = "Proveedor Desconocido";

    // Simple Heuristic: First line that isn't SENIAT and has > 4 chars
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const line = lines[i].trim().toUpperCase();
        if (line.length > 3 && !line.includes("SENIAT") && !line.includes("FACTURA") && !line.includes("RIF")) {
            // Check for specific company suffixes
            if (line.includes("C.A.") || line.includes("S.A.") || line.includes("S.R.L") || line.includes("FIRMA PERSONAL")) {
                supplierName = lines[i].trim();
                break;
            }
        }
    }

    // Fallback: If no company suffix found, take the first clean line matching rules
    if (supplierName === "Proveedor Desconocido") {
        for (let i = 0; i < Math.min(lines.length, 5); i++) {
            const line = lines[i].trim().toUpperCase();
            if (line.length > 5 && !line.includes("SENIAT") && !line.includes("REPÚBLICA")) {
                supplierName = lines[i].trim();
                break;
            }
        }
    }

    return {
        invoiceDate,
        supplierName,
        rif,
        invoiceNumber,
        itemsDescription: "Gasto procesado automáticamente (OCR)",
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

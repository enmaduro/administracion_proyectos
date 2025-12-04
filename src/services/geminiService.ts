// src/services/geminiService.ts
import { Invoice } from '../types';

export const extractInvoiceData = async (file: File): Promise<Omit<Invoice, 'id' | 'fileDataUrl' | 'fileType' | 'fileName'>> => {
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

  const bytes = new Uint8Array(arrayBuffer);
  const base64 = btoa(String.fromCharCode(...bytes));
  const mimeType = file.type || 'application/octet-stream';

  const response = await fetch('/api/extract-invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ base64Data: base64, mimeType }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Error desconocido");
    console.error('Error del servidor:', errorText);
    throw new Error(errorText || 'No se pudo procesar la factura. Inténtelo de nuevo.');
  }

  const data = await response.json();
  return data;
};
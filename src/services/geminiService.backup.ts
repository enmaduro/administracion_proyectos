import { Invoice } from '../types';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const extractInvoiceData = async (file: File, apiKey?: string): Promise<Omit<Invoice, 'id' | 'fileDataUrl' | 'fileType' | 'fileName'>> => {

  // 1. Convert file to base64 using native FileReader (most efficient method)
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });


  const mimeType = file.type || 'application/octet-stream';

  // 2. Call Gemini directly from the client
  // Prioritize the custom Project API Key, fallback to the shared env key
  const finalApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;

  // DEBUG: Log which key is being used (first 10 chars only for security)
  console.log('🔑 API Key Source:', apiKey ? 'USER_PROVIDED' : 'SHARED_ENV');
  console.log('🔑 API Key Preview:', finalApiKey ? finalApiKey.substring(0, 10) + '...' : 'NONE');

  if (!finalApiKey) {
    throw new Error("No se encontró una API Key válida. Por favor configura una en tu proyecto o contacta al administrador.");
  }

  const genAI = new GoogleGenerativeAI(finalApiKey);

  // Using gemini-2.5-flash (stable production model)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "text/plain",
    },
  });

  const prompt = `
    Eres un asistente experto en facturas venezolanas.
    Analiza la imagen o documento PDF proporcionado.
    
    OBJETIVO: Extraer datos del EMISOR (Proveedor) de la factura.
    
    INSTRUCCIONES ESPECÍFICAS:
    1. "supplierName": Busca el nombre de la empresa o persona que EMITE la factura.
       - CASO COMÚN: Si ves "SENIAT" en letras grandes al principio, EL PROVEEDOR NO ES SENIAT.
       - El proveedor es el nombre que aparece INMEDIATAMENTE DEBAJO de "SENIAT".
       - Busca nombres comerciales que terminen en "C.A.", "S.A.", "S.R.L.", "F.P." (Firmas Personales) o nombres personales.
       - En la imagen de ejemplo, debajo de "SENIAT" dice "COMPUTER SUPPLIES, C. A." -> ESE es el proveedor.
       - REGLA: Si el nombre extraído contiene "SENIAT", busca otra línea de texto cercana.
    2. "rif": Busca el RIF del PROVEEDOR (Emisor). Formato: J-12345678-9, V-12345678-9, etc.
    3. "totalAmount": El monto TOTAL A PAGAR. 
       - Busca "Total a Pagar", "Monto Total" o el valor final de la factura.
       - FORMATO NUMÉRICO VENEZOLANO: Usamos punto (.) para miles y coma (,) para decimales (ej: 1.234,56).
       - IMPORTANTE: Devuelve el monto como NÚMERO flotante estándar (punto para decimales).
       - Ejemplo: Si ves "26.623,32", devuelve 26623.32. Si ves "1.000,00", devuelve 1000.00.
    
    RESPONDE ÚNICAMENTE con un JSON válido, sin texto adicional.
    {
      "invoiceDate": "AAAA-MM-DD",
      "supplierName": "nombre real del proveedor",
      "rif": "J-12345678-9",
      "invoiceNumber": "número de factura",
      "itemsDescription": "resumen breve",
      "totalAmount": número
    }
  `;

  try {

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: prompt.trim() }
        ]
      }]
    });



    const rawText = result.response.text().trim();

    // Improved JSON extraction: Handle markdown code blocks and various wrapping
    let jsonString = rawText;
    const markdownMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
      jsonString = markdownMatch[1];
    } else {
      // Fallback: Try to find the first { and last }
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = rawText.substring(firstBrace, lastBrace + 1);
      }
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      console.error("Error parseando JSON de Gemini:", e);
      throw new Error("La IA respondió pero no se pudo leer el formato JSON. Intenta de nuevo.");
    }

    // Validate required fields
    const requiredFields = ["invoiceDate", "supplierName", "rif", "invoiceNumber", "itemsDescription", "totalAmount"];
    for (const field of requiredFields) {
      if (!(field in parsed)) {
        console.warn(`Campo faltante en la respuesta de la IA: ${field}`);
      }
    }

    // Post-processing: Aggressive SENIAT filtering
    let finalSupplierName = parsed.supplierName || "";
    // Clean up common noise
    finalSupplierName = finalSupplierName.replace(/\*/g, '').trim();

    const forbiddenTerms = ["SENIAT", "CONTRIBUYENTE", "RETENCION", "IMPUESTO"];
    if (forbiddenTerms.some(term => finalSupplierName.toUpperCase().includes(term))) {
      console.warn("⚠️ Detectado 'SENIAT' o término prohibido como proveedor. Reemplazando con advertencia.");
      finalSupplierName = "VERIFICAR PROVEEDOR";
    }

    return {
      invoiceDate: parsed.invoiceDate || "",
      supplierName: finalSupplierName,
      rif: parsed.rif || "",
      invoiceNumber: parsed.invoiceNumber || "",
      itemsDescription: parsed.itemsDescription || "",
      totalAmount: typeof parsed.totalAmount === "number" ? parsed.totalAmount : 0,
    };

  } catch (error) {
    console.error("❌ Error al procesar con Gemini:", error);
    let errorMessage = "Error desconocido al procesar factura.";

    if (error instanceof Error) {
      // Map common Gemini errors to user-friendly messages
      if (error.message.includes("429") || error.message.includes("Quota")) {
        errorMessage = "Se ha excedido la cuota gratuita de la API de IA. Intenta más tarde o usa otra clave.";
      } else if (error.message.includes("API Key")) {
        errorMessage = `Problema con la API Key configurada. Detalles: ${error.message}`;
      } else {
        errorMessage = error.message;
      }
    }
    throw new Error(errorMessage);
  }
};

export const chatWithGemini = async (userMessage: string, projectContext: any, apiKey?: string): Promise<string> => {
  const finalApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!finalApiKey) throw new Error("API Key no configurada.");

  const genAI = new GoogleGenerativeAI(finalApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Construct context string safely
  const info = projectContext?.projectInfo || {};
  const invoices = Array.isArray(projectContext?.invoices) ? projectContext.invoices : [];

  const context = `
    DATOS DEL PROYECTO:
    - Nombre: ${info.communityName || 'No especificado'}
    - Consulta: ${info.consultationNumber || 'N/A'} (${info.year || 'N/A'})
    - Presupuesto Inicial: ${info.budget !== undefined ? info.budget : 'No definido'}
    - Gastos Totales: ${projectContext?.totalAmount || 0}
    
    FACTURAS REGISTRADAS (${invoices.length}):
    ${invoices.map((inv: any) =>
    `- ${inv.invoiceDate || 'S/F'}: ${inv.supplierName || 'Proveedor desc.'} (RIF: ${inv.rif || 'S/R'}) - Monto: ${inv.totalAmount} - ${inv.itemsDescription || 'Sin descripción'}`
  ).join('\n')}
  `;

  const prompt = `
    Eres un asistente contable y administrativo para un proyecto comunitario en Venezuela.
    Tienes acceso a los siguientes datos del proyecto:
    ${context}

    PREGUNTA DEL USUARIO: "${userMessage}"

    INSTRUCCIONES:
    - Responde de forma clara, concisa y útil.
    - Usa los datos suministrados para fundamentar tu respuesta.
    - Si te preguntan por totales, sumas o listados, usa la información de "FACTURAS REGISTRADAS".
    - El formato de moneda es 'Bs.S' (Bolívares).
    - IMPORTANTE: Si el usuario pregunta "¿Cómo obtengo mi API Key?" o algo similar sobre claves de API:
      "Para obtener tu propia API Key de Google Gemini (es gratis):
       1. Ve a https://aistudio.google.com/app/apikey
       2. Inicia sesión con tu cuenta Google.
       3. Presiona 'Create API Key'.
       4. Copia la clave (empieza por 'AIza...').
       5. Reinicia este proyecto (botón rojo arriba) e ingrésala en la configuración."
    - Sé amable y profesional.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error en chat Gemini:", error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return "Lo siento, hubo un error técnico al contactar al servicio de IA.";
  }
};
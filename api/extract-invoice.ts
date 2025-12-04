// api/extract-invoice.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Tipos correctos para Vercel Functions
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("🔍 Iniciando handler de /api/extract-invoice");

  if (req.method !== "POST") {
    console.log("❌ Método no permitido:", req.method);
    return res.status(405).json({ error: "Método no permitido" });
  }

  console.log("🔍 Headers recibidos:", req.headers);
  // console.log("🔍 Body recibido:", typeof req.body);

  const { base64Data, mimeType } = req.body;

  console.log("🔍 Datos recibidos:", { base64Data: !!base64Data, mimeType });

  if (!base64Data || !mimeType) {
    console.log("❌ Faltan datos del archivo:", { base64Data: !!base64Data, mimeType: !!mimeType });
    return res.status(400).json({ error: "Faltan datos del archivo." });
  }

  console.log("🔍 API Key definida:", !!process.env.GEMINI_API_KEY);

  try {
    // ✅ Verificar que la API Key esté definida
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY no está definida en el entorno");
      return res.status(500).json({ error: "Configuración del servidor incompleta" });
    }

    console.log("🔍 Iniciando conexión con Gemini...");
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("✅ GoogleGenerativeAI creado exitosamente");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "text/plain", // ✅ Cambiado a texto plano
      },
    });
    console.log("✅ Modelo Gemini obtenido");

    const prompt = `
      Eres un asistente experto en facturas venezolanas.
      Analiza la imagen o documento PDF proporcionado.
      RESPONDE ÚNICAMENTE con un JSON válido, sin texto adicional.
      Extrae EXACTAMENTE estos campos como JSON:
      {
        "invoiceDate": "AAAA-MM-DD",
        "supplierName": "nombre del proveedor",
        "rif": "con formato como J-12345678-9",
        "invoiceNumber": "número de factura",
        "itemsDescription": "descripción de los ítems",
        "totalAmount": número, sin símbolos de moneda
      }
    `;

    console.log("🔍 Enviando solicitud a Gemini...");
    // ✅ Estructura correcta para generateContent
    const result = await model.generateContent({
      contents: [{
        role: "user", // ✅ Añadido 'role'
        parts: [
          { inlineData: { mimeType, data: base64Data } }, // ✅ 'data' recibe el base64
          { text: prompt.trim() }
        ]
      }]
    });
    console.log("✅ Solicitud a Gemini completada");

    const rawText = result.response.text().trim();
    console.log("📄 Texto bruto recibido de Gemini:", rawText);

    // ✅ Extraer solo el bloque JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ Gemini no devolvió un bloque JSON válido:", rawText);
      return res.status(500).json({ error: "La IA no devolvió un formato JSON válido." });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("❌ Error al parsear JSON de Gemini:", jsonMatch[0]);
      console.error("Error detallado:", e);
      return res.status(500).json({ error: "La IA devolvió un formato no válido." });
    }

    // ✅ Validar campos requeridos
    const requiredFields = ["invoiceDate", "supplierName", "rif", "invoiceNumber", "itemsDescription", "totalAmount"];
    for (const field of requiredFields) {
      if (!(field in parsed)) {
        console.error(`❌ Campo faltante en la respuesta de la IA: ${field}`);
        return res.status(500).json({ error: `Campo faltante en la respuesta de la IA: ${field}` });
      }
    }

    // ✅ Enviar respuesta
    console.log("✅ Respuesta de Gemini procesada correctamente");
    res.status(200).json({
      invoiceDate: parsed.invoiceDate || "",
      supplierName: parsed.supplierName || "",
      rif: parsed.rif || "",
      invoiceNumber: parsed.invoiceNumber || "",
      itemsDescription: parsed.itemsDescription || "",
      totalAmount: typeof parsed.totalAmount === "number" ? parsed.totalAmount : 0,
    });
  } catch (error) {
    console.error("❌ Error en /api/extract-invoice:", error);
    res.status(500).json({ error: "No se pudo procesar la factura. Inténtalo de nuevo." });
  }
}
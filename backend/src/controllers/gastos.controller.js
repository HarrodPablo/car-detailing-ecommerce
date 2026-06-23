const prisma = require('../prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const parseDateRange = (query) => {
  const { desde, hasta } = query;
  let startDate, endDate;
  
  if (desde && hasta) {
    startDate = new Date(desde);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(hasta);
    endDate.setHours(23, 59, 59, 999);
  } else {
    // Default to this month if not provided
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }
  return { startDate, endDate };
};

const getGastos = async (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req.query);
    
    const gastos = await prisma.gasto.findMany({
      where: {
        fecha: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { fecha: 'desc' }
    });
    
    res.json(gastos);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo gastos', error });
  }
};

const createGasto = async (req, res) => {
  try {
    const { fecha, descripcion, monto, categoria, proveedor, items } = req.body;
    
    const gasto = await prisma.gasto.create({
      data: {
        fecha: new Date(fecha),
        descripcion,
        monto: Number(monto),
        categoria: categoria || 'general',
        proveedor,
        items
      }
    });
    
    res.status(201).json(gasto);
  } catch (error) {
    res.status(500).json({ message: 'Error creando gasto', error });
  }
};

const deleteGasto = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.gasto.delete({ where: { id: Number(id) } });
    res.json({ message: 'Gasto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando gasto', error });
  }
};

const escanearFactura = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'IA no configurada' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ninguna imagen' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare image for Gemini
    const imageParts = [
      {
        inlineData: {
          data: req.file.buffer.toString('base64'),
          mimeType: req.file.mimetype
        }
      }
    ];

    const prompt = `Analizá esta factura/ticket de compra y extraé la información en formato JSON con esta estructura exacta:
{
  "proveedor": "string",
  "fecha": "string (formato YYYY-MM-DD)",
  "items": [{"nombre": "string", "cantidad": number, "precioUnitario": number, "subtotal": number}],
  "total": number
}
Si no podés identificar algún campo, usá null. 
Devolvé SOLO el JSON, sin texto adicional ni markdown.`;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    let text = response.text();
    
    // Strip markdown if Gemini ignores instructions
    if (text.includes('\`\`\`')) {
      text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const parsedData = JSON.parse(jsonMatch[0]);
    res.json(parsedData);
  } catch (error) {
    console.error('Error procesando factura con Gemini:', error);
    res.status(422).json({ error: 'No se pudo procesar la factura' });
  }
};

module.exports = {
  getGastos,
  createGasto,
  deleteGasto,
  escanearFactura
};

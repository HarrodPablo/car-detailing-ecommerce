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
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  }
  return { startDate, endDate };
};

const getResumenReport = async (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req.query);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const currentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'entregado'
      }
    });

    const facturacion = currentOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const pedidos = currentOrders.length;
    const ticketPromedio = pedidos > 0 ? facturacion / pedidos : 0;

    // Previous period
    const prevEndDate = new Date(startDate);
    prevEndDate.setMilliseconds(-1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - diffDays + 1);
    prevStartDate.setHours(0, 0, 0, 0);

    const prevOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: prevStartDate, lte: prevEndDate },
        status: 'entregado'
      }
    });

    const prevFacturacion = prevOrders.reduce((sum, o) => sum + Number(o.total), 0);
    
    let comparativo = 0;
    if (prevFacturacion === 0) {
      comparativo = facturacion > 0 ? 100 : 0;
    } else {
      comparativo = ((facturacion - prevFacturacion) / prevFacturacion) * 100;
    }

    res.json({
      facturacion,
      pedidos,
      ticketPromedio,
      comparativo: Number(comparativo.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en resumen', error });
  }
};

const getProductosTopReport = async (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req.query);
    
    const products = await prisma.product.findMany({
      include: {
        orderItems: {
          where: {
            order: {
              createdAt: { gte: startDate, lte: endDate },
              status: 'entregado'
            }
          }
        }
      }
    });

    const top = products.map(p => {
      const cantidad = p.orderItems.reduce((sum, i) => sum + Number(i.quantity), 0);
      const total = p.orderItems.reduce((sum, i) => sum + Number(i.subtotal), 0);
      return { productId: p.id, name: p.name, cantidad, total };
    })
    .filter(p => p.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

    res.json(top);
  } catch (error) {
    res.status(500).json({ message: 'Error en productos top', error });
  }
};

const getCategoriasReport = async (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req.query);

    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            orderItems: {
              where: {
                order: {
                  createdAt: { gte: startDate, lte: endDate },
                  status: 'entregado'
                }
              }
            }
          }
        }
      }
    });

    let totalGlobal = 0;
    const catData = categories.map(c => {
      const total = c.products.reduce((sum, p) => {
        return sum + p.orderItems.reduce((s, i) => s + Number(i.subtotal), 0);
      }, 0);
      totalGlobal += total;
      return { categoria: c.name, total };
    }).filter(c => c.total > 0);

    const result = catData.map(c => ({
      ...c,
      porcentaje: totalGlobal > 0 ? Number(((c.total / totalGlobal) * 100).toFixed(2)) : 0
    })).sort((a, b) => b.total - a.total);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error en categorias', error });
  }
};

const getVentasReport = async (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req.query);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const orders = await prisma.order.findMany({
      where: { 
        createdAt: { gte: startDate, lte: endDate },
        status: 'entregado'
      }
    });

    const totalPedidos = orders.length;
    const totalVentas = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const chartData = [];

    if (diffDays > 60) {
      // Group by month
      const monthsMap = {};
      orders.forEach(o => {
        const monthKey = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, '0')}`;
        if (!monthsMap[monthKey]) monthsMap[monthKey] = 0;
        monthsMap[monthKey] += Number(o.total);
      });
      
      let curr = new Date(startDate);
      curr.setDate(1); // Set to 1st of month to avoid skipping months on 31st
      while (curr <= endDate || (curr.getFullYear() === endDate.getFullYear() && curr.getMonth() === endDate.getMonth())) {
        const monthKey = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
        chartData.push({
          date: monthKey,
          total: monthsMap[monthKey] || 0
        });
        curr.setMonth(curr.getMonth() + 1);
      }
    } else {
      // Group by day
      const daysMap = {};
      orders.forEach(o => {
        const dayKey = o.createdAt.toISOString().split('T')[0];
        if (!daysMap[dayKey]) daysMap[dayKey] = 0;
        daysMap[dayKey] += Number(o.total);
      });
      
      let curr = new Date(startDate);
      while (curr <= endDate) {
        const dayKey = curr.toISOString().split('T')[0];
        chartData.push({
          date: dayKey,
          total: daysMap[dayKey] || 0
        });
        curr.setDate(curr.getDate() + 1);
      }
    }

    res.json({
      chartData,
      totalPedidos,
      totalVentas
    });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo chart de ventas', error });
  }
};

const getMarcasReport = async (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req.query);

    const brands = await prisma.brand.findMany({
      include: {
        products: {
          include: {
            orderItems: {
              where: {
                order: {
                  createdAt: { gte: startDate, lte: endDate },
                  status: 'entregado'
                }
              },
              include: { order: true }
            }
          }
        }
      }
    });

    const report = brands.map(brand => {
      const sales = brand.products.reduce((sum, p) => {
        return sum + p.orderItems.reduce((s, i) => s + Number(i.subtotal), 0);
      }, 0);
      return { name: brand.name, sales };
    }).filter(b => b.sales > 0)
    .sort((a, b) => b.sales - a.sales);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo reporte de marcas', error });
  }
};

const analizarIA = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'IA no configurada' });
    }

    const { resumen, productosTop, marcas, gastosTotales, periodo } = req.body;
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: 'Sos un analista de negocios especializado en ecommerce de productos de detailing automotriz argentino.'
    });

    const prompt = `Analizá estos datos del período ${periodo}:
- Facturación: $${resumen?.facturacion || 0}
- Pedidos: ${resumen?.pedidos || 0}
- Ticket promedio: $${resumen?.ticketPromedio || 0}
- Gastos del período: $${gastosTotales || 0}
- Ganancia estimada: $${(resumen?.facturacion || 0) - (gastosTotales || 0)}
- Top productos: ${productosTop?.map(p => p.name + ': ' + p.cantidad + ' unidades').join(', ')}
- Top marcas: ${marcas?.slice(0,3).map(m => m.name + ': $' + m.sales).join(', ')}

Devolvé un análisis en español con: 1 conclusión principal en negrita, 2-3 observaciones clave y 1-2 recomendaciones accionables. Máximo 180 palabras. Sin tecnicismos.`;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    
    res.json({ analisis: text });
  } catch (error) {
    console.error('Error en analizarIA:', error);
    res.status(500).json({ 
      error: 'Error generando análisis',
      details: error.message || String(error)
    });
  }
};

module.exports = {
  getVentasReport,
  getMarcasReport,
  getResumenReport,
  getProductosTopReport,
  getCategoriasReport,
  analizarIA
};

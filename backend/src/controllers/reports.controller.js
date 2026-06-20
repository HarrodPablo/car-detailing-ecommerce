const prisma = require('../prisma/client');

const getVentasReport = async (req, res) => {
  try {
    // Generate simple last 7 days chart
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d;
    }).reverse();

    const chartData = [];

    for (let i = 0; i < last7Days.length; i++) {
      const start = last7Days[i];
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const orders = await prisma.order.findMany({
        where: { createdAt: { gte: start, lt: end } }
      });

      chartData.push({
        date: start.toISOString().split('T')[0],
        total: orders.reduce((sum, o) => sum + o.total, 0)
      });
    }

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo chart', error });
  }
};

const getMarcasReport = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        products: {
          include: {
            orderItems: {
              include: { order: true }
            }
          }
        }
      }
    });

    const report = brands.map(brand => {
      const sales = brand.products.reduce((sum, p) => {
        return sum + p.orderItems.reduce((s, i) => s + i.quantity, 0);
      }, 0);
      return { name: brand.name, sales };
    }).sort((a, b) => b.sales - a.sales);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo reporte de marcas', error });
  }
};

module.exports = {
  getVentasReport,
  getMarcasReport
};

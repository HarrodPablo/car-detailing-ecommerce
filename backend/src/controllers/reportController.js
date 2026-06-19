const prisma = require('../prisma/client');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, totalOrders, lowStockProducts, expiringLots] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: today } }
      }),
      prisma.order.count(),
      prisma.product.count({
        where: { stock: { lte: prisma.product.fields.minStock } } // Needs logic or raw query, simplified here
      }),
      prisma.productLot.count({
        where: { status: 'POR_VENCER' }
      })
    ]);

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    // Get low stock actually by raw query because Prisma doesn't support field-to-field comparison directly yet
    const lowStockRaw = await prisma.$queryRaw`SELECT count(*) as count FROM Product WHERE stock <= minStock`;
    const lowStockCount = Number(lowStockRaw[0].count);

    res.json({
      todayRevenue,
      todayOrdersCount: todayOrders.length,
      totalOrders,
      lowStockCount,
      expiringLots
    });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo stats del dashboard', error });
  }
};

const getSalesChart = async (req, res) => {
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

module.exports = {
  getDashboardStats,
  getSalesChart
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getVentasReport = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { not: 'cancelado' } },
      select: { total: true, createdAt: true }
    });
    
    // Group by date (simple implementation)
    const grouped = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = 0;
      acc[date] += Number(order.total);
      return acc;
    }, {});

    const report = Object.keys(grouped).map(date => ({
      date,
      total: grouped[date]
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json(report);
  } catch (error) {
    next(error);
  }
};

const getMarcasReport = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: { brand: true, orderItems: { include: { order: true } } }
    });

    const report = {};
    products.forEach(p => {
      const brandName = p.brand.name;
      if (!report[brandName]) report[brandName] = 0;
      
      const sales = p.orderItems.reduce((acc, item) => {
        if (item.order.status !== 'cancelado') return acc + item.quantity;
        return acc;
      }, 0);
      
      report[brandName] += sales;
    });

    const formatted = Object.keys(report).map(name => ({
      name, sales: report[name]
    })).sort((a, b) => b.sales - a.sales);

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

const getJuntosReport = async (req, res, next) => {
  try {
    // A simplified mock of 'comprados juntos'
    res.json([
      { products: "Shampoo XYZ + Microfibra ABC", count: 15 },
      { products: "Cera Carnauba + Aplicador", count: 12 },
    ]);
  } catch (error) {
    next(error);
  }
};

module.exports = { getVentasReport, getMarcasReport, getJuntosReport };

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStockAlerts = async (req, res, next) => {
  try {
    const products = await prisma.$queryRaw`SELECT * FROM "Product" WHERE stock <= "minStock"`;
    res.json(products);
  } catch (error) {
    console.error('Error en Controlador:', error);
    next(error);
  }
};

const getLotExpiryAlerts = async (req, res, next) => {
  try {
    const today = new Date();
    // Simplified logic: find lots expiring in next X days
    const lots = await prisma.$queryRaw`
      SELECT * FROM "ProductLot" 
      WHERE "expiryDate" <= NOW() + ("alertDaysBefore" * INTERVAL '1 day')
      AND status != 'VENCIDO'
    `;
    res.json(lots);
  } catch (error) {
    console.error('Error en Controlador:', error);
    next(error);
  }
};

module.exports = { getStockAlerts, getLotExpiryAlerts };

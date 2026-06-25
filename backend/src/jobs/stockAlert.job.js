const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initStockAlertJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const lowStockProducts = await prisma.$queryRaw`SELECT id, name, stock, "minStock" FROM "Product" WHERE stock <= "minStock"`;
      
      if (lowStockProducts.length > 0) {

        // Here we could trigger a push notification, email, etc.
      }
    } catch (error) {
      console.error('Error en cron job de stock:', error);
    }
  });
};

module.exports = initStockAlertJob;

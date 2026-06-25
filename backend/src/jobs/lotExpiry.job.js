const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initLotExpiryJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      // 1. Update status to VENCIDO where expiryDate < now
      await prisma.$executeRaw`
        UPDATE "ProductLot" 
        SET status = 'VENCIDO' 
        WHERE "expiryDate" < NOW() AND status != 'VENCIDO'
      `;
      
      // 2. Alert for lots expiring soon
      const soonExpiring = await prisma.$queryRaw`
        SELECT id, "lotNumber", "expiryDate" FROM "ProductLot" 
        WHERE "expiryDate" <= NOW() + ("alertDaysBefore" * INTERVAL '1 day')
        AND status != 'VENCIDO'
      `;
      
      if (soonExpiring.length > 0) {

      }
    } catch (error) {
      console.error('Error en cron job de lotes:', error);
    }
  });
};

module.exports = initLotExpiryJob;

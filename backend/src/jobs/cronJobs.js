const cron = require('node-cron');
const prisma = require('../prisma/client');

// Run every hour
cron.schedule('0 * * * *', async () => {

  try {
    const today = new Date();
    
    // Find lots that are VIGENTE and about to expire
    const lots = await prisma.productLot.findMany({
      where: { status: 'VIGENTE' }
    });

    for (const lot of lots) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysUntilExpiry = Math.ceil((lot.expiryDate.getTime() - today.getTime()) / msPerDay);
      
      if (daysUntilExpiry <= 0) {
        await prisma.productLot.update({
          where: { id: lot.id },
          data: { status: 'VENCIDO' }
        });
      } else if (daysUntilExpiry <= lot.alertDaysBefore) {
        await prisma.productLot.update({
          where: { id: lot.id },
          data: { status: 'POR_VENCER' }
        });
      }
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

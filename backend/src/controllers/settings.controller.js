const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSettings = async (req, res, next) => {
  try {
    const settings = await prisma.setting.findMany();
    
    // Convert array to object for easier frontend consumption
    const formatted = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;
    
    for (const key of Object.keys(updates)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(updates[key]) },
        create: { key, value: String(updates[key]) }
      });
    }

    res.json({ message: 'Settings actualizados' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };

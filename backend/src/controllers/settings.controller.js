const prisma = require('../prisma/client');

const getSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const formattedSettings = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(formattedSettings);
  } catch (error) {
    console.error('Error en Controlador:', error);
    res.status(500).json({ message: 'Error obteniendo configuración', error });
  }
};

const updateSettings = async (req, res) => {
  try {
    const updates = req.body; // e.g. { STORE_NAME: "Detailing Hub", WHATSAPP_NUMBER: "1234567" }
    
    // Updates are done using transactions to ensure atomicity
    const transactions = Object.entries(updates).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    });

    await prisma.$transaction(transactions);
    res.json({ message: 'Configuración actualizada con éxito' });
  } catch (error) {
    console.error('Error en Controlador:', error);
    res.status(500).json({ message: 'Error actualizando configuración', error });
  }
};

module.exports = {
  getSettings,
  updateSettings
};

const prisma = require('../prisma/client');

const getLotsByProductId = async (req, res) => {
  try {
    const lots = await prisma.productLot.findMany({
      where: { productId: req.params.productId },
      orderBy: { expiryDate: 'asc' }
    });
    res.json(lots);
  } catch (error) {
    console.error('Error en Controlador:', error);
    res.status(500).json({ message: 'Error obteniendo lotes', error });
  }
};

const createLot = async (req, res) => {
  try {
    const data = req.body;
    
    // Ensure dates are correctly formatted
    if (data.manufactureDate) data.manufactureDate = new Date(data.manufactureDate);
    if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);

    const lot = await prisma.productLot.create({ data });
    res.status(201).json(lot);
  } catch (error) {
    console.error('Error en Controlador:', error);
    res.status(500).json({ message: 'Error creando lote', error });
  }
};

const updateLot = async (req, res) => {
  try {
    const data = req.body;
    
    if (data.manufactureDate) data.manufactureDate = new Date(data.manufactureDate);
    if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);

    const lot = await prisma.productLot.update({
      where: { id: req.params.id },
      data
    });
    res.json(lot);
  } catch (error) {
    console.error('Error en Controlador:', error);
    res.status(500).json({ message: 'Error actualizando lote', error });
  }
};

const deleteLot = async (req, res) => {
  try {
    await prisma.productLot.delete({ where: { id: req.params.id } });
    res.json({ message: 'Lote eliminado' });
  } catch (error) {
    console.error('Error en Controlador:', error);
    res.status(500).json({ message: 'Error eliminando lote', error });
  }
};

module.exports = {
  getLotsByProductId,
  createLot,
  updateLot,
  deleteLot
};

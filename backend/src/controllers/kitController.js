const prisma = require('../prisma/client');

const getAllKits = async (req, res) => {
  try {
    const kits = await prisma.kit.findMany({
      include: {
        items: {
          include: { product: true }
        }
      }
    });
    res.json(kits);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo kits', error });
  }
};

const getKitBySlug = async (req, res) => {
  try {
    const kit = await prisma.kit.findUnique({
      where: { slug: req.params.slug },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
    if (!kit) return res.status(404).json({ message: 'Kit no encontrado' });
    res.json(kit);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo kit', error });
  }
};

const createKit = async (req, res) => {
  try {
    const { name, slug, description, imageUrl, kitPrice, isActive, items } = req.body;
    
    // items should be an array of { productId, quantity }
    const kit = await prisma.kit.create({
      data: {
        name, slug, description, imageUrl, kitPrice, isActive,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true }
    });
    
    res.status(201).json(kit);
  } catch (error) {
    res.status(500).json({ message: 'Error creando kit', error });
  }
};

const updateKit = async (req, res) => {
  try {
    const { items, ...data } = req.body;
    const kitId = req.params.id;

    // Use transaction to update kit and recreate its items
    const [kit] = await prisma.$transaction([
      prisma.kit.update({
        where: { id: kitId },
        data
      }),
      prisma.kitItem.deleteMany({ where: { kitId } }),
      ...(items ? items.map(item => 
        prisma.kitItem.create({
          data: {
            kitId,
            productId: item.productId,
            quantity: item.quantity
          }
        })
      ) : [])
    ]);

    res.json(kit);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando kit', error });
  }
};

const deleteKit = async (req, res) => {
  try {
    await prisma.kitItem.deleteMany({ where: { kitId: req.params.id } });
    await prisma.kit.delete({ where: { id: req.params.id } });
    res.json({ message: 'Kit eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando kit', error });
  }
};

module.exports = {
  getAllKits,
  getKitBySlug,
  createKit,
  updateKit,
  deleteKit
};

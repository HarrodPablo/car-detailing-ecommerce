const prisma = require('../prisma/client');

// GET /api/combos — público, para el carrusel en Home
const getCombos = async (req, res) => {
  try {
    const combos = await prisma.kit.findMany({
      where: { isActive: true },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(combos);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo combos' });
  }
};

// POST /api/combos — admin, crea combo con imagen_url
const createCombo = async (req, res) => {
  try {
    const { nombre, precio, productos, imagen_url, isActive } = req.body;
    
    const kit = await prisma.kit.create({
      data: {
        name: nombre,
        slug: nombre.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          + '-' + Date.now(),
        kitPrice: parseFloat(precio),
        imageUrl: imagen_url,
        isActive: isActive ?? true,
        items: {
          create: productos.map(productId => ({
            productId: parseInt(productId),
            quantity: 1
          }))
        }
      },
      include: { items: { include: { product: true } } }
    });
    
    res.status(201).json(kit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creando combo' });
  }
};

// DELETE /api/combos/:id — admin
const deleteCombo = async (req, res) => {
  try {
    await prisma.kit.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Combo eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando combo' });
  }
};

module.exports = { getCombos, createCombo, deleteCombo };

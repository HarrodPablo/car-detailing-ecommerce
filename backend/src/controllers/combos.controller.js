const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCombos = async (req, res, next) => {
  try {
    const combos = await prisma.kit.findMany({
      where: { isActive: true },
      include: {
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(combos);
  } catch (error) {
    next(error);
  }
};

const createCombo = async (req, res, next) => {
  try {
    const { nombre, precio, productos, imagen_url, isActive } = req.body;
    
    const slug = nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const newCombo = await prisma.kit.create({
      data: {
        name: nombre,
        slug,
        kitPrice: Number(precio),
        imageUrl: imagen_url,
        isActive: isActive !== undefined ? isActive : true,
        items: {
          create: productos.map(pId => ({
            productId: Number(pId),
            quantity: 1 // default for combos
          }))
        }
      },
      include: { items: true }
    });
    res.status(201).json(newCombo);
  } catch (error) {
    next(error);
  }
};

const updateCombo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, precio, imagen_url, isActive } = req.body;
    
    const updateData = {};
    if (nombre) updateData.name = nombre;
    if (precio) updateData.kitPrice = Number(precio);
    if (imagen_url) updateData.imageUrl = imagen_url;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCombo = await prisma.kit.update({
      where: { id: Number(id) },
      data: updateData
    });
    res.json(updatedCombo);
  } catch (error) {
    next(error);
  }
};

const deleteCombo = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.kit.delete({ where: { id: Number(id) } });
    res.json({ message: 'Combo eliminado' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCombos, createCombo, updateCombo, deleteCombo };

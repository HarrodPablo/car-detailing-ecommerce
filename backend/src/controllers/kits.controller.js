const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getKits = async (req, res, next) => {
  try {
    const kits = await prisma.kit.findMany({
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(kits);
  } catch (error) {
    next(error);
  }
};

const createKit = async (req, res, next) => {
  try {
    const { name, slug, description, imageUrl, kitPrice, isActive, items } = req.body;
    
    const newKit = await prisma.kit.create({
      data: {
        name, slug, description, imageUrl, kitPrice: Number(kitPrice), isActive,
        items: {
          create: items.map(item => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity)
          }))
        }
      },
      include: { items: true }
    });
    res.status(201).json(newKit);
  } catch (error) {
    next(error);
  }
};

module.exports = { getKits, createKit };

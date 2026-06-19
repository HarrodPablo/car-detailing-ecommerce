const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, slug, iconUrl, parentId, sortOrder } = req.body;
    const newCategory = await prisma.category.create({
      data: { name, slug, iconUrl, parentId: parentId ? Number(parentId) : null, sortOrder: Number(sortOrder) || 0 }
    });
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory };

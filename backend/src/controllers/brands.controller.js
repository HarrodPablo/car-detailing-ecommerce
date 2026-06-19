const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getBrands = async (req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(brands);
  } catch (error) {
    next(error);
  }
};

const createBrand = async (req, res, next) => {
  try {
    const { name, slug, logoUrl, description, country, website } = req.body;
    const newBrand = await prisma.brand.create({
      data: { name, slug, logoUrl, description, country, website }
    });
    res.status(201).json(newBrand);
  } catch (error) {
    next(error);
  }
};

module.exports = { getBrands, createBrand };

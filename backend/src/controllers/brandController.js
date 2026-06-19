const prisma = require('../prisma/client');

const getAllBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo marcas', error });
  }
};

const getBrandBySlug = async (req, res) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: { slug: req.params.slug },
      include: { products: true }
    });
    if (!brand) return res.status(404).json({ message: 'Marca no encontrada' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo marca', error });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name, slug, logoUrl, description, country, website } = req.body;
    const brand = await prisma.brand.create({
      data: { name, slug, logoUrl, description, country, website }
    });
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error creando marca', error });
  }
};

const updateBrand = async (req, res) => {
  try {
    const brand = await prisma.brand.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando marca', error });
  }
};

const deleteBrand = async (req, res) => {
  try {
    await prisma.brand.delete({ where: { id: req.params.id } });
    res.json({ message: 'Marca eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando marca', error });
  }
};

module.exports = {
  getAllBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand
};

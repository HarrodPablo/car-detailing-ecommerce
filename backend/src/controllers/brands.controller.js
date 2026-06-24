const prisma = require('../prisma/client');

const getAllBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(brands);
  } catch (error) {
    console.error('Error en Controlador:', error);
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
    console.error('Error en Controlador:', error);
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
    console.error('Error en Controlador:', error);
    res.status(500).json({ message: 'Error creando marca', error });
  }
};

const updateBrand = async (req, res) => {
  try {
    const brand = await prisma.brand.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(brand);
  } catch (error) {
    console.error('Error en Controlador:', error);
    res.status(500).json({ message: 'Error actualizando marca', error });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // Verificar si tiene productos asociados
    const productsCount = await prisma.product.count({ where: { brandId: id } });
    if (productsCount > 0) {
      return res.status(400).json({ message: 'No se puede eliminar: hay productos asociados a esta marca.' });
    }

    await prisma.brand.delete({ where: { id } });
    res.json({ message: 'Marca eliminada' });
  } catch (error) {
    console.error('Error en Controlador:', error);
    res.status(500).json({ message: 'Error eliminando marca', error: error.message });
  }
};

module.exports = {
  getAllBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand
};

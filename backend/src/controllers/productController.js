const prisma = require('../prisma/client');

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        images: true,
      }
    });
    // Parse surfaceCompatible if needed (stored as string in SQLite)
    const formattedProducts = products.map(p => ({
      ...p,
      surfaceCompatible: p.surfaceCompatible ? JSON.parse(p.surfaceCompatible) : []
    }));
    
    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo productos', error });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        brand: true,
        category: true,
        images: true,
        lots: true
      }
    });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    
    product.surfaceCompatible = product.surfaceCompatible ? JSON.parse(product.surfaceCompatible) : [];
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo producto', error });
  }
};

const createProduct = async (req, res) => {
  try {
    const data = req.body;
    
    // Convert surfaceCompatible to string for SQLite
    if (data.surfaceCompatible && Array.isArray(data.surfaceCompatible)) {
      data.surfaceCompatible = JSON.stringify(data.surfaceCompatible);
    }
    
    const product = await prisma.product.create({ data });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creando producto', error });
  }
};

const updateProduct = async (req, res) => {
  try {
    const data = req.body;
    
    if (data.surfaceCompatible && Array.isArray(data.surfaceCompatible)) {
      data.surfaceCompatible = JSON.stringify(data.surfaceCompatible);
    }
    
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando producto', error });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando producto', error });
  }
};

module.exports = {
  getAllProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
};

const prisma = require('../prisma/client');

const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { children: true }
    });
    // Build tree if necessary or just return flat list
    res.json(categories);
  } catch (error) {
    console.error('Error en Controlador:', error);
    res.status(500).json({ message: 'Error obteniendo categorías', error });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: { products: true, children: true }
    });
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(category);
  } catch (error) {
    console.error('Error en Controlador:', error);
    res.status(500).json({ message: 'Error obteniendo categoría', error });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, parentId, iconUrl, sortOrder } = req.body;
    const category = await prisma.category.create({
      data: { name, slug, parentId, iconUrl, sortOrder }
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error en Controlador:', error);
    res.status(500).json({ message: 'Error creando categoría', error });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(category);
  } catch (error) {
    console.error('Error en Controlador:', error);
    res.status(500).json({ message: 'Error actualizando categoría', error });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // Verificar si tiene productos asociados
    const productsCount = await prisma.product.count({ where: { categoryId: id } });
    if (productsCount > 0) {
      return res.status(400).json({ message: 'No se puede eliminar: hay productos asociados a esta categoría.' });
    }

    // Verificar si tiene subcategorías (si el modelo lo usa)
    const childrenCount = await prisma.category.count({ where: { parentId: id } });
    if (childrenCount > 0) {
      return res.status(400).json({ message: 'No se puede eliminar: tiene subcategorías asociadas.' });
    }

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error en Controlador:', error);
    res.status(500).json({ message: 'Error eliminando categoría', error: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};

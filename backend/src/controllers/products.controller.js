const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProducts = async (req, res, next) => {
  try {
    const { brandId, categoryId, isActive, isFeatured, isNew, isOffer } = req.query;
    
    const where = {};
    if (brandId) where.brandId = Number(brandId);
    if (categoryId) where.categoryId = Number(categoryId);
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';
    if (isNew !== undefined) where.isNew = isNew === 'true';
    if (isOffer !== undefined) where.isOffer = isOffer === 'true';

    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        lots: true
      }
    });
    if (!product) {
      res.status(404);
      throw new Error('Producto no encontrado');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name, slug, sku, brandId, categoryId, shortDescription, longDescription,
      costPrice, salePrice, stock, minStock, surfaceCompatible,
      applicationType, contentAmount, contentUnit, isActive, isFeatured, isOffer, isNew, images
    } = req.body;

    const newProduct = await prisma.product.create({
      data: {
        name, slug, sku, brandId: Number(brandId), categoryId: Number(categoryId),
        shortDescription, longDescription,
        costPrice: Number(costPrice), salePrice: Number(salePrice),
        stock: Number(stock), minStock: Number(minStock),
        surfaceCompatible: surfaceCompatible || null,
        applicationType, contentAmount: contentAmount ? Number(contentAmount) : null,
        contentUnit, isActive, isFeatured, isOffer, isNew,
        images: {
          create: images && images.length > 0 ? images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            sortOrder: idx
          })) : []
        }
      },
      include: { images: true }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.id;
    if (updateData.brandId) updateData.brandId = Number(updateData.brandId);
    if (updateData.categoryId) updateData.categoryId = Number(updateData.categoryId);
    if (updateData.costPrice) updateData.costPrice = Number(updateData.costPrice);
    if (updateData.salePrice) updateData.salePrice = Number(updateData.salePrice);
    if (updateData.stock) updateData.stock = Number(updateData.stock);
    if (updateData.minStock) updateData.minStock = Number(updateData.minStock);
    if (updateData.contentAmount) updateData.contentAmount = Number(updateData.contentAmount);

    // Handle images manually if needed, or assume they are managed separately
    delete updateData.images; 

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData
    });
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct
};

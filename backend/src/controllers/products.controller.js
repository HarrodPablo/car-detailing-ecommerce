const { PrismaClient } = require('@prisma/client');
const cloudinary = require('../utils/cloudinary.config');
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
        images: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Error en Controlador:', error);
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
        images: true,
      }
    });
    if (!product) {
      res.status(404);
      throw new Error('Producto no encontrado');
    }
    res.json(product);
  } catch (error) {
    console.error('Error en Controlador:', error);
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name, slug, sku, description, brandId, categoryId, costPrice, salePrice, stock, minStock
    } = req.body;

    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

    if (!brandId || !categoryId) {
      return res.status(400).json({ error: 'La marca y la categoría son requeridas' });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug: productSlug,
        sku,
        longDescription: description || null,
        brandId: Number(brandId),
        categoryId: Number(categoryId),
        costPrice: costPrice ? Number(costPrice) : 0,
        salePrice: Number(salePrice),
        stock: stock ? Number(stock) : 0,
        minStock: minStock ? Number(minStock) : 5,
        images: req.file ? {
          create: [{ url: req.file.path, publicId: req.file.filename, isPrimary: true }]
        } : undefined
      },
      include: { brand: true, category: true, images: true }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name, slug, sku, description, brandId, categoryId, costPrice, salePrice, stock, minStock
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (sku) updateData.sku = sku;
    if (description !== undefined) updateData.longDescription = description || null;
    if (brandId !== undefined) updateData.brandId = Number(brandId);
    if (categoryId !== undefined) updateData.categoryId = Number(categoryId);
    if (costPrice !== undefined) updateData.costPrice = costPrice ? Number(costPrice) : 0;
    if (salePrice !== undefined) updateData.salePrice = Number(salePrice);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (minStock !== undefined) updateData.minStock = Number(minStock);

    if (req.file) {
      const existingImages = await prisma.productImage.findMany({
        where: { productId: Number(id) }
      });

      for (const img of existingImages) {
        if (img.publicId) {
          try {
            await cloudinary.uploader.destroy(img.publicId);
          } catch (err) {
            console.error('Error deleting image from Cloudinary:', err);
          }
        }
      }

      await prisma.productImage.deleteMany({
        where: { productId: Number(id) }
      });
      updateData.images = {
        create: [{
          url: req.file.path,
          publicId: req.file.filename
        }]
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData,
      include: { brand: true, category: true, images: true }
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error en Controlador:', error);
    next(error);
  }
};

const updateProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      res.status(400);
      throw new Error('No image provided');
    }
    const existingImages = await prisma.productImage.findMany({
      where: { productId: Number(id) }
    });

    for (const img of existingImages) {
      if (img.publicId) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
        } catch (err) {
          console.error('Error deleting image from Cloudinary:', err);
        }
      }
    }

    await prisma.productImage.deleteMany({
      where: { productId: Number(id) }
    });
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        images: {
          create: [{
            url: req.file.path,
            publicId: req.file.filename
          }]
        }
      },
      include: { brand: true, category: true, images: true }
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error en Controlador:', error);
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const existingImages = await prisma.productImage.findMany({
      where: { productId: Number(req.params.id) }
    });

    await Promise.all(
      existingImages
        .filter(img => img.publicId)
        .map(img =>
          cloudinary.uploader.destroy(img.publicId).catch(err => {
            console.error('Error deleting image from Cloudinary:', err);
          })
        )
    );

    await prisma.product.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    if (error.code === 'P2003' || (error.message && error.message.includes('foreign key constraint'))) {
      return res.status(400).json({ error: 'No se puede eliminar el producto porque está incluido en un Combo o en pedidos históricos. Recomendamos editar el producto y ponerlo como "Inactivo".' });
    }
    next(error);
  }
};

module.exports = {
  getProducts, getProductBySlug, createProduct, updateProduct, updateProductImage, deleteProduct
};

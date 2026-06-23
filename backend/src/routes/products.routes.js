const express = require('express');
const { getProducts, getProductBySlug, createProduct, updateProduct, updateProductImage, deleteProduct } = require('../controllers/products.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', authenticate, requireAdmin, upload.single('image'), createProduct);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), updateProduct);
router.put('/:id/image', authenticate, requireAdmin, upload.single('image'), updateProductImage);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

module.exports = router;

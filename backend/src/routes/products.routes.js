const express = require('express');
const { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } = require('../controllers/products.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', authenticate, requireAdmin, createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

module.exports = router;

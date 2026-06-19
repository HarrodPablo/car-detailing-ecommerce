const express = require('express');
const { getAllProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:slug', getProductBySlug);
router.post('/', authenticate, requireAdmin, createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

module.exports = router;

const express = require('express');
const { getAllBrands, getBrandBySlug, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getAllBrands);
router.get('/:slug', getBrandBySlug);
router.post('/', authenticate, requireAdmin, createBrand);
router.put('/:id', authenticate, requireAdmin, updateBrand);
router.delete('/:id', authenticate, requireAdmin, deleteBrand);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getBrands, createBrand } = require('../controllers/brands.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getBrands);
router.post('/', protect, createBrand);

module.exports = router;

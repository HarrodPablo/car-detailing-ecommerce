const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categories.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getCategories);
router.post('/', protect, createCategory);

module.exports = router;

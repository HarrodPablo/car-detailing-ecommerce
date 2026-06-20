const express = require('express');
const { getAllCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory } = require('../controllers/categories.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', authenticate, requireAdmin, createCategory);
router.put('/:id', authenticate, requireAdmin, updateCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

module.exports = router;

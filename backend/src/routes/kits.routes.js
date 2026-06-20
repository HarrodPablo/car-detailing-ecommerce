const express = require('express');
const { getAllKits, getKitBySlug, createKit, updateKit, deleteKit } = require('../controllers/kits.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getAllKits);
router.get('/:slug', getKitBySlug);
router.post('/', authenticate, requireAdmin, createKit);
router.put('/:id', authenticate, requireAdmin, updateKit);
router.delete('/:id', authenticate, requireAdmin, deleteKit);

module.exports = router;

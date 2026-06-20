const express = require('express');
const { getLotsByProductId, createLot, updateLot, deleteLot } = require('../controllers/lots.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/product/:productId', authenticate, requireAdmin, getLotsByProductId);
router.post('/', authenticate, requireAdmin, createLot);
router.put('/:id', authenticate, requireAdmin, updateLot);
router.delete('/:id', authenticate, requireAdmin, deleteLot);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrderStatus } = require('../controllers/orders.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', protect, getOrders);
router.post('/', protect, createOrder);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;

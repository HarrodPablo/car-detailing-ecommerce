const express = require('express');
const { getOrders, createOrder, updateOrderStatus } = require('../controllers/orders.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticate, requireAdmin, getOrders);
router.post('/', createOrder); // This can be public as orders come from WhatsApp or FrontEnd
router.patch('/:id/status', authenticate, requireAdmin, updateOrderStatus);

module.exports = router;

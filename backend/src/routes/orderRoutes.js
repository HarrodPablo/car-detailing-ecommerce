const express = require('express');
const { getAllOrders, createOrder, updateOrderStatus } = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticate, requireAdmin, getAllOrders);
router.post('/', createOrder); // This can be public as orders come from WhatsApp or FrontEnd
router.patch('/:id/status', authenticate, requireAdmin, updateOrderStatus);

module.exports = router;

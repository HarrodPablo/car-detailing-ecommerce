const express = require('express');
const { getDashboardStats, getSalesChart } = require('../controllers/reportController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/dashboard', authenticate, requireAdmin, getDashboardStats);
router.get('/sales-chart', authenticate, requireAdmin, getSalesChart);

module.exports = router;

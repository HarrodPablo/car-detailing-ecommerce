const express = require('express');
const router = express.Router();
const { getStockAlerts, getLotExpiryAlerts } = require('../controllers/alerts.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/stock', protect, getStockAlerts);
router.get('/lotes', protect, getLotExpiryAlerts);

module.exports = router;

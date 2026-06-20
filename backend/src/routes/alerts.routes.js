const express = require('express');
const router = express.Router();
const { getStockAlerts, getLotExpiryAlerts } = require('../controllers/alerts.controller');
const { authenticate } = require('../middlewares/auth');

router.get('/stock', authenticate, getStockAlerts);
router.get('/lotes', authenticate, getLotExpiryAlerts);

module.exports = router;

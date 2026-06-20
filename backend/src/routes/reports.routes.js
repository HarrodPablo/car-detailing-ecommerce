const express = require('express');
const router = express.Router();
const { getVentasReport, getMarcasReport } = require('../controllers/reports.controller');
const { authenticate } = require('../middlewares/auth');

router.get('/ventas', authenticate, getVentasReport);
router.get('/marcas', authenticate, getMarcasReport);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getVentasReport, getMarcasReport, getJuntosReport } = require('../controllers/reports.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/ventas', protect, getVentasReport);
router.get('/marcas', protect, getMarcasReport);
router.get('/juntos', protect, getJuntosReport);

module.exports = router;

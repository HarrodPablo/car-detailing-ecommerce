const express = require('express');
const router = express.Router();
const { 
  getVentasReport, 
  getMarcasReport,
  getResumenReport,
  getProductosTopReport,
  getCategoriasReport
} = require('../controllers/reports.controller');
const { authenticate } = require('../middlewares/auth');

router.get('/resumen', authenticate, getResumenReport);
router.get('/ventas', authenticate, getVentasReport);
router.get('/marcas', authenticate, getMarcasReport);
router.get('/productos-top', authenticate, getProductosTopReport);
router.get('/categorias', authenticate, getCategoriasReport);

module.exports = router;

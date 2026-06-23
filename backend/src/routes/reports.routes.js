const express = require('express');
const router = express.Router();
const { 
  getVentasReport, 
  getMarcasReport,
  getResumenReport,
  getProductosTopReport,
  getCategoriasReport,
  analizarIA
} = require('../controllers/reports.controller');
const { authenticate } = require('../middlewares/auth');

router.get('/resumen', authenticate, getResumenReport);
router.get('/ventas', authenticate, getVentasReport);
router.get('/marcas', authenticate, getMarcasReport);
router.get('/productos-top', authenticate, getProductosTopReport);
router.get('/categorias', authenticate, getCategoriasReport);
router.post('/analizar-ia', authenticate, analizarIA);

module.exports = router;

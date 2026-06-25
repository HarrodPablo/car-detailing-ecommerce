const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getGastos, createGasto, deleteGasto, escanearFactura, togglePagado } = require('../controllers/gastos.controller');
const { authenticate } = require('../middlewares/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authenticate, getGastos);
router.post('/', authenticate, createGasto);
router.delete('/:id', authenticate, deleteGasto);
router.post('/escanear-factura', authenticate, upload.single('factura'), escanearFactura);
router.patch('/:id/toggle-pagado', authenticate, togglePagado);

module.exports = router;

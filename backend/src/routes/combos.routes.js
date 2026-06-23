const express = require('express');
const router = express.Router();
const { getCombos, getComboById, createCombo, deleteCombo } = require('../controllers/combos.controller');
const { authenticate } = require('../middlewares/auth');

router.get('/', getCombos);                          // público
router.get('/:id', getComboById);                    // público
router.post('/', authenticate, createCombo);          // admin
router.delete('/:id', authenticate, deleteCombo);    // admin

module.exports = router;

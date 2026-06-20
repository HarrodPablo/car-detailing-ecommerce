const express = require('express');
const router = express.Router();
const { getCombos, createCombo, deleteCombo } = require('../controllers/combos.controller');
const { authenticate } = require('../middlewares/auth');

router.get('/', getCombos);                          // público
router.post('/', authenticate, createCombo);          // admin
router.delete('/:id', authenticate, deleteCombo);    // admin

module.exports = router;

const express = require('express');
const router = express.Router();
const { getCombos, createCombo, updateCombo, deleteCombo } = require('../controllers/combos.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getCombos);
router.post('/', protect, createCombo);
router.put('/:id', protect, updateCombo);
router.delete('/:id', protect, deleteCombo);

module.exports = router;

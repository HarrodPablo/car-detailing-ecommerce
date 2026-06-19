const express = require('express');
const router = express.Router();
const { getKits, createKit } = require('../controllers/kits.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getKits);
router.post('/', protect, createKit);

module.exports = router;

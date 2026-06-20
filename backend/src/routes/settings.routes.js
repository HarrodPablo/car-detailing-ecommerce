const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getSettings);
router.put('/', authenticate, requireAdmin, updateSettings);

module.exports = router;

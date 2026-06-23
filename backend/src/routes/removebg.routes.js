const express = require('express');
const router = express.Router();
const multer = require('multer');
const { removeBg } = require('../controllers/removebg.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const uploadMemory = multer({ storage: multer.memoryStorage() });

router.post('/', authenticate, requireAdmin, uploadMemory.single('image'), removeBg);

module.exports = router;
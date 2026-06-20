const express = require('express');
const router = express.Router();
const { login } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');

router.post('/login', login);
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;

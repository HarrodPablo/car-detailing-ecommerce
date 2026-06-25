const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { authenticate } = require('../middlewares/auth');

// Inicia el flujo OAuth con Google
router.get('/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    session: false
  })
);

// Google redirige acá después del login
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    
    if (err) {
      console.error('❌ Error en OAuth callback:', err);
      return res.redirect(
        `${process.env.FRONTEND_URL}/admin/login?error=server-error`
      );
    }
    
    if (!user) {

      return res.redirect(
        `${process.env.FRONTEND_URL}/admin/login?error=no-autorizado`
      );
    }


    
    return res.redirect(
      `${process.env.FRONTEND_URL}/admin/auth/callback?token=${user.token}`
    );
    
  })(req, res, next);
});

// Verificar token activo
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;

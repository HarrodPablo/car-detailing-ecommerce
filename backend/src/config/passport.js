const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { generateToken } = require('../utils/jwt');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value.trim().toLowerCase();
    
    // Debug temporal - mostrá qué email llega y qué hay en la lista

    
    const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS
      .split(',')
      .map(e => e.trim().toLowerCase());
    


    if (!allowedEmails.includes(email)) {

      return done(null, false, { message: 'Email no autorizado' });
    }

    // generateToken recibe el payload como objeto
    const token = generateToken({ email, role: 'admin' }, '8h');

    return done(null, { email, token });
  } catch (error) {
    console.error('❌ Error en passport strategy:', error);
    return done(error);
  }
}));

module.exports = passport;

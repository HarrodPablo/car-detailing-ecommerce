const { generateToken } = require('../utils/jwt.utils');

const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Hardcoded simple admin for this case since User model is not present
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@detailinghub.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (email === adminEmail && password === adminPassword) {
    const user = {
      id: 1,
      name: 'Admin',
      email: adminEmail,
      role: 'ADMIN'
    };
    const token = generateToken(user);
    res.json({ user, token });
  } else {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
};

module.exports = { login };

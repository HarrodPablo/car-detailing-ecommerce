const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email?.trim();
    const cleanPassword = password?.trim();

    const adminEmail = await prisma.setting.findFirst({ where: { key: 'admin_email' } });
    const adminPassword = await prisma.setting.findFirst({ where: { key: 'admin_password' } });

    if (!adminEmail || cleanEmail !== adminEmail.value) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(cleanPassword, adminPassword.value);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { email: cleanEmail, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { email: cleanEmail, role: 'admin' } });
  } catch (error) {
    console.error('Error en Controlador:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = { login };
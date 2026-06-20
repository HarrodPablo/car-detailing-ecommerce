const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('BODY RECIBIDO:', { email, password }); // TEMP

    const adminEmail = await prisma.setting.findFirst({ where: { key: 'admin_email' } });
    const adminPassword = await prisma.setting.findFirst({ where: { key: 'admin_password' } });

    console.log('DB email:', adminEmail?.value); // TEMP
    console.log('Email match?:', email === adminEmail?.value); // TEMP

    if (!adminEmail || email !== adminEmail.value) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, adminPassword.value);
    console.log('Password match?:', valid); // TEMP

    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token, user: { email, role: 'admin' } });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = { login };

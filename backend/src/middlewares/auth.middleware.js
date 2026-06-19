const { verifyToken } = require('../utils/jwt.utils');

const protect = (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'No autorizado, no hay token' });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'No autorizado, token fallido o expirado' });
    }

    // Since there's no User model, we just attach the decoded info directly
    req.admin = decoded;
    
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'No autorizado' });
  }
};

module.exports = { protect };

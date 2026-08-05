const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_ersa_group_jwt_key_2026';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Acceso no autorizado. Token JWT faltante.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token JWT inválido o expirado.' });
  }
}

function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.usuario = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Ignorar si el token opcional es inválido
    }
  }
  next();
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  JWT_SECRET
};

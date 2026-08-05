const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email y contraseña son obligatorios.' });
  }

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email.toLowerCase().trim()]);
    const usuario = result.rows[0];

    if (!usuario) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas. Usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(password, usuario.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas. Contraseña incorrecta.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ success: false, error: 'Error del servidor al iniciar sesión.' });
  }
}

async function getMe(req, res) {
  return res.json({
    success: true,
    usuario: req.usuario
  });
}

module.exports = {
  login,
  getMe
};

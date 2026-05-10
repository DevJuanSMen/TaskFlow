const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

/**
 * Middleware de autenticación JWT.
 * Verifica el token y adjunta el usuario al request.
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Obtener token del header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token no proporcionado.',
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Buscar usuario y adjuntarlo al request
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Usuario no encontrado.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada. Contacte al administrador.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado. Token inválido o expirado.',
    });
  }
};

/**
 * Middleware de autorización por roles.
 * Restringe el acceso según los roles permitidos.
 * @param  {...string} roles - Roles permitidos (ej: 'ADMIN', 'PROJECT_MANAGER')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `El rol '${req.user.role}' no tiene acceso a este recurso.`,
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };

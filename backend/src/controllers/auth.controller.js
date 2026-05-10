const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

/**
 * Genera un token JWT para el usuario
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

/**
 * @desc    Registrar nuevo usuario
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con ese correo electrónico',
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'DEVELOPER',
    });

    // Generar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message,
    });
  }
};

/**
 * @desc    Login de usuario
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione email y contraseña',
      });
    }

    // Buscar usuario (incluir password para comparar)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada. Contacte al administrador.',
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Actualizar último acceso (RF-01.6)
    user.lastAccess = new Date();
    await user.save();

    // Generar token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener perfil del usuario autenticado
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar perfil del usuario
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, avatar, description } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (description !== undefined) updateData.description = description;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message,
    });
  }
};

/**
 * @desc    Cerrar sesión (logout)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  // En JWT el logout se maneja del lado del cliente eliminando el token.
  // Aquí solo registramos el evento.
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente',
  });
};

/**
 * @desc    Obtener todos los usuarios (para asignar a proyectos)
 * @route   GET /api/auth/users
 * @access  Private
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('name email role avatar');
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message,
    });
  }
};

module.exports = { register, login, getMe, updateProfile, logout, getUsers };

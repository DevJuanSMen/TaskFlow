const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, logout, getUsers } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/logout', authenticate, logout);
router.get('/users', authenticate, getUsers);

module.exports = router;

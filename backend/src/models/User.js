const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Formato de correo inválido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false, // No incluir en consultas por defecto
    },
    role: {
      type: String,
      enum: {
        values: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'],
        message: 'Rol inválido: {VALUE}',
      },
      default: 'DEVELOPER',
    },
    avatar: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
      default: '',
    },
    lastAccess: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ============================================
// Middleware: Hash de contraseña antes de guardar
// ============================================
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============================================
// Métodos de instancia
// ============================================

/**
 * Compara la contraseña proporcionada con el hash almacenado
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Retorna el usuario sin campos sensibles
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);

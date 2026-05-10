const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la columna es obligatorio'],
    trim: true,
  },
  order: {
    type: Number,
    required: true,
  },
  wipLimit: {
    type: Number,
    default: 0, // 0 = sin límite
    min: [0, 'El WIP limit no puede ser negativo'],
  },
});

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del tablero es obligatorio'],
      trim: true,
      maxlength: [200, 'El nombre no puede exceder 200 caracteres'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    columns: {
      type: [columnSchema],
      default: () => [
        { name: 'Por hacer', order: 0, wipLimit: 0 },
        { name: 'En progreso', order: 1, wipLimit: 0 },
        { name: 'En revisión', order: 2, wipLimit: 0 },
        { name: 'Completado', order: 3, wipLimit: 0 },
      ],
    },
  },
  {
    timestamps: true,
  }
);

boardSchema.index({ project: 1 });

module.exports = mongoose.model('Board', boardSchema);

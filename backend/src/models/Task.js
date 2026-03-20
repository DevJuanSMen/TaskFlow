const mongoose = require('mongoose');

// Sub-schema para etiquetas
const labelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  color: { type: String, required: true, default: '#3B82F6' },
});

// Sub-schema para subtareas
const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
});

// Sub-schema para comentarios
const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// Sub-schema para adjuntos
const attachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
});

// Sub-schema para entradas de tiempo
const timeEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hours: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now },
});

// Sub-schema para historial de cambios
const historyEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  field: { type: String, default: null },
  oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
  newValue: { type: mongoose.Schema.Types.Mixed, default: null },
  timestamp: { type: Date, default: Date.now },
});

// ============================================
// Schema principal de Tarea
// ============================================
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título de la tarea es obligatorio'],
      trim: true,
      maxlength: [300, 'El título no puede exceder 300 caracteres'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [5000, 'La descripción no puede exceder 5000 caracteres'],
    },
    priority: {
      type: String,
      enum: {
        values: ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'],
        message: 'Prioridad inválida: {VALUE}',
      },
      default: 'MEDIA',
    },
    type: {
      type: String,
      enum: {
        values: ['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT'],
        message: 'Tipo inválido: {VALUE}',
      },
      default: 'TASK',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimation: {
      type: Number, // horas estimadas
      default: 0,
      min: [0, 'La estimación no puede ser negativa'],
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    column: {
      type: String,
      required: [true, 'La columna es obligatoria'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    labels: [labelSchema],
    subtasks: [subtaskSchema],
    comments: [commentSchema],
    attachments: [attachmentSchema],
    timeEntries: [timeEntrySchema],
    history: [historyEntrySchema],
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// Virtuals
// ============================================

// Indica si la tarea está vencida
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate) return false;
  return new Date() > this.dueDate && this.column !== 'Completado';
});

// Progreso de subtareas (%)
taskSchema.virtual('subtaskProgress').get(function () {
  if (!this.subtasks || this.subtasks.length === 0) return 100;
  const completed = this.subtasks.filter((s) => s.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

// Total de horas registradas
taskSchema.virtual('totalTimeSpent').get(function () {
  if (!this.timeEntries || this.timeEntries.length === 0) return 0;
  return this.timeEntries.reduce((total, entry) => total + entry.hours, 0);
});

// Asegurar que los virtuals se incluyan en JSON
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

// Índices
taskSchema.index({ board: 1, column: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);

const express = require('express');
const router = express.Router();
const {
  createTask,
  createTaskWithBuilder,
  getTasksByBoard,
  getTask,
  updateTask,
  moveTask,
  deleteTask,
  cloneTask,
  addSubtask,
  toggleSubtask,
  addComment,
  deleteComment,
  addAttachment,
  addTimeEntry,
} = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Crear tareas (2 endpoints: Factory Method y Builder)
router.post('/', createTask);           // Factory Method
router.post('/build', createTaskWithBuilder); // Builder

// CRUD tareas
router.get('/board/:boardId', getTasksByBoard);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);

// Acciones sobre tareas
router.put('/:id/move', moveTask);
router.post('/:id/clone', cloneTask);   // Prototype

// Subtareas
router.post('/:id/subtasks', addSubtask);
router.put('/:id/subtasks/:subtaskId', toggleSubtask);

// Comentarios
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

// Adjuntos
router.post('/:id/attachments', addAttachment);

// Tiempo
router.post('/:id/time', addTimeEntry);

module.exports = router;

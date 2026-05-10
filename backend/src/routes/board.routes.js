const express = require('express');
const router = express.Router();
const {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  addColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
} = require('../controllers/board.controller');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/project/:projectId', getBoards);
router.route('/').post(createBoard);
router.route('/:id').get(getBoard).put(updateBoard).delete(deleteBoard);

// Columnas
router.post('/:id/columns', addColumn);
router.put('/:id/columns/reorder', reorderColumns);
router.put('/:id/columns/:columnId', updateColumn);
router.delete('/:id/columns/:columnId', deleteColumn);

module.exports = router;

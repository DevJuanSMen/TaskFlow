const Board = require('../models/Board');
const Project = require('../models/Project');
const Task = require('../models/Task');

/**
 * @desc    Obtener tableros de un proyecto
 * @route   GET /api/boards/project/:projectId
 * @access  Private
 */
const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ project: req.params.projectId });
    res.json({
      success: true,
      count: boards.length,
      data: boards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tableros',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener tablero por ID con tareas
 * @route   GET /api/boards/:id
 * @access  Private
 */
const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Tablero no encontrado',
      });
    }

    // Obtener tareas del tablero agrupadas por columna
    const tasks = await Task.find({ board: board._id })
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1 });

    // Agrupar tareas por columna
    const tasksByColumn = {};
    board.columns.forEach((col) => {
      tasksByColumn[col.name] = tasks.filter((t) => t.column === col.name);
    });

    res.json({
      success: true,
      data: {
        board: board.toObject(),
        tasks: tasksByColumn,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tablero',
      error: error.message,
    });
  }
};

/**
 * @desc    Crear nuevo tablero
 * @route   POST /api/boards
 * @access  Private
 */
const createBoard = async (req, res) => {
  try {
    const { name, projectId, columns } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    const board = await Board.create({
      name,
      project: projectId,
      ...(columns && { columns }),
    });

    res.status(201).json({
      success: true,
      message: 'Tablero creado exitosamente',
      data: board,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear tablero',
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar tablero (nombre)
 * @route   PUT /api/boards/:id
 * @access  Private
 */
const updateBoard = async (req, res) => {
  try {
    const { name } = req.body;
    const board = await Board.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Tablero no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Tablero actualizado',
      data: board,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tablero',
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar tablero
 * @route   DELETE /api/boards/:id
 * @access  Private
 */
const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Tablero no encontrado',
      });
    }

    // Eliminar tareas del tablero
    await Task.deleteMany({ board: board._id });
    await Board.findByIdAndDelete(board._id);

    res.json({
      success: true,
      message: 'Tablero eliminado exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar tablero',
      error: error.message,
    });
  }
};

/**
 * @desc    Agregar columna a tablero
 * @route   POST /api/boards/:id/columns
 * @access  Private
 */
const addColumn = async (req, res) => {
  try {
    const { name, wipLimit } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Tablero no encontrado',
      });
    }

    const maxOrder = board.columns.reduce((max, col) => Math.max(max, col.order), -1);

    board.columns.push({
      name,
      order: maxOrder + 1,
      wipLimit: wipLimit || 0,
    });

    await board.save();

    res.status(201).json({
      success: true,
      message: 'Columna agregada',
      data: board,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar columna',
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar columna (renombrar, WIP limit)
 * @route   PUT /api/boards/:id/columns/:columnId
 * @access  Private
 */
const updateColumn = async (req, res) => {
  try {
    const { name, wipLimit } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Tablero no encontrado',
      });
    }

    const column = board.columns.id(req.params.columnId);
    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Columna no encontrada',
      });
    }

    // Si se renombra la columna, actualizar las tareas que estén en ella
    if (name && name !== column.name) {
      await Task.updateMany(
        { board: board._id, column: column.name },
        { column: name }
      );
      column.name = name;
    }

    if (wipLimit !== undefined) column.wipLimit = wipLimit;

    await board.save();

    res.json({
      success: true,
      message: 'Columna actualizada',
      data: board,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar columna',
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar columna
 * @route   DELETE /api/boards/:id/columns/:columnId
 * @access  Private
 */
const deleteColumn = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Tablero no encontrado',
      });
    }

    if (board.columns.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'El tablero debe tener al menos una columna',
      });
    }

    const column = board.columns.id(req.params.columnId);
    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Columna no encontrada',
      });
    }

    // Mover tareas de esta columna a la primera columna disponible
    const firstColumn = board.columns.find(
      (c) => c._id.toString() !== req.params.columnId
    );
    await Task.updateMany(
      { board: board._id, column: column.name },
      { column: firstColumn.name }
    );

    board.columns.pull(req.params.columnId);
    await board.save();

    res.json({
      success: true,
      message: 'Columna eliminada. Las tareas se movieron a la primera columna.',
      data: board,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar columna',
      error: error.message,
    });
  }
};

/**
 * @desc    Reordenar columnas
 * @route   PUT /api/boards/:id/columns/reorder
 * @access  Private
 */
const reorderColumns = async (req, res) => {
  try {
    const { columnOrder } = req.body; // Array de {columnId, order}
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Tablero no encontrado',
      });
    }

    columnOrder.forEach(({ columnId, order }) => {
      const column = board.columns.id(columnId);
      if (column) {
        column.order = order;
      }
    });

    // Ordenar las columnas
    board.columns.sort((a, b) => a.order - b.order);
    await board.save();

    res.json({
      success: true,
      message: 'Columnas reordenadas',
      data: board,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al reordenar columnas',
      error: error.message,
    });
  }
};

module.exports = {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  addColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
};

const Task = require('../models/Task');
const Board = require('../models/Board');
const { getTaskCreator } = require('../patterns/TaskFactory');
const { TaskBuilder } = require('../patterns/TaskBuilder');
const { TaskPrototype } = require('../patterns/Prototype');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para adjuntos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single('file');

/**
 * @desc    Crear tarea usando Factory Method
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
  try {
    const { title, description, priority, type, dueDate, estimation, boardId, column, assignees, labels, subtasks } = req.body;

    // Verificar que el tablero existe
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Tablero no encontrado',
      });
    }

    // Verificar WIP limit
    const targetColumn = column || 'Por hacer';
    const colConfig = board.columns.find((c) => c.name === targetColumn);
    if (colConfig && colConfig.wipLimit > 0) {
      const currentTaskCount = await Task.countDocuments({ board: boardId, column: targetColumn });
      if (currentTaskCount >= colConfig.wipLimit) {
        return res.status(400).json({
          success: false,
          message: `La columna "${targetColumn}" ha alcanzado su límite WIP de ${colConfig.wipLimit} tareas`,
        });
      }
    }

    // ============================================
    // Usar Factory Method para crear la tarea
    // ============================================
    const taskType = type || 'TASK';
    const creator = getTaskCreator(taskType);
    const taskData = creator.create({
      title,
      description,
      priority,
      dueDate,
      estimation,
      board: boardId,
      column: targetColumn,
      project: board.project,
      createdBy: req.user._id,
      assignees: assignees || [],
      labels,
      subtasks: subtasks || [],
    });

    const task = await Task.create(taskData);

    const populatedTask = await Task.findById(task._id)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: `Tarea tipo '${taskType}' creada usando Factory Method`,
      pattern: 'FACTORY_METHOD',
      data: populatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear tarea',
      error: error.message,
    });
  }
};

/**
 * @desc    Crear tarea usando Builder (creación avanzada)
 * @route   POST /api/tasks/build
 * @access  Private
 */
const createTaskWithBuilder = async (req, res) => {
  try {
    const { title, description, priority, type, dueDate, estimation, boardId, column, assignees, labels, subtasks } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Tablero no encontrado',
      });
    }

    // ============================================
    // Usar Builder para construir la tarea paso a paso
    // ============================================
    const builder = new TaskBuilder();
    builder
      .setTitle(title)
      .setBoard(boardId)
      .setProject(board.project.toString())
      .setCreatedBy(req.user._id.toString())
      .setColumn(column || 'Por hacer');

    if (description) builder.setDescription(description);
    if (priority) builder.setPriority(priority);
    if (type) builder.setType(type);
    if (dueDate) builder.setDueDate(dueDate);
    if (estimation) builder.setEstimation(estimation);
    if (assignees) builder.setAssignees(assignees);

    // Agregar etiquetas una por una
    if (labels && labels.length > 0) {
      labels.forEach((label) => builder.addLabel(label.name, label.color));
    }

    // Agregar subtareas una por una
    if (subtasks && subtasks.length > 0) {
      subtasks.forEach((subtask) => builder.addSubtask(subtask.title || subtask));
    }

    const taskData = builder.build();
    const task = await Task.create(taskData);

    const populatedTask = await Task.findById(task._id)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Tarea creada usando Builder pattern',
      pattern: 'BUILDER',
      data: populatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear tarea con Builder',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener tareas de un tablero
 * @route   GET /api/tasks/board/:boardId
 * @access  Private
 */
const getTasksByBoard = async (req, res) => {
  try {
    const { priority, type, assignee, label, search } = req.query;
    const filter = { board: req.params.boardId };

    // Filtros (RF-07.2)
    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    if (assignee) filter.assignees = assignee;
    if (label) filter['labels.name'] = label;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tareas',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener tarea por ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.user', 'name email avatar')
      .populate('attachments.uploadedBy', 'name email avatar')
      .populate('timeEntries.user', 'name email avatar')
      .populate('history.user', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tarea',
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar tarea
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada',
      });
    }

    const { title, description, priority, type, dueDate, estimation, assignees, labels } = req.body;

    // Registrar cambios en el historial (RF-06.1)
    const changes = [];
    if (title && title !== task.title) {
      changes.push({ field: 'title', oldValue: task.title, newValue: title });
      task.title = title;
    }
    if (description !== undefined && description !== task.description) {
      changes.push({ field: 'description', oldValue: task.description, newValue: description });
      task.description = description;
    }
    if (priority && priority !== task.priority) {
      changes.push({ field: 'priority', oldValue: task.priority, newValue: priority });
      task.priority = priority;
    }
    if (type && type !== task.type) {
      changes.push({ field: 'type', oldValue: task.type, newValue: type });
      task.type = type;
    }
    if (dueDate !== undefined) {
      changes.push({ field: 'dueDate', oldValue: task.dueDate, newValue: dueDate });
      task.dueDate = dueDate;
    }
    if (estimation !== undefined) {
      changes.push({ field: 'estimation', oldValue: task.estimation, newValue: estimation });
      task.estimation = estimation;
    }
    if (assignees) {
      task.assignees = assignees;
    }
    if (labels) {
      task.labels = labels;
    }

    // Agregar al historial
    changes.forEach((change) => {
      task.history.push({
        user: req.user._id,
        action: 'UPDATED',
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        timestamp: new Date(),
      });
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json({
      success: true,
      message: 'Tarea actualizada',
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tarea',
      error: error.message,
    });
  }
};

/**
 * @desc    Mover tarea entre columnas (RF-04.4)
 * @route   PUT /api/tasks/:id/move
 * @access  Private
 */
const moveTask = async (req, res) => {
  try {
    const { column, order } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada',
      });
    }

    // Verificar WIP limit de la columna destino
    const board = await Board.findById(task.board);
    const targetCol = board.columns.find((c) => c.name === column);
    if (targetCol && targetCol.wipLimit > 0) {
      const currentCount = await Task.countDocuments({
        board: task.board,
        column,
        _id: { $ne: task._id },
      });
      if (currentCount >= targetCol.wipLimit) {
        return res.status(400).json({
          success: false,
          message: `La columna "${column}" ha alcanzado su límite WIP de ${targetCol.wipLimit}`,
        });
      }
    }

    const oldColumn = task.column;
    task.column = column;
    if (order !== undefined) task.order = order;

    // Registrar movimiento en historial
    task.history.push({
      user: req.user._id,
      action: 'MOVED',
      field: 'column',
      oldValue: oldColumn,
      newValue: column,
      timestamp: new Date(),
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json({
      success: true,
      message: `Tarea movida de "${oldColumn}" a "${column}"`,
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al mover tarea',
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar tarea
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Tarea eliminada exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar tarea',
      error: error.message,
    });
  }
};

/**
 * @desc    Clonar tarea (PATRÓN PROTOTYPE) (RF-04.8)
 * @route   POST /api/tasks/:id/clone
 * @access  Private
 */
const cloneTask = async (req, res) => {
  try {
    const originalTask = await Task.findById(req.params.id);

    if (!originalTask) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada',
      });
    }

    // Usar patrón Prototype
    const prototype = new TaskPrototype(originalTask.toObject());
    const clonedData = prototype.clone(req.user._id);

    const clonedTask = await Task.create(clonedData);

    const populatedTask = await Task.findById(clonedTask._id)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Tarea clonada usando Patrón Prototype',
      pattern: 'PROTOTYPE',
      data: populatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al clonar tarea',
      error: error.message,
    });
  }
};

/**
 * @desc    Agregar subtarea (RF-04.5)
 * @route   POST /api/tasks/:id/subtasks
 * @access  Private
 */
const addSubtask = async (req, res) => {
  try {
    const { title } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada',
      });
    }

    task.subtasks.push({ title, completed: false });
    task.history.push({
      user: req.user._id,
      action: 'SUBTASK_ADDED',
      field: 'subtasks',
      oldValue: null,
      newValue: title,
      timestamp: new Date(),
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Subtarea agregada',
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar subtarea',
      error: error.message,
    });
  }
};

/**
 * @desc    Togglear subtarea completada
 * @route   PUT /api/tasks/:id/subtasks/:subtaskId
 * @access  Private
 */
const toggleSubtask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada',
      });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtarea no encontrada',
      });
    }

    subtask.completed = !subtask.completed;
    subtask.completedAt = subtask.completed ? new Date() : null;

    await task.save();

    res.json({
      success: true,
      message: `Subtarea ${subtask.completed ? 'completada' : 'reabierta'}`,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar subtarea',
      error: error.message,
    });
  }
};

/**
 * @desc    Agregar comentario (RF-04.6)
 * @route   POST /api/tasks/:id/comments
 * @access  Private
 */
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada',
      });
    }

    task.comments.push({
      user: req.user._id,
      content,
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('comments.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Comentario agregado',
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar comentario',
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar comentario
 * @route   DELETE /api/tasks/:id/comments/:commentId
 * @access  Private
 */
const deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada',
      });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado',
      });
    }

    // Solo el autor puede eliminar su comentario
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes eliminar tus propios comentarios',
      });
    }

    task.comments.pull(req.params.commentId);
    await task.save();

    res.json({
      success: true,
      message: 'Comentario eliminado',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar comentario',
      error: error.message,
    });
  }
};

/**
 * @desc    Subir archivo adjunto (RF-04.7)
 * @route   POST /api/tasks/:id/attachments
 * @access  Private
 */
const addAttachment = async (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'El archivo excede el tamaño máximo de 10 MB',
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Error al subir archivo',
          error: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó archivo',
        });
      }

      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada',
        });
      }

      task.attachments.push({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`,
        uploadedBy: req.user._id,
      });

      await task.save();

      res.status(201).json({
        success: true,
        message: 'Archivo adjuntado',
        data: task,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al adjuntar archivo',
        error: error.message,
      });
    }
  });
};

/**
 * @desc    Registrar tiempo trabajado (RF-04.10)
 * @route   POST /api/tasks/:id/time
 * @access  Private
 */
const addTimeEntry = async (req, res) => {
  try {
    const { hours, description, date } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada',
      });
    }

    task.timeEntries.push({
      user: req.user._id,
      hours,
      description: description || '',
      date: date || new Date(),
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: `${hours} horas registradas`,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar tiempo',
      error: error.message,
    });
  }
};

module.exports = {
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
};

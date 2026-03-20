const Project = require('../models/Project');
const Board = require('../models/Board');
const Task = require('../models/Task');
const User = require('../models/User');
const { ProjectPrototype } = require('../patterns/Prototype');

/**
 * @desc    Crear proyecto
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;

    const project = await Project.create({
      name,
      description,
      startDate: startDate || new Date(),
      endDate,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: req.user.role,
          joinedAt: new Date(),
        },
      ],
    });

    // Crear tablero por defecto automáticamente (RF-03.1)
    await Board.create({
      name: 'Tablero Principal',
      project: project._id,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Proyecto creado exitosamente con tablero por defecto',
      data: populatedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear proyecto',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener todos los proyectos del usuario
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Calcular progreso de cada proyecto (RF-02.4)
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id });
        const completedTasks = await Task.countDocuments({
          project: project._id,
          column: 'Completado',
        });
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          progress,
        };
      })
    );

    res.json({
      success: true,
      count: projectsWithProgress.length,
      data: projectsWithProgress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener proyectos',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener proyecto por ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    // Verificar acceso
    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember && project.owner._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'No tiene acceso a este proyecto',
      });
    }

    // Calcular progreso
    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({
      project: project._id,
      column: 'Completado',
    });
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      data: {
        ...project.toObject(),
        totalTasks,
        completedTasks,
        progress,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener proyecto',
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar proyecto
 * @route   PUT /api/projects/:id
 * @access  Private (owner o ADMIN)
 */
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    // Solo el owner o ADMIN pueden editar (RF-02.2)
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Solo el creador o un ADMIN pueden editar el proyecto',
      });
    }

    // Verificar si está archivado (RF-02.6)
    if (project.archived) {
      return res.status(400).json({
        success: false,
        message: 'No se puede editar un proyecto archivado',
      });
    }

    const { name, description, startDate, endDate, status } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (status) project.status = status;

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Proyecto actualizado exitosamente',
      data: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar proyecto',
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar proyecto
 * @route   DELETE /api/projects/:id
 * @access  Private (owner o ADMIN)
 */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Solo el creador o un ADMIN pueden eliminar el proyecto',
      });
    }

    // Eliminar tareas, tableros y el proyecto
    await Task.deleteMany({ project: project._id });
    await Board.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.json({
      success: true,
      message: 'Proyecto eliminado exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar proyecto',
      error: error.message,
    });
  }
};

/**
 * @desc    Clonar proyecto como plantilla (PATRÓN PROTOTYPE)
 * @route   POST /api/projects/:id/clone
 * @access  Private
 */
const cloneProject = async (req, res) => {
  try {
    const originalProject = await Project.findById(req.params.id);

    if (!originalProject) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    // Usar el patrón Prototype para clonar
    const prototype = new ProjectPrototype(originalProject.toObject());
    const clonedData = prototype.clone(req.user._id);

    // Crear el proyecto clonado
    const clonedProject = await Project.create({
      ...clonedData,
      members: [
        {
          user: req.user._id,
          role: req.user.role,
          joinedAt: new Date(),
        },
      ],
    });

    // Clonar los tableros del proyecto original (sin tareas) (RF-02.5)
    const originalBoards = await Board.find({ project: originalProject._id });
    for (const board of originalBoards) {
      await Board.create({
        name: board.name,
        project: clonedProject._id,
        columns: board.columns.map((col) => ({
          name: col.name,
          order: col.order,
          wipLimit: col.wipLimit,
        })),
      });
    }

    const populatedClone = await Project.findById(clonedProject._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: `Proyecto clonado exitosamente usando Patrón Prototype`,
      pattern: 'PROTOTYPE',
      data: populatedClone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al clonar proyecto',
      error: error.message,
    });
  }
};

/**
 * @desc    Archivar proyecto (RF-02.6)
 * @route   PUT /api/projects/:id/archive
 * @access  Private (owner o ADMIN)
 */
const archiveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Solo el creador o un ADMIN pueden archivar el proyecto',
      });
    }

    project.archived = !project.archived;
    project.status = project.archived ? 'ARCHIVADO' : 'COMPLETADO';
    await project.save();

    res.json({
      success: true,
      message: project.archived
        ? 'Proyecto archivado (solo lectura)'
        : 'Proyecto desarchivado',
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al archivar proyecto',
      error: error.message,
    });
  }
};

/**
 * @desc    Invitar miembro al proyecto (RF-02.3)
 * @route   POST /api/projects/:id/members
 * @access  Private (owner o ADMIN)
 */
const addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Solo el creador o un ADMIN pueden agregar miembros',
      });
    }

    const userToAdd = await User.findOne({ email, isActive: true });
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado con ese correo',
      });
    }

    // Verificar si ya es miembro
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya es miembro del proyecto',
      });
    }

    project.members.push({
      user: userToAdd._id,
      role: role || 'DEVELOPER',
      joinedAt: new Date(),
    });

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: `${userToAdd.name} agregado al proyecto`,
      data: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar miembro',
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar miembro del proyecto
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private (owner o ADMIN)
 */
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Solo el creador o un ADMIN pueden eliminar miembros',
      });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );

    await project.save();

    res.json({
      success: true,
      message: 'Miembro eliminado del proyecto',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar miembro',
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  cloneProject,
  archiveProject,
  addMember,
  removeMember,
};

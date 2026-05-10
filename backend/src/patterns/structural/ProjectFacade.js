const Project = require('../../models/Project');
const Board = require('../../models/Board');

class ProjectFacade {
  static async createProjectWithDefaults(data, user) {
    console.log('🏢 [Facade] Inicializando proyecto y subsistemas...');
    
    // 1. Crear proyecto
    const project = await Project.create({
      name: data.name,
      description: data.description,
      startDate: data.startDate || new Date(),
      endDate: data.endDate,
      owner: user._id,
      members: [
        {
          user: user._id,
          role: user.role,
          joinedAt: new Date(),
        },
      ],
    });

    // 2. Crear tablero por defecto automáticamente (Subsistema Board)
    console.log(`🏢 [Facade] Creando tablero por defecto para proyecto ${project._id}`);
    await Board.create({
      name: 'Tablero Principal',
      project: project._id,
    });

    // 3. Obtener proyecto populado
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
      
    return populatedProject;
  }
}

module.exports = ProjectFacade;

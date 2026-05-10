const Project = require('../../models/Project');
const Task = require('../../models/Task');

class ProjectCacheProxy {
  constructor() {
    this.cache = new Map();
  }

  async getUserProjects(userId) {
    const cacheKey = userId.toString();
    
    if (this.cache.has(cacheKey)) {
      console.log('🛡️ [Proxy] Retornando proyectos desde caché para usuario:', cacheKey);
      return this.cache.get(cacheKey);
    }

    console.log('🛡️ [Proxy] Consultando base de datos para usuario:', cacheKey);
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Calcular progreso
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

    this.cache.set(cacheKey, projectsWithProgress);
    
    // Invalidar caché después de 5 minutos
    setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);

    return projectsWithProgress;
  }

  clearCache(userId) {
    console.log('🛡️ [Proxy] Limpiando caché para usuario:', userId.toString());
    this.cache.delete(userId.toString());
  }
}

module.exports = new ProjectCacheProxy();

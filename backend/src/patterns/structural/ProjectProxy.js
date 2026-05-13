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

    // Calcular progreso usando el Patrón Composite
    const { TaskComposite, TaskLeaf } = require('./TaskComposite');

    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        
        const projectComposite = new TaskComposite(project.name);
        
        tasks.forEach(task => {
          if (task.subtasks && task.subtasks.length > 0) {
            // Si tiene subtareas, la tarea es un compuesto de sus subtareas
            const taskComp = new TaskComposite(task.title);
            task.subtasks.forEach(sub => {
              taskComp.add(new TaskLeaf(sub.title, sub.completed));
            });
            projectComposite.add(taskComp);
          } else {
            // Si no tiene subtareas, la tarea es una hoja
            projectComposite.add(new TaskLeaf(task.title, task.column === 'Completado'));
          }
        });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.column === 'Completado').length;
        const progress = projectComposite.calculatePercentage();

        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          progress,
          pattern: 'COMPOSITE', // Indicar que se usó Composite para el progreso
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

  clearAllCache() {
    console.log('🛡️ [Proxy] Limpiando TODA la caché de proyectos...');
    this.cache.clear();
  }
}

module.exports = new ProjectCacheProxy();

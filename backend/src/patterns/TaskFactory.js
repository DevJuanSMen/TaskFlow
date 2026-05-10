// ============================================
// PATRÓN FACTORY METHOD - Creación de Tareas
// ============================================
// Define una interfaz para crear tareas, pero permite que
// las subclases (creators) decidan qué tipo de tarea crear.
// Cada factory pre-configura campos por defecto según el tipo.
// ============================================

/**
 * Clase base abstracta: TaskCreator (Creator)
 * Define el Factory Method y un template para crear tareas.
 */
class TaskCreator {
  /**
   * Factory Method - debe ser implementado por las subclases.
   * @param {Object} data - Datos base de la tarea
   * @returns {Object} - Objeto de tarea con configuración por defecto
   */
  createTask(data) {
    throw new Error('El método createTask() debe ser implementado por la subclase');
  }

  /**
   * Template Method: Crea y configura una tarea completa.
   * Valida los datos, invoca el Factory Method, y aplica configuración final.
   */
  create(data) {
    // Validación base
    if (!data.title) {
      throw new Error('El título es obligatorio para crear una tarea');
    }

    // Invocar Factory Method (implementado por subclases)
    const task = this.createTask(data);

    // Agregar entrada en el historial de creación
    task.history = [
      {
        user: data.createdBy,
        action: 'CREATED',
        field: 'task',
        oldValue: null,
        newValue: `Tarea tipo ${task.type} creada`,
        timestamp: new Date(),
      },
    ];

    console.log(`🏭 [Factory Method] Tarea tipo '${task.type}' creada: "${task.title}"`);
    return task;
  }
}

/**
 * Concrete Creator: BugTaskCreator
 * Crea tareas de tipo BUG con prioridad ALTA por defecto.
 */
class BugTaskCreator extends TaskCreator {
  createTask(data) {
    return {
      ...data,
      type: 'BUG',
      priority: data.priority || 'ALTA', // Los bugs son alta prioridad por defecto
      labels: data.labels || [{ name: 'Bug', color: '#EF4444' }], // Etiqueta roja
      description: data.description || 'Bug reportado - requiere investigación y corrección',
    };
  }
}

/**
 * Concrete Creator: FeatureTaskCreator
 * Crea tareas de tipo FEATURE con prioridad MEDIA por defecto.
 */
class FeatureTaskCreator extends TaskCreator {
  createTask(data) {
    return {
      ...data,
      type: 'FEATURE',
      priority: data.priority || 'MEDIA',
      labels: data.labels || [{ name: 'Feature', color: '#8B5CF6' }], // Etiqueta morada
      description: data.description || 'Nueva funcionalidad a implementar',
    };
  }
}

/**
 * Concrete Creator: GeneralTaskCreator
 * Crea tareas de tipo TASK con configuración estándar.
 */
class GeneralTaskCreator extends TaskCreator {
  createTask(data) {
    return {
      ...data,
      type: 'TASK',
      priority: data.priority || 'MEDIA',
      labels: data.labels || [{ name: 'Task', color: '#3B82F6' }], // Etiqueta azul
      description: data.description || 'Tarea general',
    };
  }
}

/**
 * Concrete Creator: ImprovementTaskCreator
 * Crea tareas de tipo IMPROVEMENT con prioridad BAJA por defecto.
 */
class ImprovementTaskCreator extends TaskCreator {
  createTask(data) {
    return {
      ...data,
      type: 'IMPROVEMENT',
      priority: data.priority || 'BAJA',
      labels: data.labels || [{ name: 'Improvement', color: '#10B981' }], // Etiqueta verde
      description: data.description || 'Mejora o refactorización propuesta',
    };
  }
}

/**
 * Función helper: Selecciona el creator apropiado según el tipo.
 * @param {string} type - Tipo de tarea (BUG, FEATURE, TASK, IMPROVEMENT)
 * @returns {TaskCreator} - El creator correspondiente
 */
function getTaskCreator(type) {
  const creators = {
    BUG: new BugTaskCreator(),
    FEATURE: new FeatureTaskCreator(),
    TASK: new GeneralTaskCreator(),
    IMPROVEMENT: new ImprovementTaskCreator(),
  };

  const creator = creators[type];
  if (!creator) {
    console.log(`⚠️  [Factory Method] Tipo '${type}' no reconocido, usando TASK por defecto`);
    return creators.TASK;
  }

  return creator;
}

module.exports = {
  TaskCreator,
  BugTaskCreator,
  FeatureTaskCreator,
  GeneralTaskCreator,
  ImprovementTaskCreator,
  getTaskCreator,
};

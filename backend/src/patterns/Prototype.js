// ============================================
// PATRÓN PROTOTYPE - Clonación de Proyectos y Tareas
// ============================================
// Permite crear nuevos objetos copiando una instancia existente
// (prototipo), en lugar de crearlos desde cero. Es útil para
// clonar proyectos como plantillas y duplicar tareas.
// ============================================

/**
 * Interfaz Prototype base.
 * Define el contrato que deben cumplir los objetos clonables.
 */
class Prototype {
  /**
   * Método clone - debe ser implementado por las subclases.
   * @returns {Object} Una copia profunda del objeto
   */
  clone() {
    throw new Error('El método clone() debe ser implementado');
  }
}

/**
 * ProjectPrototype: Permite clonar un proyecto existente como plantilla.
 * Clona la estructura (tableros y columnas) pero no las tareas.
 */
class ProjectPrototype extends Prototype {
  constructor(projectData) {
    super();
    this.data = projectData;
  }

  /**
   * Clona el proyecto creando una copia profunda.
   * - Mantiene: nombre (con sufijo " (Copia)"), descripción, estructura de tableros
   * - Reinicia: fechas, estado, miembros
   * - Excluye: tareas, historial
   * @param {string} newOwnerId - ID del nuevo dueño del proyecto clonado
   * @returns {Object} Datos del proyecto clonado
   */
  clone(newOwnerId) {
    const clonedProject = {
      name: `${this.data.name} (Copia)`,
      description: this.data.description || '',
      startDate: new Date(),
      endDate: null,
      owner: newOwnerId,
      members: [],
      status: 'PLANIFICADO',
      archived: false,
    };

    console.log(`📋 [Prototype] Proyecto clonado: "${this.data.name}" → "${clonedProject.name}"`);
    return clonedProject;
  }
}

/**
 * TaskPrototype: Permite clonar una tarea existente.
 * Copia todos los campos excepto comentarios, adjuntos e historial.
 */
class TaskPrototype extends Prototype {
  constructor(taskData) {
    super();
    this.data = taskData;
  }

  /**
   * Clona la tarea creando una copia profunda.
   * - Mantiene: título (con sufijo " (Copia)"), descripción, prioridad, tipo, etiquetas, subtareas (reiniciadas)
   * - Reinicia: estado a "Por hacer", subtareas como no completadas
   * - Excluye: comentarios, adjuntos, historial, entradas de tiempo
   * @param {string} newCreatorId - ID del usuario que clona la tarea
   * @returns {Object} Datos de la tarea clonada
   */
  clone(newCreatorId) {
    // Deep clone de las etiquetas
    const clonedLabels = (this.data.labels || []).map((label) => ({
      name: label.name,
      color: label.color,
    }));

    // Deep clone de subtareas (reiniciándolas como no completadas)
    const clonedSubtasks = (this.data.subtasks || []).map((subtask) => ({
      title: subtask.title,
      completed: false,
      completedAt: null,
    }));

    const clonedTask = {
      title: `${this.data.title} (Copia)`,
      description: this.data.description || '',
      priority: this.data.priority,
      type: this.data.type,
      dueDate: null, // Reiniciar fecha de vencimiento
      estimation: this.data.estimation || 0,
      board: this.data.board,
      column: 'Por hacer', // Siempre empieza en la primera columna
      project: this.data.project,
      createdBy: newCreatorId,
      assignees: [], // Los asignados se resetean
      labels: clonedLabels,
      subtasks: clonedSubtasks,
      comments: [], // Los comentarios no se clonan
      attachments: [], // Los adjuntos no se clonan
      timeEntries: [], // El tiempo no se clona
      history: [
        {
          user: newCreatorId,
          action: 'CLONED',
          field: 'task',
          oldValue: this.data._id ? this.data._id.toString() : null,
          newValue: 'Tarea clonada desde otra tarea',
          timestamp: new Date(),
        },
      ],
    };

    console.log(`📋 [Prototype] Tarea clonada: "${this.data.title}" → "${clonedTask.title}"`);
    return clonedTask;
  }
}

module.exports = { Prototype, ProjectPrototype, TaskPrototype };

// ============================================
// PATRÓN BUILDER - Creación Avanzada de Tareas
// ============================================
// Permite construir objetos de tarea complejos paso a paso,
// con una interfaz fluida (method chaining). Separa la 
// construcción de un objeto complejo de su representación.
// ============================================

/**
 * TaskBuilder: Construye tareas complejas paso a paso.
 * Usa una API fluida (method chaining) para configurar cada aspecto.
 */
class TaskBuilder {
  constructor() {
    this.taskData = {
      title: '',
      description: '',
      priority: 'MEDIA',
      type: 'TASK',
      dueDate: null,
      estimation: 0,
      assignees: [],
      labels: [],
      subtasks: [],
      column: 'Por hacer',
      board: null,
      project: null,
      createdBy: null,
      order: 0,
    };
    console.log('🔨 [Builder] Nuevo TaskBuilder inicializado');
  }

  /**
   * Establece el título de la tarea
   * @param {string} title
   * @returns {TaskBuilder}
   */
  setTitle(title) {
    this.taskData.title = title;
    return this; // Method chaining
  }

  /**
   * Establece la descripción
   * @param {string} description
   * @returns {TaskBuilder}
   */
  setDescription(description) {
    this.taskData.description = description;
    return this;
  }

  /**
   * Establece la prioridad
   * @param {string} priority - BAJA | MEDIA | ALTA | URGENTE
   * @returns {TaskBuilder}
   */
  setPriority(priority) {
    const validPriorities = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
    if (!validPriorities.includes(priority)) {
      throw new Error(`Prioridad inválida: ${priority}. Use: ${validPriorities.join(', ')}`);
    }
    this.taskData.priority = priority;
    return this;
  }

  /**
   * Establece el tipo de tarea
   * @param {string} type - BUG | FEATURE | TASK | IMPROVEMENT
   * @returns {TaskBuilder}
   */
  setType(type) {
    const validTypes = ['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT'];
    if (!validTypes.includes(type)) {
      throw new Error(`Tipo inválido: ${type}. Use: ${validTypes.join(', ')}`);
    }
    this.taskData.type = type;
    return this;
  }

  /**
   * Establece la fecha de vencimiento
   * @param {Date|string} date
   * @returns {TaskBuilder}
   */
  setDueDate(date) {
    this.taskData.dueDate = new Date(date);
    return this;
  }

  /**
   * Establece la estimación en horas
   * @param {number} hours
   * @returns {TaskBuilder}
   */
  setEstimation(hours) {
    if (hours < 0) throw new Error('La estimación no puede ser negativa');
    this.taskData.estimation = hours;
    return this;
  }

  /**
   * Agrega un responsable
   * @param {string} userId - ID del usuario asignado
   * @returns {TaskBuilder}
   */
  addAssignee(userId) {
    if (!this.taskData.assignees.includes(userId)) {
      this.taskData.assignees.push(userId);
    }
    return this;
  }

  /**
   * Establece múltiples responsables
   * @param {string[]} userIds
   * @returns {TaskBuilder}
   */
  setAssignees(userIds) {
    this.taskData.assignees = [...new Set(userIds)]; // Evitar duplicados
    return this;
  }

  /**
   * Agrega una etiqueta
   * @param {string} name - Nombre de la etiqueta
   * @param {string} color - Color hex de la etiqueta
   * @returns {TaskBuilder}
   */
  addLabel(name, color = '#3B82F6') {
    this.taskData.labels.push({ name, color });
    return this;
  }

  /**
   * Agrega una subtarea
   * @param {string} title - Título de la subtarea
   * @returns {TaskBuilder}
   */
  addSubtask(title) {
    this.taskData.subtasks.push({ title, completed: false });
    return this;
  }

  /**
   * Establece el tablero
   * @param {string} boardId
   * @returns {TaskBuilder}
   */
  setBoard(boardId) {
    this.taskData.board = boardId;
    return this;
  }

  /**
   * Establece la columna
   * @param {string} columnName
   * @returns {TaskBuilder}
   */
  setColumn(columnName) {
    this.taskData.column = columnName;
    return this;
  }

  /**
   * Establece el proyecto
   * @param {string} projectId
   * @returns {TaskBuilder}
   */
  setProject(projectId) {
    this.taskData.project = projectId;
    return this;
  }

  /**
   * Establece el creador
   * @param {string} userId
   * @returns {TaskBuilder}
   */
  setCreatedBy(userId) {
    this.taskData.createdBy = userId;
    return this;
  }

  /**
   * Establece el orden dentro de la columna
   * @param {number} order
   * @returns {TaskBuilder}
   */
  setOrder(order) {
    this.taskData.order = order;
    return this;
  }

  /**
   * Construye y retorna el objeto de tarea final.
   * Valida que los campos obligatorios estén presentes.
   * @returns {Object} Objeto de tarea listo para guardar
   */
  build() {
    // Validaciones
    if (!this.taskData.title) {
      throw new Error('[Builder] El título es obligatorio');
    }
    if (!this.taskData.board) {
      throw new Error('[Builder] El tablero es obligatorio');
    }
    if (!this.taskData.project) {
      throw new Error('[Builder] El proyecto es obligatorio');
    }
    if (!this.taskData.createdBy) {
      throw new Error('[Builder] El creador es obligatorio');
    }

    console.log(`🔨 [Builder] Tarea construida: "${this.taskData.title}" (${this.taskData.type}, ${this.taskData.priority})`);

    // Retornar una copia para evitar mutaciones
    return { ...this.taskData };
  }
}

/**
 * Director: Facilita la construcción de tareas con configuraciones predefinidas.
 */
class TaskDirector {
  /**
   * Construye un bug urgente con configuración predeterminada
   */
  static buildUrgentBug(builder, title, description, boardId, projectId, userId) {
    return builder
      .setTitle(title)
      .setDescription(description)
      .setType('BUG')
      .setPriority('URGENTE')
      .addLabel('Bug Urgente', '#DC2626')
      .addLabel('Producción', '#F59E0B')
      .setBoard(boardId)
      .setProject(projectId)
      .setCreatedBy(userId)
      .build();
  }

  /**
   * Construye una feature estándar con subtareas comunes
   */
  static buildStandardFeature(builder, title, description, boardId, projectId, userId) {
    return builder
      .setTitle(title)
      .setDescription(description)
      .setType('FEATURE')
      .setPriority('MEDIA')
      .addLabel('Feature', '#8B5CF6')
      .addSubtask('Diseño de solución')
      .addSubtask('Implementación')
      .addSubtask('Pruebas unitarias')
      .addSubtask('Code review')
      .setBoard(boardId)
      .setProject(projectId)
      .setCreatedBy(userId)
      .build();
  }
}

module.exports = { TaskBuilder, TaskDirector };

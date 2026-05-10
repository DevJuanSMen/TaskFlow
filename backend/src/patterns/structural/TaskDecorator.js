// Patrón Decorator: Añade metadatos adicionales a la respuesta de la tarea 
// dinámicamente, basándose en el contenido de la misma.

class TaskDecorator {
  constructor(task) {
    this.task = task.toObject ? task.toObject({ virtuals: true }) : { ...task };
  }

  getTask() {
    return this.task;
  }
}

class CommentableTaskDecorator extends TaskDecorator {
  constructor(task) {
    super(task);
    console.log('🎨 [Decorator] Decorando tarea con módulo de comentarios...');
    this.task.hasComments = true;
    this.task.commentCount = this.task.comments.length;
  }
}

class AttachableTaskDecorator extends TaskDecorator {
  constructor(task) {
    super(task);
    console.log('🎨 [Decorator] Decorando tarea con módulo de adjuntos...');
    this.task.hasAttachments = true;
    this.task.attachmentCount = this.task.attachments.length;
  }
}

class TimeTrackableTaskDecorator extends TaskDecorator {
  constructor(task) {
    super(task);
    console.log('🎨 [Decorator] Decorando tarea con módulo de tracking de tiempo...');
    this.task.isTimeTracked = true;
  }
}

// Helper para aplicar decoradores basados en el contenido
const decorateTask = (taskData) => {
  let decorated = new TaskDecorator(taskData);
  
  if (decorated.getTask().comments && decorated.getTask().comments.length > 0) {
    decorated = new CommentableTaskDecorator(decorated.getTask());
  }
  
  if (decorated.getTask().attachments && decorated.getTask().attachments.length > 0) {
    decorated = new AttachableTaskDecorator(decorated.getTask());
  }
  
  if (decorated.getTask().timeEntries && decorated.getTask().timeEntries.length > 0) {
    decorated = new TimeTrackableTaskDecorator(decorated.getTask());
  }
  
  return decorated.getTask();
};

module.exports = { decorateTask };

/**
 * Patrón Composite: Permite tratar objetos individuales (subtareas)
 * y composiciones de objetos (tareas, proyectos) de manera uniforme.
 */

// Interfaz común (Componente)
class ProjectComponent {
  constructor(name) {
    this.name = name;
  }

  getProgress() {
    throw new Error('Método getProgress() debe ser implementado');
  }

  getWeight() {
    throw new Error('Método getWeight() debe ser implementado');
  }
}

// Hoja (Leaf): Subtarea o Tarea sin subtareas
class TaskLeaf extends ProjectComponent {
  constructor(name, completed) {
    super(name);
    this.completed = completed;
  }

  getProgress() {
    return this.completed ? 1 : 0;
  }

  getWeight() {
    return 1;
  }
}

// Compuesto (Composite): Tarea con subtareas o Proyecto con tareas
class TaskComposite extends ProjectComponent {
  constructor(name) {
    super(name);
    this.children = [];
  }

  add(component) {
    this.children.push(component);
  }

  getProgress() {
    if (this.children.length === 0) return 0;
    const totalProgress = this.children.reduce(
      (sum, child) => sum + child.getProgress(),
      0
    );
    return totalProgress;
  }

  getWeight() {
    if (this.children.length === 0) return 0;
    return this.children.reduce((sum, child) => sum + child.getWeight(), 0);
  }

  calculatePercentage() {
    const weight = this.getWeight();
    if (weight === 0) return 100; // Si no hay trabajo, está "al día"
    return Math.round((this.getProgress() / weight) * 100);
  }
}

module.exports = {
  TaskLeaf,
  TaskComposite,
};

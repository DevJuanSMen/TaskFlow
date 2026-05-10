import type { TaskProps } from '../components/TaskCard';

// 1. La interfaz Strategy
export interface SortStrategy {
  sort(tasks: TaskProps[]): TaskProps[];
}

// 2. Estrategias Concretas
export class PrioritySortStrategy implements SortStrategy {
  sort(tasks: TaskProps[]): TaskProps[] {
    const priorityWeights: Record<string, number> = {
      'URGENTE': 1,
      'ALTA': 2,
      'MEDIA': 3,
      'BAJA': 4
    };
    
    return [...tasks].sort((a, b) => {
      const weightA = priorityWeights[a.priority] || 5;
      const weightB = priorityWeights[b.priority] || 5;
      return weightA - weightB;
    });
  }
}

export class TypeSortStrategy implements SortStrategy {
  sort(tasks: TaskProps[]): TaskProps[] {
    return [...tasks].sort((a, b) => a.type.localeCompare(b.type));
  }
}

// 3. El Contexto (El que usa la estrategia)
export class TaskSorter {
  private strategy: SortStrategy;

  constructor(strategy: SortStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: SortStrategy) {
    this.strategy = strategy;
  }

  sortTasks(tasks: TaskProps[]): TaskProps[] {
    console.log('🔄 [Strategy Pattern] Ordenando tareas');
    return this.strategy.sort(tasks);
  }
}

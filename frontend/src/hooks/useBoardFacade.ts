import { useState, useEffect } from 'react';
import axios from 'axios';
import { TaskProps } from '../components/TaskCard';

// Facade Pattern: Oculta la complejidad de las llamadas a la API y el manejo de estado
export function useBoardFacade(boardId: string) {
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial
  useEffect(() => {
    if (!boardId) return;
    
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // En una app real, aquí iría la URL del backend
        // const response = await axios.get(`/api/tasks/board/${boardId}`);
        // setTasks(response.data.data);
        
        console.log('🏛️ [Facade] Obteniendo tareas para el tablero:', boardId);
        // Simulamos delay
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (err) {
        setError('Error al cargar las tareas');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [boardId]);

  // Funciones simplificadas para que los componentes las usen sin saber de APIs
  const moveTask = async (taskId: string, newColumn: string) => {
    console.log(`🏛️ [Facade] Moviendo tarea ${taskId} a ${newColumn}`);
    // await axios.put(`/api/tasks/${taskId}/move`, { column: newColumn });
  };

  const createTask = async (taskData: any) => {
    console.log('🏛️ [Facade] Creando nueva tarea');
    // await axios.post('/api/tasks', taskData);
  };

  return {
    tasks,
    loading,
    error,
    moveTask,
    createTask
  };
}

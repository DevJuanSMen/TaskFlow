import { useState, useEffect, useCallback } from 'react';
import type { TaskProps } from '../components/TaskCard';
import api from '../services/api';

// Facade Pattern: Oculta la complejidad de las llamadas a la API y el manejo de estado
export function useBoardFacade(initialBoardId?: string) {
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(initialBoardId || null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      let currentBoardId = activeBoardId;

      // Si no tenemos un tablero activo, buscamos el primero disponible
      if (!currentBoardId) {
        console.log('🏛️ [Facade] Resolviendo tablero activo...');
        const projectsRes = await api.get('/projects');
        let projects = projectsRes.data.data;
        
        // Si no hay proyectos, creamos uno usando el ProjectFacade en el backend
        if (projects.length === 0) {
          console.log('🏛️ [Facade] Sin proyectos, creando uno por defecto...');
          const newProjRes = await api.post('/projects', {
            name: 'Mi Primer Proyecto',
            description: 'Creado automáticamente'
          });
          projects = [newProjRes.data.data];
        }

        const projectId = projects[0]._id;
        const boardsRes = await api.get(`/boards/project/${projectId}`);
        
        if (boardsRes.data.data && boardsRes.data.data.length > 0) {
          currentBoardId = boardsRes.data.data[0]._id;
          setActiveBoardId(currentBoardId);
        } else {
          throw new Error('No se encontró ningún tablero');
        }
      }

      console.log('🏛️ [Facade] Obteniendo tareas reales del backend para el tablero:', currentBoardId);
      const response = await api.get(`/tasks/board/${currentBoardId}`);
      
      const fetchedTasks = response.data.data.map((task: any) => ({
        ...task,
        hasComments: task.comments?.length > 0,
        commentCount: task.comments?.length || 0,
        hasAttachments: task.attachments?.length > 0,
        attachmentCount: task.attachments?.length || 0,
        isTimeTracked: task.timeEntries?.length > 0,
      }));
      setTasks(fetchedTasks);
    } catch (err: any) {
      console.error('Error fetching tasks', err);
      setError('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  }, [activeBoardId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Funciones simplificadas para que los componentes las usen sin saber de APIs
  const moveTask = async (taskId: string, newColumn: string) => {
    console.log(`🏛️ [Facade] Moviendo tarea ${taskId} a ${newColumn}`);
    try {
      await api.put(`/tasks/${taskId}/move`, { column: newColumn });
      await fetchTasks();
    } catch (err) {
      console.error('Error moving task', err);
    }
  };

  const createTask = async (taskData: any) => {
    if (!activeBoardId) return;
    console.log('🏛️ [Facade] Creando nueva tarea en backend (Factory Pattern)');
    try {
      await api.post('/tasks', { ...taskData, boardId: activeBoardId });
      await fetchTasks(); // Recargar tras crear
    } catch (err) {
      console.error('Error creating task', err);
    }
  };

  return {
    tasks,
    loading,
    error,
    moveTask,
    createTask
  };
}

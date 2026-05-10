import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { TaskProps } from '../components/TaskCard';

export function useBoardFacade(boardId: string) {
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [boardInfo, setBoardInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoardData = useCallback(async () => {
    if (!boardId) return;
    setLoading(true);
    try {
      console.log('🏛️ [Facade] Obteniendo datos reales del tablero:', boardId);
      const [boardRes, tasksRes] = await Promise.all([
        api.get(`/boards/${boardId}`),
        api.get(`/tasks/board/${boardId}`)
      ]);
      setBoardInfo(boardRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err) {
      setError('Error al cargar el tablero');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  const moveTask = async (taskId: string, newColumn: string) => {
    try {
      await api.put(`/tasks/${taskId}/move`, { column: newColumn });
      fetchBoardData();
    } catch (err) {
      console.error('Error moviendo tarea', err);
    }
  };

  const createTask = async (taskData: any) => {
    try {
      const endpoint = taskData.subtasks?.length > 0 ? '/tasks/build' : '/tasks';
      await api.post(endpoint, { ...taskData, boardId });
      fetchBoardData();
    } catch (err) {
      console.error('Error creando tarea', err);
    }
  };

  return { tasks, boardInfo, loading, error, moveTask, createTask };
}

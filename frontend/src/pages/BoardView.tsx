import React from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Columns } from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { useBoardFacade } from '../hooks/useBoardFacade';

export const BoardView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Patrón Facade: Abstrae la lógica de carga y estado
  const { tasks, loading, error, boardInfo } = useBoardFacade(id!);

  if (loading) return <div className="p-8 text-center text-text-secondary">Cargando tablero...</div>;
  if (error) return <div className="p-8 text-center text-danger">{error}</div>;

  return (
    <div className="flex-1 p-6 lg:p-8 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-sm text-primary font-medium mb-1 flex items-center gap-2">
            <Columns size={16} /> Tablero Kanban (Facade Pattern)
          </p>
          <h2 className="text-3xl font-bold text-text tracking-tight">{boardInfo?.name || 'Tablero Principal'}</h2>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg flex items-center gap-2">
          <Plus size={18} />
          <span>Nueva Tarea (Factory/Builder)</span>
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {boardInfo?.columns?.map((column: any) => (
          <div key={column._id} className="min-w-[300px] max-w-[320px] flex flex-col bg-surface/30 p-4 rounded-2xl border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${column.name === 'Completado' ? 'bg-success' : 'bg-info'}`}></div>
                {column.name}
              </h3>
              <span className="bg-surface px-2 py-0.5 rounded text-xs text-text-secondary border border-border font-medium shadow-sm">
                {tasks.filter(t => t.column === column.name).length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1">
              {tasks.filter(t => t.column === column.name).map(task => (
                <TaskCard key={task._id} task={task as any} />
              ))}
              {tasks.filter(t => t.column === column.name).length === 0 && (
                <div className="h-24 border-2 border-dashed border-border/50 rounded-xl bg-surface/20 flex flex-col items-center justify-center text-text-secondary/50">
                  <span className="text-sm">Arrastra tareas aquí</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

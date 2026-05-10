import { useState } from 'react';
import { Sun, Moon, Layout, Plus, Search, User, Bell, LogOut } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { TaskCard } from '../components/TaskCard';
import { useBoardFacade } from '../hooks/useBoardFacade';
import { Modal } from '../components/ui/Modal';
import { TaskSorter, PrioritySortStrategy, TypeSortStrategy } from '../patterns/TaskSortStrategy';

export const BoardPage = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  // '65123abcd...' o similar es necesario en un sistema real. Por ahora pasamos un mock boardId si no hay backend completo para tableros, 
  // OJO: Asumimos que tasks en backend no requieren un ID estricto si no hay lógica de tableros completada.
  const { tasks, loading, createTask } = useBoardFacade();
  
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // Estados para el formulario
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskType, setNewTaskType] = useState('TASK');
  
  // Estado para el Strategy Pattern
  const [sortMethod, setSortMethod] = useState<'priority' | 'type'>('priority');

  // Aplicar el Strategy Pattern
  const sorter = new TaskSorter(
    sortMethod === 'priority' ? new PrioritySortStrategy() : new TypeSortStrategy()
  );
  const sortedTasks = sorter.sortTasks(tasks);

  const handleCreateTask = async () => {
    if (!newTaskTitle) return;
    await createTask({
      title: newTaskTitle,
      description: newTaskDesc,
      type: newTaskType,
      priority: 'MEDIA',
      status: 'TODO', // Por Hacer
    });
    setIsNewTaskModalOpen(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar con Glassmorphism */}
      <nav className="sticky top-0 z-50 glass-panel border-b-0 border-x-0 border-t-0 rounded-none px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg text-primary">
            <Layout size={20} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            TaskFlow
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-surface/50 border border-border rounded-full px-3 py-1.5 w-64 focus-within:ring-2 ring-primary/50 transition-all">
            <Search size={16} className="text-text-secondary mr-2" />
            <input 
              type="text" 
              placeholder="Buscar tareas..." 
              className="bg-transparent border-none outline-none text-sm text-text w-full"
            />
          </div>

          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-surface-hover text-text-secondary transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className="p-2 rounded-full hover:bg-surface-hover text-text-secondary transition-colors">
            <Bell size={20} />
          </button>

          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-text">{user?.name}</p>
              <p className="text-[10px] text-text-secondary">{user?.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-medium cursor-pointer shadow-lg shadow-primary/30 hover-lift">
              <User size={16} />
            </div>
            <button 
              onClick={logout}
              className="p-2 rounded-full hover:bg-danger/10 text-danger transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 flex flex-col h-full overflow-hidden">
        {/* Header del tablero */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-sm text-primary font-medium mb-1">MERN Stack Migration</p>
            <h2 className="text-3xl font-bold text-text tracking-tight">Tablero Principal</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Selector del Strategy Pattern */}
            <div className="bg-surface border border-border rounded-lg px-3 py-1.5 flex items-center">
              <span className="text-xs text-text-secondary mr-2 font-medium">Ordenar por:</span>
              <select 
                value={sortMethod}
                onChange={(e) => setSortMethod(e.target.value as 'priority' | 'type')}
                className="bg-transparent border-none outline-none text-sm font-bold text-primary cursor-pointer"
              >
                <option value="priority">Prioridad</option>
                <option value="type">Tipo</option>
              </select>
            </div>

            <button 
              onClick={() => setIsNewTaskModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Nueva Tarea</span>
            </button>
          </div>
        </div>

        {/* Board Columns */}
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          
          {/* Column 1 */}
          <div className="min-w-[300px] max-w-[320px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-info"></div>
                Por Hacer
              </h3>
              <span className="bg-surface px-2 py-0.5 rounded text-xs text-text-secondary border border-border">3</span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                sortedTasks.filter(t => t.status === 'TODO' || !t.status).map(task => (
                  <div key={task._id} onClick={() => setSelectedTask(task)}>
                    <TaskCard task={task} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2 */}
          <div className="min-w-[300px] max-w-[320px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-warning"></div>
                En Progreso
              </h3>
              <span className="bg-surface px-2 py-0.5 rounded text-xs text-text-secondary border border-border">
                {tasks.filter(t => t.status === 'IN_PROGRESS').length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 border-2 border-dashed border-border/50 rounded-xl bg-surface/20 flex flex-col items-center justify-center text-text-secondary/50">
              {sortedTasks.filter(t => t.status === 'IN_PROGRESS').length === 0 ? (
                <span className="text-sm">Arrastra tareas aquí</span>
              ) : (
                sortedTasks.filter(t => t.status === 'IN_PROGRESS').map(task => (
                  <div key={task._id} onClick={() => setSelectedTask(task)} className="w-full">
                    <TaskCard task={task} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3 */}
          <div className="min-w-[300px] max-w-[320px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
                Completado
              </h3>
              <span className="bg-surface px-2 py-0.5 rounded text-xs text-text-secondary border border-border">
                {tasks.filter(t => t.status === 'DONE').length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 border-2 border-dashed border-border/50 rounded-xl bg-surface/20 flex flex-col items-center justify-center text-text-secondary/50">
              {sortedTasks.filter(t => t.status === 'DONE').length === 0 ? (
                <span className="text-sm">Arrastra tareas aquí</span>
              ) : (
                sortedTasks.filter(t => t.status === 'DONE').map(task => (
                  <div key={task._id} onClick={() => setSelectedTask(task)} className="w-full">
                    <TaskCard task={task} />
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Modal Nueva Tarea */}
      <Modal 
        isOpen={isNewTaskModalOpen} 
        onClose={() => setIsNewTaskModalOpen(false)} 
        title="Crear Nueva Tarea"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Título de la tarea</label>
            <input 
              type="text" 
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-2 px-4 outline-none focus:ring-2 ring-primary/50 text-text" 
              placeholder="Ej: Implementar Proxy" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Tipo</label>
            <select 
              value={newTaskType}
              onChange={e => setNewTaskType(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-2 px-4 outline-none focus:ring-2 ring-primary/50 text-text"
            >
              <option value="TASK">Tarea (General)</option>
              <option value="BUG">Bug</option>
              <option value="FEATURE">Feature</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Descripción</label>
            <textarea 
              value={newTaskDesc}
              onChange={e => setNewTaskDesc(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-2 px-4 outline-none focus:ring-2 ring-primary/50 text-text h-24" 
              placeholder="Describe los detalles..."
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setIsNewTaskModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-hover transition-colors">Cancelar</button>
            <button onClick={handleCreateTask} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-all">Crear Tarea</button>
          </div>
        </div>
      </Modal>

      {/* Modal Detalles Tarea */}
      <Modal 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
        title="Detalles de la Tarea"
      >
        {selectedTask && (
          <div className="space-y-6">
            <div>
              <div className="flex gap-2 mb-3">
                <span className="text-xs font-bold px-2 py-1 bg-primary/20 text-primary rounded uppercase">{selectedTask.type}</span>
                <span className="text-xs font-bold px-2 py-1 bg-surface border border-border text-text-secondary rounded uppercase">{selectedTask.priority}</span>
              </div>
              <h3 className="text-2xl font-bold text-text">{selectedTask.title}</h3>
            </div>
            
            <div className="p-4 bg-surface/50 rounded-xl border border-border">
              <p className="text-text-secondary text-sm leading-relaxed">
                Esta es una demostración del patrón **Decorator**. Los iconos que ves en la tarjeta (comentarios, adjuntos) son inyectados dinámicamente por la estructura decoradora del backend.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={() => setSelectedTask(null)} className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">Entendido</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

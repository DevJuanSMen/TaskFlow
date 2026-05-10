import React, { useEffect, useState } from 'react';
import { Plus, Briefcase, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface Project {
  _id: string;
  name: string;
  description: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  status: string;
}

export const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPatternInfoVisible, setIsPatternInfoVisible] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data.data);
        if (res.data.pattern === 'PROXY') setIsPatternInfoVisible(true);
      } catch (err) {
        console.error("Error cargando proyectos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text tracking-tight mb-1">Mis Proyectos</h2>
          <p className="text-text-secondary">Gestiona tus tableros y tareas</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg flex items-center gap-2">
          <Plus size={18} />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {isPatternInfoVisible && (
        <div className="bg-info/10 border border-info/30 text-info px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
          <Activity size={18} />
          <span><strong>Patrón Proxy Activo:</strong> Los proyectos se están cargando ultra-rápido desde la caché en memoria del backend.</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 glass-panel rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center">
          <div className="bg-surface p-4 rounded-full text-text-secondary mb-4">
            <Briefcase size={32} />
          </div>
          <h3 className="text-xl font-bold text-text mb-2">No tienes proyectos</h3>
          <p className="text-text-secondary mb-6">Crea tu primer proyecto para empezar a usar los tableros Kanban.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link key={project._id} to={`/projects/${project._id}`} className="glass-panel p-6 rounded-xl hover-lift cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary/20 p-2.5 rounded-lg text-primary">
                  <Briefcase size={20} />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${project.status === 'COMPLETADO' ? 'bg-success/20 text-success' : 'bg-surface text-text-secondary border border-border'}`}>
                  {project.status}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-text mb-2 group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
              <p className="text-sm text-text-secondary mb-6 line-clamp-2">{project.description}</p>
              
              <div>
                <div className="flex justify-between text-xs text-text-secondary mb-2">
                  <span>Progreso</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2 border border-border overflow-hidden">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="mt-3 text-xs text-text-secondary font-medium">
                  {project.completedTasks} de {project.totalTasks} tareas completadas
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout, Columns, Calendar, User as UserIcon } from 'lucide-react';
import api from '../api/axios';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const [projectRes, boardsRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/boards/project/${id}`)
        ]);
        setProject(projectRes.data.data);
        setBoards(boardsRes.data.data);
      } catch (err) {
        console.error("Error cargando proyecto", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-text-secondary">Cargando proyecto...</div>;
  if (!project) return <div className="p-8 text-center text-danger">Proyecto no encontrado</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="glass-panel p-8 rounded-2xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/20 p-2 rounded-lg text-primary">
                <Layout size={24} />
              </div>
              <h1 className="text-3xl font-bold text-text">{project.name}</h1>
            </div>
            <p className="text-text-secondary max-w-2xl">{project.description}</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-surface border border-border rounded-xl p-4 min-w-[120px]">
              <div className="text-text-secondary text-sm flex items-center gap-2 mb-1">
                <UserIcon size={14} /> Creador
              </div>
              <p className="font-medium text-text">{project.owner?.name}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 min-w-[120px]">
              <div className="text-text-secondary text-sm flex items-center gap-2 mb-1">
                <Calendar size={14} /> Fecha Inicio
              </div>
              <p className="font-medium text-text">
                {new Date(project.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-end">
        <h2 className="text-xl font-bold text-text flex items-center gap-2">
          <Columns className="text-primary" /> Tableros del Proyecto
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {boards.map(board => (
          <Link key={board._id} to={`/boards/${board._id}`} className="glass-panel p-6 rounded-xl hover-lift cursor-pointer group flex items-center gap-4">
            <div className="bg-secondary/20 p-4 rounded-xl text-secondary group-hover:scale-110 transition-transform">
              <Columns size={24} />
            </div>
            <div>
              <h3 className="font-bold text-text text-lg group-hover:text-primary transition-colors">{board.name}</h3>
              <p className="text-sm text-text-secondary">Ver tablero Kanban →</p>
            </div>
          </Link>
        ))}
        {boards.length === 0 && (
          <div className="col-span-3 text-center py-12 text-text-secondary border-2 border-dashed border-border rounded-xl">
            No hay tableros en este proyecto.
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { X, MessageSquare, Paperclip, Clock, Calendar, User, Tag, CheckCircle2, AlertCircle, Plus, Send, Upload } from 'lucide-react';
import api from '../api/axios';

interface TaskDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ taskId, isOpen, onClose }) => {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchDetail = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await api.get(`/tasks/${taskId}`);
      setTask(res.data.data);
    } catch (err) {
      console.error("Error al cargar detalle", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchDetail();
    }
  }, [isOpen, taskId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/tasks/${taskId}/comments`, { content: newComment });
      setNewComment('');
      fetchDetail();
    } catch (err) {
      console.error("Error al añadir comentario", err);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    try {
      await api.post(`/tasks/${taskId}/subtasks`, { title: newSubtask });
      setNewSubtask('');
      fetchDetail();
    } catch (err) {
      console.error("Error al añadir subtarea", err);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      await api.put(`/tasks/${taskId}/subtasks/${subtaskId}`);
      fetchDetail();
    } catch (err) {
      console.error("Error al cambiar estado de subtarea", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    try {
      // PATRÓN ADAPTER: El backend usa un Adapter para manejar diferentes storages
      await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchDetail();
    } catch (err) {
      console.error("Error al subir archivo", err);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col h-[85vh]">
        {/* Header con gradiente suave */}
        <div className="h-2 bg-gradient-to-r from-primary via-secondary to-info"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-surface/50 hover:bg-surface p-2 rounded-full text-text-secondary hover:text-text transition-all z-20 border border-border"
        >
          <X size={20} />
        </button>

        {loading && !task ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-text-secondary animate-pulse">Obteniendo detalles reales...</p>
          </div>
        ) : task ? (
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Columna Izquierda: Información Principal */}
            <div className="flex-1 overflow-y-auto p-8 border-r border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  task.type === 'BUG' ? 'bg-danger/20 text-danger' : 
                  task.type === 'FEATURE' ? 'bg-secondary/20 text-secondary' : 
                  'bg-primary/20 text-primary'
                }`}>
                  {task.type}
                </span>
                <span className="text-xs font-semibold px-3 py-1.5 bg-surface-hover rounded-full border border-border text-text-secondary">
                  Prioridad {task.priority}
                </span>
              </div>

              <h2 className="text-3xl font-bold text-text mb-4 leading-tight">{task.title}</h2>
              <p className="text-text-secondary mb-8 text-lg leading-relaxed">{task.description || 'Sin descripción detallada.'}</p>

              {/* Subtareas (Composite Pattern) */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={14} /> Subtareas (Patrón Composite)
                  </h4>
                </div>
                
                <form onSubmit={handleAddSubtask} className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Nueva subtarea..."
                    className="flex-1 bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                  <button type="submit" className="bg-primary/10 text-primary p-2 rounded-lg hover:bg-primary/20 transition-colors">
                    <Plus size={18} />
                  </button>
                </form>

                <div className="space-y-2">
                  {task.subtasks?.map((sub: any) => (
                    <div 
                      key={sub._id} 
                      onClick={() => handleToggleSubtask(sub._id)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-hover cursor-pointer group border border-transparent hover:border-border transition-all"
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${sub.completed ? 'bg-success border-success text-white' : 'border-border'}`}>
                        {sub.completed && <CheckCircle2 size={12} />}
                      </div>
                      <span className={`text-sm flex-1 ${sub.completed ? 'line-through text-text-secondary' : 'text-text font-medium'}`}>{sub.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adjuntos (Adapter Pattern) */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                    <Paperclip size={14} /> Adjuntos (Patrón Adapter)
                  </h4>
                  <label className="cursor-pointer bg-warning/10 text-warning px-3 py-1 rounded-lg text-xs font-bold hover:bg-warning/20 transition-all flex items-center gap-1">
                    <Upload size={12} />
                    <span>Subir</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {task.attachments?.map((att: any) => (
                    <a 
                      key={att._id} 
                      href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${att.path}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover border border-border hover:border-warning/50 transition-all group"
                    >
                      <div className="bg-warning/10 p-2 rounded-lg text-warning">
                        <Paperclip size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate">{att.filename}</p>
                        <p className="text-[10px] text-text-secondary">{(att.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </a>
                  ))}
                  {(!task.attachments || task.attachments.length === 0) && <p className="text-sm text-text-secondary/50 italic col-span-2">No hay archivos adjuntos.</p>}
                </div>
              </div>
            </div>

            {/* Columna Derecha: Comentarios y Metadatos */}
            <div className="w-full md:w-80 bg-surface-hover overflow-y-auto p-6 flex flex-col h-full">
              <div className="mb-8">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Metadatos</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-text-secondary" />
                    <div>
                      <p className="text-[10px] text-text-secondary font-bold uppercase">Creado por</p>
                      <p className="text-sm font-medium">{task.createdBy?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-text-secondary" />
                    <div>
                      <p className="text-[10px] text-text-secondary font-bold uppercase">Estimación</p>
                      <p className="text-sm font-medium">{task.estimation} horas</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MessageSquare size={14} /> Comentarios (Patrón Decorator)
                </h4>
                
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {task.comments?.map((comment: any) => (
                    <div key={comment._id} className="bg-surface p-3 rounded-xl border border-border shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-primary">{comment.user?.name}</span>
                        <span className="text-[10px] text-text-secondary">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-text leading-relaxed">{comment.content}</p>
                    </div>
                  ))}
                  {(!task.comments || task.comments.length === 0) && <p className="text-sm text-text-secondary/50 italic text-center py-8">Aún no hay comentarios.</p>}
                </div>

                <form onSubmit={handleAddComment} className="relative">
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="w-full bg-surface border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-none h-24 pr-12"
                  />
                  <button 
                    type="submit" 
                    className="absolute bottom-3 right-3 bg-primary text-white p-2 rounded-lg hover:bg-primary-hover transition-colors shadow-lg"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-20 text-center">
            <AlertCircle className="mx-auto text-danger mb-4" size={48} />
            <p className="text-text font-bold">Error al cargar la tarea</p>
          </div>
        )}
      </div>
    </div>
  );
};

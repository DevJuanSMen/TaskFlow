import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('TASK');
  const [priority, setPriority] = useState('MEDIA');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, type, priority, column: 'Pendiente' });
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface border border-border p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text transition-colors"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-text mb-4">Nueva Tarea (Builder/Factory)</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Título</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="Ej. Implementar login..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Tipo de Tarea (Factory)</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary transition-colors"
            >
              <option value="TASK">General (Task)</option>
              <option value="BUG">Error (Bug)</option>
              <option value="FEATURE">Nueva Funcionalidad (Feature)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Prioridad (Builder)</label>
            <select 
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary transition-colors"
            >
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2 rounded-lg transition-colors mt-6 shadow-lg shadow-primary/20"
          >
            Crear Tarea
          </button>
        </form>
      </div>
    </div>
  );
};

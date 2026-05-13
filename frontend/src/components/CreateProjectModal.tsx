import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description });
    setName('');
    setDescription('');
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
        
        <h2 className="text-xl font-bold text-text mb-4">Nuevo Proyecto (Facade)</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Nombre del Proyecto</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="Ej. Rediseño Web 2024"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Descripción</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary transition-colors h-24 resize-none"
              placeholder="Describe brevemente el objetivo del proyecto..."
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2 rounded-lg transition-colors mt-6 shadow-lg shadow-primary/20"
          >
            Crear Proyecto
          </button>
        </form>
      </div>
    </div>
  );
};

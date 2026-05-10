import React from 'react';
import { MessageSquare, Paperclip, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface TaskProps {
  _id: string;
  title: string;
  type: string;
  priority: string;
  status?: string;
  // Propiedades añadidas por el Decorador del Backend
  hasComments?: boolean;
  commentCount?: number;
  hasAttachments?: boolean;
  attachmentCount?: number;
  isTimeTracked?: boolean;
}

export const TaskCard: React.FC<{ task: TaskProps }> = ({ task }) => {
  const isBug = task.type === 'BUG';
  const isFeature = task.type === 'FEATURE';
  
  const typeColorClass = isBug 
    ? "bg-danger/20 text-danger" 
    : isFeature 
      ? "bg-secondary/20 text-secondary" 
      : "bg-primary/20 text-primary";

  return (
    <div className="glass-panel hover-lift p-4 rounded-xl cursor-pointer mb-3 group relative overflow-hidden">
      {/* Resplandor decorativo en hover */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <span className={cn("text-xs font-semibold px-2 py-1 rounded-md", typeColorClass)}>
          {task.type}
        </span>
        <span className="text-xs text-text-secondary font-medium px-2 py-1 bg-surface rounded-md border border-border">
          {task.priority}
        </span>
      </div>
      
      <h3 className="text-text font-medium text-sm mb-4 relative z-10 leading-snug">{task.title}</h3>
      
      {/* ============================================================== */}
      {/* UI Decorators: Renderizado condicional basado en el Decorator  */}
      {/* ============================================================== */}
      <div className="flex items-center gap-4 text-text-secondary relative z-10">
        {task.hasComments && (
          <div className="flex items-center gap-1.5 text-xs font-medium" title="Comentarios">
            <MessageSquare size={14} className="text-info" />
            <span>{task.commentCount}</span>
          </div>
        )}
        
        {task.hasAttachments && (
          <div className="flex items-center gap-1.5 text-xs font-medium" title="Adjuntos">
            <Paperclip size={14} className="text-warning" />
            <span>{task.attachmentCount}</span>
          </div>
        )}
        
        {task.isTimeTracked && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-success" title="Tiempo registrado">
            <Clock size={14} />
          </div>
        )}
      </div>
    </div>
  );
};

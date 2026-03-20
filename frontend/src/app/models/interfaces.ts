export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
  avatar: string | null;
  description: string;
  lastAccess: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  owner: User;
  members: ProjectMember[];
  status: 'PLANIFICADO' | 'EN_PROGRESO' | 'PAUSADO' | 'COMPLETADO' | 'ARCHIVADO';
  archived: boolean;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  user: User;
  role: string;
  joinedAt: string;
}

export interface Board {
  _id: string;
  name: string;
  project: string;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  _id: string;
  name: string;
  order: number;
  wipLimit: number;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  type: 'BUG' | 'FEATURE' | 'TASK' | 'IMPROVEMENT';
  dueDate: string | null;
  estimation: number;
  board: string;
  column: string;
  project: string;
  createdBy: User;
  assignees: User[];
  labels: Label[];
  subtasks: Subtask[];
  comments: Comment[];
  attachments: Attachment[];
  timeEntries: TimeEntry[];
  history: HistoryEntry[];
  isOverdue: boolean;
  subtaskProgress: number;
  totalTimeSpent: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  _id?: string;
  name: string;
  color: string;
}

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
}

export interface Comment {
  _id: string;
  user: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedBy: User;
  uploadedAt: string;
}

export interface TimeEntry {
  _id: string;
  user: User;
  hours: number;
  description: string;
  date: string;
}

export interface HistoryEntry {
  _id: string;
  user: User;
  action: string;
  field: string | null;
  oldValue: any;
  newValue: any;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  pattern?: string;
  count?: number;
  data: T;
}

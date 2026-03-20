import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Mis Proyectos</h1>
          <p class="page-subtitle">Gestiona y organiza tus proyectos colaborativos</p>
        </div>
        <button class="btn btn-primary" (click)="showCreateModal = true">
          ➕ Nuevo Proyecto
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📁</div>
          <div class="stat-info">
            <span class="stat-value">{{ projects.length }}</span>
            <span class="stat-label">Total Proyectos</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🚀</div>
          <div class="stat-info">
            <span class="stat-value">{{ activeProjects }}</span>
            <span class="stat-label">En Progreso</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <span class="stat-value">{{ completedProjects }}</span>
            <span class="stat-label">Completados</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <span class="stat-value">{{ totalTasks }}</span>
            <span class="stat-label">Total Tareas</span>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-spinner" *ngIf="loading"></div>

      <!-- Projects Grid -->
      <div class="projects-grid" *ngIf="!loading">
        <div class="project-card card" *ngFor="let project of projects" [routerLink]="['/projects', project._id]">
          <div class="project-card-header">
            <div class="project-status-dot" [class]="'status-' + project.status"></div>
            <h3 class="project-name">{{ project.name }}</h3>
            <div class="project-actions">
              <button class="btn-icon" title="Clonar (Prototype)" (click)="cloneProject(project._id, $event)">📋</button>
              <button class="btn-icon" title="Archivar" (click)="archiveProject(project._id, $event)">📦</button>
            </div>
          </div>

          <p class="project-description">{{ project.description || 'Sin descripción' }}</p>

          <div class="project-progress">
            <div class="progress-info">
              <span>Progreso</span>
              <span class="progress-percent">{{ project.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" [style.width.%]="project.progress"></div>
            </div>
          </div>

          <div class="project-meta">
            <span class="badge badge-status" [class]="'status-badge-' + project.status">
              {{ getStatusLabel(project.status) }}
            </span>
            <div class="project-members">
              <div class="avatar avatar-sm" *ngFor="let m of project.members?.slice(0, 3)" [title]="m.user?.name">
                {{ m.user?.name?.charAt(0)?.toUpperCase() }}
              </div>
              <span class="member-count" *ngIf="project.members && project.members.length > 3">
                +{{ project.members.length - 3 }}
              </span>
            </div>
          </div>

          <div class="project-footer">
            <span class="task-count">{{ project.completedTasks }}/{{ project.totalTasks }} tareas</span>
            <span class="project-date">{{ project.createdAt | date:'dd MMM yyyy' }}</span>
          </div>
        </div>

        <!-- Empty state -->
        <div class="empty-state" *ngIf="projects.length === 0">
          <span class="empty-icon">📋</span>
          <h3>No hay proyectos aún</h3>
          <p>Crea tu primer proyecto para comenzar</p>
          <button class="btn btn-primary" (click)="showCreateModal = true">
            ➕ Crear Proyecto
          </button>
        </div>
      </div>

      <!-- Toast -->
      <div class="toast toast-success" *ngIf="toastMessage" (click)="toastMessage = ''">
        {{ toastMessage }}
      </div>

      <!-- Modal Crear Proyecto -->
      <div class="modal-overlay" *ngIf="showCreateModal" (click)="showCreateModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>🆕 Nuevo Proyecto</h2>
            <button class="btn-icon" (click)="showCreateModal = false">✕</button>
          </div>

          <form (ngSubmit)="createProject()">
            <div class="form-group">
              <label for="projectName">Nombre del Proyecto</label>
              <input type="text" id="projectName" class="form-control" [(ngModel)]="newProject.name" name="name" placeholder="Ej: TaskFlow v2.0" required />
            </div>

            <div class="form-group">
              <label for="projectDesc">Descripción</label>
              <textarea id="projectDesc" class="form-control" [(ngModel)]="newProject.description" name="description" placeholder="Describe tu proyecto..." rows="3"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group form-half">
                <label for="startDate">Fecha Inicio</label>
                <input type="date" id="startDate" class="form-control" [(ngModel)]="newProject.startDate" name="startDate" />
              </div>
              <div class="form-group form-half">
                <label for="endDate">Fecha Fin (Estimada)</label>
                <input type="date" id="endDate" class="form-control" [(ngModel)]="newProject.endDate" name="endDate" />
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showCreateModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary">🚀 Crear Proyecto</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 4px;
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px var(--shadow);
    }

    .stat-icon {
      font-size: 2rem;
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-hover);
      border-radius: 14px;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      display: block;
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }

    .project-card {
      cursor: pointer;
      padding: 24px;
    }

    .project-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .project-status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .status-PLANIFICADO { background: var(--info); }
    .status-EN_PROGRESO { background: var(--warning); }
    .status-PAUSADO { background: var(--text-secondary); }
    .status-COMPLETADO { background: var(--success); }
    .status-ARCHIVADO { background: var(--border); }

    .project-name {
      font-size: 1.1rem;
      font-weight: 700;
      flex: 1;
    }

    .project-actions {
      display: flex;
      gap: 4px;
    }

    .project-description {
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin-bottom: 16px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .project-progress {
      margin-bottom: 16px;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .progress-percent {
      font-weight: 600;
      color: var(--primary);
    }

    .project-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .status-badge-PLANIFICADO { background: rgba(59, 130, 246, 0.15); color: var(--info); }
    .status-badge-EN_PROGRESO { background: rgba(251, 191, 36, 0.15); color: var(--warning); }
    .status-badge-PAUSADO { background: var(--surface-hover); color: var(--text-secondary); }
    .status-badge-COMPLETADO { background: rgba(16, 185, 129, 0.15); color: var(--success); }
    .status-badge-ARCHIVADO { background: var(--surface-hover); color: var(--text-secondary); }

    .project-members {
      display: flex;
      align-items: center;
    }

    .project-members .avatar {
      margin-left: -6px;
      border: 2px solid var(--card-bg);
    }

    .project-members .avatar:first-child { margin-left: 0; }

    .member-count {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-left: 8px;
    }

    .project-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-secondary);
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 80px 20px;
    }

    .empty-icon { font-size: 4rem; display: block; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.5rem; margin-bottom: 8px; }
    .empty-state p { color: var(--text-secondary); margin-bottom: 24px; }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-half {
      flex: 1;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }

    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .projects-grid { grid-template-columns: 1fr; }
      .form-row { flex-direction: column; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  showCreateModal = false;
  toastMessage = '';
  newProject = { name: '', description: '', startDate: '', endDate: '' };

  constructor(
    private projectService: ProjectService,
    public authService: AuthService
  ) {}

  get activeProjects(): number {
    return this.projects.filter(p => p.status === 'EN_PROGRESO').length;
  }

  get completedProjects(): number {
    return this.projects.filter(p => p.status === 'COMPLETADO').length;
  }

  get totalTasks(): number {
    return this.projects.reduce((sum, p) => sum + (p.totalTasks || 0), 0);
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (res) => {
        this.projects = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  createProject(): void {
    this.projectService.createProject(this.newProject).subscribe({
      next: (res) => {
        this.showCreateModal = false;
        this.newProject = { name: '', description: '', startDate: '', endDate: '' };
        this.showToast('Proyecto creado exitosamente ✅');
        this.loadProjects();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error al crear proyecto');
      }
    });
  }

  cloneProject(id: string, event: Event): void {
    event.stopPropagation();
    this.projectService.cloneProject(id).subscribe({
      next: (res) => {
        this.showToast(`📋 Proyecto clonado (Patrón Prototype): ${res.data.name}`);
        this.loadProjects();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error al clonar');
      }
    });
  }

  archiveProject(id: string, event: Event): void {
    event.stopPropagation();
    this.projectService.archiveProject(id).subscribe({
      next: (res) => {
        this.showToast(res.message || 'Proyecto archivado');
        this.loadProjects();
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PLANIFICADO: 'Planificado',
      EN_PROGRESO: 'En Progreso',
      PAUSADO: 'Pausado',
      COMPLETADO: 'Completado',
      ARCHIVADO: 'Archivado'
    };
    return labels[status] || status;
  }

  showToast(message: string): void {
    this.toastMessage = message;
    setTimeout(() => (this.toastMessage = ''), 3000);
  }
}

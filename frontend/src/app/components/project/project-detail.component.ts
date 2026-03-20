import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { BoardService } from '../../services/board.service';
import { Project, Board } from '../../models/interfaces';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container" *ngIf="project">
      <!-- Header -->
      <div class="project-header">
        <div class="header-left">
          <button class="btn btn-secondary btn-sm" routerLink="/dashboard">← Volver</button>
          <div>
            <h1 class="project-title">{{ project.name }}</h1>
            <p class="project-desc">{{ project.description || 'Sin descripción' }}</p>
          </div>
        </div>
        <div class="header-actions">
          <select class="form-control status-select" [(ngModel)]="project.status" (change)="updateStatus()">
            <option value="PLANIFICADO">📋 Planificado</option>
            <option value="EN_PROGRESO">🚀 En Progreso</option>
            <option value="PAUSADO">⏸️ Pausado</option>
            <option value="COMPLETADO">✅ Completado</option>
          </select>
          <button class="btn btn-primary btn-sm" (click)="showAddMemberModal = true">👥 Agregar Miembro</button>
        </div>
      </div>

      <!-- Info cards -->
      <div class="info-grid">
        <div class="info-card">
          <span class="info-label">Progreso</span>
          <span class="info-value">{{ project.progress }}%</span>
          <div class="progress-bar" style="margin-top: 8px">
            <div class="progress-bar-fill" [style.width.%]="project.progress"></div>
          </div>
        </div>
        <div class="info-card">
          <span class="info-label">Tareas</span>
          <span class="info-value">{{ project.completedTasks }}/{{ project.totalTasks }}</span>
        </div>
        <div class="info-card">
          <span class="info-label">Miembros</span>
          <span class="info-value">{{ project.members?.length || 0 }}</span>
        </div>
        <div class="info-card">
          <span class="info-label">Fecha Inicio</span>
          <span class="info-value info-date">{{ project.startDate | date:'dd/MM/yyyy' }}</span>
        </div>
      </div>

      <!-- Members -->
      <div class="section">
        <h2 class="section-title">👥 Miembros del Equipo</h2>
        <div class="members-list">
          <div class="member-item" *ngFor="let m of project.members">
            <div class="avatar">{{ m.user?.name?.charAt(0)?.toUpperCase() }}</div>
            <div class="member-info">
              <span class="member-name">{{ m.user?.name }}</span>
              <span class="member-email">{{ m.user?.email }}</span>
            </div>
            <span class="role-badge">{{ m.role }}</span>
          </div>
        </div>
      </div>

      <!-- Boards -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">📋 Tableros</h2>
          <button class="btn btn-primary btn-sm" (click)="showCreateBoardModal = true">➕ Nuevo Tablero</button>
        </div>
        <div class="boards-grid">
          <div class="board-card card" *ngFor="let board of boards" [routerLink]="['/boards', board._id]">
            <h3 class="board-name">{{ board.name }}</h3>
            <p class="board-columns">{{ board.columns.length }} columnas</p>
            <div class="board-columns-preview">
              <span class="column-tag" *ngFor="let col of board.columns">{{ col.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div class="toast toast-success" *ngIf="toast">{{ toast }}</div>

      <!-- Add Member Modal -->
      <div class="modal-overlay" *ngIf="showAddMemberModal" (click)="showAddMemberModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>👥 Agregar Miembro</h2>
            <button class="btn-icon" (click)="showAddMemberModal = false">✕</button>
          </div>
          <form (ngSubmit)="addMember()">
            <div class="form-group">
              <label>Correo del usuario</label>
              <input type="email" class="form-control" [(ngModel)]="memberEmail" name="memberEmail" placeholder="correo@ejemplo.com" required />
            </div>
            <div class="form-group">
              <label>Rol</label>
              <select class="form-control" [(ngModel)]="memberRole" name="memberRole">
                <option value="DEVELOPER">Desarrollador</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showAddMemberModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary">Agregar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Create Board Modal -->
      <div class="modal-overlay" *ngIf="showCreateBoardModal" (click)="showCreateBoardModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>📋 Nuevo Tablero</h2>
            <button class="btn-icon" (click)="showCreateBoardModal = false">✕</button>
          </div>
          <form (ngSubmit)="createBoard()">
            <div class="form-group">
              <label>Nombre del Tablero</label>
              <input type="text" class="form-control" [(ngModel)]="newBoardName" name="boardName" placeholder="Ej: Sprint 1" required />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showCreateBoardModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary">Crear</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="loading-spinner" *ngIf="loading"></div>
  `,
  styles: [`
    .project-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 32px;
      gap: 20px;
    }

    .header-left {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .project-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 4px; }
    .project-desc { color: var(--text-secondary); font-size: 0.9rem; }

    .header-actions { display: flex; align-items: center; gap: 12px; }

    .status-select {
      width: auto;
      min-width: 160px;
      padding: 8px 12px;
      font-size: 0.85rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .info-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
    }

    .info-label { display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px; }
    .info-value { font-size: 1.5rem; font-weight: 800; display: block; }
    .info-date { font-size: 1rem; }

    .section { margin-bottom: 32px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .section-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; }
    .section-header .section-title { margin-bottom: 0; }

    .members-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }

    .member-item {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
    }

    .member-name { font-weight: 600; font-size: 0.9rem; display: block; }
    .member-email { font-size: 0.8rem; color: var(--text-secondary); }
    .role-badge {
      margin-left: auto;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 600;
      background: rgba(99, 102, 241, 0.15);
      color: var(--primary);
    }

    .boards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .board-card { cursor: pointer; }
    .board-name { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
    .board-columns { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; }

    .board-columns-preview { display: flex; flex-wrap: wrap; gap: 6px; }
    .column-tag {
      padding: 4px 10px;
      background: var(--surface-hover);
      border-radius: 8px;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }

    @media (max-width: 768px) {
      .info-grid { grid-template-columns: repeat(2, 1fr); }
      .project-header { flex-direction: column; }
    }
  `]
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  boards: Board[] = [];
  loading = true;
  toast = '';
  showAddMemberModal = false;
  showCreateBoardModal = false;
  memberEmail = '';
  memberRole = 'DEVELOPER';
  newBoardName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProject(id);
      this.loadBoards(id);
    }
  }

  loadProject(id: string): void {
    this.projectService.getProject(id).subscribe({
      next: (res) => {
        this.project = res.data;
        this.loading = false;
      },
      error: () => {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadBoards(projectId: string): void {
    this.boardService.getBoards(projectId).subscribe({
      next: (res) => {
        this.boards = res.data;
      }
    });
  }

  updateStatus(): void {
    if (this.project) {
      this.projectService.updateProject(this.project._id, { status: this.project.status }).subscribe({
        next: () => this.showToast('Estado actualizado'),
        error: (err) => this.showToast(err.error?.message || 'Error')
      });
    }
  }

  addMember(): void {
    if (this.project) {
      this.projectService.addMember(this.project._id, this.memberEmail, this.memberRole).subscribe({
        next: (res) => {
          this.showAddMemberModal = false;
          this.memberEmail = '';
          this.showToast(res.message || 'Miembro agregado');
          this.loadProject(this.project!._id);
        },
        error: (err) => this.showToast(err.error?.message || 'Error al agregar miembro')
      });
    }
  }

  createBoard(): void {
    if (this.project) {
      this.boardService.createBoard({ name: this.newBoardName, projectId: this.project._id }).subscribe({
        next: () => {
          this.showCreateBoardModal = false;
          this.newBoardName = '';
          this.showToast('Tablero creado');
          this.loadBoards(this.project!._id);
        },
        error: (err) => this.showToast(err.error?.message || 'Error')
      });
    }
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 3000);
  }
}

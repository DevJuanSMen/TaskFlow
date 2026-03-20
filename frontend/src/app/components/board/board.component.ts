import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BoardService } from '../../services/board.service';
import { TaskService } from '../../services/task.service';
import { Board, Column, Task } from '../../models/interfaces';
import { TaskDialogComponent } from '../task/task-dialog.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TaskDialogComponent],
  template: `
    <div class="board-page" *ngIf="board">
      <!-- Board Header -->
      <div class="board-header">
        <div class="header-left">
          <button class="btn btn-secondary btn-sm" (click)="goBack()">← Volver</button>
          <h1 class="board-title">{{ board.name }}</h1>
        </div>
        <div class="header-actions">
          <!-- Filters -->
          <div class="filter-bar">
            <input type="text" class="form-control filter-input" placeholder="🔍 Buscar tareas..." [(ngModel)]="searchQuery" (input)="filterTasks()" />
            <select class="form-control filter-select" [(ngModel)]="filterPriority" (change)="filterTasks()">
              <option value="">Prioridad</option>
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
            <select class="form-control filter-select" [(ngModel)]="filterType" (change)="filterTasks()">
              <option value="">Tipo</option>
              <option value="BUG">Bug</option>
              <option value="FEATURE">Feature</option>
              <option value="TASK">Task</option>
              <option value="IMPROVEMENT">Improvement</option>
            </select>
          </div>
          <button class="btn btn-primary" (click)="openCreateTask()">➕ Nueva Tarea</button>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="kanban-container">
        <div class="kanban-column" *ngFor="let col of board.columns">
          <div class="column-header">
            <div class="column-title-group">
              <h3 class="column-title">{{ col.name }}</h3>
              <span class="column-count">{{ getColumnTasks(col.name).length }}</span>
            </div>
            <span class="wip-badge" *ngIf="col.wipLimit > 0">WIP: {{ col.wipLimit }}</span>
          </div>

          <div class="column-body">
            <div
              class="task-card"
              *ngFor="let task of getColumnTasks(col.name)"
              [class.overdue]="task.isOverdue"
              (click)="openTaskDetail(task)"
            >
              <!-- Labels -->
              <div class="task-labels" *ngIf="task.labels?.length">
                <span class="label-dot" *ngFor="let label of task.labels" [style.background]="label.color" [title]="label.name"></span>
              </div>

              <!-- Title -->
              <h4 class="task-title">{{ task.title }}</h4>

              <!-- Badges -->
              <div class="task-badges">
                <span class="badge" [class]="'badge-type-' + task.type">{{ task.type }}</span>
                <span class="badge" [class]="'badge-priority-' + task.priority">{{ task.priority }}</span>
              </div>

              <!-- Description -->
              <p class="task-desc" *ngIf="task.description">{{ task.description | slice:0:80 }}{{ task.description.length > 80 ? '...' : '' }}</p>

              <!-- Subtask progress -->
              <div class="task-subtasks" *ngIf="task.subtasks?.length">
                <div class="progress-bar" style="height: 4px">
                  <div class="progress-bar-fill" [style.width.%]="task.subtaskProgress"></div>
                </div>
                <span class="subtask-text">{{ getCompletedSubtasks(task) }}/{{ task.subtasks.length }} subtareas</span>
              </div>

              <!-- Footer -->
              <div class="task-footer">
                <div class="task-assignees">
                  <div class="avatar avatar-sm" *ngFor="let a of task.assignees?.slice(0, 2)" [title]="a.name">
                    {{ a.name?.charAt(0)?.toUpperCase() }}
                  </div>
                </div>
                <div class="task-meta-icons">
                  <span *ngIf="task.comments?.length" title="Comentarios">💬 {{ task.comments.length }}</span>
                  <span *ngIf="task.attachments?.length" title="Adjuntos">📎 {{ task.attachments.length }}</span>
                  <span *ngIf="task.dueDate" class="due-date" [class.text-danger]="task.isOverdue" [title]="'Vence: ' + (task.dueDate | date:'dd/MM/yyyy')">
                    📅 {{ task.dueDate | date:'dd/MM' }}
                  </span>
                </div>
              </div>

              <!-- Move buttons -->
              <div class="task-move-actions">
                <button class="move-btn" *ngIf="getColumnIndex(col.name) > 0" (click)="moveTask(task, getPrevColumn(col.name), $event)" title="Mover a la izquierda">◀</button>
                <button class="move-btn" *ngIf="getColumnIndex(col.name) < board.columns.length - 1" (click)="moveTask(task, getNextColumn(col.name), $event)" title="Mover a la derecha">▶</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div class="toast" [class.toast-success]="!toastError" [class.toast-error]="toastError" *ngIf="toastMessage">
        {{ toastMessage }}
      </div>
    </div>

    <!-- Task Dialog -->
    <app-task-dialog
      *ngIf="showTaskDialog"
      [boardId]="board?._id || ''"
      [columns]="board?.columns || []"
      [task]="selectedTask"
      (close)="closeTaskDialog()"
      (saved)="onTaskSaved($event)"
      (deleted)="onTaskDeleted()"
      (cloned)="onTaskCloned($event)"
      (moved)="onTaskMoved($event)"
    ></app-task-dialog>

    <div class="loading-spinner" *ngIf="loading"></div>
  `,
  styles: [`
    .board-page { max-width: 100%; overflow-x: auto; }

    .board-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .header-left { display: flex; align-items: center; gap: 16px; }
    .board-title { font-size: 1.5rem; font-weight: 800; }

    .header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

    .filter-bar { display: flex; gap: 8px; }
    .filter-input { width: 200px; padding: 8px 14px; font-size: 0.85rem; }
    .filter-select { width: 120px; padding: 8px; font-size: 0.85rem; }

    .kanban-container {
      display: flex;
      gap: 16px;
      padding-bottom: 20px;
      min-height: 60vh;
    }

    .kanban-column {
      min-width: 300px;
      max-width: 340px;
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
    }

    .column-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .column-title-group { display: flex; align-items: center; gap: 10px; }
    .column-title { font-size: 0.95rem; font-weight: 700; }
    .column-count {
      background: var(--surface-hover);
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .wip-badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 8px;
      background: rgba(251, 191, 36, 0.15);
      color: var(--warning);
      font-weight: 600;
    }

    .column-body {
      padding: 12px;
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .task-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .task-card:hover {
      border-color: var(--primary);
      box-shadow: 0 4px 20px var(--shadow);
      transform: translateY(-1px);
    }

    .task-card.overdue {
      border-left: 3px solid var(--danger);
    }

    .task-labels {
      display: flex;
      gap: 4px;
      margin-bottom: 8px;
    }

    .label-dot {
      width: 24px;
      height: 4px;
      border-radius: 2px;
    }

    .task-title {
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .task-badges {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
    }

    .task-desc {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-bottom: 10px;
      line-height: 1.4;
    }

    .task-subtasks {
      margin-bottom: 10px;
    }

    .subtask-text {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 4px;
      display: block;
    }

    .task-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .task-assignees {
      display: flex;
    }

    .task-assignees .avatar { margin-left: -4px; border: 2px solid var(--card-bg); }
    .task-assignees .avatar:first-child { margin-left: 0; }

    .task-meta-icons {
      display: flex;
      gap: 10px;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .text-danger { color: var(--danger) !important; }

    .task-move-actions {
      display: none;
      position: absolute;
      top: 8px;
      right: 8px;
      gap: 4px;
    }

    .task-card:hover .task-move-actions { display: flex; }

    .move-btn {
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 6px;
      background: var(--primary);
      color: white;
      font-size: 0.7rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .move-btn:hover { background: var(--primary-hover); }

    @media (max-width: 768px) {
      .kanban-container { flex-direction: column; }
      .kanban-column { min-width: 100%; max-width: 100%; }
      .filter-bar { flex-direction: column; }
    }
  `]
})
export class BoardComponent implements OnInit {
  board: Board | null = null;
  allTasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading = true;
  showTaskDialog = false;
  selectedTask: Task | null = null;
  toastMessage = '';
  toastError = false;

  // Filters
  searchQuery = '';
  filterPriority = '';
  filterType = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadBoard(id);
  }

  loadBoard(id: string): void {
    this.loading = true;
    this.boardService.getBoard(id).subscribe({
      next: (res: any) => {
        this.board = res.data.board;
        // Flatten tasks from columns
        const tasksByCol = res.data.tasks;
        this.allTasks = [];
        Object.values(tasksByCol).forEach((colTasks: any) => {
          this.allTasks.push(...colTasks);
        });
        this.filteredTasks = [...this.allTasks];
        this.loading = false;
      },
      error: () => { this.router.navigate(['/dashboard']); }
    });
  }

  filterTasks(): void {
    this.filteredTasks = this.allTasks.filter(task => {
      const matchesSearch = !this.searchQuery ||
        task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesPriority = !this.filterPriority || task.priority === this.filterPriority;
      const matchesType = !this.filterType || task.type === this.filterType;
      return matchesSearch && matchesPriority && matchesType;
    });
  }

  getColumnTasks(columnName: string): Task[] {
    return this.filteredTasks.filter(t => t.column === columnName);
  }

  getColumnIndex(columnName: string): number {
    return this.board?.columns.findIndex(c => c.name === columnName) ?? -1;
  }

  getPrevColumn(columnName: string): string {
    const idx = this.getColumnIndex(columnName);
    return this.board?.columns[idx - 1]?.name || columnName;
  }

  getNextColumn(columnName: string): string {
    const idx = this.getColumnIndex(columnName);
    return this.board?.columns[idx + 1]?.name || columnName;
  }

  getCompletedSubtasks(task: Task): number {
    return task.subtasks?.filter(s => s.completed).length || 0;
  }

  moveTask(task: Task, targetColumn: string, event: Event): void {
    event.stopPropagation();
    this.taskService.moveTask(task._id, targetColumn).subscribe({
      next: (res) => {
        this.showToast(`Tarea movida a "${targetColumn}"`, false);
        if (this.board) this.loadBoard(this.board._id);
      },
      error: (err) => this.showToast(err.error?.message || 'Error al mover', true)
    });
  }

  openCreateTask(): void {
    this.selectedTask = null;
    this.showTaskDialog = true;
  }

  openTaskDetail(task: Task): void {
    this.selectedTask = task;
    this.showTaskDialog = true;
  }

  closeTaskDialog(): void {
    this.showTaskDialog = false;
    this.selectedTask = null;
  }

  onTaskSaved(event: any): void {
    this.showToast(event.message || 'Tarea guardada', false);
    if (this.board) this.loadBoard(this.board._id);
    this.closeTaskDialog();
  }

  onTaskDeleted(): void {
    this.showToast('Tarea eliminada', false);
    if (this.board) this.loadBoard(this.board._id);
    this.closeTaskDialog();
  }

  onTaskCloned(event: any): void {
    this.showToast(`📋 Tarea clonada (Patrón Prototype): ${event.data?.title}`, false);
    if (this.board) this.loadBoard(this.board._id);
  }

  onTaskMoved(event: any): void {
    if (this.board) this.loadBoard(this.board._id);
  }

  goBack(): void {
    if (this.board) {
      this.router.navigate(['/projects', (this.board as any).project]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  showToast(message: string, isError: boolean): void {
    this.toastMessage = message;
    this.toastError = isError;
    setTimeout(() => (this.toastMessage = ''), 3000);
  }
}

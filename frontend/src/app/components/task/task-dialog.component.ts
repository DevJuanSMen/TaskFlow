import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task, Column } from '../../models/interfaces';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="task-modal" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <h2>{{ isNew ? '🆕 Nueva Tarea' : '📝 ' + taskForm.title }}</h2>
          <div class="header-btns">
            <button class="btn-icon" *ngIf="!isNew" (click)="cloneTask()" title="Clonar (Prototype)">📋</button>
            <button class="btn-icon" *ngIf="!isNew" (click)="deleteTask()" title="Eliminar">🗑️</button>
            <button class="btn-icon" (click)="close.emit()">✕</button>
          </div>
        </div>

        <!-- Pattern indicator -->
        <div class="pattern-info" *ngIf="isNew">
          <span class="pattern-badge factory">🏭 Factory Method</span>
          <span class="pattern-badge builder">🔨 Builder</span>
          <span class="pattern-toggle">Usando: <strong>{{ useBuilder ? 'Builder' : 'Factory Method' }}</strong></span>
          <label class="switch">
            <input type="checkbox" [(ngModel)]="useBuilder" name="useBuilder">
            <span class="slider"></span>
          </label>
        </div>

        <!-- Tabs -->
        <div class="tabs" *ngIf="!isNew">
          <button class="tab" [class.active]="activeTab === 'details'" (click)="activeTab = 'details'">Detalles</button>
          <button class="tab" [class.active]="activeTab === 'subtasks'" (click)="activeTab = 'subtasks'">Subtareas ({{ taskForm.subtasks?.length || 0 }})</button>
          <button class="tab" [class.active]="activeTab === 'comments'" (click)="activeTab = 'comments'">Comentarios ({{ taskForm.comments?.length || 0 }})</button>
          <button class="tab" [class.active]="activeTab === 'history'" (click)="activeTab = 'history'; loadFullTask()">Historial</button>
        </div>

        <!-- Details Tab -->
        <div class="tab-content" *ngIf="activeTab === 'details' || isNew">
          <form (ngSubmit)="saveTask()">
            <div class="form-grid">
              <div class="form-group form-full">
                <label>Título</label>
                <input type="text" class="form-control" [(ngModel)]="taskForm.title" name="title" placeholder="Título de la tarea" required />
              </div>

              <div class="form-group form-full">
                <label>Descripción</label>
                <textarea class="form-control" [(ngModel)]="taskForm.description" name="description" rows="3" placeholder="Describe la tarea..."></textarea>
              </div>

              <div class="form-group">
                <label>Tipo</label>
                <select class="form-control" [(ngModel)]="taskForm.type" name="type">
                  <option value="TASK">📌 Task</option>
                  <option value="BUG">🐛 Bug</option>
                  <option value="FEATURE">✨ Feature</option>
                  <option value="IMPROVEMENT">🔧 Improvement</option>
                </select>
              </div>

              <div class="form-group">
                <label>Prioridad</label>
                <select class="form-control" [(ngModel)]="taskForm.priority" name="priority">
                  <option value="BAJA">🟢 Baja</option>
                  <option value="MEDIA">🟡 Media</option>
                  <option value="ALTA">🟠 Alta</option>
                  <option value="URGENTE">🔴 Urgente</option>
                </select>
              </div>

              <div class="form-group">
                <label>Columna</label>
                <select class="form-control" [(ngModel)]="taskForm.column" name="column">
                  <option *ngFor="let col of columns" [value]="col.name">{{ col.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Fecha Vencimiento</label>
                <input type="date" class="form-control" [(ngModel)]="taskForm.dueDate" name="dueDate" />
              </div>

              <div class="form-group">
                <label>Estimación (horas)</label>
                <input type="number" class="form-control" [(ngModel)]="taskForm.estimation" name="estimation" min="0" />
              </div>
            </div>

            <!-- Labels -->
            <div class="form-group">
              <label>Etiquetas</label>
              <div class="labels-list">
                <span class="label-item" *ngFor="let label of taskForm.labels; let i = index" [style.background]="label.color + '30'" [style.color]="label.color">
                  {{ label.name }}
                  <button type="button" class="label-remove" (click)="removeLabel(i)">×</button>
                </span>
              </div>
              <div class="label-add">
                <input type="text" class="form-control" [(ngModel)]="newLabelName" name="newLabelName" placeholder="Nueva etiqueta" style="flex:1" />
                <input type="color" [(ngModel)]="newLabelColor" name="newLabelColor" class="color-picker" />
                <button type="button" class="btn btn-sm btn-secondary" (click)="addLabel()">+</button>
              </div>
            </div>

            <!-- Time tracking (only for existing tasks) -->
            <div class="form-group" *ngIf="!isNew">
              <label>⏱️ Registrar Tiempo</label>
              <div class="time-add">
                <input type="number" class="form-control" [(ngModel)]="timeHours" name="timeHours" placeholder="Horas" min="0.25" step="0.25" style="width:100px" />
                <input type="text" class="form-control" [(ngModel)]="timeDesc" name="timeDesc" placeholder="Descripción" style="flex:1" />
                <button type="button" class="btn btn-sm btn-secondary" (click)="addTimeEntry()">Registrar</button>
              </div>
              <div class="time-total" *ngIf="taskForm.totalTimeSpent">
                Total: <strong>{{ taskForm.totalTimeSpent }} horas</strong>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="close.emit()">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                {{ isNew ? (useBuilder ? '🔨 Crear con Builder' : '🏭 Crear con Factory') : '💾 Guardar' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Subtasks Tab -->
        <div class="tab-content" *ngIf="activeTab === 'subtasks' && !isNew">
          <div class="subtasks-list">
            <div class="subtask-item" *ngFor="let st of taskForm.subtasks" [class.completed]="st.completed">
              <input type="checkbox" [checked]="st.completed" (change)="toggleSubtask(st._id)" class="subtask-checkbox" />
              <span class="subtask-title" [class.line-through]="st.completed">{{ st.title }}</span>
            </div>
          </div>
          <div class="add-subtask">
            <input type="text" class="form-control" [(ngModel)]="newSubtaskTitle" placeholder="Nueva subtarea..." (keydown.enter)="addSubtask()" />
            <button class="btn btn-sm btn-primary" (click)="addSubtask()">Agregar</button>
          </div>
        </div>

        <!-- Comments Tab -->
        <div class="tab-content" *ngIf="activeTab === 'comments' && !isNew">
          <div class="comments-list">
            <div class="comment-item" *ngFor="let c of taskForm.comments">
              <div class="comment-header">
                <div class="avatar avatar-sm">{{ c.user?.name?.charAt(0)?.toUpperCase() }}</div>
                <span class="comment-author">{{ c.user?.name }}</span>
                <span class="comment-date">{{ c.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <p class="comment-content">{{ c.content }}</p>
            </div>
            <div class="empty-tab" *ngIf="!taskForm.comments?.length">No hay comentarios aún</div>
          </div>
          <div class="add-comment">
            <textarea class="form-control" [(ngModel)]="newComment" placeholder="Escribe un comentario..." rows="2"></textarea>
            <button class="btn btn-sm btn-primary" (click)="addComment()" [disabled]="!newComment.trim()">Comentar</button>
          </div>
        </div>

        <!-- History Tab -->
        <div class="tab-content" *ngIf="activeTab === 'history' && !isNew">
          <div class="history-list">
            <div class="history-item" *ngFor="let h of taskForm.history">
              <div class="history-dot"></div>
              <div class="history-content">
                <span class="history-action">{{ h.action }}</span>
                <span class="history-field" *ngIf="h.field">sobre <strong>{{ h.field }}</strong></span>
                <span class="history-date">{{ h.timestamp | date:'dd/MM/yyyy HH:mm' }}</span>
                <div class="history-values" *ngIf="h.oldValue || h.newValue">
                  <span class="old-value" *ngIf="h.oldValue">{{ h.oldValue }}</span>
                  <span *ngIf="h.oldValue && h.newValue">→</span>
                  <span class="new-value" *ngIf="h.newValue">{{ h.newValue }}</span>
                </div>
              </div>
            </div>
            <div class="empty-tab" *ngIf="!taskForm.history?.length">No hay historial</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-modal {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 32px;
      width: 95%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease;
    }

    .header-btns { display: flex; gap: 4px; }

    .pattern-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--surface-hover);
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 0.85rem;
    }

    .pattern-badge {
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .pattern-badge.factory { background: rgba(59, 130, 246, 0.15); color: var(--info); }
    .pattern-badge.builder { background: rgba(139, 92, 246, 0.15); color: var(--secondary); }
    .pattern-toggle { margin-left: auto; font-size: 0.8rem; color: var(--text-secondary); }

    .switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }

    .switch input { opacity: 0; width: 0; height: 0; }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background: var(--info);
      border-radius: 24px;
      transition: 0.3s;
    }

    .slider::before {
      content: '';
      position: absolute;
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background: white;
      border-radius: 50%;
      transition: 0.3s;
    }

    input:checked + .slider { background: var(--secondary); }
    input:checked + .slider::before { transform: translateX(20px); }

    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0;
    }

    .tab {
      padding: 10px 18px;
      border: none;
      background: none;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      font-family: 'Inter', sans-serif;
    }

    .tab.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }

    .tab:hover { color: var(--text); }
    .tab-content { animation: fadeIn 0.2s ease; }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-full { grid-column: 1 / -1; }

    .labels-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
    }

    .label-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .label-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      font-size: 1rem;
      padding: 0;
      line-height: 1;
    }

    .label-add, .time-add, .add-subtask, .add-comment {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .color-picker {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      padding: 2px;
    }

    .time-total {
      margin-top: 8px;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .subtasks-list { margin-bottom: 16px; }

    .subtask-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
    }

    .subtask-checkbox {
      width: 18px;
      height: 18px;
      accent-color: var(--primary);
      cursor: pointer;
    }

    .subtask-title { font-size: 0.9rem; }
    .line-through { text-decoration: line-through; color: var(--text-secondary); }
    .completed { opacity: 0.7; }

    .comments-list {
      margin-bottom: 16px;
      max-height: 300px;
      overflow-y: auto;
    }

    .comment-item {
      padding: 14px 0;
      border-bottom: 1px solid var(--border);
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .comment-author { font-weight: 600; font-size: 0.85rem; }
    .comment-date { font-size: 0.75rem; color: var(--text-secondary); margin-left: auto; }
    .comment-content { font-size: 0.9rem; line-height: 1.5; color: var(--text); }

    .history-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .history-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
    }

    .history-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      flex-shrink: 0;
      margin-top: 6px;
    }

    .history-action { font-weight: 600; font-size: 0.85rem; margin-right: 4px; }
    .history-field { font-size: 0.85rem; color: var(--text-secondary); }
    .history-date { display: block; font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; }
    .history-values { font-size: 0.8rem; margin-top: 4px; }
    .old-value { color: var(--danger); }
    .new-value { color: var(--success); }

    .empty-tab {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
    }

    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class TaskDialogComponent implements OnInit {
  @Input() boardId = '';
  @Input() columns: Column[] = [];
  @Input() task: Task | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<void>();
  @Output() cloned = new EventEmitter<any>();
  @Output() moved = new EventEmitter<any>();

  taskForm: any = {};
  isNew = true;
  useBuilder = false;
  activeTab = 'details';

  // New items
  newLabelName = '';
  newLabelColor = '#6366F1';
  newSubtaskTitle = '';
  newComment = '';
  timeHours = 0;
  timeDesc = '';

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    if (this.task) {
      this.isNew = false;
      this.taskForm = { ...this.task };
    } else {
      this.isNew = true;
      this.taskForm = {
        title: '',
        description: '',
        type: 'TASK',
        priority: 'MEDIA',
        column: this.columns[0]?.name || 'Por hacer',
        dueDate: '',
        estimation: 0,
        labels: [],
        subtasks: [],
        comments: [],
        history: [],
        assignees: [],
      };
    }
  }

  loadFullTask(): void {
    if (this.task?._id) {
      this.taskService.getTask(this.task._id).subscribe({
        next: (res) => {
          this.taskForm = { ...res.data };
        }
      });
    }
  }

  saveTask(): void {
    if (this.isNew) {
      const data = {
        title: this.taskForm.title,
        description: this.taskForm.description,
        type: this.taskForm.type,
        priority: this.taskForm.priority,
        column: this.taskForm.column,
        dueDate: this.taskForm.dueDate,
        estimation: this.taskForm.estimation,
        boardId: this.boardId,
        labels: this.taskForm.labels,
        subtasks: this.taskForm.subtasks?.map((s: any) => ({ title: s.title || s })),
      };

      const createMethod = this.useBuilder
        ? this.taskService.createTaskWithBuilder(data)
        : this.taskService.createTask(data);

      createMethod.subscribe({
        next: (res) => {
          this.saved.emit({
            message: `Tarea creada usando ${this.useBuilder ? 'Builder' : 'Factory Method'} ✅`,
            pattern: res.pattern,
            data: res.data
          });
        },
        error: (err) => console.error(err)
      });
    } else {
      this.taskService.updateTask(this.task!._id, {
        title: this.taskForm.title,
        description: this.taskForm.description,
        type: this.taskForm.type,
        priority: this.taskForm.priority,
        dueDate: this.taskForm.dueDate,
        estimation: this.taskForm.estimation,
        labels: this.taskForm.labels,
      }).subscribe({
        next: (res) => this.saved.emit({ message: 'Tarea actualizada ✅', data: res.data }),
        error: (err) => console.error(err)
      });
    }
  }

  deleteTask(): void {
    if (this.task && confirm('¿Eliminar esta tarea?')) {
      this.taskService.deleteTask(this.task._id).subscribe({
        next: () => this.deleted.emit(),
        error: (err) => console.error(err)
      });
    }
  }

  cloneTask(): void {
    if (this.task) {
      this.taskService.cloneTask(this.task._id).subscribe({
        next: (res) => this.cloned.emit(res),
        error: (err) => console.error(err)
      });
    }
  }

  addLabel(): void {
    if (this.newLabelName.trim()) {
      this.taskForm.labels.push({ name: this.newLabelName.trim(), color: this.newLabelColor });
      this.newLabelName = '';
    }
  }

  removeLabel(index: number): void {
    this.taskForm.labels.splice(index, 1);
  }

  addSubtask(): void {
    if (this.newSubtaskTitle.trim() && this.task) {
      this.taskService.addSubtask(this.task._id, this.newSubtaskTitle.trim()).subscribe({
        next: (res) => {
          this.taskForm.subtasks = res.data.subtasks;
          this.newSubtaskTitle = '';
        }
      });
    }
  }

  toggleSubtask(subtaskId: string): void {
    if (this.task) {
      this.taskService.toggleSubtask(this.task._id, subtaskId).subscribe({
        next: (res) => {
          this.taskForm.subtasks = res.data.subtasks;
        }
      });
    }
  }

  addComment(): void {
    if (this.newComment.trim() && this.task) {
      this.taskService.addComment(this.task._id, this.newComment.trim()).subscribe({
        next: (res) => {
          this.taskForm.comments = res.data.comments;
          this.newComment = '';
        }
      });
    }
  }

  addTimeEntry(): void {
    if (this.timeHours > 0 && this.task) {
      this.taskService.addTimeEntry(this.task._id, this.timeHours, this.timeDesc).subscribe({
        next: (res) => {
          this.taskForm.timeEntries = res.data.timeEntries;
          this.taskForm.totalTimeSpent = res.data.timeEntries?.reduce((sum: number, e: any) => sum + e.hours, 0) || 0;
          this.timeHours = 0;
          this.timeDesc = '';
        }
      });
    }
  }
}

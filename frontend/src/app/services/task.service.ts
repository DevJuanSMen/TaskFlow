import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Task } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  // Crear tarea usando Factory Method
  createTask(data: any): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(this.apiUrl, data);
  }

  // Crear tarea usando Builder
  createTaskWithBuilder(data: any): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/build`, data);
  }

  getTasksByBoard(boardId: string, filters?: any): Observable<ApiResponse<Task[]>> {
    let params: any = {};
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key];
      });
    }
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/board/${boardId}`, { params });
  }

  getTask(id: string): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/${id}`);
  }

  updateTask(id: string, data: any): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/${id}`, data);
  }

  moveTask(id: string, column: string, order?: number): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/${id}/move`, { column, order });
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  cloneTask(id: string): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/${id}/clone`, {});
  }

  addSubtask(taskId: string, title: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${taskId}/subtasks`, { title });
  }

  toggleSubtask(taskId: string, subtaskId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${taskId}/subtasks/${subtaskId}`, {});
  }

  addComment(taskId: string, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${taskId}/comments`, { content });
  }

  deleteComment(taskId: string, commentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${taskId}/comments/${commentId}`);
  }

  addAttachment(taskId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${taskId}/attachments`, formData);
  }

  addTimeEntry(taskId: string, hours: number, description: string = ''): Observable<any> {
    return this.http.post(`${this.apiUrl}/${taskId}/time`, { hours, description });
  }
}

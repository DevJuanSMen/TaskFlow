import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Board } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private apiUrl = `${environment.apiUrl}/boards`;

  constructor(private http: HttpClient) {}

  getBoards(projectId: string): Observable<ApiResponse<Board[]>> {
    return this.http.get<ApiResponse<Board[]>>(`${this.apiUrl}/project/${projectId}`);
  }

  getBoard(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createBoard(data: { name: string; projectId: string }): Observable<ApiResponse<Board>> {
    return this.http.post<ApiResponse<Board>>(this.apiUrl, data);
  }

  updateBoard(id: string, name: string): Observable<ApiResponse<Board>> {
    return this.http.put<ApiResponse<Board>>(`${this.apiUrl}/${id}`, { name });
  }

  deleteBoard(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addColumn(boardId: string, name: string, wipLimit: number = 0): Observable<ApiResponse<Board>> {
    return this.http.post<ApiResponse<Board>>(`${this.apiUrl}/${boardId}/columns`, { name, wipLimit });
  }

  updateColumn(boardId: string, columnId: string, data: { name?: string; wipLimit?: number }): Observable<ApiResponse<Board>> {
    return this.http.put<ApiResponse<Board>>(`${this.apiUrl}/${boardId}/columns/${columnId}`, data);
  }

  deleteColumn(boardId: string, columnId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${boardId}/columns/${columnId}`);
  }

  reorderColumns(boardId: string, columnOrder: { columnId: string; order: number }[]): Observable<ApiResponse<Board>> {
    return this.http.put<ApiResponse<Board>>(`${this.apiUrl}/${boardId}/columns/reorder`, { columnOrder });
  }
}

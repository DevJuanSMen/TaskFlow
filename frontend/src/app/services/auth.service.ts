import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenKey = 'taskflow_token';

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const user = localStorage.getItem('taskflow_user');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  register(name: string, email: string, password: string, role: string = 'DEVELOPER'): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password, role }).pipe(
      tap(response => {
        if (response.success) {
          this.setSession(response.data.user, response.data.token);
        }
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.success) {
          this.setSession(response.data.user, response.data.token);
        }
      })
    );
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  updateProfile(data: { name?: string; avatar?: string; description?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data).pipe(
      tap((response: any) => {
        if (response.success) {
          this.currentUserSubject.next(response.data);
          localStorage.setItem('taskflow_user', JSON.stringify(response.data));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('taskflow_user');
    this.currentUserSubject.next(null);
  }

  private setSession(user: User, token: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem('taskflow_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}

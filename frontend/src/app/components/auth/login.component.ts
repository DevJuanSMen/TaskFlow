import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-icon">⚡</span>
          <h1>TaskFlow</h1>
          <p>Inicia sesión para gestionar tus proyectos</p>
        </div>

        <form (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              class="form-control"
              [(ngModel)]="email"
              name="email"
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              class="form-control"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div class="error-message" *ngIf="error">
            {{ error }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            {{ loading ? '⏳ Iniciando...' : '🚀 Iniciar Sesión' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>¿No tienes cuenta? <a routerLink="/register">Regístrate aquí</a></p>
        </div>
      </div>

      <div class="auth-decoration">
        <div class="floating-card card-1">📋 Kanban</div>
        <div class="floating-card card-2">✅ Tareas</div>
        <div class="floating-card card-3">👥 Equipo</div>
        <div class="floating-card card-4">📊 Reportes</div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 64px);
      position: relative;
      overflow: hidden;
    }

    .auth-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 48px;
      width: 100%;
      max-width: 440px;
      position: relative;
      z-index: 2;
      box-shadow: 0 20px 60px var(--shadow);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 36px;
    }

    .auth-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 12px;
    }

    .auth-header h1 {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }

    .auth-header p {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .auth-form {
      margin-bottom: 24px;
    }

    .btn-block {
      width: 100%;
      justify-content: center;
      padding: 14px;
      font-size: 1rem;
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: var(--danger);
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 0.85rem;
      margin-bottom: 16px;
      animation: slideDown 0.3s ease;
    }

    .auth-footer {
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .auth-footer a {
      font-weight: 600;
    }

    .auth-decoration {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .floating-card {
      position: absolute;
      padding: 16px 24px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      font-weight: 600;
      font-size: 0.9rem;
      opacity: 0.15;
      animation: float 6s ease-in-out infinite;
    }

    .card-1 { top: 15%; left: 8%; animation-delay: 0s; }
    .card-2 { top: 25%; right: 10%; animation-delay: 1.5s; }
    .card-3 { bottom: 20%; left: 12%; animation-delay: 3s; }
    .card-4 { bottom: 30%; right: 8%; animation-delay: 4.5s; }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(3deg); }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al iniciar sesión';
      }
    });
  }
}

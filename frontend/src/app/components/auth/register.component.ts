import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-icon">⚡</span>
          <h1>Crear Cuenta</h1>
          <p>Únete a TaskFlow y gestiona tus proyectos</p>
        </div>

        <form (ngSubmit)="onRegister()" class="auth-form">
          <div class="form-group">
            <label for="name">Nombre Completo</label>
            <input type="text" id="name" class="form-control" [(ngModel)]="name" name="name" placeholder="Tu nombre" required />
          </div>

          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" class="form-control" [(ngModel)]="email" name="email" placeholder="tu@correo.com" required />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" class="form-control" [(ngModel)]="password" name="password" placeholder="Mínimo 6 caracteres" required />
          </div>

          <div class="form-group">
            <label for="role">Rol</label>
            <select id="role" class="form-control" [(ngModel)]="role" name="role">
              <option value="DEVELOPER">Desarrollador</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div class="error-message" *ngIf="error">{{ error }}</div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            {{ loading ? '⏳ Registrando...' : '✨ Crear Cuenta' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 64px);
    }

    .auth-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 48px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 60px var(--shadow);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 36px;
    }

    .auth-icon { font-size: 3rem; display: block; margin-bottom: 12px; }

    .auth-header h1 {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }

    .auth-header p { color: var(--text-secondary); font-size: 0.9rem; }
    .auth-form { margin-bottom: 24px; }
    .btn-block { width: 100%; justify-content: center; padding: 14px; font-size: 1rem; }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: var(--danger);
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 0.85rem;
      margin-bottom: 16px;
    }

    .auth-footer { text-align: center; font-size: 0.875rem; color: var(--text-secondary); }
    .auth-footer a { font-weight: 600; }
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  role = 'DEVELOPER';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    this.loading = true;
    this.error = '';

    this.authService.register(this.name, this.email, this.password, this.role).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al registrarse';
      }
    });
  }
}

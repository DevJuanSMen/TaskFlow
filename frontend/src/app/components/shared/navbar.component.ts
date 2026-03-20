import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../patterns/theme-factory';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar" *ngIf="authService.isLoggedIn">
      <div class="navbar-container">
        <a routerLink="/dashboard" class="navbar-brand">
          <span class="brand-icon">⚡</span>
          <span class="brand-text">TaskFlow</span>
        </a>

        <div class="navbar-actions">
          <button class="theme-toggle" (click)="toggleTheme()" [title]="themeService.currentTheme.isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'">
            {{ themeService.currentTheme.isDark ? '☀️' : '🌙' }}
          </button>

          <div class="user-menu">
            <button class="user-btn" (click)="showMenu = !showMenu">
              <div class="avatar avatar-sm">
                {{ authService.currentUser?.name?.charAt(0)?.toUpperCase() }}
              </div>
              <span class="user-name">{{ authService.currentUser?.name }}</span>
              <span class="chevron">▾</span>
            </button>

            <div class="dropdown-menu" *ngIf="showMenu" (click)="showMenu = false">
              <div class="dropdown-header">
                <div class="avatar">{{ authService.currentUser?.name?.charAt(0)?.toUpperCase() }}</div>
                <div>
                  <p class="dropdown-user-name">{{ authService.currentUser?.name }}</p>
                  <p class="dropdown-user-email">{{ authService.currentUser?.email }}</p>
                  <span class="role-badge">{{ authService.currentUser?.role }}</span>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" (click)="logout()">
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      height: 64px;
      background: var(--navbar-bg);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
      transition: all 0.3s ease;
    }

    .navbar-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text);
    }

    .brand-icon {
      font-size: 1.5rem;
    }

    .brand-text {
      font-size: 1.25rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .theme-toggle {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 1.1rem;
      transition: all 0.2s ease;
    }

    .theme-toggle:hover {
      background: var(--surface-hover);
      transform: scale(1.05);
    }

    .user-menu {
      position: relative;
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 6px 14px 6px 6px;
      cursor: pointer;
      color: var(--text);
      transition: all 0.2s ease;
    }

    .user-btn:hover {
      background: var(--surface-hover);
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .chevron {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 8px;
      min-width: 260px;
      box-shadow: 0 12px 40px var(--shadow);
      animation: slideDown 0.2s ease;
      z-index: 200;
    }

    .dropdown-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
    }

    .dropdown-user-name {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .dropdown-user-email {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .role-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 600;
      background: rgba(99, 102, 241, 0.15);
      color: var(--primary);
      margin-top: 4px;
    }

    .dropdown-divider {
      height: 1px;
      background: var(--border);
      margin: 8px 0;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 12px;
      border: none;
      background: none;
      color: var(--text);
      font-size: 0.875rem;
      cursor: pointer;
      border-radius: 10px;
      transition: all 0.2s ease;
      font-family: 'Inter', sans-serif;
    }

    .dropdown-item:hover {
      background: var(--surface-hover);
    }
  `]
})
export class NavbarComponent {
  showMenu = false;

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

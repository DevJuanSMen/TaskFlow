import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/shared/navbar.component';
import { ThemeService } from './patterns/theme-factory';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 64px);
      padding: 24px;
      background: var(--background);
      transition: background 0.3s ease;
    }
  `]
})
export class AppComponent {
  constructor(private themeService: ThemeService) {}
}

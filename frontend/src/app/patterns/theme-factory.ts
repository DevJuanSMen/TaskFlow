// ============================================
// PATRÓN ABSTRACT FACTORY - Temas Visuales
// ============================================
// Implementa una familia de productos relacionados (colores,
// estilos de componentes) sin especificar sus clases concretas.
// Permite cambiar entre tema claro y oscuro de forma coherente.
// ============================================

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Interfaz del producto: ThemeColors
 * Define los colores de un tema visual
 */
export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  cardBg: string;
  sidebarBg: string;
  navbarBg: string;
  inputBg: string;
  inputBorder: string;
  accent: string;
}

/**
 * Interfaz del producto: ThemeConfig
 * Configuración completa de un tema
 */
export interface ThemeConfig {
  name: string;
  label: string;
  colors: ThemeColors;
  isDark: boolean;
}

/**
 * Abstract Factory: ThemeFactory
 * Define la interfaz para crear familias de objetos de tema
 */
abstract class ThemeFactory {
  abstract createTheme(): ThemeConfig;
}

/**
 * Concrete Factory: LightThemeFactory
 * Crea la familia de productos del tema claro
 */
class LightThemeFactory extends ThemeFactory {
  createTheme(): ThemeConfig {
    console.log('🎨 [Abstract Factory] Tema CLARO creado');
    return {
      name: 'light',
      label: 'Tema Claro',
      isDark: false,
      colors: {
        primary: '#6366F1',
        primaryHover: '#4F46E5',
        secondary: '#8B5CF6',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        surfaceHover: '#F1F5F9',
        text: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        shadow: 'rgba(0, 0, 0, 0.08)',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        cardBg: '#FFFFFF',
        sidebarBg: '#F8FAFC',
        navbarBg: '#FFFFFF',
        inputBg: '#F8FAFC',
        inputBorder: '#CBD5E1',
        accent: '#EC4899'
      }
    };
  }
}

/**
 * Concrete Factory: DarkThemeFactory
 * Crea la familia de productos del tema oscuro
 */
class DarkThemeFactory extends ThemeFactory {
  createTheme(): ThemeConfig {
    console.log('🌙 [Abstract Factory] Tema OSCURO creado');
    return {
      name: 'dark',
      label: 'Tema Oscuro',
      isDark: true,
      colors: {
        primary: '#818CF8',
        primaryHover: '#6366F1',
        secondary: '#A78BFA',
        background: '#0F172A',
        surface: '#1E293B',
        surfaceHover: '#334155',
        text: '#F1F5F9',
        textSecondary: '#94A3B8',
        border: '#334155',
        shadow: 'rgba(0, 0, 0, 0.3)',
        success: '#34D399',
        warning: '#FBBF24',
        danger: '#F87171',
        info: '#60A5FA',
        cardBg: '#1E293B',
        sidebarBg: '#0F172A',
        navbarBg: '#1E293B',
        inputBg: '#1E293B',
        inputBorder: '#475569',
        accent: '#F472B6'
      }
    };
  }
}

/**
 * Servicio ThemeService: Gestiona el tema activo.
 * Usa el Abstract Factory para crear temas y aplica CSS variables.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private factories: Map<string, ThemeFactory> = new Map();
  private currentThemeSubject = new BehaviorSubject<ThemeConfig>(new LightThemeFactory().createTheme());
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    // Registrar las fábricas concretas
    this.factories.set('light', new LightThemeFactory());
    this.factories.set('dark', new DarkThemeFactory());

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('taskflow_theme') || 'dark';
    this.setTheme(savedTheme);
  }

  get currentTheme(): ThemeConfig {
    return this.currentThemeSubject.value;
  }

  /**
   * Cambia el tema usando la fábrica correspondiente
   */
  setTheme(themeName: string): void {
    const factory = this.factories.get(themeName);
    if (!factory) {
      console.warn(`⚠️ [Abstract Factory] Tema '${themeName}' no registrado`);
      return;
    }

    const theme = factory.createTheme();
    this.currentThemeSubject.next(theme);
    this.applyTheme(theme);
    localStorage.setItem('taskflow_theme', themeName);
  }

  /**
   * Alterna entre tema claro y oscuro
   */
  toggleTheme(): void {
    const current = this.currentThemeSubject.value;
    this.setTheme(current.isDark ? 'light' : 'dark');
  }

  /**
   * Aplica el tema como CSS custom properties en :root
   */
  private applyTheme(theme: ThemeConfig): void {
    const root = document.documentElement;
    const colors = theme.colors;

    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    // Clase para el body
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme.name}`);
  }
}

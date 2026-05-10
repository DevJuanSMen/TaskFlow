import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  // Inicializar desde localStorage o defecto a dark
  const savedTheme = (localStorage.getItem('taskflow_theme') as 'light' | 'dark') || 'dark';
  document.documentElement.className = `theme-${savedTheme}`;

  return {
    theme: savedTheme,
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('taskflow_theme', newTheme);
      document.documentElement.className = `theme-${newTheme}`;
      return { theme: newTheme };
    }),
    setTheme: (theme) => set(() => {
      localStorage.setItem('taskflow_theme', theme);
      document.documentElement.className = `theme-${theme}`;
      return { theme };
    }),
  };
});

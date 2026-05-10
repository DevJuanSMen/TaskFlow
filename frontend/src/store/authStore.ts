import { create } from 'zustand';
import api from '../api/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return {
    user,
    token,
    isAuthenticated: !!token,
    
    login: (token: string, user: User) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },
    
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ token: null, user: null, isAuthenticated: false });
      window.location.href = '/login';
    },

    checkAuth: async () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) return;
      
      try {
        const response = await api.get('/auth/me');
        set({ user: response.data.data, isAuthenticated: true });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ token: null, user: null, isAuthenticated: false });
      }
    }
  };
});

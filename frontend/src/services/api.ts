import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// El backend está expuesto en el puerto 3000 por docker-compose
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor para inyectar el token
api.interceptors.request.use((config) => {
  // Obtener token directo del estado de Zustand sin suscribirse
  const token = useAuthStore.getState().user?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

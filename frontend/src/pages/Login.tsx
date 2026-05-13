import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.data.token, response.data.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/20 p-3 rounded-xl text-primary">
              <Layout size={32} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-text mb-2">Bienvenido de nuevo</h2>
          <p className="text-center text-text-secondary mb-8">Inicia sesión para acceder a tus tableros</p>

          {error && (
            <div className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                placeholder="ejemplo@correo.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Contraseña</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-primary/25 disabled:opacity-70 mt-4"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            ¿No tienes cuenta? <Link to="/register" className="text-primary hover:underline">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

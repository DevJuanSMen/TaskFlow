import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Registrar
      await api.post('/auth/register', formData);
      // 2. Auto-login tras registro exitoso
      const response = await api.post('/auth/login', { email: formData.email, password: formData.password });
      login(response.data.data.token, response.data.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-secondary/20 p-3 rounded-xl text-secondary">
              <Layout size={32} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-text mb-2">Crear Cuenta</h2>
          <p className="text-center text-text-secondary mb-8">Únete a TaskFlow y organiza tus proyectos</p>

          {error && (
            <div className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Nombre</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Contraseña</label>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Rol</label>
              <select 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all"
              >
                <option value="USER">Usuario Estándar</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-secondary/25 disabled:opacity-70 mt-4"
            >
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            ¿Ya tienes cuenta? <Link to="/login" className="text-secondary hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

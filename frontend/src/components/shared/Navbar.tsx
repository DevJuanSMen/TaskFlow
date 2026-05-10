import React from 'react';
import { Sun, Moon, Layout, Search, User, LogOut } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b-0 border-x-0 border-t-0 rounded-none px-6 py-3 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-lg text-primary">
          <Layout size={20} />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          TaskFlow
        </h1>
      </Link>

      {user && (
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-surface/50 border border-border rounded-full px-3 py-1.5 w-64 focus-within:ring-2 ring-primary/50 transition-all">
            <Search size={16} className="text-text-secondary mr-2" />
            <input 
              type="text" 
              placeholder="Buscar tareas..." 
              className="bg-transparent border-none outline-none text-sm text-text w-full"
            />
          </div>

          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-surface-hover text-text-secondary transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="flex items-center gap-3 ml-2 border-l border-border pl-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-text leading-none">{user.name}</p>
              <p className="text-xs text-text-secondary mt-1">{user.role}</p>
            </div>
            
            <button 
              onClick={() => logout()}
              className="p-2 rounded-full hover:bg-danger/10 text-danger transition-colors ml-2"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

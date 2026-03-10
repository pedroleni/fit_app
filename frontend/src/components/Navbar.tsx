import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Dumbbell,
  Droplets,
  Bot,
  LayoutDashboard,
  LogOut,
  CalendarDays,
  Search,
  BookOpen,
  History,
} from 'lucide-react';
import './Navbar.css';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">💪</div>
          <span className="brand-name">FitApp</span>
        </div>

        <div className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <div className="nav-section-label">Entrenamientos IA</div>

          <NavLink to="/routine" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <CalendarDays size={20} />
            <span>Rutina IA</span>
          </NavLink>
          <NavLink to="/exercises" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Search size={20} />
            <span>Buscar Ejercicios</span>
          </NavLink>
          <NavLink to="/directory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BookOpen size={20} />
            <span>Directorio</span>
          </NavLink>
          <NavLink to="/workout-history-detail" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <History size={20} />
            <span>Historial IA</span>
          </NavLink>

          <div className="nav-section-label">Registro</div>

          <NavLink to="/workouts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Dumbbell size={20} />
            <span>Entrenamientos</span>
          </NavLink>
          <NavLink to="/water" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Droplets size={20} />
            <span>Hidratación</span>
          </NavLink>
          <NavLink to="/ai-coach" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Bot size={20} />
            <span>AI Coach</span>
          </NavLink>
        </div>

        <div className="sidebar-user">
          {user?.image && <img src={user.image} alt={user.name} className="user-avatar" />}
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  MoreHorizontal,
  X,
} from 'lucide-react';
import './Navbar.css';

const MAIN_NAV = [
  { to: '/',          end: true,  icon: LayoutDashboard, label: 'Inicio'   },
  { to: '/workouts',  end: false, icon: Dumbbell,        label: 'Entrenos' },
  { to: '/water',     end: false, icon: Droplets,        label: 'Agua'     },
  { to: '/ai-coach',  end: false, icon: Bot,             label: 'Coach'    },
];

const MORE_NAV = [
  { to: '/routine',               icon: CalendarDays, label: 'Rutina IA'          },
  { to: '/exercises',             icon: Search,       label: 'Buscar ejercicios'  },
  { to: '/directory',             icon: BookOpen,     label: 'Directorio'         },
  { to: '/workout-history-detail',icon: History,      label: 'Historial IA'       },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isMoreActive = MORE_NAV.some(item => location.pathname === item.to);

  return (
    <div className="app-layout">

      {/* ── Desktop sidebar ── */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">💪</div>
          <span className="brand-name">FitApp</span>
        </div>

        <div className="sidebar-nav">
          {MAIN_NAV.map(({ to, end, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={20} /><span>{label}</span>
            </NavLink>
          ))}

          <div className="nav-section-label">Entrenamientos IA</div>

          {MORE_NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={20} /><span>{label}</span>
            </NavLink>
          ))}
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

      {/* ── Mobile top header ── */}
      <header className="mobile-header">
        <span className="mobile-brand">💪 FitApp</span>
        {user?.image && (
          <img src={user.image} alt={user.name} className="mobile-avatar"
            onClick={handleLogout} title="Cerrar sesión" />
        )}
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="bottom-bar">
        {MAIN_NAV.map(({ to, end, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
            <div className="tab-icon-wrap"><Icon size={22} /></div>
            <span className="tab-label">{label}</span>
          </NavLink>
        ))}

        <button
          className={`tab-item tab-more ${isMoreActive ? 'active' : ''}`}
          onClick={() => setMoreOpen(v => !v)}>
          <div className="tab-icon-wrap">
            {moreOpen ? <X size={22} /> : <MoreHorizontal size={22} />}
          </div>
          <span className="tab-label">Más</span>
        </button>
      </nav>

      {/* ── More drawer ── */}
      {moreOpen && (
        <div className="more-overlay" onClick={() => setMoreOpen(false)}>
          <div className="more-drawer" onClick={e => e.stopPropagation()}>
            <p className="more-drawer-title">Más opciones</p>
            <div className="more-grid">
              {MORE_NAV.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) => `more-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMoreOpen(false)}>
                  <div className="more-item-icon"><Icon size={24} /></div>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

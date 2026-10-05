import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  LogOut, 
  Cpu
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear mock authentication states
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Monitoring', path: '/monitoring', icon: Activity },
    { name: 'Error Detection', path: '/errors', icon: AlertTriangle },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="sidebar-container glass-card">
      <div className="sidebar-header">
        <div className="logo-box">
          <Cpu className="logo-icon" />
          <span className="logo-text">AI Smart Monitor</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="item-icon" />
              <span className="item-name">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-item logout-btn" onClick={handleLogout}>
          <LogOut className="item-icon" />
          <span className="item-name">Logout</span>
        </button>
      </div>
    </aside>
  );
}

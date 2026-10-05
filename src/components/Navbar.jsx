import React, { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, User, ShieldCheck } from 'lucide-react';
import { fetchRecentAlerts } from '../services/api.js';
import './Navbar.css';

export default function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadNavbarAlerts = async () => {
    try {
      const res = await fetchRecentAlerts(5);
      if (res.status === 'success' && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error("Navbar alerts fetch error:", err);
    }
  };

  useEffect(() => {
    loadNavbarAlerts();
    const timer = setInterval(loadNavbarAlerts, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="navbar-container">
      <div className="search-wrapper">
        <Search className="search-icon" />
        <input 
          type="text" 
          placeholder="Search anything (logs, metrics, status)..." 
          className="search-input"
        />
      </div>

      <div className="nav-actions">
        {/* Notifications */}
        <div className="nav-action-btn-wrapper">
          <button 
            className="nav-action-btn" 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
          >
            <Bell className="nav-icon" />
            {notifications.length > 0 && (
              <span className="bell-badge">{notifications.length}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notifications-dropdown glass-card">
              <div className="dropdown-header">
                <h4>MongoDB System Alerts</h4>
                <span className="badge badge-danger">{notifications.length} New</span>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-items">
                {notifications.length > 0 ? (
                  notifications.map(item => (
                    <div key={item.alert_id || item.timestamp} className="dropdown-item">
                      <div className="item-bullet-wrapper">
                        <span className={`item-bullet ${item.severity === 'High' ? 'bullet-error' : item.severity === 'Medium' ? 'bullet-warning' : 'bullet-success'}`}></span>
                      </div>
                      <div className="item-content">
                        <p className="item-text">{item.title || item.message}</p>
                        <span className="item-time">{item.timestamp ? item.timestamp.replace('T', ' ') : 'Just now'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="item-text" style={{ textAlign: 'center', padding: '12px', color: '#94A3B8' }}>
                    No pending alerts in MongoDB.
                  </p>
                )}
              </div>
              <div className="dropdown-divider"></div>
              <a href="/errors" className="dropdown-footer-link">View all alerts database</a>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="profile-menu-wrapper">
          <button 
            className="profile-btn"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
          >
            <div className="avatar-wrapper">
              <User className="avatar-icon" />
            </div>
            <div className="profile-info">
              <span className="profile-name">Admin</span>
              <span className="profile-role">System Admin</span>
            </div>
            <ChevronDown className="chevron-icon" />
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown glass-card">
              <div className="profile-dropdown-header">
                <div className="header-icon-box">
                  <ShieldCheck className="shield-icon" />
                </div>
                <div>
                  <h4 className="user-name">Admin User</h4>
                  <span className="user-email">admin@example.com</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <a href="/settings" className="profile-dropdown-item">Account Settings</a>
              <a href="/monitoring" className="profile-dropdown-item">Server Telemetry</a>
              <div className="dropdown-divider"></div>
              <button 
                onClick={() => {
                  localStorage.removeItem('isAuthenticated');
                  window.location.href = '/login';
                }} 
                className="profile-dropdown-item logout-link"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

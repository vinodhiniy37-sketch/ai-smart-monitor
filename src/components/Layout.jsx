import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

export default function Layout({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Basic local authentication check. Perfect for mock environment
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="app-container">
      {/* Background neon elements */}
      <div className="cyber-bg"></div>

      {/* Persistent Left Navigation Sidebar */}
      <Sidebar />

      {/* Main workspace container */}
      <div className="main-content">
        {/* Top telemetry and search actions bar */}
        <Navbar />

        {/* Dynamic page contents wrapper */}
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
}

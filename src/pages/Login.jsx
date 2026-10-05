import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, BrainCircuit } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    // Standard mock authentication
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      setErrorMsg('Invalid credentials. Use admin / admin123');
    }
  };

  return (
    <div className="login-wrapper">
      {/* Animated circuit and glow background */}
      <div className="cyber-bg"></div>
      <div className="circuit-pattern"></div>

      <div className="login-card-container glass-card pulse-purple">
        <div className="login-header">
          <div className="logo-glow-wrapper">
            <BrainCircuit className="login-logo" />
          </div>
          <h1 className="project-title">
            AI-Based Smart Monitoring
          </h1>
          <p className="project-subtitle">
            & Automated Error Detection System
          </p>
          <span className="sign-in-prompt">Sign in to continue</span>
        </div>

        {errorMsg && <div className="login-error-alert">{errorMsg}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="input-icon-wrapper">
              <User className="input-field-icon" />
              <input
                id="username"
                type="text"
                placeholder="Enter admin"
                className="form-input text-indent"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-field-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter admin123"
                className="form-input text-indent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="eye-icon" /> : <Eye className="eye-icon" />}
              </button>
            </div>
          </div>

          <div className="form-actions-row">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="custom-checkbox"
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-password-link" onClick={(e) => {
              e.preventDefault();
              alert("Mock functionality: Admin credentials are admin / admin123");
            }}>
              Forgot password?
            </a>
          </div>

          <button type="submit" className="btn-gradient login-submit-btn">
            Login
          </button>
        </form>

        <footer className="login-footer">
          <p>© 2026 AI Smart Monitoring System. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

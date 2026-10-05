import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Briefcase, 
  Globe, 
  Clock, 
  Calendar, 
  Sliders, 
  Camera, 
  Check 
} from 'lucide-react';
import { defaultUserProfile } from '../services/mockData.js';
import './Settings.css';

export default function Settings() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : defaultUserProfile;
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleAvatarChange = () => {
    alert("Mock upload: Avatar selector triggered.");
  };

  return (
    <div className="settings-content">
      {/* Title */}
      <div className="page-header-row">
        <div>
          <h2>System Settings</h2>
          <p>Configure personal profiles, system telemetry bounds, and dashboard preferences</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        <div className="settings-grid">
          {/* Left panel: Profile Profile Card */}
          <div className="settings-left-panel">
            <div className="profile-card-widget glass-card">
              <h3 className="settings-subheading">Profile Overview</h3>
              <div className="avatar-upload-box">
                <div className="profile-avatar-large">
                  <User className="avatar-icon-large" />
                  <button 
                    type="button" 
                    className="avatar-edit-overlay" 
                    onClick={handleAvatarChange}
                  >
                    <Camera className="camera-icon" />
                  </button>
                </div>
                <div className="avatar-info-box">
                  <h4>{profile.fullName}</h4>
                  <span className="profile-badge-role">{profile.role}</span>
                </div>
              </div>

              <div className="profile-meta-fields">
                <div className="meta-field-row">
                  <Mail className="meta-field-icon" />
                  <div>
                    <span className="field-title">Email Address</span>
                    <p className="field-value">{profile.email}</p>
                  </div>
                </div>
                <div className="meta-field-row">
                  <Briefcase className="meta-field-icon" />
                  <div>
                    <span className="field-title">Permissions Level</span>
                    <p className="field-value">{profile.role} privileges (Read/Write)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick alert notifications settings */}
            <div className="profile-card-widget glass-card toggle-card-box">
              <h3 className="settings-subheading">AI Alert Dispatch</h3>
              <div className="toggle-list">
                <label className="toggle-item-row">
                  <div>
                    <span className="toggle-title">SMS Notifications</span>
                    <p className="toggle-desc">Dispatch urgent severity classifications via SMS</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle-switch" />
                </label>
                <label className="toggle-item-row">
                  <div>
                    <span className="toggle-title">Email Stack Traces</span>
                    <p className="toggle-desc">Include code trace log diagnostics on email alert</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle-switch" />
                </label>
              </div>
            </div>
          </div>

          {/* Right panel: Details & Preferences form */}
          <div className="settings-right-panel glass-card">
            <h3 className="settings-subheading">Dashboard Configurations</h3>
            
            <div className="fields-grid">
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Full Name</label>
                <div className="input-icon-wrapper">
                  <User className="input-field-icon" />
                  <input
                    id="fullName"
                    type="text"
                    className="form-input text-indent"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail className="input-field-icon" />
                  <input
                    id="email"
                    type="email"
                    className="form-input text-indent"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Theme Selector */}
              <div className="form-group">
                <label className="form-label" htmlFor="theme">Active Theme</label>
                <div className="input-icon-wrapper">
                  <Sliders className="input-field-icon" />
                  <select
                    id="theme"
                    className="form-input text-indent select-field"
                    value={profile.theme}
                    onChange={(e) => setProfile({ ...profile, theme: e.target.value })}
                  >
                    <option value="Dark">Dark Futuristic (Default)</option>
                    <option value="Light">Light Modern</option>
                    <option value="Cyberpunk">Cyberpunk Neon</option>
                  </select>
                </div>
              </div>

              {/* Language Selector */}
              <div className="form-group">
                <label className="form-label" htmlFor="language">Interface Language</label>
                <div className="input-icon-wrapper">
                  <Globe className="input-field-icon" />
                  <select
                    id="language"
                    className="form-input text-indent select-field"
                    value={profile.language}
                    onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                  >
                    <option value="English">English</option>
                    <option value="German">Deutsch (German)</option>
                    <option value="Spanish">Español (Spanish)</option>
                  </select>
                </div>
              </div>

              {/* Timezone */}
              <div className="form-group">
                <label className="form-label" htmlFor="timezone">Timezone Offset</label>
                <div className="input-icon-wrapper">
                  <Clock className="input-field-icon" />
                  <select
                    id="timezone"
                    className="form-input text-indent select-field"
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  >
                    <option value="(UTC+05:30) India Standard Time">(UTC+05:30) India Standard Time</option>
                    <option value="(UTC+00:00) Greenwich Mean Time">(UTC+00:00) Greenwich Mean Time</option>
                    <option value="(UTC-05:00) Eastern Standard Time">(UTC-05:00) Eastern Standard Time</option>
                    <option value="(UTC+01:00) Central European Time">(UTC+01:00) Central European Time</option>
                  </select>
                </div>
              </div>

              {/* Date Format */}
              <div className="form-group">
                <label className="form-label" htmlFor="dateFormat">Date Format Style</label>
                <div className="input-icon-wrapper">
                  <Calendar className="input-field-icon" />
                  <select
                    id="dateFormat"
                    className="form-input text-indent select-field"
                    value={profile.dateFormat}
                    onChange={(e) => setProfile({ ...profile, dateFormat: e.target.value })}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 13/07/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 07/13/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-07-13)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer submit action */}
            <div className="settings-footer-actions">
              {saveSuccess && (
                <div className="save-status-msg glass-card">
                  <Check className="check-success-icon" />
                  <span>Configurations saved successfully.</span>
                </div>
              )}
              <button type="submit" className="btn-gradient settings-save-btn">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

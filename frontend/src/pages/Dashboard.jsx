import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../api/authService';

/* ─── Simple Inline Icons ─── */
const icons = {
  stethoscope: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
      <circle cx="20" cy="10" r="2"/>
    </svg>
  ),
  pill: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 1.5 3 3-8 8-3-3a4.24 4.24 0 0 1 0-6 4.24 4.24 0 0 1 6 0z"/>
      <line x1="10" y1="5" x2="19" y2="14"/>
    </svg>
  ),
  fileText: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  shieldAlert: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
};



/* ─── SVG Background Elements ─── */
const FloatingLeaf = ({ style, delay = 0, size = 24 }) => (
  <svg
    className="floating-health-element floating-leaf"
    style={{ ...style, animationDelay: `${delay}s` }}
    width={size} height={size} viewBox="0 0 24 24" fill="none"
  >
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20c4 0 8.5-3 9-8 .5-5-2-8-2-8z"
      fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1"/>
    <path d="M2 2s7.5 1.5 9 5c1.5 3.5 1 6.5 0 9" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" fill="none"/>
  </svg>
);

const FloatingCross = ({ style, delay = 0, size = 20 }) => (
  <svg
    className="floating-health-element floating-cross"
    style={{ ...style, animationDelay: `${delay}s` }}
    width={size} height={size} viewBox="0 0 24 24" fill="none"
  >
    <rect x="9" y="2" width="6" height="20" rx="2" fill="rgba(6, 182, 212, 0.1)" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1"/>
    <rect x="2" y="9" width="20" height="6" rx="2" fill="rgba(6, 182, 212, 0.1)" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1"/>
  </svg>
);

const FloatingCapsule = ({ style, delay = 0, size = 22 }) => (
  <svg
    className="floating-health-element floating-capsule"
    style={{ ...style, animationDelay: `${delay}s` }}
    width={size} height={size} viewBox="0 0 24 24" fill="none"
  >
    <path d="M5.12 17.88L17.88 5.12a4 4 0 0 1 0 5.66L10.78 17.88a4 4 0 0 1-5.66 0z"
      fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.22)" strokeWidth="1"/>
    <line x1="11.5" y1="11.5" x2="17.88" y2="5.12" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1"/>
  </svg>
);

const FloatingHeartbeat = ({ style, delay = 0 }) => (
  <svg
    className="floating-health-element floating-heartbeat"
    style={{ ...style, animationDelay: `${delay}s` }}
    width="80" height="30" viewBox="0 0 80 30" fill="none"
  >
    <polyline
      points="0,15 15,15 20,5 25,25 30,10 35,20 40,15 55,15 60,5 65,25 70,15 80,15"
      stroke="rgba(16, 185, 129, 0.15)"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="heartbeat-line"
    />
  </svg>
);

const FloatingDNA = ({ style, delay = 0 }) => (
  <svg
    className="floating-health-element floating-dna"
    style={{ ...style, animationDelay: `${delay}s` }}
    width="24" height="60" viewBox="0 0 24 60" fill="none"
  >
    <path d="M4 0C4 0 4 15 12 15S20 30 20 30S20 45 12 45S4 60 4 60"
      stroke="rgba(16, 185, 129, 0.18)" strokeWidth="1.2" fill="none"/>
    <path d="M20 0C20 0 20 15 12 15S4 30 4 30S4 45 12 45S20 60 20 60"
      stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1.2" fill="none"/>
    <line x1="6" y1="7" x2="18" y2="7" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8"/>
    <line x1="5" y1="15" x2="19" y2="15" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8"/>
    <line x1="6" y1="23" x2="18" y2="23" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8"/>
    <line x1="5" y1="37" x2="19" y2="37" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8"/>
    <line x1="6" y1="53" x2="18" y2="53" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8"/>
  </svg>
);

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('dashboard-theme') || 'dark');
  const navigate = useNavigate();

  // Close dropdowns
  useEffect(() => {
    const handler = (e) => {
      if (showDropdown && !e.target.closest('.navbar-profile-container')) setShowDropdown(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showDropdown]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('dashboard-theme', nextTheme);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try { await authService.logout(); } catch {}
    finally { logout(); navigate('/login'); }
  };

  return (
    <div className={`launch-page dashboard-page theme-${theme}`}>
      {/* Navbar */}
      <nav className={`dashboard-navbar theme-${theme}`}>
        <div className="navbar-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/sanjeevani_symbol.png" alt="Sanjeevani Logo" className="dashboard-logo-img" />
          <img src="/sanjeevani_text_transparent.png" alt="Sanjeevani" className="dashboard-logo-text-img" style={{ height: '38px', objectFit: 'contain' }} />
        </div>

        <div className="navbar-controls-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Theme Toggle Button */}
          <button 
            type="button" 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <div className="navbar-profile-container">
            <button type="button" className="profile-emoji-btn" onClick={() => setShowDropdown(!showDropdown)}>
              👤
          </button>
          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header"><h4>User Profile</h4></div>
              <div className="dropdown-info">
                <div className="dropdown-field">
                  <span className="field-label">Full Name</span>
                  <span className="field-value">{user?.fullName || 'N/A'}</span>
                </div>
                <div className="dropdown-field">
                  <span className="field-label">Email Address</span>
                  <span className="field-value">{user?.email || 'N/A'}</span>
                </div>
                <div className="dropdown-field">
                  <span className="field-label">Phone Number</span>
                  <span className="field-value">{user?.phoneNumber || user?.mobileNumber || 'N/A'}</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-actions">
                <button onClick={() => { setShowDropdown(false); navigate('/change-password'); }} className="dropdown-btn">
                  🔑 Change Password
                </button>
                <button onClick={handleLogout} className="dropdown-btn logout-btn" disabled={isLoggingOut}>
                  {isLoggingOut ? 'Logging Out...' : '🚪 Log Out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>

      {/* Main dashboard content area */}
      <main className="dashboard-content">
        <div className="dashboard-hero-card">
          <div className="launch-badge">🏥 Welcome to Sanjeevani Portal</div>
          <h1 className="launch-title">
            Welcome back, <span className="shimmer-text">{user?.fullName || 'Patient'}</span>
          </h1>
          <p className="launch-subtitle">
            Manage consultations, pharmacy prescriptions, and lab test orders from one integrated dashboard.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

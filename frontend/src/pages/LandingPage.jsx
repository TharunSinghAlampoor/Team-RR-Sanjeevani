import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

/* ─── Simple Inline SVG Icons ─── */
const icons = {
  stethoscope: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
      <circle cx="20" cy="10" r="2"/>
    </svg>
  ),
  pill: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 1.5 3 3-8 8-3-3a4.24 4.24 0 0 1 0-6 4.24 4.24 0 0 1 6 0z"/>
      <line x1="10" y1="5" x2="19" y2="14"/>
    </svg>
  ),
  microscope: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M8 6h4"/><path d="M12 2v4"/>
    </svg>
  ),
  arrowRight: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  )
};

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing simple-landing">
      {/* ── Background Glows ── */}
      <div className="landing-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-grid" />
      </div>

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/sanjeevani_symbol.png" alt="Sanjeevani Logo" className="landing-logo-img" style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'contain', border: '1.5px solid rgba(16, 185, 129, 0.25)' }} />
            <img src="/sanjeevani_text_transparent.png" alt="Sanjeevani" className="landing-logo-text-img" style={{ height: '42px', objectFit: 'contain' }} />
          </Link>

          <div className="landing-nav-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="landing-nav-btn primary">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="landing-nav-btn ghost">Sign In</Link>
                <Link to="/register" className="landing-nav-btn primary">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <main className="landing-hero">
        <div className="landing-hero-content">
          <div style={{ marginBottom: '28px' }}>
            <img src="/sanjeevani_text_transparent.png" alt="Sanjeevani Logo" className="landing-logo-text-img" style={{ height: '84px', objectFit: 'contain' }} />
          </div>

          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Active Healthcare Services
          </div>

          <h1 className="hero-title">
            Health Delivered<br />
            <span className="hero-gradient-text">To You.</span>
          </h1>

          <p className="hero-subtitle">
            Consult verified doctors online, order medicines with home delivery, 
            and book diagnostic lab tests with quick report turnaround.
          </p>

          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="hero-btn-primary">
                Go to Dashboard
                {icons.arrowRight}
              </Link>
            ) : (
              <>
                <Link to="/register" className="hero-btn-primary">
                  Get Started Now
                  {icons.arrowRight}
                </Link>
                <Link to="/login" className="hero-btn-secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      {/* ── Key Features / Services (Simple, no duplicates) ── */}
      <section className="landing-services">
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon pharmacy-color">
              {icons.pill}
            </div>
            <h3>Medicine Delivery</h3>
            <p>Order prescription medicines directly to your door with fast home delivery.</p>
          </div>
        </div>
      </section>

      {/* ── Minimalist Footer ── */}
      <footer className="landing-footer">
        <div className="footer-bottom">
          <div className="footer-logo" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <img src="/sanjeevani_text_transparent.png" alt="Sanjeevani" className="landing-logo-text-img" style={{ height: '48px', objectFit: 'contain' }} />
          </div>
          <p>© {new Date().getFullYear()} Sanjeevani Healthcare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

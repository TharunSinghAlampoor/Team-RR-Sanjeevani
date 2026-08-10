import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ShoppingBag, Activity, Heart, Award, CheckCircle2 } from 'lucide-react';

/**
 * AuthIllustration — Left Column Sanjeevani Brand Showcase
 * Styled with rich Sanjeevani Forest Emerald (#059669 → #047857) & Cyan accents.
 */
export const AuthIllustration = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '2.75rem 2.25rem',
        height: '100%',
        position: 'relative',
        zIndex: 2,
        color: '#FFFFFF',
        background: 'linear-gradient(135deg, #059669 0%, #047857 60%, #064e3b 100%)',
      }}
    >
      {/* Background Decorative Healthcare Circles */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.30) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Brand Header Logo */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.85rem' }}>
          <img
            src="/sanjeevani_symbol.png"
            alt="Sanjeevani Symbol"
            style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
          />
          <span style={{ fontSize: '1.65rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Sanjeevani
          </span>
        </Link>
      </div>

      {/* Hero Headline & Subtext */}
      <div style={{ margin: '2.25rem 0', position: 'relative', zIndex: 3 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.15)',
            color: '#A7F3D0',
            padding: '0.4rem 0.95rem',
            borderRadius: '99px',
            fontSize: '0.82rem',
            fontWeight: 800,
            marginBottom: '1.35rem',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Award style={{ width: 16, height: 16, color: '#34D399' }} />
          <span>Trusted E-Pharmacy & Healthcare</span>
        </div>

        <h1
          style={{
            fontSize: '2.4rem',
            fontWeight: 900,
            lineHeight: 1.25,
            color: '#FFFFFF',
            margin: '0 0 1rem 0',
            letterSpacing: '-0.025em',
          }}
        >
          Your Health, <br />
          <span style={{ color: '#6EE7B7' }}>Our Priority.</span>
        </h1>

        <p
          style={{
            fontSize: '0.96rem',
            lineHeight: 1.65,
            color: '#D1FAE5',
            fontWeight: 500,
            maxWidth: '400px',
            margin: 0,
            opacity: 0.95,
          }}
        >
          Discover genuine healthcare products, order prescriptions online, and manage your health essentials with ease.
        </p>
      </div>

      {/* Vector Healthcare Composite Illustration */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '220px',
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(12px)',
          borderRadius: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.2)',
          zIndex: 3,
        }}
      >
        {/* Background Plus Crosses */}
        <div style={{ position: 'absolute', top: '15%', left: '12%', opacity: 0.35, color: '#A7F3D0', fontSize: '26px', fontWeight: 900 }}>+</div>
        <div style={{ position: 'absolute', bottom: '15%', right: '14%', opacity: 0.35, color: '#67E8F9', fontSize: '28px', fontWeight: 900 }}>+</div>

        {/* Central Shield Container */}
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: '#FFFFFF',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            border: '3px solid #10B981',
          }}
        >
          <Shield style={{ width: 44, height: 44, color: '#059669' }} />
        </div>

        {/* Left Medicines Badge */}
        <div
          style={{
            position: 'absolute',
            left: '12%',
            top: '28%',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '0.6rem 0.85rem',
            borderRadius: '1rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '1px solid #E2E8F0',
            zIndex: 2,
          }}
        >
          <ShoppingBag style={{ width: 20, height: 20, color: '#059669' }} />
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A' }}>Genuine Medicine</div>
            <div style={{ fontSize: '0.65rem', color: '#16A34A', fontWeight: 700 }}>100% Certified</div>
          </div>
        </div>

        {/* Right ECG Monitoring Badge */}
        <div
          style={{
            position: 'absolute',
            right: '10%',
            bottom: '24%',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '0.6rem 0.85rem',
            borderRadius: '1rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '1px solid #E2E8F0',
            zIndex: 2,
          }}
        >
          <Activity style={{ width: 20, height: 20, color: '#0D9488' }} />
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A' }}>ECG Monitoring</div>
            <div style={{ fontSize: '0.65rem', color: '#0D9488', fontWeight: 700 }}>Active Care</div>
          </div>
        </div>

        {/* Waveform Trace */}
        <div style={{ position: 'absolute', bottom: '8px', width: '100%', opacity: 0.4 }}>
          <svg viewBox="0 0 400 30" style={{ width: '100%', height: '22px' }}>
            <path
              d="M0,15 L100,15 L110,10 L120,20 L130,2 L140,28 L150,12 L160,15 L400,15"
              fill="none"
              stroke="#6EE7B7"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </div>

      {/* Trust Badges Footer */}
      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.5rem', position: 'relative', zIndex: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#ECFDF5' }}>
          <CheckCircle2 style={{ width: 16, height: 16, color: '#34D399' }} />
          <span>Doctor Verified</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#ECFDF5' }}>
          <Heart style={{ width: 16, height: 16, color: '#F472B6' }} />
          <span>100K+ Patients Care</span>
        </div>
      </div>
    </div>
  );
};

export default AuthIllustration;

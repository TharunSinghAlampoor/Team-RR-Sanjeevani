import React from 'react';

export const BrandLoader = ({ fullScreen = true, message = 'Loading Sanjeevani Store...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: fullScreen ? '100vh' : '300px',
    width: '100%',
    background: fullScreen ? 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' : 'transparent',
    color: '#059669',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '2rem',
  }}>
    {/* Animated Symbol Logo Container */}
    <div style={{
      width: '76px',
      height: '76px',
      borderRadius: '22px',
      background: '#ffffff',
      border: '2px solid #a7f3d0',
      boxShadow: '0 12px 32px rgba(5, 150, 105, 0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'sanjeevaniPulse 1.6s ease-in-out infinite',
      marginBottom: '1.25rem',
    }}>
      <img
        src="/sanjeevani_symbol.png"
        alt="Sanjeevani Symbol"
        style={{ width: '50px', height: 'auto', objectFit: 'contain' }}
      />
    </div>

    {/* Sanjeevani Brand Name Image */}
    <img
      src="/sanjeevani_text_transparent.png"
      alt="Sanjeevani Healthcare"
      style={{ height: '48px', width: 'auto', objectFit: 'contain', display: 'block', marginBottom: '1rem' }}
    />

    {/* Status indicator & message */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', opacity: 0.9 }}>
      <div style={{
        width: '9px',
        height: '9px',
        borderRadius: '50%',
        background: '#059669',
        animation: 'dotGlow 1.2s ease-in-out infinite'
      }} />
      <p style={{ fontSize: '0.85rem', letterSpacing: '0.06em', color: '#047857', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>
        {message}
      </p>
    </div>

    <style>{`
      @keyframes sanjeevaniPulse {
        0%, 100% { transform: scale(1); filter: drop-shadow(0 4px 12px rgba(5, 150, 105, 0.2)); }
        50% { transform: scale(1.08); filter: drop-shadow(0 8px 24px rgba(5, 150, 105, 0.35)); }
      }
      @keyframes dotGlow {
        0%, 100% { opacity: 0.35; transform: scale(0.85); }
        50% { opacity: 1; transform: scale(1.2); }
      }
    `}</style>
  </div>
);

export default BrandLoader;

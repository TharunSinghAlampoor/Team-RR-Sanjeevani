import React from 'react';

export const BrandLoader = ({ fullScreen = true, message = 'Loading Sanjeevani Store...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: fullScreen ? '100vh' : '280px',
    width: '100%',
    background: fullScreen ? 'linear-gradient(135deg, #0f172a 0%, #0f766e 50%, #059669 100%)' : 'transparent',
    color: '#ffffff',
    fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
    padding: '2rem',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Background glowing particles */}
    {fullScreen && (
      <>
        <div style={{
          position: 'absolute',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25), transparent 70%)',
          top: '-50px',
          left: '-50px',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.25), transparent 70%)',
          bottom: '-50px',
          right: '-50px',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />
      </>
    )}

    {/* Animated Symbol Logo Container */}
    <div style={{
      width: '84px',
      height: '84px',
      borderRadius: '24px',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid rgba(255, 255, 255, 0.6)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25), 0 0 30px rgba(56, 189, 248, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'sanjeevaniPulse 1.4s ease-in-out infinite',
      marginBottom: '1.25rem',
      position: 'relative',
      zIndex: 2,
    }}>
      <img
        src="/sanjeevani_symbol.png"
        alt="Sanjeevani Symbol"
        style={{ width: '56px', height: 'auto', objectFit: 'contain' }}
      />
    </div>

    {/* Sanjeevani Brand Name */}
    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
      <img
        src="/sanjeevani_text_transparent.png"
        alt="Sanjeevani Healthcare"
        style={{ height: '44px', width: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto 0.85rem auto', filter: fullScreen ? 'brightness(0) invert(1)' : 'none' }}
      />
    </div>

    {/* Micro-Progress Loading Bar */}
    <div style={{
      width: '160px',
      height: '4px',
      borderRadius: '99px',
      background: fullScreen ? 'rgba(255, 255, 255, 0.18)' : 'rgba(5, 150, 105, 0.15)',
      overflow: 'hidden',
      marginBottom: '1rem',
      position: 'relative',
      zIndex: 2
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '99px',
        background: fullScreen ? 'linear-gradient(90deg, #38bdf8, #34d399)' : 'linear-gradient(90deg, #059669, #0284c7)',
        animation: 'shimmerProgress 1.2s ease-in-out infinite'
      }} />
    </div>

    {/* Status indicator & message */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', zIndex: 2 }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: fullScreen ? '#38bdf8' : '#059669',
        animation: 'dotGlow 1.2s ease-in-out infinite'
      }} />
      <p style={{ fontSize: '0.8rem', letterSpacing: '0.06em', color: fullScreen ? '#e2e8f0' : '#047857', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>
        {message}
      </p>
    </div>

    <style>{`
      @keyframes sanjeevaniPulse {
        0%, 100% { transform: scale(1) translateZ(0); filter: drop-shadow(0 4px 12px rgba(56, 189, 248, 0.3)); }
        50% { transform: scale(1.06) translateZ(0); filter: drop-shadow(0 12px 28px rgba(52, 211, 153, 0.45)); }
      }
      @keyframes shimmerProgress {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes dotGlow {
        0%, 100% { opacity: 0.35; transform: scale(0.85); }
        50% { opacity: 1; transform: scale(1.25); }
      }
    `}</style>
  </div>
);

export default BrandLoader;

import React from 'react';

export const BrandLoader = ({ 
  fullScreen = true, 
  message = 'Loading Sanjeevani Store...',
  variant = 'default' 
}) => {
  return (
    <div 
      className={`sanjeevani-brand-loader ${fullScreen ? 'sanjeevani-brand-loader--fullscreen' : 'sanjeevani-brand-loader--inline'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : '260px',
        width: '100%',
        padding: '2rem',
        boxSizing: 'border-box',
        position: fullScreen ? 'fixed' : 'relative',
        inset: fullScreen ? 0 : 'auto',
        zIndex: fullScreen ? 99999 : 1,
        background: fullScreen 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,253,244,0.96) 50%, rgba(236,253,245,0.97) 100%)'
          : 'transparent',
        backdropFilter: fullScreen ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: fullScreen ? 'blur(16px)' : 'none',
        color: '#0f172a',
        fontFamily: "'Outfit', 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
        transition: 'all 0.3s ease',
      }}
    >
      {/* Background Subtle Ambient Glow Circles */}
      {fullScreen && (
        <>
          <div style={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18), transparent 70%)',
            top: '-40px',
            left: '-40px',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13, 92, 117, 0.16), transparent 70%)',
            bottom: '-40px',
            right: '-40px',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }} />
        </>
      )}

      {/* Animated Emblem Logo Container */}
      <div style={{
        width: fullScreen ? '88px' : '72px',
        height: fullScreen ? '88px' : '72px',
        borderRadius: '24px',
        background: '#ffffff',
        border: '2px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 16px 36px rgba(5, 150, 105, 0.18), 0 0 24px rgba(13, 92, 117, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'brandEmblemPulse 1.6s ease-in-out infinite',
        marginBottom: '1.1rem',
        position: 'relative',
        zIndex: 2,
        padding: '10px',
        boxSizing: 'border-box'
      }}>
        <img
          src="/sanjeevani_symbol.png"
          alt="Sanjeevani Emblem"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Sanjeevani Brand Text Image */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <img
          src="/sanjeevani_text_transparent.png"
          alt="Sanjeevani Healthcare"
          style={{ 
            height: fullScreen ? '42px' : '34px', 
            width: 'auto', 
            objectFit: 'contain', 
            display: 'block', 
            margin: '0 auto 0.75rem auto',
            filter: 'drop-shadow(0 2px 8px rgba(5, 150, 105, 0.12))'
          }}
        />
      </div>

      {/* Smooth Shimmer Progress Bar */}
      <div style={{
        width: '150px',
        height: '4px',
        borderRadius: '99px',
        background: 'rgba(5, 150, 105, 0.12)',
        overflow: 'hidden',
        marginBottom: '0.9rem',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '99px',
          background: 'linear-gradient(90deg, #0d5c75 0%, #059669 50%, #34d399 100%)',
          animation: 'brandProgressShimmer 1.3s cubic-bezier(0.4, 0, 0.2, 1) infinite'
        }} />
      </div>

      {/* Message Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 2 }}>
        <div style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#059669',
          boxShadow: '0 0 8px #059669',
          animation: 'brandDotPulse 1.2s ease-in-out infinite'
        }} />
        <p style={{ 
          fontSize: '0.78rem', 
          letterSpacing: '0.08em', 
          color: '#0d5c75', 
          fontWeight: 800, 
          margin: 0, 
          textTransform: 'uppercase' 
        }}>
          {message}
        </p>
      </div>

      <style>{`
        @keyframes brandEmblemPulse {
          0%, 100% { 
            transform: scale(1) translateZ(0); 
            box-shadow: 0 14px 32px rgba(5, 150, 105, 0.18), 0 0 20px rgba(13, 92, 117, 0.12);
          }
          50% { 
            transform: scale(1.06) translateZ(0); 
            box-shadow: 0 20px 44px rgba(5, 150, 105, 0.32), 0 0 28px rgba(52, 211, 153, 0.25);
          }
        }
        @keyframes brandProgressShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes brandDotPulse {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        /* Dark mode support */
        .dark .sanjeevani-brand-loader--fullscreen {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(6, 78, 59, 0.94) 100%) !important;
          color: #ffffff !important;
        }
        .dark .sanjeevani-brand-loader p {
          color: #34d399 !important;
        }
        .dark .sanjeevani-brand-loader img[alt="Sanjeevani Healthcare"] {
          filter: brightness(0) invert(1) drop-shadow(0 2px 10px rgba(52, 211, 153, 0.3)) !important;
        }
      `}</style>
    </div>
  );
};

export default BrandLoader;

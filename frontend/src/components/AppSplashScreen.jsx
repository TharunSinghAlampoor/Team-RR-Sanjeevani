import React, { useState, useEffect } from 'react';

/**
 * AppSplashScreen — Amazon / Native App Style Initial Splash Screen
 * Displays the Sanjeevani emblem logo & text brand name for 3.5 seconds
 * when starting the application, then smoothly fades out to reveal the portal.
 */
export const AppSplashScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Hold splash screen for 3.5 seconds, then initiate fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 3500);

    // Complete transition after 4.1 seconds total
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 4100);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #ecfdf5 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut ? 0 : 1,
        transform: fadeOut ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        pointerEvents: fadeOut ? 'none' : 'auto',
        fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* Central Brand Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          animation: 'splashZoomIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Animated Sanjeevani Emblem Logo */}
        <div
          style={{
            position: 'relative',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '2.5px solid #10b981',
            boxShadow: '0 16px 40px rgba(16, 185, 129, 0.22), 0 0 0 8px rgba(16, 185, 129, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            animation: 'logoPulse 2.4s ease-in-out infinite',
          }}
        >
          <img
            src="/sanjeevani_symbol.png"
            alt="Sanjeevani Emblem"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '50%',
            }}
          />
          {/* Subtle Outer Glow Ring */}
          <div
            style={{
              position: 'absolute',
              inset: -12,
              borderRadius: '50%',
              border: '2px solid rgba(16, 185, 129, 0.25)',
              animation: 'ringExpand 2s ease-out infinite',
            }}
          />
        </div>

        {/* Sanjeevani Text Logo */}
        <div
          style={{
            animation: 'textFadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <img
            src="/sanjeevani_text_transparent.png"
            alt="Sanjeevani Healthcare"
            style={{
              height: '64px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.15))',
            }}
          />
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#059669',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              opacity: 0.9,
            }}
          >
            Health Delivered To You
          </span>
        </div>
      </div>

      {/* Amazon-Style Bottom Shimmer Progress Line */}
      <div
        style={{
          position: 'absolute',
          bottom: '3.5rem',
          width: '180px',
          height: '4px',
          background: 'rgba(16, 185, 129, 0.15)',
          borderRadius: '99px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%)',
            borderRadius: '99px',
            animation: 'progressBar 3.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
          }}
        />
      </div>

      {/* Footer Tagline */}
      <p
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          fontSize: '0.76rem',
          fontWeight: 700,
          color: '#64748b',
          letterSpacing: '0.08em',
          margin: 0,
          textTransform: 'uppercase',
        }}
      >
        Pan India Express Healthcare Portal
      </p>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes splashZoomIn {
          0% {
            opacity: 0;
            transform: scale(0.82) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes textFadeUp {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes logoPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 16px 40px rgba(16, 185, 129, 0.22), 0 0 0 8px rgba(16, 185, 129, 0.08);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 20px 48px rgba(16, 185, 129, 0.35), 0 0 0 14px rgba(16, 185, 129, 0.12);
          }
        }
        @keyframes ringExpand {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.35);
            opacity: 0;
          }
        }
        @keyframes progressBar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  );
};

export default AppSplashScreen;

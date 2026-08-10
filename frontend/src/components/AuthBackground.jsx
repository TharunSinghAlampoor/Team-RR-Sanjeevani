import React from 'react';

/**
 * AuthBackground — Subtle Healthcare Ambient Background
 * Features:
 * - Medical cross (+), ECG heartbeat line, leaf emblems, shield, heart visuals
 * - Very low opacity, soft healthcare colors (#DCFCE7, #CCFBF1, #16A34A)
 * - Slowly floating symbols & gentle ECG wave
 * - Strict support for @media (prefers-reduced-motion: reduce)
 */
export const AuthBackground = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundColor: '#F8FAFC',
        backgroundImage: 'radial-gradient(circle at 10% 20%, #DCFCE7 0%, transparent 40%), radial-gradient(circle at 90% 80%, #CCFBF1 0%, transparent 40%)',
      }}
    >
      <style>{`
        /* Floating subtle healthcare symbols */
        .san-bg-symbol {
          position: absolute;
          opacity: 0.12;
          pointer-events: none;
          color: #16A34A;
        }

        .san-bg-cross-1 { top: 12%; left: 8%; animation: floatSlow 22s ease-in-out infinite; }
        .san-bg-cross-2 { bottom: 16%; right: 10%; animation: floatSlow 26s ease-in-out infinite reverse; }

        .san-bg-leaf-1 { top: 65%; left: 6%; animation: floatRotate 24s ease-in-out infinite; }
        .san-bg-leaf-2 { top: 20%; right: 8%; animation: floatRotate 28s ease-in-out infinite reverse; }

        .san-bg-shield { top: 45%; left: 4%; animation: floatSlow 30s ease-in-out infinite; opacity: 0.08; }
        .san-bg-heart { bottom: 30%; right: 5%; animation: floatSlow 25s ease-in-out infinite; opacity: 0.08; }

        /* Gentle ECG Line */
        .san-bg-ecg-wrap {
          position: absolute;
          bottom: 12%;
          left: 0;
          width: 100%;
          height: 60px;
          opacity: 0.15;
          overflow: hidden;
        }

        .san-bg-ecg-path {
          fill: none;
          stroke: #16A34A;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          animation: ecgFlow 12s linear infinite;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-16px) scale(1.05); }
        }

        @keyframes floatRotate {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(20deg); }
        }

        @keyframes ecgFlow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── Prefers Reduced Motion Rule (Rule #5) ── */
        @media (prefers-reduced-motion: reduce) {
          .san-bg-symbol,
          .san-bg-cross-1,
          .san-bg-cross-2,
          .san-bg-leaf-1,
          .san-bg-leaf-2,
          .san-bg-shield,
          .san-bg-heart,
          .san-bg-ecg-path {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Medical Cross (+) Symbols */}
      <div className="san-bg-symbol san-bg-cross-1">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
        </svg>
      </div>

      <div className="san-bg-symbol san-bg-cross-2">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
        </svg>
      </div>

      {/* Sanjeevani Healing Leaves */}
      <div className="san-bg-symbol san-bg-leaf-1">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5 16 5 21h2c0-3.87 2.13-7.5 5.5-9.5C14.7 10.1 17 8 17 8zM21 3C10 3 3 10 3 21h2c0-9 5.5-15 16-16V3z"/>
        </svg>
      </div>

      <div className="san-bg-symbol san-bg-leaf-2">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5 16 5 21h2c0-3.87 2.13-7.5 5.5-9.5C14.7 10.1 17 8 17 8zM21 3C10 3 3 10 3 21h2c0-9 5.5-15 16-16V3z"/>
        </svg>
      </div>

      {/* Medical Shield */}
      <div className="san-bg-symbol san-bg-shield">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8s0 .01 0 .01z"/>
        </svg>
      </div>

      {/* Medical Heart */}
      <div className="san-bg-symbol san-bg-heart">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>

      {/* Gentle ECG Waveform */}
      <div className="san-bg-ecg-wrap">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{ width: '200%', height: '100%' }}>
          <path
            className="san-bg-ecg-path"
            d="M0,30 L100,30 L110,24 L120,36 L130,10 L140,50 L150,22 L160,30 L300,30 L400,30 L410,24 L420,36 L430,10 L440,50 L450,22 L460,30 L600,30 L700,30 L710,24 L720,36 L730,10 L740,50 L750,22 L760,30 L900,30 L1000,30 L1010,24 L1020,36 L1030,10 L1040,50 L1050,22 L1060,30 L1200,30"
          />
        </svg>
      </div>
    </div>
  );
};

export default AuthBackground;

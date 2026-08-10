import React from 'react';

/**
 * AuthSharedBackground — Ultra-Clean Sanjeevani Ambient Mesh Background
 * Sleek, modern, state-of-the-art background for Login, Register & Forgot Password pages.
 * Features:
 * - Soft Sanjeevani Mesh Gradient Base (#F8FAFC -> #DCFCE7 -> #CCFBF1)
 * - Silky smooth floating Emerald (#16A34A) & Teal (#0D9488) ambient light orbs
 * - Micro light specks drifting slowly
 * - Zero lag, 100% crisp focus on authentication forms
 */
const AuthSharedBackground = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #DCFCE7 35%, #CCFBF1 70%, #F8FAFC 100%)',
      }}
    >
      <style>{`
        /* ── Silky Smooth Sanjeevani Ambient Orbs ── */
        .san-aurora-orb {
          position: absolute;
          border-radius: 50%;
          transform: translateZ(0);
          pointer-events: none;
        }

        /* Top-Left Sanjeevani Emerald Glow */
        .san-orb-1 {
          width: 580px;
          height: 580px;
          background: radial-gradient(circle, rgba(22, 163, 74, 0.22) 0%, rgba(21, 128, 61, 0.05) 50%, transparent 75%);
          top: -12%;
          left: -8%;
          animation: sanFloat1 20s ease-in-out infinite;
        }

        /* Top-Right Sky Teal Glow */
        .san-orb-2 {
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, rgba(13, 148, 136, 0.20) 0%, rgba(15, 118, 110, 0.04) 50%, transparent 75%);
          top: -5%;
          right: -10%;
          animation: sanFloat2 24s ease-in-out infinite;
        }

        /* Bottom-Left Soft Mint Glow */
        .san-orb-3 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.18) 0%, rgba(22, 163, 74, 0.04) 50%, transparent 75%);
          bottom: -10%;
          left: 10%;
          animation: sanFloat3 22s ease-in-out infinite;
        }

        /* Bottom-Right Healthcare Teal Glow */
        .san-orb-4 {
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(20, 184, 166, 0.16) 0%, rgba(13, 148, 136, 0.03) 50%, transparent 75%);
          bottom: -8%;
          right: -5%;
          animation: sanFloat4 26s ease-in-out infinite;
        }

        /* Center Soft Ambient Glow */
        .san-orb-center {
          width: 650px;
          height: 650px;
          background: radial-gradient(circle, rgba(220, 252, 231, 0.6) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: sanPulse 12s ease-in-out infinite;
        }

        /* ── Subtle Twinkling Micro Light Specks ── */
        .san-speck {
          position: absolute;
          border-radius: 50%;
          background: #FFFFFF;
          box-shadow: 0 0 10px rgba(22, 163, 74, 0.6);
          animation: speckFloat 6s ease-in-out infinite;
        }

        .san-speck-1 { width: 5px; height: 5px; top: 18%; left: 14%; animation-delay: 0s; }
        .san-speck-2 { width: 4px; height: 4px; top: 28%; right: 16%; animation-delay: 1.5s; }
        .san-speck-3 { width: 6px; height: 6px; bottom: 22%; left: 20%; animation-delay: 3s; }
        .san-speck-4 { width: 4px; height: 4px; bottom: 32%; right: 14%; animation-delay: 2.2s; }
        .san-speck-5 { width: 5px; height: 5px; top: 62%; left: 8%; animation-delay: 4.1s; }

        /* Keyframe Animations */
        @keyframes sanFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(35px, 25px) scale(1.06); }
        }
        @keyframes sanFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 20px) scale(1.05); }
        }
        @keyframes sanFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -30px) scale(1.08); }
        }
        @keyframes sanFloat4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-35px, -20px) scale(1.06); }
        }
        @keyframes sanPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.12); opacity: 1; }
        }
        @keyframes speckFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.35; }
          50% { transform: translateY(-12px) scale(1.2); opacity: 0.85; }
        }

        @media (prefers-reduced-motion: reduce) {
          .san-aurora-orb, .san-speck {
            animation: none !important;
          }
        }
      `}</style>

      {/* Sanjeevani Ambient Glow Orbs */}
      <div className="san-aurora-orb san-orb-1" />
      <div className="san-aurora-orb san-orb-2" />
      <div className="san-aurora-orb san-orb-3" />
      <div className="san-aurora-orb san-orb-4" />
      <div className="san-aurora-orb san-orb-center" />

      {/* Twinkling Light Specks */}
      <div className="san-speck san-speck-1" />
      <div className="san-speck san-speck-2" />
      <div className="san-speck san-speck-3" />
      <div className="san-speck san-speck-4" />
      <div className="san-speck san-speck-5" />
    </div>
  );
};

export default AuthSharedBackground;

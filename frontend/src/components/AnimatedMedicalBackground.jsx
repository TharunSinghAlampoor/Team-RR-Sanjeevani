import React from 'react';

/**
 * AnimatedMedicalBackground — Glassmorphism Style
 * Pure CSS animated background with:
 * - Floating colorful gradient orbs
 * - Glassmorphic frosted panels
 * - Smooth keyframe animations
 * - Soft mint green healthcare base
 */

const styles = {
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    background: 'linear-gradient(135deg, #d1fae5 0%, #e0f7ed 20%, #ecfdf5 40%, #e0f2fe 60%, #ede9fe 80%, #d1fae5 100%)',
  },
};

const AnimatedMedicalBackground = () => {
  return (
    <div style={styles.wrapper}>
      <style>{`
        /* ── Floating Gradient Orbs (Optimized Native Radial Gradients — 60fps Scrolling) ── */
        .bg-orb {
          position: absolute;
          border-radius: 50%;
          transform: translateZ(0);
          pointer-events: none;
        }

        .bg-orb-1 {
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(5, 150, 105, 0.12) 40%, transparent 70%);
          top: -8%;
          left: -5%;
          animation: orbFloat1 18s ease-in-out infinite;
        }

        .bg-orb-2 {
          width: 460px;
          height: 460px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.32) 0%, rgba(14, 165, 233, 0.09) 40%, transparent 70%);
          top: 10%;
          right: -8%;
          animation: orbFloat2 22s ease-in-out infinite;
        }

        .bg-orb-3 {
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.28) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%);
          bottom: 5%;
          left: 15%;
          animation: orbFloat3 20s ease-in-out infinite;
        }

        .bg-orb-4 {
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, rgba(251, 113, 133, 0.26) 0%, rgba(244, 63, 94, 0.07) 40%, transparent 70%);
          top: 45%;
          left: 50%;
          animation: orbFloat4 24s ease-in-out infinite;
        }

        .bg-orb-5 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.26) 0%, rgba(245, 158, 11, 0.07) 40%, transparent 70%);
          bottom: 15%;
          right: 10%;
          animation: orbFloat5 19s ease-in-out infinite;
        }

        .bg-orb-6 {
          width: 340px;
          height: 340px;
          background: radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, rgba(13, 148, 136, 0.08) 40%, transparent 70%);
          top: 60%;
          left: -5%;
          animation: orbFloat6 21s ease-in-out infinite;
        }

        /* ── Glassmorphic Floating Panels (Ultra-Fast 60fps Scrolling) ── */
        .glass-panel {
          position: absolute;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.45);
          border: 1.5px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 10px 30px rgba(5, 150, 105, 0.08);
          transform: translateZ(0);
          pointer-events: none;
        }

        .glass-panel-1 {
          width: 200px;
          height: 140px;
          top: 8%;
          right: 12%;
          transform: rotate(-8deg);
          animation: glassFloat1 16s ease-in-out infinite;
        }

        .glass-panel-2 {
          width: 160px;
          height: 120px;
          top: 35%;
          left: 5%;
          transform: rotate(5deg);
          animation: glassFloat2 18s ease-in-out infinite;
        }

        .glass-panel-3 {
          width: 180px;
          height: 100px;
          bottom: 18%;
          right: 20%;
          transform: rotate(-4deg);
          animation: glassFloat3 14s ease-in-out infinite;
        }

        .glass-panel-4 {
          width: 140px;
          height: 140px;
          bottom: 30%;
          left: 18%;
          border-radius: 50%;
          transform: rotate(0deg);
          animation: glassFloat4 20s ease-in-out infinite;
        }

        .glass-panel-5 {
          width: 120px;
          height: 80px;
          top: 55%;
          right: 5%;
          transform: rotate(10deg);
          animation: glassFloat5 17s ease-in-out infinite;
        }

        /* ── Floating Plus Signs (Medical Motif) ── */
        .med-plus {
          position: absolute;
          opacity: 0.28;
          will-change: transform;
        }

        .med-plus::before,
        .med-plus::after {
          content: '';
          position: absolute;
          border-radius: 4px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .med-plus::before {
          width: 30%;
          height: 100%;
          background: currentColor;
        }

        .med-plus::after {
          width: 100%;
          height: 30%;
          background: currentColor;
        }

        .med-plus-1 {
          width: 40px; height: 40px;
          color: #10b981;
          top: 12%; left: 20%;
          animation: plusFloat1 12s ease-in-out infinite;
        }

        .med-plus-2 {
          width: 28px; height: 28px;
          color: #0ea5e9;
          top: 25%; right: 25%;
          animation: plusFloat2 15s ease-in-out infinite;
        }

        .med-plus-3 {
          width: 35px; height: 35px;
          color: #8b5cf6;
          bottom: 20%; left: 30%;
          animation: plusFloat3 13s ease-in-out infinite;
        }

        .med-plus-4 {
          width: 24px; height: 24px;
          color: #f43f5e;
          top: 50%; left: 8%;
          animation: plusFloat4 11s ease-in-out infinite;
        }

        .med-plus-5 {
          width: 32px; height: 32px;
          color: #14b8a6;
          bottom: 35%; right: 12%;
          animation: plusFloat5 14s ease-in-out infinite;
        }

        .med-plus-6 {
          width: 22px; height: 22px;
          color: #f59e0b;
          top: 70%; left: 55%;
          animation: plusFloat6 16s ease-in-out infinite;
        }

        /* ── Sparkle Dots ── */
        .sparkle-dot {
          position: absolute;
          border-radius: 50%;
          will-change: transform, opacity;
        }

        .sparkle-dot-1 {
          width: 6px; height: 6px;
          background: #10b981;
          top: 15%; left: 40%;
          animation: sparkle 3s ease-in-out infinite;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
        }

        .sparkle-dot-2 {
          width: 4px; height: 4px;
          background: #3b82f6;
          top: 30%; right: 15%;
          animation: sparkle 4s ease-in-out 0.5s infinite;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
        }

        .sparkle-dot-3 {
          width: 5px; height: 5px;
          background: #8b5cf6;
          bottom: 25%; left: 12%;
          animation: sparkle 3.5s ease-in-out 1s infinite;
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);
        }

        .sparkle-dot-4 {
          width: 4px; height: 4px;
          background: #f43f5e;
          top: 65%; right: 30%;
          animation: sparkle 4.5s ease-in-out 1.5s infinite;
          box-shadow: 0 0 10px rgba(244, 63, 94, 0.4);
        }

        .sparkle-dot-5 {
          width: 5px; height: 5px;
          background: #14b8a6;
          top: 40%; left: 60%;
          animation: sparkle 3s ease-in-out 2s infinite;
          box-shadow: 0 0 12px rgba(20, 184, 166, 0.4);
        }

        .sparkle-dot-6 {
          width: 3px; height: 3px;
          background: #f59e0b;
          bottom: 40%; right: 40%;
          animation: sparkle 5s ease-in-out 0.8s infinite;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
        }

        .sparkle-dot-7 {
          width: 5px; height: 5px;
          background: #10b981;
          top: 80%; left: 45%;
          animation: sparkle 3.2s ease-in-out 1.3s infinite;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
        }

        .sparkle-dot-8 {
          width: 4px; height: 4px;
          background: #ec4899;
          top: 20%; left: 75%;
          animation: sparkle 4s ease-in-out 2.2s infinite;
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.4);
        }

        /* ── Floating Ring Circles ── */
        .float-ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid;
          opacity: 0.2;
          will-change: transform;
        }

        .float-ring-1 {
          width: 100px; height: 100px;
          border-color: #10b981;
          top: 18%; right: 35%;
          animation: ringFloat1 14s ease-in-out infinite;
        }

        .float-ring-2 {
          width: 70px; height: 70px;
          border-color: #3b82f6;
          bottom: 12%; left: 45%;
          animation: ringFloat2 16s ease-in-out infinite;
        }

        .float-ring-3 {
          width: 55px; height: 55px;
          border-color: #8b5cf6;
          top: 48%; right: 8%;
          animation: ringFloat3 12s ease-in-out infinite;
        }

        .float-ring-4 {
          width: 85px; height: 85px;
          border-color: #14b8a6;
          top: 72%; left: 10%;
          animation: ringFloat4 18s ease-in-out infinite;
        }

        /* ═══ KEYFRAME ANIMATIONS ═══ */

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(60px, 40px) scale(1.08); }
          50% { transform: translate(30px, 80px) scale(0.95); }
          75% { transform: translate(-30px, 50px) scale(1.05); }
        }

        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-50px, 60px) scale(1.1); }
          50% { transform: translate(-80px, 30px) scale(0.92); }
          75% { transform: translate(-20px, -30px) scale(1.06); }
        }

        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(40px, -50px) scale(1.05); }
          50% { transform: translate(70px, -20px) scale(0.96); }
          75% { transform: translate(20px, 30px) scale(1.08); }
        }

        @keyframes orbFloat4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-60px, 40px) scale(1.12); }
          66% { transform: translate(40px, -50px) scale(0.9); }
        }

        @keyframes orbFloat5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-40px, -60px) scale(1.06); }
          50% { transform: translate(30px, -30px) scale(0.94); }
          75% { transform: translate(-20px, 40px) scale(1.1); }
        }

        @keyframes orbFloat6 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          30% { transform: translate(50px, -40px) scale(1.08); }
          60% { transform: translate(80px, 20px) scale(0.95); }
        }

        @keyframes glassFloat1 {
          0%, 100% { transform: rotate(-8deg) translate(0, 0); }
          25% { transform: rotate(-5deg) translate(-15px, 20px); }
          50% { transform: rotate(-10deg) translate(10px, 35px); }
          75% { transform: rotate(-6deg) translate(-8px, 15px); }
        }

        @keyframes glassFloat2 {
          0%, 100% { transform: rotate(5deg) translate(0, 0); }
          25% { transform: rotate(8deg) translate(20px, -15px); }
          50% { transform: rotate(3deg) translate(10px, -30px); }
          75% { transform: rotate(7deg) translate(-10px, -10px); }
        }

        @keyframes glassFloat3 {
          0%, 100% { transform: rotate(-4deg) translate(0, 0); }
          33% { transform: rotate(-2deg) translate(-20px, -18px); }
          66% { transform: rotate(-6deg) translate(15px, -10px); }
        }

        @keyframes glassFloat4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(15px, -20px) scale(1.05); }
          50% { transform: translate(-10px, -35px) scale(0.97); }
          75% { transform: translate(20px, -10px) scale(1.03); }
        }

        @keyframes glassFloat5 {
          0%, 100% { transform: rotate(10deg) translate(0, 0); }
          50% { transform: rotate(6deg) translate(-15px, 25px); }
        }

        @keyframes plusFloat1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(12px, -18px) rotate(15deg); }
          50% { transform: translate(-8px, -30px) rotate(-10deg); }
          75% { transform: translate(15px, -12px) rotate(8deg); }
        }

        @keyframes plusFloat2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-15px, 20px) rotate(-20deg); }
          66% { transform: translate(10px, 10px) rotate(12deg); }
        }

        @keyframes plusFloat3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, 10px) rotate(18deg); }
          50% { transform: translate(8px, -20px) rotate(-8deg); }
          75% { transform: translate(-12px, -5px) rotate(5deg); }
        }

        @keyframes plusFloat4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(18px, -22px) rotate(25deg); }
        }

        @keyframes plusFloat5 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-10px, 15px) rotate(-15deg); }
          66% { transform: translate(15px, -10px) rotate(10deg); }
        }

        @keyframes plusFloat6 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-8px, -12px) rotate(12deg); }
          75% { transform: translate(12px, 8px) rotate(-8deg); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.8); }
        }

        @keyframes ringFloat1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(15px, 20px) rotate(45deg); }
          50% { transform: translate(-10px, 35px) rotate(90deg); }
          75% { transform: translate(20px, 10px) rotate(135deg); }
        }

        @keyframes ringFloat2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-20px, -15px) rotate(60deg); }
          66% { transform: translate(15px, -25px) rotate(120deg); }
        }

        @keyframes ringFloat3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-12px, 18px) rotate(90deg); }
        }

        @keyframes ringFloat4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(18px, -12px) rotate(30deg); }
          50% { transform: translate(25px, 15px) rotate(60deg); }
          75% { transform: translate(-10px, 20px) rotate(90deg); }
        }

        /* ── Realistic Cardiac Monitor ECG (Full Width Left-to-Right) ── */
        .ecg-monitor {
          position: absolute;
          left: 0;
          width: 100%;
          height: 48px;
          overflow: hidden;
          pointer-events: none;
        }

        .ecg-monitor-2 { top: 640px; }

        /* The SVG waveform - always fully drawn */
        .ecg-monitor svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .ecg-monitor-2 .ecg-monitor-line {
          fill: none;
          stroke: #059669;
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 0 3px rgba(5, 150, 105, 0.4));
        }

        .ecg-monitor-2 .ecg-monitor-glow {
          fill: none;
          stroke: #059669;
          stroke-width: 3.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: 0.2;
          filter: blur(2.5px);
        }

        /* Draw mask — reveals heartbeat line from left end to right end */
        .ecg-sweep-mask {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .ecg-sweep-mask-2 {
          animation: drawHeartbeatLeft 7.5s ease-in-out infinite;
        }

        @keyframes drawHeartbeatLeft {
          0% {
            clip-path: inset(0 100% 0 0);
            opacity: 0.1;
          }
          10% {
            opacity: 1;
          }
          75% {
            clip-path: inset(0 0% 0 0);
            opacity: 1;
          }
          88% {
            clip-path: inset(0 0% 0 0);
            opacity: 0;
          }
          100% {
            clip-path: inset(0 100% 0 0);
            opacity: 0;
          }
        }

        /* ═══ RESPONSIVE — TABLET (≤1024px) ═══ */
        @media (max-width: 1024px) {
          .bg-orb-1 { width: 350px; height: 350px; }
          .bg-orb-2 { width: 320px; height: 320px; }
          .bg-orb-3 { width: 280px; height: 280px; }
          .bg-orb-4 { width: 250px; height: 250px; }
          .bg-orb-5 { width: 260px; height: 260px; }
          .bg-orb-6 { width: 220px; height: 220px; }

          .glass-panel-1 { width: 150px; height: 105px; }
          .glass-panel-2 { width: 120px; height: 90px; }
          .glass-panel-3 { width: 135px; height: 75px; }
          .glass-panel-4 { width: 100px; height: 100px; }
          .glass-panel-5 { width: 90px; height: 60px; }

          .med-plus-1 { width: 30px; height: 30px; }
          .med-plus-2 { width: 22px; height: 22px; }
          .med-plus-3 { width: 28px; height: 28px; }
          .med-plus-4 { width: 18px; height: 18px; }
          .med-plus-5 { width: 24px; height: 24px; }
          .med-plus-6 { width: 16px; height: 16px; }

          .float-ring-1 { width: 70px; height: 70px; }
          .float-ring-2 { width: 50px; height: 50px; }
          .float-ring-3 { width: 40px; height: 40px; }
          .float-ring-4 { width: 60px; height: 60px; }

          .ecg-monitor { height: 70px; }
          .ecg-monitor-1 { top: 65px; }
          .ecg-monitor-2 { top: 600px; }
          .ecg-monitor-line { stroke-width: 2.2; }
          .ecg-monitor-glow { stroke-width: 6; }
          .ecg-scan-dot { width: 10px; height: 10px; margin-top: -5px; }
        }

        /* ═══ RESPONSIVE — MOBILE LANDSCAPE (≤768px) ═══ */
        @media (max-width: 768px) {
          .bg-orb-1 { width: 250px; height: 250px; }
          .bg-orb-2 { width: 220px; height: 220px; }
          .bg-orb-3 { width: 200px; height: 200px; }
          .bg-orb-4 { width: 180px; height: 180px; }
          .bg-orb-5 { width: 190px; height: 190px; display: none; }
          .bg-orb-6 { width: 160px; height: 160px; display: none; }

          .glass-panel-1 { width: 120px; height: 85px; }
          .glass-panel-2 { width: 100px; height: 70px; }
          .glass-panel-3 { width: 110px; height: 60px; }
          .glass-panel-4 { width: 80px; height: 80px; }
          .glass-panel-5 { display: none; }

          .med-plus-1 { width: 24px; height: 24px; }
          .med-plus-2 { width: 18px; height: 18px; }
          .med-plus-3 { width: 22px; height: 22px; }
          .med-plus-4 { display: none; }
          .med-plus-5 { width: 20px; height: 20px; }
          .med-plus-6 { display: none; }

          .sparkle-dot-6,
          .sparkle-dot-7,
          .sparkle-dot-8 { display: none; }

          .float-ring-1 { width: 55px; height: 55px; }
          .float-ring-2 { width: 40px; height: 40px; }
          .float-ring-3 { display: none; }
          .float-ring-4 { width: 45px; height: 45px; }

          .ecg-monitor { height: 44px; width: 100%; }
          .ecg-monitor-2 { top: 580px; }
          .ecg-monitor-2 .ecg-monitor-line { stroke-width: 1.3; }
          .ecg-monitor-2 .ecg-monitor-glow { stroke-width: 3; }
          .ecg-scan-dot { width: 7px; height: 7px; margin-top: -3.5px; }
        }

        /* ═══ RESPONSIVE — SMALL MOBILE (≤480px) ═══ */
        @media (max-width: 480px) {
          .bg-orb-1 { width: 180px; height: 180px; }
          .bg-orb-2 { width: 160px; height: 160px; }
          .bg-orb-3 { width: 150px; height: 150px; }
          .bg-orb-4 { display: none; }
          .bg-orb-5 { display: none; }
          .bg-orb-6 { display: none; }

          .glass-panel-1 { width: 90px; height: 65px; border-radius: 16px; }
          .glass-panel-2 { width: 75px; height: 55px; border-radius: 14px; }
          .glass-panel-3 { display: none; }
          .glass-panel-4 { width: 60px; height: 60px; }
          .glass-panel-5 { display: none; }

          .med-plus-1 { width: 20px; height: 20px; }
          .med-plus-2 { width: 14px; height: 14px; }
          .med-plus-3 { display: none; }
          .med-plus-4 { display: none; }
          .med-plus-5 { width: 16px; height: 16px; }
          .med-plus-6 { display: none; }

          .sparkle-dot-4,
          .sparkle-dot-5,
          .sparkle-dot-6,
          .sparkle-dot-7,
          .sparkle-dot-8 { display: none; }

          .float-ring-1 { width: 40px; height: 40px; }
          .float-ring-2 { display: none; }
          .float-ring-3 { display: none; }
          .float-ring-4 { display: none; }

          .ecg-monitor { height: 40px; }
          .ecg-monitor-2 { top: 560px; }
          .ecg-monitor-2 .ecg-monitor-line { stroke-width: 1.2; }
          .ecg-monitor-2 .ecg-monitor-glow { stroke-width: 2.5; }
          .ecg-scan-dot { width: 6px; height: 6px; margin-top: -3px; }
        }
      `}</style>

      {/* Gradient Orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-orb bg-orb-4" />
      <div className="bg-orb bg-orb-5" />
      <div className="bg-orb bg-orb-6" />

      {/* Glassmorphic Panels */}
      <div className="glass-panel glass-panel-1" />
      <div className="glass-panel glass-panel-2" />
      <div className="glass-panel glass-panel-3" />
      <div className="glass-panel glass-panel-4" />
      <div className="glass-panel glass-panel-5" />

      {/* Medical Plus Signs */}
      <div className="med-plus med-plus-1" />
      <div className="med-plus med-plus-2" />
      <div className="med-plus med-plus-3" />
      <div className="med-plus med-plus-4" />
      <div className="med-plus med-plus-5" />
      <div className="med-plus med-plus-6" />

      {/* Sparkle Dots */}
      <div className="sparkle-dot sparkle-dot-1" />
      <div className="sparkle-dot sparkle-dot-2" />
      <div className="sparkle-dot sparkle-dot-3" />
      <div className="sparkle-dot sparkle-dot-4" />
      <div className="sparkle-dot sparkle-dot-5" />
      <div className="sparkle-dot sparkle-dot-6" />
      <div className="sparkle-dot sparkle-dot-7" />
      <div className="sparkle-dot sparkle-dot-8" />

      {/* Floating Rings */}
      <div className="float-ring float-ring-1" />
      <div className="float-ring float-ring-2" />
      <div className="float-ring float-ring-3" />
      <div className="float-ring float-ring-4" />



      {/* ── Cardiac Monitor ECG Line 2 (lower) ── */}
      <div className="ecg-monitor ecg-monitor-2">
        <div className="ecg-sweep-mask ecg-sweep-mask-2">
          <svg viewBox="0 0 1000 90" preserveAspectRatio="none">
            <path className="ecg-monitor-glow" d="M0,45 L60,45 C70,45 75,45 80,45 C85,45 88,43 93,38 C98,33 100,30 103,33 C106,36 108,42 113,45 L140,45 L150,45 L155,46 L158,50 L161,45 L162,35 L163,12 L164,-5 L165,8 L166,25 L167,55 L169,65 L172,52 L175,45 L185,45 C195,45 210,45 230,45 C238,45 241,43 246,38 C251,33 253,30 256,33 C259,36 261,42 266,45 L300,45 L340,45 C350,45 355,45 360,45 C365,45 368,43 373,38 C378,33 380,30 383,33 C386,36 388,42 393,45 L420,45 L430,45 L435,46 L438,50 L441,45 L442,35 L443,12 L444,-5 L445,8 L446,25 L447,55 L449,65 L452,52 L455,45 L465,45 C475,45 490,45 510,45 C518,45 521,43 526,38 C531,33 533,30 536,33 C539,36 541,42 546,45 L580,45 L620,45 C630,45 635,45 640,45 C645,45 648,43 653,38 C658,33 660,30 663,33 C666,36 668,42 673,45 L700,45 L710,45 L715,46 L718,50 L721,45 L722,35 L723,12 L724,-5 L725,8 L726,25 L727,55 L729,65 L732,52 L735,45 L745,45 C755,45 770,45 790,45 C798,45 801,43 806,38 C811,33 813,30 816,33 C819,36 821,42 826,45 L860,45 L900,45 L950,45 L1000,45" />
            <path className="ecg-monitor-line" d="M0,45 L60,45 C70,45 75,45 80,45 C85,45 88,43 93,38 C98,33 100,30 103,33 C106,36 108,42 113,45 L140,45 L150,45 L155,46 L158,50 L161,45 L162,35 L163,12 L164,-5 L165,8 L166,25 L167,55 L169,65 L172,52 L175,45 L185,45 C195,45 210,45 230,45 C238,45 241,43 246,38 C251,33 253,30 256,33 C259,36 261,42 266,45 L300,45 L340,45 C350,45 355,45 360,45 C365,45 368,43 373,38 C378,33 380,30 383,33 C386,36 388,42 393,45 L420,45 L430,45 L435,46 L438,50 L441,45 L442,35 L443,12 L444,-5 L445,8 L446,25 L447,55 L449,65 L452,52 L455,45 L465,45 C475,45 490,45 510,45 C518,45 521,43 526,38 C531,33 533,30 536,33 C539,36 541,42 546,45 L580,45 L620,45 C630,45 635,45 640,45 C645,45 648,43 653,38 C658,33 660,30 663,33 C666,36 668,42 673,45 L700,45 L710,45 L715,46 L718,50 L721,45 L722,35 L723,12 L724,-5 L725,8 L726,25 L727,55 L729,65 L732,52 L735,45 L745,45 C755,45 770,45 790,45 C798,45 801,43 806,38 C811,33 813,30 816,33 C819,36 821,42 826,45 L860,45 L900,45 L950,45 L1000,45" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AnimatedMedicalBackground;

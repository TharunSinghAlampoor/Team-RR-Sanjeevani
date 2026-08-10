import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, LogOut, ArrowRight, ShieldAlert, Clock } from 'lucide-react';

export const TokenExpiredModal = ({ isOpen, onConfirm }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer = null;
    if (isOpen) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onConfirm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen]);

  if (!isOpen || window.location.pathname === '/') return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '1rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            width: '100%',
            maxWidth: 420,
            background: '#ffffff',
            borderRadius: '1.25rem',
            boxShadow: '0 25px 60px -12px rgba(225, 29, 72, 0.35)',
            border: '2px solid #fecdd3',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Top Red Gradient Bar */}
          <div style={{
            height: 6,
            background: 'linear-gradient(90deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
          }} />

          <div style={{ padding: '1.75rem 1.5rem 1.5rem', textAlign: 'center' }}>
            {/* Warning Icon Badge */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#fff1f2',
              border: '2px solid #fecdd3',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              margin: '0 auto 1.1rem',
              boxShadow: '0 8px 20px rgba(225, 29, 72, 0.15)',
            }}>
              <AlertTriangle style={{ width: 32, height: 32, color: '#e11d48' }} />
            </div>

            {/* Title */}
            <h3 style={{
              margin: '0 0 0.45rem',
              fontSize: '1.25rem',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.02em',
            }}>
              Token Expired!
            </h3>

            {/* Message */}
            <p style={{
              margin: '0 0 1.25rem',
              fontSize: '0.88rem',
              lineHeight: 1.5,
              color: '#475569',
              fontWeight: 600,
            }}>
              Your security token has expired or session is no longer valid. Please log in again to continue accessing Sanjeevani Store.
            </p>

            {/* Countdown Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '99px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#be123c',
              marginBottom: '1.25rem',
            }}>
              <Clock style={{ width: 14, height: 14 }} className="animate-spin" />
              <span>Auto-redirecting in {countdown}s</span>
            </div>

            {/* Confirm Login Button */}
            <button
              onClick={onConfirm}
              style={{
                width: '100%',
                padding: '0.8rem 1.25rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
                transition: 'transform 0.18s, boxShadow 0.18s',
              }}
            >
              <LogOut style={{ width: 18, height: 18 }} />
              <span>Login Again Now</span>
              <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TokenExpiredModal;

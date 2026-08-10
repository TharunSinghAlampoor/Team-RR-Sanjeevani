import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Heart, ShoppingBag, Trash2, X, AlertCircle } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

export const ToastNotification = ({ toast, onClose }) => {
  const { translateData } = useLanguage();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const { type = 'success', title, message, icon } = toast;

  const getIcon = () => {
    if (icon) return icon;
    if (type === 'cart-add') return <ShoppingBag style={{ width: 22, height: 22, color: '#059669' }} />;
    if (type === 'cart-remove') return <Trash2 style={{ width: 22, height: 22, color: '#ef4444' }} />;
    if (type === 'fav-add') return <Heart style={{ width: 22, height: 22, color: '#f43f5e', fill: '#f43f5e' }} />;
    if (type === 'fav-remove') return <Heart style={{ width: 22, height: 22, color: '#94a3b8' }} />;
    if (type === 'error') return <AlertCircle style={{ width: 22, height: 22, color: '#ef4444' }} />;
    return <CheckCircle2 style={{ width: 22, height: 22, color: '#059669' }} />;
  };

  const getBadgeBg = () => {
    if (type === 'cart-add' || type === 'success') return 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
    if (type === 'fav-add') return 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)';
    if (type === 'cart-remove' || type === 'fav-remove' || type === 'error') return 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)';
    return 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, x: '-50%', scale: 0.9 }}
        animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
        exit={{ opacity: 0, y: -30, x: '-50%', scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        style={{
          position: 'fixed',
          top: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '1.25rem',
          padding: '1.1rem 1.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 16px 48px rgba(15, 23, 42, 0.18), 0 6px 20px rgba(5, 150, 105, 0.12)',
          maxWidth: '460px',
          width: 'calc(100% - 32px)',
          pointerEvents: 'auto',
        }}
      >
        {/* Badge Icon */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          background: getBadgeBg(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {getIcon()}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <p style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
              {translateData(title)}
            </p>
          )}
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.92rem', fontWeight: 600, color: '#334155', lineHeight: 1.4 }}>
            {translateData(message)}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'rgba(241, 245, 249, 0.8)',
            color: '#64748b',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.18s ease',
            flexShrink: 0,
          }}
        >
          <X style={{ width: 18, height: 18 }} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default ToastNotification;

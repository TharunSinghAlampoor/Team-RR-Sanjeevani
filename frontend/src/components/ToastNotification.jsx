import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Heart, ShoppingBag, Trash2, X, AlertCircle } from 'lucide-react';

export const ToastNotification = ({ toast, onClose }) => {
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
    if (type === 'cart-add') return <ShoppingBag style={{ width: 18, height: 18, color: '#059669' }} />;
    if (type === 'cart-remove') return <Trash2 style={{ width: 18, height: 18, color: '#ef4444' }} />;
    if (type === 'fav-add') return <Heart style={{ width: 18, height: 18, color: '#f43f5e', fill: '#f43f5e' }} />;
    if (type === 'fav-remove') return <Heart style={{ width: 18, height: 18, color: '#94a3b8' }} />;
    if (type === 'error') return <AlertCircle style={{ width: 18, height: 18, color: '#ef4444' }} />;
    return <CheckCircle2 style={{ width: 18, height: 18, color: '#059669' }} />;
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
        initial={{ opacity: 0, y: -40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(226, 232, 240, 0.9)',
          borderRadius: '1.1rem',
          padding: '0.9rem 1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          boxShadow: '0 12px 36px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 118, 110, 0.08)',
          maxWidth: '380px',
          pointerEvents: 'auto',
        }}
      >
        {/* Badge Icon */}
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
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
            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {title}
            </p>
          )}
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', fontWeight: 600, color: '#475569', lineHeight: 1.35 }}>
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0.2rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s',
          }}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default ToastNotification;

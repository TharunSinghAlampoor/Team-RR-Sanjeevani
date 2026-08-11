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
        initial={{ opacity: 0, y: -40, x: '-50%', scale: 0.92 }}
        animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
        exit={{ opacity: 0, y: -30, x: '-50%', scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        className="sanjeevani-toast-wrapper"
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999999,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '1.25rem',
          padding: '1rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.22), 0 6px 20px rgba(5, 150, 105, 0.18)',
          maxWidth: '460px',
          width: 'calc(100% - 28px)',
          pointerEvents: 'auto',
        }}
      >
        {/* Badge Icon */}
        <div style={{
          width: '42px',
          height: '42px',
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
            <p style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
              {translateData(title)}
            </p>
          )}
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.86rem', fontWeight: 700, color: '#334155', lineHeight: 1.35 }}>
            {translateData(message)}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'rgba(241, 245, 249, 0.9)',
            color: '#64748b',
            cursor: 'pointer',
            padding: '0.35rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.18s ease',
            flexShrink: 0,
          }}
        >
          <X style={{ width: 17, height: 17 }} />
        </button>

        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 640px) {
            .sanjeevani-toast-wrapper {
              top: calc(12px + env(safe-area-inset-top, 0px)) !important;
              width: calc(100% - 24px) !important;
              padding: 0.85rem 1.1rem !important;
            }
          }
        ` }} />
      </motion.div>
    </AnimatePresence>
  );
};

export default ToastNotification;

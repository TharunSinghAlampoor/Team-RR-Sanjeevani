import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Send, MessageCircle } from 'lucide-react';

export const ShareModal = ({ isOpen, onClose, product, customTitle, customText, customUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const title = customTitle || `${product?.name || 'Sanjeevani Healthcare'} - Sanjeevani`;
  const url = customUrl || window.location.href;
  const description = product?.description ? product.description.slice(0, 120) : '';
  const price = product?.price ? `₹${product.price}` : '';
  const text = customText || `Check out ${product?.name || 'this item'} on Sanjeevani Healthcare!\n\n${price ? `💰 Price: ${price}\n` : ''}${description ? `📝 ${description}...\n` : ''}\n🔗 Link: ${url}`;

  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url
        });
        onClose();
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const shareApps = [
    {
      name: 'WhatsApp',
      color: '#25D366',
      bg: '#DCFCE7',
      border: '#86EFAC',
      icon: '💬',
      action: () => window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank')
    },
    {
      name: 'X (Twitter)',
      color: '#09090b',
      bg: '#F4F4F5',
      border: '#E4E4E7',
      icon: '𝕏',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank')
    },
    {
      name: 'Telegram',
      color: '#229ED9',
      bg: '#E0F2FE',
      border: '#7DD3FC',
      icon: '✈️',
      action: () => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank')
    },
    {
      name: 'Facebook',
      color: '#1877F2',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      icon: '📘',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank')
    },
    {
      name: 'Instagram / Apps',
      color: '#E1306C',
      bg: '#FCE7F3',
      border: '#FBCFE8',
      icon: '📸',
      action: handleNativeShare
    }
  ];

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            maxWidth: 420,
            width: '100%',
            padding: '1.5rem',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.25)',
            border: '1.5px solid #e2e8f0'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#ECFDF5', border: '1.5px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                <Share2 style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                  Share Product
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0', fontWeight: 600 }}>
                  Send directly to installed mobile apps
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Installed Apps Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {shareApps.map((app, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={app.action}
                style={{
                  background: app.bg,
                  border: `1.5px solid ${app.border}`,
                  borderRadius: '0.85rem',
                  padding: '0.85rem 0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{app.icon}</span>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: app.color }}>{app.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Copy Direct Link Section */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '0.85rem', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <input
              type="text"
              readOnly
              value={url}
              style={{ border: 'none', background: 'transparent', fontSize: '0.8rem', color: '#475569', fontWeight: 600, outline: 'none', width: '100%', textOverflow: 'ellipsis' }}
            />
            <button
              onClick={handleCopyLink}
              style={{
                background: copied ? '#10b981' : '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '0.6rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
            >
              {copied ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareModal;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2 } from 'lucide-react';

// Real Brand SVG Icons
const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.419h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.87 11.87 0 005.71 1.454h.005c6.554 0 11.89-5.335 11.894-11.893a11.82 11.82 0 00-3.48-8.413" fill="#25D366"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#0F172A"/>
  </svg>
);

const TelegramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.762-.17.712-.433.95-.688.974-.558.051-.982-.369-1.522-.723-.846-.554-1.324-.899-2.146-1.44-.95-.626-.334-.97.207-1.534.141-.147 2.598-2.381 2.645-2.583.006-.025.011-.122-.047-.173-.058-.051-.143-.033-.205-.019-.089.02-1.498.952-4.228 2.798-.4.275-.762.41-1.086.403-.357-.008-1.044-.202-1.554-.368-.626-.204-1.123-.312-1.08-.659.022-.181.272-.367.75-.558 2.936-1.278 4.895-2.122 5.877-2.53 2.795-1.16 3.377-1.362 3.756-1.369.083-.001.27.02.39.118.102.083.133.195.147.273.013.078.028.256.015.395z" fill="#229ED9"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#0A66C2"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="#E1306C"/>
  </svg>
);

const MailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#EA4335"/>
  </svg>
);

export const ShareModal = ({ isOpen, onClose, product, customTitle, customText, customUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const title = customTitle || `${product?.name || 'Sanjeevani Healthcare'} - Sanjeevani`;
  const url = customUrl || window.location.href;
  const productImage = product?.imageUrl || product?.images?.[0]?.imageUrl || product?.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';
  const description = product?.description ? product.description.slice(0, 120) : '';
  const price = product?.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : '';
  
  const text = customText || `💊 Check out *${product?.name || 'this medicine'}* on Sanjeevani Healthcare!\n\n${price ? `💰 Price: ${price}\n` : ''}${description ? `📝 ${description}...\n` : ''}\n🖼️ Product Image: ${productImage}\n🔗 Link: ${url}`;

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
      color: '#15803D',
      bg: '#DCFCE7',
      border: '#86EFAC',
      icon: <WhatsAppIcon />,
      action: () => window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank')
    },
    {
      name: 'Telegram',
      color: '#0369A1',
      bg: '#E0F2FE',
      border: '#7DD3FC',
      icon: <TelegramIcon />,
      action: () => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank')
    },
    {
      name: 'X (Twitter)',
      color: '#0F172A',
      bg: '#F1F5F9',
      border: '#CBD5E1',
      icon: <XIcon />,
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank')
    },
    {
      name: 'Facebook',
      color: '#1D4ED8',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      icon: <FacebookIcon />,
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank')
    },
    {
      name: 'LinkedIn',
      color: '#0A66C2',
      bg: '#E0F2FE',
      border: '#93C5FD',
      icon: <LinkedInIcon />,
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank')
    },
    {
      name: 'Email',
      color: '#B91C1C',
      bg: '#FEF2F2',
      border: '#FCA5A5',
      icon: <MailIcon />,
      action: () => window.open(`mailto:?subject=${encodedTitle}&body=${encodedText}`, '_blank')
    },
    {
      name: 'Instagram / Apps',
      color: '#BE185D',
      bg: '#FCE7F3',
      border: '#FBCFE8',
      icon: <InstagramIcon />,
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#ECFDF5', border: '1.5px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                <Share2 style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                  Share Product
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0', fontWeight: 600 }}>
                  Send product image & details to installed apps
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

          {/* Product Image Card Preview */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '0.85rem',
            padding: '0.75rem',
            marginBottom: '1.25rem'
          }}>
            <img
              src={productImage}
              alt={product?.name || 'Product Image'}
              style={{
                width: 58,
                height: 58,
                borderRadius: '0.65rem',
                objectFit: 'cover',
                border: '1px solid #cbd5e1',
                background: '#ffffff'
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product?.name || 'Sanjeevani Product'}
              </h4>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {product?.categoryName || product?.category || 'Healthcare'}
              </p>
              {price && (
                <div style={{ marginTop: '0.2rem', fontSize: '0.88rem', fontWeight: 900, color: '#059669' }}>
                  {price}
                </div>
              )}
            </div>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                  {app.icon}
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: app.color, textAlign: 'center' }}>{app.name}</span>
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

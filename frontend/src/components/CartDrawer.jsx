import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductImage from './ProductImage';
import { useLanguage } from '../context/LanguageContext';

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(15,23,42,0.55)',
    backdropFilter: 'blur(4px)',
    display: 'flex', justifyContent: 'flex-end',
  },
  panel: {
    width: '100%', maxWidth: 420,
    background: '#ffffff',
    height: '100%',
    display: 'flex', flexDirection: 'column',
    boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
    borderLeft: '1.5px solid #e2e8f0',
    overflowY: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1.1rem 1.25rem 1rem',
    borderBottom: '1.5px solid #f1f5f9',
    background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
    flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  headerTitle: { fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 },
  headerCount: {
    fontSize: '0.7rem', fontWeight: 800,
    background: '#059669', color: '#fff',
    borderRadius: 99, padding: '0.15rem 0.5rem',
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: '50%',
    border: '1.5px solid #e2e8f0',
    background: '#f8fafc', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.18s',
  },
  deliveryBar: {
    margin: '0.75rem 1.25rem',
    padding: '0.65rem 0.85rem',
    borderRadius: '0.75rem',
    background: 'linear-gradient(135deg, #ecfdf5, #f0fdfa)',
    border: '1px solid #a7f3d0',
    flexShrink: 0,
  },
  deliveryBarRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '0.72rem', fontWeight: 700, color: '#065f46', marginBottom: '0.4rem',
  },
  progressTrack: {
    width: '100%', height: 5, borderRadius: 99,
    background: '#d1fae5', overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 99,
    background: 'linear-gradient(90deg, #10b981, #059669)',
    transition: 'width 0.4s ease',
  },
  scrollArea: {
    flex: 1, overflowY: 'auto', padding: '0 1.25rem 1rem',
    display: 'flex', flexDirection: 'column', gap: '0.7rem',
  },
  emptyState: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '0.75rem', padding: '3rem 1rem',
    color: '#94a3b8', textAlign: 'center',
  },
  emptyTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#64748b', margin: 0 },
  emptyBtn: {
    padding: '0.55rem 1.25rem', borderRadius: 99,
    background: '#059669', color: '#fff',
    fontSize: '0.78rem', fontWeight: 800,
    border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
  },

  // Product Card in drawer matching Orders modal cards
  card: {
    display: 'flex', gap: '0.85rem',
    padding: '0.85rem 1rem',
    borderRadius: '1rem',
    border: '1.5px solid #a7f3d0',
    background: 'linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)',
    alignItems: 'flex-start',
    boxShadow: '0 4px 14px rgba(15, 118, 110, 0.08)',
    transition: 'all 0.2s ease',
  },
  imgWrap: {
    width: 72, height: 72, flexShrink: 0,
    borderRadius: '0.85rem',
    background: '#f0fdf4',
    border: '1.5px solid #a7f3d0',
    overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0.35rem',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)',
  },
  cardInfo: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.22rem' },
  cardName: {
    fontSize: '0.88rem', fontWeight: 900, color: '#0f172a',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    margin: 0,
  },
  cardBrand: { fontSize: '0.72rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', margin: 0, letterSpacing: '0.04em' },
  cardPrice: { fontSize: '0.95rem', fontWeight: 900, color: '#047857', margin: '0.15rem 0 0' },
  cardItemTotal: { fontSize: '0.72rem', color: '#64748b', fontWeight: 700 },
  qtyRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginTop: '0.45rem',
  },
  qtyBox: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    background: '#ffffff', border: '1.5px solid #a7f3d0',
    borderRadius: '0.65rem', padding: '0.25rem 0.5rem',
    boxShadow: '0 2px 6px rgba(15, 118, 110, 0.05)',
  },
  qtyBtn: {
    width: 24, height: 24, borderRadius: '0.4rem',
    border: 'none', background: '#ecfdf5', color: '#047857',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s ease', fontWeight: 800,
  },
  qtyNum: { fontSize: '0.82rem', fontWeight: 900, color: '#0f172a', minWidth: 20, textAlign: 'center' },
  removeBtn: {
    width: 30, height: 30, borderRadius: '0.65rem',
    border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#dc2626',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.18s ease', boxShadow: '0 2px 6px rgba(220, 38, 38, 0.1)',
  },

  // Footer
  footer: {
    padding: '0.9rem 1.25rem',
    borderTop: '1.5px solid #f1f5f9',
    background: '#fafffe',
    flexShrink: 0,
    display: 'flex', flexDirection: 'column', gap: '0.5rem',
  },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '0.75rem', color: '#64748b',
  },
  grandTotal: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '1rem', fontWeight: 900, color: '#0f172a',
    paddingTop: '0.4rem', borderTop: '1px solid #e2e8f0',
  },
  checkoutBtn: {
    width: '100%', padding: '0.85rem',
    borderRadius: '0.85rem',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff', fontWeight: 900, fontSize: '0.9rem',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    boxShadow: '0 6px 20px rgba(5,150,105,0.35)',
    transition: 'opacity 0.18s',
    marginTop: '0.3rem',
  },
  secureNote: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
    fontSize: '0.68rem', color: '#94a3b8',
  },
};

export const CartDrawer = ({ isOpen = true, cartItems = [], onClose, onUpdateQuantity, onRemoveItem, onProceedToCheckout, onCheckout }) => {
  const { t, translateData } = useLanguage();
  if (isOpen === false) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.itemTotal) || 0), 0);
  const FREE_THRESHOLD = 500;
  const progress = Math.min(100, (subtotal / FREE_THRESHOLD) * 100);
  const shipping = subtotal >= FREE_THRESHOLD ? 0 : 40;

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        style={s.panel}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
      >
        <div style={s.header}>
          <div style={s.headerLeft}>
            <ShoppingBag style={{ width: 20, height: 20, color: '#059669' }} />
            <h3 style={s.headerTitle}>{t('cart') || translateData('My Cart')}</h3>
            <span style={s.headerCount}>{cartItems.length} {translateData('item')}{cartItems.length !== 1 ? 's' : ''}</span>
          </div>
          <button style={s.closeBtn} onClick={onClose}>
            <X style={{ width: 16, height: 16, color: '#64748b' }} />
          </button>
        </div>

        {cartItems.length > 0 && (
          <div style={s.deliveryBar}>
            <div style={s.deliveryBarRow}>
              <span>
                {subtotal >= FREE_THRESHOLD
                  ? `🎉 ${translateData('Free Delivery Unlocked!')}`
                  : `${translateData('Add')} ₹${(FREE_THRESHOLD - subtotal).toFixed(0)} ${translateData('more for Free Delivery')}`}
              </span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div style={s.progressTrack}>
              <div style={{ ...s.progressFill, width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div style={s.scrollArea}>
          {cartItems.length === 0 ? (
            <div style={s.emptyState}>
              <Package style={{ width: 52, height: 52, color: '#d1fae5' }} />
              <p style={s.emptyTitle}>{translateData('Your cart is empty')}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                {translateData('Browse products and click "Add to Cart"')}
              </p>
              <button style={s.emptyBtn} onClick={onClose}>{translateData('Start Shopping')}</button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  style={s.card}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <div style={s.imgWrap}>
                    <ProductImage
                      src={item.product?.imageUrl}
                      alt={item.product?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={s.cardInfo}>
                    <p style={s.cardName}>{translateData(item.product?.name || 'Product')}</p>
                    <p style={s.cardBrand}>{translateData(item.product?.brand || item.product?.categoryName || '')}</p>
                    <p style={s.cardPrice}>₹{Number(item.product?.price || 0).toLocaleString('en-IN')}</p>
                    <p style={s.cardItemTotal}>{translateData('Subtotal')}: ₹{Number(item.itemTotal || 0).toLocaleString('en-IN')}</p>
                    <div style={s.qtyRow}>
                      <div style={s.qtyBox}>
                        <button
                          style={s.qtyBtn}
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus style={{ width: 11, height: 11, color: '#475569' }} />
                        </button>
                        <span style={s.qtyNum}>{item.quantity}</span>
                        <button
                          style={s.qtyBtn}
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus style={{ width: 11, height: 11, color: '#475569' }} />
                        </button>
                      </div>
                      <button style={s.removeBtn} onClick={() => onRemoveItem(item.id)} title="Remove">
                        <Trash2 style={{ width: 13, height: 13, color: '#ef4444' }} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={s.footer}>
            <div style={s.summaryRow}>
              <span style={s.summaryLabel}>{translateData('Subtotal')}</span>
              <span style={s.summaryVal}>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={s.summaryRow}>
              <span style={s.summaryLabel}>{translateData('Delivery')}</span>
              <span style={{ ...s.summaryVal, color: shipping === 0 ? '#059669' : '#0f172a' }}>
                {shipping === 0 ? translateData('FREE') : `₹${shipping}`}
              </span>
            </div>
            <div style={s.totalRow}>
              <span>{translateData('Total')}</span>
              <span>₹{(subtotal + shipping).toFixed(2)}</span>
            </div>
            <button
              style={s.checkoutBtn}
              onClick={() => {
                onClose();
                if (onProceedToCheckout) onProceedToCheckout();
                else if (onCheckout) onCheckout();
              }}
            >
              <span>{t('buyNow') || translateData('Proceed to Checkout')}</span>
              <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
            <div style={s.secureNote}>
              <ShieldCheck style={{ width: 13, height: 13, color: '#059669' }} />
              <span>{translateData('100% Encrypted & Safe Healthcare Checkout')}</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CartDrawer;

import React from 'react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductImage from './ProductImage';

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
    borderBottom: '1.5px solid #fce7f3',
    background: 'linear-gradient(135deg, #fff0f6 0%, #ffffff 100%)',
    flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  headerTitle: { fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 },
  headerCount: {
    fontSize: '0.7rem', fontWeight: 800,
    background: '#f43f5e', color: '#fff',
    borderRadius: 99, padding: '0.15rem 0.5rem',
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: '50%',
    border: '1.5px solid #fce7f3',
    background: '#fff5f7', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.18s',
  },
  scrollArea: {
    flex: 1, overflowY: 'auto',
    padding: '0.85rem 1.25rem',
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
    background: '#f43f5e', color: '#fff',
    fontSize: '0.78rem', fontWeight: 800,
    border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(244,63,94,0.3)',
  },
  // Product Card matching Orders modal cards
  card: {
    display: 'flex', gap: '0.85rem',
    padding: '0.85rem 1rem',
    borderRadius: '1rem',
    border: '1.5px solid #fda4af',
    background: 'linear-gradient(180deg, #ffffff 0%, #fff1f2 100%)',
    alignItems: 'flex-start',
    boxShadow: '0 4px 14px rgba(244, 63, 94, 0.08)',
    transition: 'all 0.2s ease',
  },
  imgWrap: {
    width: 72, height: 72, flexShrink: 0,
    borderRadius: '0.85rem',
    background: '#fff1f2',
    border: '1.5px solid #fecdd3',
    overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0.35rem',
    boxShadow: '0 2px 8px rgba(244, 63, 94, 0.1)',
  },
  cardInfo: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.22rem' },
  cardName: {
    fontSize: '0.88rem', fontWeight: 900, color: '#0f172a',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    margin: 0,
  },
  cardBrand: { fontSize: '0.72rem', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', margin: 0, letterSpacing: '0.04em' },
  cardPrice: { fontSize: '0.95rem', fontWeight: 900, color: '#047857', margin: '0.15rem 0 0' },
  cardStock: { fontSize: '0.72rem', fontWeight: 800 },
  actionRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.45rem' },
  cartBtn: {
    flex: 1,
    padding: '0.55rem 0.8rem',
    borderRadius: '0.75rem',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff', fontWeight: 900, fontSize: '0.78rem',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
    transition: 'all 0.18s ease',
  },
  removeBtn: {
    width: 32, height: 32, borderRadius: '0.65rem',
    border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#dc2626',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.18s ease', flexShrink: 0, boxShadow: '0 2px 6px rgba(220, 38, 38, 0.1)',
  },
  footer: {
    padding: '0.85rem 1.25rem',
    borderTop: '1.5px solid #fce7f3',
    background: '#fff5f7',
    flexShrink: 0,
    textAlign: 'center',
  },
  footerText: {
    fontSize: '0.72rem', color: '#f43f5e', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
  },
};

import { useLanguage } from '../context/LanguageContext';

export const FavoritesDrawer = ({ isOpen = true, favorites = [], onClose, onRemoveFavorite, onAddToCart, onOpenDetails }) => {
  const { t, translateData } = useLanguage();
  if (isOpen === false) return null;

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        style={s.panel}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
      >
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <Heart style={{ width: 20, height: 20, color: '#f43f5e', fill: '#f43f5e' }} />
            <h3 style={s.headerTitle}>{t('favorites') || translateData('My Wishlist')}</h3>
            <span style={s.headerCount}>{favorites.length} {translateData('item')}{favorites.length !== 1 ? 's' : ''}</span>
          </div>
          <button style={s.closeBtn} onClick={onClose}>
            <X style={{ width: 16, height: 16, color: '#f43f5e' }} />
          </button>
        </div>

        {/* Items */}
        <div style={s.scrollArea}>
          {favorites.length === 0 ? (
            <div style={s.emptyState}>
              <Heart style={{ width: 52, height: 52, color: '#fecdd3' }} />
              <p style={s.emptyTitle}>{translateData('Your wishlist is empty')}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                {translateData('Click the ❤️ on any product to save it here')}
              </p>
              <button style={s.emptyBtn} onClick={onClose}>{translateData('Browse Products')}</button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {favorites.map((item) => {
                const product = item.product ? item.product : item;
                const pId = product.productId || item.productId;
                const inStock = (product.stock || 0) > 0;
                return (
                  <motion.div
                    key={pId || item.id}
                    style={{...s.card, cursor: onOpenDetails ? 'pointer' : 'default'}}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.2 }}
                    layout
                    onClick={() => {
                      if (onOpenDetails) {
                        onOpenDetails(product);
                        onClose();
                      }
                    }}
                  >
                    {/* Image */}
                    <div style={s.imgWrap}>
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    {/* Info */}
                    <div style={s.cardInfo}>
                      <p style={s.cardName}>{translateData(product.name)}</p>
                      <p style={s.cardBrand}>{translateData(product.brand || product.categoryName || '')}</p>
                      <p style={s.cardPrice}>₹{Number(product.price || 0).toLocaleString('en-IN')}</p>
                      <p style={{
                        ...s.cardStock,
                        color: inStock ? '#059669' : '#ef4444',
                      }}>
                        {inStock ? `✓ ${t('inStock') || translateData('In Stock')}` : `✗ ${t('outOfStock') || translateData('Out of Stock')}`}
                      </p>

                      <div style={s.actionRow}>
                        <button
                          style={{ ...s.cartBtn, opacity: inStock ? 1 : 0.5 }}
                          disabled={!inStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(pId, 1);
                            if (onRemoveFavorite) {
                              onRemoveFavorite(pId);
                            }
                          }}
                        >
                          <ShoppingCart style={{ width: 12, height: 12 }} />
                          {t('addToCart') || translateData('Add to Cart')}
                        </button>
                        <button
                          style={s.removeBtn}
                          onClick={() => onRemoveFavorite(pId)}
                          title="Remove from wishlist"
                        >
                          <Trash2 style={{ width: 13, height: 13, color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {favorites.length > 0 && (
          <div style={s.footer}>
            <p style={s.footerText}>
              <Heart style={{ width: 12, height: 12, fill: '#f43f5e' }} />
              {favorites.length} product{favorites.length !== 1 ? 's' : ''} saved in your wishlist
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FavoritesDrawer;

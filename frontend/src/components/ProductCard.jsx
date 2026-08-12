import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ShieldAlert, CheckCircle2, AlertCircle, Heart, Star, Plus, Minus, Trash2 } from 'lucide-react';
import ProductImage from './ProductImage';
import { resolveBrandName } from '../utils/brandUtils';
import { useLanguage } from '../context/LanguageContext';

const ProductCard = React.memo(({
  product,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onBuyNow,
  onOpenDetails,
  onToggleFavorite,
  isFavorite = false,
  isInCart = false,
  cartQuantity = 0,
  compact = false,
  index = 0,
}) => {
  if (!product) return null;
  const { t, translateData } = useLanguage();

  const inStock = Boolean(product.stock && product.stock > 0);
  const [isAddedLocal, setIsAddedLocal] = useState(false);
  const [qty, setQty] = useState(cartQuantity || (isInCart ? 1 : 0));
  const navigate = useNavigate();

  useEffect(() => {
    if (cartQuantity > 0) {
      setQty(cartQuantity);
      setIsAddedLocal(true);
    } else if (isInCart) {
      setQty(prev => (prev > 0 ? prev : 1));
      setIsAddedLocal(true);
    } else {
      setQty(0);
      setIsAddedLocal(false);
    }
  }, [cartQuantity, isInCart]);

  const pId = product.productId || product.id || product._id;

  const handleCardClick = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (typeof onOpenDetails === 'function') {
      onOpenDetails(product);
    } else if (pId) {
      navigate(`/product/${pId}`);
    }
  }, [onOpenDetails, product, pId, navigate]);

  const handleCartAdd = useCallback((e) => {
    if (e) e.stopPropagation();
    setQty(1);
    setIsAddedLocal(true);
    if (onAddToCart) onAddToCart(pId, 1);
  }, [onAddToCart, pId]);

  const handleDecrease = useCallback((e) => {
    if (e) e.stopPropagation();
    const newQ = qty - 1;
    if (newQ <= 0) {
      setQty(0);
      setIsAddedLocal(false);
      if (typeof onRemoveFromCart === 'function') {
        onRemoveFromCart(pId);
      } else if (typeof onUpdateQuantity === 'function') {
        onUpdateQuantity(pId, 0);
      } else if (typeof onAddToCart === 'function') {
        onAddToCart(pId, -qty);
      }
    } else {
      setQty(newQ);
      if (typeof onUpdateQuantity === 'function') {
        onUpdateQuantity(pId, newQ);
      } else if (typeof onAddToCart === 'function') {
        onAddToCart(pId, -1);
      }
    }
  }, [qty, pId, onRemoveFromCart, onUpdateQuantity, onAddToCart]);

  const handleIncrease = useCallback((e) => {
    if (e) e.stopPropagation();
    const newQ = qty + 1;
    setQty(newQ);
    if (typeof onUpdateQuantity === 'function') {
      onUpdateQuantity(pId, newQ);
    } else if (typeof onAddToCart === 'function') {
      onAddToCart(pId, 1);
    }
  }, [qty, pId, onUpdateQuantity, onAddToCart]);

  const handleWishlist = useCallback((e) => {
    if (e) e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(pId);
  }, [onToggleFavorite, pId]);

  const brandName = resolveBrandName(product);
  const inCartActive = isInCart || isAddedLocal || qty > 0;

  return (
    <div
      className={`pcard ${compact ? 'pcard--compact' : ''} cursor-pointer`}
      onClick={handleCardClick}
    >
      {/* Rx Badge */}
      {product.prescriptionRequired && (
        <span className="pcard__rx-badge">
          <ShieldAlert className="w-2.5 h-2.5" /> Rx
        </span>
      )}

      {/* Wishlist Heart Button */}
      <button
        onClick={handleWishlist}
        title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          width: 30,
          height: 30,
          borderRadius: '50%',
          border: isFavorite ? '1.5px solid #fca5a5' : '1.5px solid #cbd5e1',
          background: isFavorite ? '#fff0f0' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
        }}
      >
        <Heart
          style={{
            width: 14,
            height: 14,
            color: isFavorite ? '#ef4444' : '#94a3b8',
            fill: isFavorite ? '#ef4444' : 'none',
            transition: 'all 0.2s ease',
          }}
        />
      </button>

      {/* Product Image */}
      <div className="pcard__image-wrap">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="pcard__image object-contain w-full h-full select-none"
          draggable="false"
        />
      </div>

      {/* Info */}
      <div className="pcard__info">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
          <p className="pcard__brand" style={{ color: '#0369a1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.7rem' }}>{brandName}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: 'auto', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', padding: '2px 7px', borderRadius: 99, border: '1px solid #fde68a', boxShadow: '0 1px 3px rgba(245, 158, 11, 0.12)' }}>
            <Star style={{ width: 12, height: 12, color: '#f59e0b', fill: '#f59e0b' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#b45309' }}>
              {Number(product.rating || 4.5).toFixed(1)}
            </span>
          </div>
        </div>
        <h3 className="pcard__name" style={{ color: '#0f172a', fontWeight: 800 }}>{translateData(product.name)}</h3>
        <p className="pcard__desc" style={{ color: '#64748b' }}>{translateData(product.description)}</p>
      </div>

      {/* Price + Stock */}
      <div className="pcard__price-row" style={{ marginTop: '0.4rem' }}>
        <span className="pcard__price" style={{ color: '#0f766e', fontSize: '1.12rem', fontWeight: 900, letterSpacing: '-0.02em' }}>₹{Number(product.price).toLocaleString('en-IN')}</span>
        {inStock
          ? <span className="pcard__stock pcard__stock--in" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', color: '#047857', border: '1px solid #6ee7b7', fontWeight: 800, padding: '2px 8px', borderRadius: '0.4rem', fontSize: '0.7rem' }}><CheckCircle2 className="w-3 h-3" /> {t('inStock')}</span>
          : <span className="pcard__stock pcard__stock--out" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', color: '#dc2626', border: '1px solid #fca5a5', fontWeight: 800, padding: '2px 8px', borderRadius: '0.4rem', fontSize: '0.7rem' }}><AlertCircle className="w-3 h-3" /> {t('outOfStock')}</span>
        }
      </div>

      {/* Actions: Separate Buttons for Add to Cart / Stepper / Buy Now / Separate Remove */}
      <div className="pcard__actions" style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
        {inCartActive && qty > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', width: '100%' }}>
            {/* Stepper Pill (- Count +) */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                padding: '0.3rem 0.4rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #ff4757 0%, #e11d48 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 3px 10px rgba(255, 71, 87, 0.32)',
              }}
            >
              <button
                onClick={handleDecrease}
                title="Decrease quantity"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '0.45rem',
                  background: 'rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Minus style={{ width: 14, height: 14 }} />
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>{qty}</span>
                <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.88)', textTransform: 'uppercase' }}>in cart</span>
              </div>

              <button
                onClick={handleIncrease}
                disabled={!inStock}
                title="Increase quantity"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '0.45rem',
                  background: 'rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* Separate Distinct Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQty(0);
                setIsAddedLocal(false);
                if (typeof onRemoveFromCart === 'function') {
                  onRemoveFromCart(pId);
                } else if (typeof onUpdateQuantity === 'function') {
                  onUpdateQuantity(pId, 0);
                }
              }}
              title="Remove from Cart"
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '0.75rem',
                background: '#fef2f2',
                color: '#dc2626',
                border: '1.5px solid #fca5a5',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.12)',
                transition: 'all 0.2s ease'
              }}
            >
              <Trash2 style={{ width: 14, height: 14 }} />
              <span>Remove</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', width: '100%' }}>
            <button
              disabled={!inStock}
              onClick={handleCartAdd}
              style={{
                flex: 1,
                padding: '0.68rem 0.5rem',
                borderRadius: '0.75rem',
                fontWeight: 800,
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                cursor: inStock ? 'pointer' : 'not-allowed',
                background: 'linear-gradient(135deg, #ff4757 0%, #e11d48 100%)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 3px 10px rgba(255, 71, 87, 0.32)',
              }}
            >
              <ShoppingCart style={{ width: 15, height: 15 }} />
              <span>{t('addToCart')}</span>
            </button>

            {typeof onBuyNow === 'function' && (
              <button
                disabled={!inStock}
                onClick={handleBuy}
                style={{
                  padding: '0.68rem 0.75rem',
                  borderRadius: '0.75rem',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  cursor: inStock ? 'pointer' : 'not-allowed',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  boxShadow: '0 3px 10px rgba(37, 99, 235, 0.28)',
                }}
              >
                <span>⚡ Buy</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export { ProductCard };
export default ProductCard;

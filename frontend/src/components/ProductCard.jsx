import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, CreditCard, ShieldAlert, CheckCircle2, AlertCircle, Heart, Star, ChevronRight } from 'lucide-react';
import ProductImage from './ProductImage';
import { resolveBrandName } from '../utils/brandUtils';
import { useLanguage } from '../context/LanguageContext';

const ProductCard = React.memo(({
  product,
  onAddToCart,
  onBuyNow,
  onOpenDetails,
  onToggleFavorite,
  isFavorite = false,
  isInCart = false,
  compact = false,
  index = 0,
}) => {
  if (!product) return null;
  const { t, translateData } = useLanguage();

  const inStock = Boolean(product.stock && product.stock > 0);
  const [imgError, setImgError] = useState(false);
  const [isAddedLocal, setIsAddedLocal] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const targetId = product?.productId || product?.id;
    if (typeof onOpenDetails === 'function') {
      onOpenDetails(product);
    } else if (targetId) {
      navigate(`/product/${targetId}`);
    }
  }, [onOpenDetails, product, navigate]);

  const handleCart = useCallback((e) => {
    e.stopPropagation();
    setIsAddedLocal(true);
    if (onAddToCart) onAddToCart(product.productId, 1);
  }, [onAddToCart, product.productId]);

  const handleBuy = useCallback((e) => {
    e.stopPropagation();
    onBuyNow(product);
  }, [onBuyNow, product]);

  const handleWishlist = useCallback((e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(product.productId);
  }, [onToggleFavorite, product.productId]);

  const brandName = resolveBrandName(product);
  const inCartActive = isInCart || isAddedLocal;

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

      {/* Wishlist Heart Button — top right */}
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

      {/* Actions: Add to Cart */}
      <div className="pcard__actions" style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
        <button
          disabled={!inStock}
          onClick={handleCart}
          className="pcard__btn"
          style={{
            width: '100%',
            padding: '0.72rem',
            borderRadius: '0.8rem',
            fontWeight: 800,
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            cursor: inStock ? 'pointer' : 'not-allowed',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            background: inCartActive
              ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
              : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#ffffff',
            border: 'none',
            boxShadow: inCartActive
              ? '0 4px 16px rgba(16, 185, 129, 0.38)'
              : '0 4px 16px rgba(5, 150, 105, 0.32)',
          }}
        >
          {inCartActive ? (
            <>
              <CheckCircle2 style={{ width: 17, height: 17, color: '#ffffff' }} />
              <span>✓ {t('addedToCart')}</span>
            </>
          ) : (
            <>
              <ShoppingCart style={{ width: 16, height: 16 }} />
              <span>{t('addToCart')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export { ProductCard };
export default ProductCard;

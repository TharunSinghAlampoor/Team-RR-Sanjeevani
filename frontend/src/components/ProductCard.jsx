import React, { useState, useCallback } from 'react';
import { ShoppingCart, CreditCard, ShieldAlert, CheckCircle2, AlertCircle, Heart, Star, ChevronRight } from 'lucide-react';
import ProductImage from './ProductImage';
import { resolveBrandName } from '../utils/brandUtils';

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
  const inStock = product.stock > 0;
  const [imgError, setImgError] = useState(false);
  const [isAddedLocal, setIsAddedLocal] = useState(false);

  const handleCardClick = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (typeof onOpenDetails === 'function' && product) {
      onOpenDetails(product);
    }
  }, [onOpenDetails, product]);

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
          <p className="pcard__brand" style={{ color: '#047857', fontWeight: 800 }}>{brandName}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto', background: '#fffbeb', padding: '1px 6px', borderRadius: 99, border: '1px solid #fef3c7' }}>
            <Star style={{ width: 12, height: 12, color: '#f59e0b', fill: '#f59e0b' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#d97706' }}>
              {Number(product.rating || 4.5).toFixed(1)}
            </span>
          </div>
        </div>
        <h3 className="pcard__name">{product.name}</h3>
        <p className="pcard__desc">{product.description}</p>
      </div>

      {/* Price + Stock */}
      <div className="pcard__price-row" style={{ marginTop: '0.35rem' }}>
        <span className="pcard__price" style={{ color: '#047857', fontSize: '1.08rem', fontWeight: 900 }}>₹{Number(product.price).toLocaleString('en-IN')}</span>
        {inStock
          ? <span className="pcard__stock pcard__stock--in" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}><CheckCircle2 className="w-3 h-3" /> In Stock</span>
          : <span className="pcard__stock pcard__stock--out" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }}><AlertCircle className="w-3 h-3" /> Out of Stock</span>
        }
      </div>

      {/* Actions: Add to Cart Only */}
      <div className="pcard__actions" style={{ marginTop: '0.75rem' }}>
        <button
          disabled={!inStock}
          onClick={handleCart}
          className="pcard__btn"
          style={{
            width: '100%',
            padding: '0.65rem',
            borderRadius: '0.75rem',
            fontWeight: 900,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            cursor: inStock ? 'pointer' : 'not-allowed',
            transition: 'all 0.25s ease',
            background: inCartActive
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : '#f0fdfa',
            color: inCartActive ? '#ffffff' : '#0f766e',
            border: inCartActive ? 'none' : '1.5px solid #99f6e4',
            boxShadow: inCartActive
              ? '0 4px 14px rgba(16, 185, 129, 0.4)'
              : '0 2px 6px rgba(15, 118, 110, 0.08)',
          }}
        >
          {inCartActive ? (
            <>
              <CheckCircle2 style={{ width: 17, height: 17, color: '#ffffff' }} />
              <span>✓ Added in Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart style={{ width: 16, height: 16 }} />
              <span>Add to Cart</span>
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

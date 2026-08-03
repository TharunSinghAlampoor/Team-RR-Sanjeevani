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
  compact = false,
  index = 0,
}) => {
  const inStock = product.stock > 0;
  const [imgError, setImgError] = useState(false);

  const handleCardClick = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (typeof onOpenDetails === 'function' && product) {
      onOpenDetails(product);
    }
  }, [onOpenDetails, product]);
  const handleCart = useCallback((e) => {
    e.stopPropagation();
    onAddToCart(product.productId, 1);
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
          border: isFavorite ? '1.5px solid #fca5a5' : '1.5px solid #e2e8f0',
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
          src={(!imgError && product.imageUrl) ? product.imageUrl : 'https://placehold.co/260x260/f0fdf4/0f766e?text=No+Image'}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="pcard__image object-contain w-full h-full select-none"
          draggable="false"
          onError={() => setImgError(true)}
        />
      </div>

      {/* Info */}
      <div className="pcard__info">
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '0.4rem' }}>
          <p className="pcard__brand">{brandName}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1px', marginLeft: 'auto' }}>
            <Star style={{ width: 12, height: 12, color: '#f59e0b', fill: '#f59e0b' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706' }}>
              {Number(product.rating || 4.5).toFixed(1)}
            </span>
          </div>
        </div>
        <h3 className="pcard__name">{product.name}</h3>
        <p className="pcard__desc">{product.description}</p>
      </div>

      {/* Price + Stock */}
      <div className="pcard__price-row">
        <span className="pcard__price">₹{Number(product.price).toLocaleString('en-IN')}</span>
        {inStock
          ? <span className="pcard__stock pcard__stock--in"><CheckCircle2 className="w-2.5 h-2.5" /> In Stock</span>
          : <span className="pcard__stock pcard__stock--out"><AlertCircle className="w-2.5 h-2.5" /> Out of Stock</span>
        }
      </div>

      {/* Actions */}
      <div className="pcard__actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.75rem' }}>
        <button
          disabled={!inStock}
          onClick={handleCart}
          className="pcard__btn pcard__btn--cart"
          style={{ width: '100%' }}
        >
          <ShoppingCart className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Add to Cart</span>
        </button>

        <button
          type="button"
          onClick={handleCardClick}
          style={{
            width: '100%', padding: '0.45rem', borderRadius: '0.55rem',
            border: '1.5px solid #cbd5e1', background: '#f8fafc',
            color: '#0f172a', fontWeight: 800, fontSize: '0.78rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
            transition: 'all 0.2s ease',
          }}
        >
          <span>See Details</span>
          <ChevronRight style={{ width: 13, height: 13, color: '#0284c7' }} />
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export { ProductCard };
export default ProductCard;

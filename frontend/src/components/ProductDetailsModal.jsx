import React, { useState } from 'react';
import { formatCategoryName } from './CategoryCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, ShoppingCart, Zap, Heart, ShieldAlert,
  Truck, Shield, RotateCcw, Package, ChevronLeft, Share2
} from 'lucide-react';
import ProductImage from './ProductImage';
import ShareModal from './ShareModal';
import { resolveBrandName } from '../utils/brandUtils';

export const ProductDetailsModal = ({
  product,
  relatedProducts = [],
  isFavorite = false,
  onClose,
  onToggleFavorite,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  if (!product) return null;

  const inStock = product.stock > 0;
  const rating = product.rating || 4.5;
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  const brandName = resolveBrandName(product);

  const handleShare = async () => {
    const imageUrl = product.imageUrl || '';
    const purchaseUrl = `${window.location.origin}/dashboard?productId=${product.productId}`;
    const formattedPrice = `₹${Number(product.price).toLocaleString('en-IN')}`;

    const shareTitle = `${product.name} - Sanjeevani Medical Care`;
    const shareText = `Check out ${product.name} on Sanjeevani Care!\n\n🏷️ Brand: ${brandName}\n💰 Price: ${formattedPrice}\n📝 ${product.description || ''}\n\n🔗 Purchase Link: ${purchaseUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: purchaseUrl,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    setIsShareOpen(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="product-detail-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        <motion.div
          className="product-detail-card"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top bar */}
          <div className="pd-topbar">
            <button onClick={onClose} className="pd-back-btn">
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Products</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="pd-close-btn text-emerald-600 hover:bg-emerald-50"
                title="Share Product"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="pd-close-btn" title="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="pd-content">
            {/* Left: Image */}
            <div className="pd-image-section">
              <div className="pd-image-container">
                {product.prescriptionRequired && (
                  <span className="pd-rx-badge">
                    <ShieldAlert className="w-3.5 h-3.5" /> Rx Required
                  </span>
                )}
                <ProductImage
                  src={(!imgError && product.imageUrl)
                    ? product.imageUrl
                    : 'https://placehold.co/400x400/f0fdf4/0f766e?text=No+Image'}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="pd-image object-contain w-full h-full select-none"
                  draggable="false"
                  onError={() => setImgError(true)}
                />
              </div>
            </div>

            {/* Right: Details */}
            <div className="pd-details">
              {/* Category badge */}
              <div className="pd-badges">
                <span className="pd-category-badge">
                  {formatCategoryName(product.categoryName)}
                </span>
              </div>

              {/* Product name */}
              <h1 className="pd-name">{product.name}</h1>

              {/* Brand */}
              <p className="pd-brand">by {brandName}</p>

              {/* Rating */}
              <div className="pd-rating">
                <div className="pd-stars">
                  {[1, 2, 3, 4, 5].map(i => {
                    const isFull = i <= fullStars;
                    const isHalf = i === fullStars + 1 && hasHalf;
                    return (
                      <Star
                        key={i}
                        style={{
                          width: 18,
                          height: 18,
                          color: isFull ? '#f59e0b' : isHalf ? '#fbbf24' : '#cbd5e1',
                          fill: isFull ? '#f59e0b' : isHalf ? '#fde047' : '#f1f5f9',
                          marginRight: 2,
                        }}
                      />
                    );
                  })}
                </div>
                <span className="pd-rating-value">{rating.toFixed(1)}</span>
                <span className="pd-rating-count">(Customer Ratings)</span>
              </div>

              {/* Price */}
              <div className="pd-price-section">
                <span className="pd-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                <span className="pd-price-label">Inclusive of all taxes</span>
              </div>

              {/* Description */}
              <div className="pd-description">
                <h3 className="pd-section-title">Description</h3>
                <p className="pd-desc-text">{product.description}</p>
              </div>

              {/* Product Info */}
              <div className="pd-info-grid">
                <div className="pd-info-item">
                  <Package className="w-4 h-4" style={{ color: '#0f766e' }} />
                  <div>
                    <span className="pd-info-label">Brand</span>
                    <span className="pd-info-value">{brandName}</span>
                  </div>
                </div>
                <div className="pd-info-item">
                  <Truck className="w-4 h-4" style={{ color: '#2563eb' }} />
                  <div>
                    <span className="pd-info-label">Delivery</span>
                    <span className="pd-info-value">Fast Delivery</span>
                  </div>
                </div>
                <div className="pd-info-item">
                  <Shield className="w-4 h-4" style={{ color: '#7c3aed' }} />
                  <div>
                    <span className="pd-info-label">Authentic</span>
                    <span className="pd-info-value">100% Genuine</span>
                  </div>
                </div>
                <div className="pd-info-item">
                  <RotateCcw className="w-4 h-4" style={{ color: '#ea580c' }} />
                  <div>
                    <span className="pd-info-label">Returns</span>
                    <span className="pd-info-value">Easy Returns</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pd-actions">
                <button
                  onClick={() => onToggleFavorite(product.productId)}
                  className={`pd-btn pd-btn--wish ${isFavorite ? 'pd-btn--wish-active' : ''}`}
                  title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>

                <button
                  disabled={!inStock}
                  onClick={() => onAddToCart(product.productId, 1)}
                  className="pd-btn pd-btn--cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  disabled={!inStock}
                  onClick={() => onBuyNow(product)}
                  className="pd-btn pd-btn--buy"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pd-related">
              <h3 className="pd-section-title">Related Products</h3>
              <div className="pd-related-grid">
                {relatedProducts.slice(0, 4).map((rel) => (
                  <motion.div
                    key={rel.productId}
                    onClick={() => onSelectProduct(rel)}
                    className="pd-related-card"
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="pd-related-img-wrap">
                      <ProductImage src={rel.imageUrl} alt={rel.name} className="pd-related-img object-contain w-full h-full" />
                    </div>
                    <p className="pd-related-name">{rel.name}</p>
                    <p className="pd-related-price">₹{Number(rel.price).toLocaleString('en-IN')}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          product={product}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductDetailsModal;

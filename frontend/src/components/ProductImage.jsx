import React, { useState, useEffect } from 'react';
import { getTransparentProductImage, getCachedTransparentImage } from '../utils/imageBackgroundRemover';

/**
 * ProductImage Component
 * Automatically processes product images to remove solid white/light backgrounds,
 * rendering crisp, transparent PNG images that blend naturally into dark & light themes.
 * Caches transparent versions permanently in IndexedDB for 0ms loading on subsequent requests.
 */
export const ProductImage = ({
  src,
  alt = 'Product image',
  className = '',
  loading = 'lazy',
  decoding = 'async',
  draggable = false,
  onError,
  fallbackSrc = 'https://placehold.co/300x300/10b981/ffffff?text=Product+Image',
  ...props
}) => {
  const [displaySrc, setDisplaySrc] = useState(() => getCachedTransparentImage(src) || src);
  const [isProcessing, setIsProcessing] = useState(() => !getCachedTransparentImage(src) && Boolean(src));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;

    // Check if already cached in memory
    const cached = getCachedTransparentImage(src);
    if (cached) {
      setDisplaySrc(cached);
      setIsProcessing(false);
      return;
    }

    let isMounted = true;
    setIsProcessing(true);

    getTransparentProductImage(src)
      .then((transparentUrl) => {
        if (isMounted) {
          setDisplaySrc(transparentUrl);
          setIsProcessing(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDisplaySrc(src);
          setIsProcessing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  const handleImageError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  const finalSrc = hasError || !displaySrc ? fallbackSrc : displaySrc;

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      draggable={draggable}
      onError={handleImageError}
      className={`${className} transition-opacity duration-200 ${isProcessing ? 'opacity-80' : 'opacity-100'}`}
      {...props}
    />
  );
};

export default React.memo(ProductImage);

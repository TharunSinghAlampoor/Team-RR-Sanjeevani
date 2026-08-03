import React, { useState, useEffect } from 'react';
import { getTransparentProductImage, getCachedTransparentImage } from '../utils/imageBackgroundRemover';

/**
 * ProductImage Component
 * Automatically processes product images to remove solid white/light backgrounds,
 * rendering crisp, transparent PNG images that blend naturally into dark & light themes.
 * Caches transparent versions permanently in IndexedDB for 0ms loading on subsequent requests.
 */
const DEFAULT_FALLBACKS = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
];

const getCleanUrl = (url) => {
  if (!url) return '';
  try {
    return encodeURI(url.trim());
  } catch (e) {
    return url;
  }
};

export const ProductImage = ({
  src,
  alt = 'Product image',
  className = '',
  loading = 'lazy',
  decoding = 'async',
  draggable = false,
  onError,
  fallbackSrc = DEFAULT_FALLBACKS[0],
  ...props
}) => {
  const safeSrc = getCleanUrl(src);
  const [displaySrc, setDisplaySrc] = useState(() => getCachedTransparentImage(safeSrc) || safeSrc);
  const [isProcessing, setIsProcessing] = useState(() => !getCachedTransparentImage(safeSrc) && Boolean(safeSrc));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!safeSrc) return;

    // Check if already cached in memory
    const cached = getCachedTransparentImage(safeSrc);
    if (cached) {
      setDisplaySrc(cached);
      setIsProcessing(false);
      return;
    }

    let isMounted = true;
    setIsProcessing(true);

    getTransparentProductImage(safeSrc)
      .then((transparentUrl) => {
        if (isMounted) {
          setDisplaySrc(transparentUrl);
          setIsProcessing(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDisplaySrc(safeSrc);
          setIsProcessing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [safeSrc]);

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

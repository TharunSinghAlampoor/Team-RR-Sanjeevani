import React, { useState, useEffect } from 'react';
import { getTransparentProductImage, getCachedTransparentImage } from '../utils/imageBackgroundRemover';

/**
 * ProductImage Component
 * Automatically processes product images to remove solid white/light backgrounds,
 * rendering crisp, transparent PNG images that blend naturally into dark & light themes.
 * Caches transparent versions permanently in IndexedDB for 0ms loading on subsequent requests.
 */
// Intelligent image mapping based on product keywords and category types
const PRODUCT_IMAGE_FALLBACKS = {
  skincare: [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1608248597266-07f1f97c0c16?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
  ],
  baby: [
    'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=80',
  ],
  devices: [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=500&auto=format&fit=crop&q=80',
  ],
  wellness: [
    'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=80',
  ],
  pharma: [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=80',
  ],
};

const getCategoryFallbackImage = (title = '') => {
  const t = String(title).toLowerCase();
  if (
    t.includes('serum') || t.includes('cream') || t.includes('wash') ||
    t.includes('lotion') || t.includes('balm') || t.includes('gel') ||
    t.includes('spf') || t.includes('sunscreen') || t.includes('retinol') ||
    t.includes('niacinamide') || t.includes('hyaluronic') || t.includes('dermo') ||
    t.includes('skin') || t.includes('cleanser') || t.includes('exfoliating')
  ) {
    const list = PRODUCT_IMAGE_FALLBACKS.skincare;
    return list[Math.abs(hashString(t)) % list.length];
  }

  if (
    t.includes('baby') || t.includes('pediatric') || t.includes('diaper') ||
    t.includes('wipes') || t.includes('formula') || t.includes('pacifier') ||
    t.includes('infant') || t.includes('child')
  ) {
    const list = PRODUCT_IMAGE_FALLBACKS.baby;
    return list[Math.abs(hashString(t)) % list.length];
  }

  if (
    t.includes('monitor') || t.includes('device') || t.includes('oximeter') ||
    t.includes('thermometer') || t.includes('bp') || t.includes('stethoscope') ||
    t.includes('mask') || t.includes('gauge')
  ) {
    const list = PRODUCT_IMAGE_FALLBACKS.devices;
    return list[Math.abs(hashString(t)) % list.length];
  }

  if (
    t.includes('supplement') || t.includes('vitamin') || t.includes('protein') ||
    t.includes('zinc') || t.includes('calcium') || t.includes('probiotic') ||
    t.includes('ors') || t.includes('gummies') || t.includes('nutrition')
  ) {
    const list = PRODUCT_IMAGE_FALLBACKS.wellness;
    return list[Math.abs(hashString(t)) % list.length];
  }

  const list = PRODUCT_IMAGE_FALLBACKS.pharma;
  return list[Math.abs(hashString(t)) % list.length];
};

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

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
  fallbackSrc,
  ...props
}) => {
  const safeSrc = getCleanUrl(src);
  const resolvedFallback = fallbackSrc || getCategoryFallbackImage(alt);
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

  const finalSrc = hasError || !displaySrc ? resolvedFallback : displaySrc;

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

import React, { useState } from 'react';

const getCleanUrl = (url) => {
  if (!url) return '';
  let clean = url.trim();
  try {
    clean = decodeURIComponent(clean);
  } catch (e) {}
  try {
    return encodeURI(clean);
  } catch (e) {
    return clean;
  }
};

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';

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
  const [hasError, setHasError] = useState(false);

  const handleImageError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  const finalSrc = (hasError || !safeSrc) ? (fallbackSrc || DEFAULT_FALLBACK) : safeSrc;

  const mergedStyle = {
    mixBlendMode: 'multiply',
    ...(props.style || {})
  };

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      draggable={draggable}
      onError={(e) => {
        if (!hasError) {
          setHasError(true);
          e.target.src = DEFAULT_FALLBACK;
        }
      }}
      className={className}
      style={mergedStyle}
      {...props}
    />
  );
};

export default React.memo(ProductImage);

import React, { useState } from 'react';

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
  const [hasError, setHasError] = useState(false);

  const handleImageError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  const finalSrc = hasError || !safeSrc ? (fallbackSrc || safeSrc) : safeSrc;

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      draggable={draggable}
      onError={handleImageError}
      className={className}
      {...props}
    />
  );
};

export default React.memo(ProductImage);

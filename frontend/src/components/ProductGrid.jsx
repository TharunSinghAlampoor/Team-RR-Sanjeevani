import React from 'react';
import ProductCard from './ProductCard';
import BrandLoader from './BrandLoader';

export const ProductGrid = ({
  products = [],
  loading = false,
  favoritesMap = {},
  onToggleFavorite,
  onAddToCart,
  onBuyNow,
  onOpenDetails,
}) => {
  if (loading) {
    return <BrandLoader fullScreen={false} message="Loading Healthcare Essentials..." />;
  }

  if (products.length === 0) {
    return (
      <div className="empty-products py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
          🔍
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Products Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Try clearing your search query or selecting a different medical category filter.
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.productId}
          product={product}
          isFavorite={!!favoritesMap[product.productId]}
          onToggleFavorite={onToggleFavorite}
          onAddToCart={onAddToCart}
          onBuyNow={onBuyNow}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
};

export default ProductGrid;

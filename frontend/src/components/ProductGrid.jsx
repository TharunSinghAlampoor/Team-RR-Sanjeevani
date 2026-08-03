import React from 'react';
import ProductCard from './ProductCard';

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
    return (
      <div className="product-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="skeleton-card animate-pulse bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        ))}
      </div>
    );
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

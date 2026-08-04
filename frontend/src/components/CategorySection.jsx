import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Pill, Baby, Stethoscope, Sparkles, Activity } from 'lucide-react';
import ProductCard from './ProductCard';

import { formatCategoryName } from './CategoryCard';

export const CATEGORY_META = {
  'Prescriptions & Medicines': {
    icon: Pill,
    color: '#0F766E',
    bg: '#f0fdfa',
    gradient: 'from-teal-500 to-emerald-600',
    badgeColor: '#ccfbf1',
    badgeText: '#0f766e',
  },
  'Prescriptions & Pharmacy': {
    icon: Pill,
    color: '#0F766E',
    bg: '#f0fdfa',
    gradient: 'from-teal-500 to-emerald-600',
    badgeColor: '#ccfbf1',
    badgeText: '#0f766e',
  },
  'Medicine Prescription and General Care': {
    icon: Pill,
    color: '#0F766E',
    bg: '#f0fdfa',
    gradient: 'from-teal-500 to-emerald-600',
    badgeColor: '#ccfbf1',
    badgeText: '#0f766e',
  },
  'Nutrition & Health': {
    icon: Activity,
    color: '#2563EB',
    bg: '#eff6ff',
    gradient: 'from-blue-500 to-indigo-600',
    badgeColor: '#dbeafe',
    badgeText: '#1d4ed8',
  },
  'Nutrition & Wellness': {
    icon: Activity,
    color: '#2563EB',
    bg: '#eff6ff',
    gradient: 'from-blue-500 to-indigo-600',
    badgeColor: '#dbeafe',
    badgeText: '#1d4ed8',
  },
  'Nutrition and Health Supplements': {
    icon: Activity,
    color: '#2563EB',
    bg: '#eff6ff',
    gradient: 'from-blue-500 to-indigo-600',
    badgeColor: '#dbeafe',
    badgeText: '#1d4ed8',
  },
  'Medical Devices': {
    icon: Stethoscope,
    color: '#7c3aed',
    bg: '#f5f3ff',
    gradient: 'from-violet-500 to-purple-600',
    badgeColor: '#ede9fe',
    badgeText: '#6d28d9',
  },
  'Medical Devices & Equipment': {
    icon: Stethoscope,
    color: '#7c3aed',
    bg: '#f5f3ff',
    gradient: 'from-violet-500 to-purple-600',
    badgeColor: '#ede9fe',
    badgeText: '#6d28d9',
  },
  'Baby & Kids': {
    icon: Baby,
    color: '#db2777',
    bg: '#fdf2f8',
    gradient: 'from-pink-500 to-rose-600',
    badgeColor: '#fce7f3',
    badgeText: '#be185d',
  },
  "Baby & Kid's Essentials": {
    icon: Baby,
    color: '#db2777',
    bg: '#fdf2f8',
    gradient: 'from-pink-500 to-rose-600',
    badgeColor: '#fce7f3',
    badgeText: '#be185d',
  },
  "Kid's Essentials": {
    icon: Baby,
    color: '#db2777',
    bg: '#fdf2f8',
    gradient: 'from-pink-500 to-rose-600',
    badgeColor: '#fce7f3',
    badgeText: '#be185d',
  },
  'Skin Care': {
    icon: Sparkles,
    color: '#ea580c',
    bg: '#fff7ed',
    gradient: 'from-orange-500 to-amber-600',
    badgeColor: '#ffedd5',
    badgeText: '#c2410c',
  },
  'Skin Care & Dermocosmetics': {
    icon: Sparkles,
    color: '#ea580c',
    bg: '#fff7ed',
    gradient: 'from-orange-500 to-amber-600',
    badgeColor: '#ffedd5',
    badgeText: '#c2410c',
  },
  'Dermocosmetics (Skin Care)': {
    icon: Sparkles,
    color: '#ea580c',
    bg: '#fff7ed',
    gradient: 'from-orange-500 to-amber-600',
    badgeColor: '#ffedd5',
    badgeText: '#c2410c',
  },
};

const PREVIEW_COUNT = 5;

const SkeletonCard = ({ index }) => (
  <div className="pcard pcard--skeleton" style={{ animationDelay: `${index * 0.08}s` }}>
    <div className="pcard-skel-img" />
    <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
      <div className="pcard-skel-line" style={{ width: '45%', height: 8 }} />
      <div className="pcard-skel-line" style={{ width: '85%', height: 10 }} />
      <div className="pcard-skel-line" style={{ width: '95%', height: 8 }} />
      <div className="pcard-skel-line" style={{ width: '70%', height: 8 }} />
      <div className="pcard-skel-line" style={{ width: '50%', height: 12, marginTop: 4 }} />
      <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
        <div className="pcard-skel-line" style={{ flex: 1, height: 28 }} />
        <div className="pcard-skel-line" style={{ flex: 1, height: 28 }} />
        <div className="pcard-skel-line" style={{ flex: 1, height: 28 }} />
      </div>
    </div>
  </div>
);

export const CategorySection = ({
  category,
  products,
  loading,
  favoritesMap,
  onToggleFavorite,
  onAddToCart,
  onBuyNow,
  onOpenDetails,
}) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const meta = CATEGORY_META[category.categoryName] || CATEGORY_META[formatCategoryName(category.categoryName)] || {
    icon: Activity,
    color: '#64748b',
    bg: '#f8fafc',
    gradient: 'from-slate-400 to-slate-600',
    badgeColor: '#f1f5f9',
    badgeText: '#475569',
  };
  const Icon = meta.icon;

  const displayProducts = expanded ? products : products.slice(0, PREVIEW_COUNT);
  const hasMore = products.length > PREVIEW_COUNT;

  return (
    <section className="cat-section">
      {/* Category Header */}
      <div className="cat-section__header" style={{ borderLeftColor: meta.color }}>
        <div className="cat-section__title-group">
          <div
            className="cat-section__icon-wrap"
            style={{ background: `linear-gradient(135deg, ${meta.color}22, ${meta.color}11)`, border: `1.5px solid ${meta.color}33` }}
          >
            <Icon style={{ color: meta.color, width: 22, height: 22 }} />
          </div>
          <div>
            <h2 className="cat-section__title">{formatCategoryName(category.categoryName)}</h2>
          </div>
        </div>

        <motion.button
          className="cat-section__toggle"
          style={{ color: meta.color, borderColor: `${meta.color}40`, background: meta.bg }}
          onClick={() => navigate(`/category/${category.categoryId || category.categoryName}`)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <ChevronRight className="w-4 h-4" />
          <span>See All</span>
        </motion.button>
      </div>

      {/* Divider */}
      <div className="cat-section__divider" style={{ background: `linear-gradient(90deg, ${meta.color}40, transparent)` }} />

      {/* Product Grid */}
      <div className="cat-section__grid">
        {loading
          ? Array.from({ length: PREVIEW_COUNT }).map((_, i) => <SkeletonCard key={i} index={i} />)
          : displayProducts.map((product, i) => (
              <ProductCard
                key={product.productId}
                product={product}
                index={i}
                isFavorite={!!favoritesMap[product.productId]}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                onOpenDetails={onOpenDetails}
              />
            ))
        }
      </div>

      {/* No Products */}
      <AnimatePresence>
        {!loading && products.length === 0 && (
          <motion.div
            className="cat-section__empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Icon style={{ color: meta.color, width: 44, height: 44, opacity: 0.4 }} />
            <p>No products found in this category.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default React.memo(CategorySection);

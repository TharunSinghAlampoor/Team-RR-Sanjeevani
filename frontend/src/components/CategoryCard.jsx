import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Pill, Baby, Stethoscope, Sparkles, Activity } from 'lucide-react';

export const formatCategoryName = (name) => {
  if (!name) return '';
  const str = String(name);
  if (str.includes('Medicine Prescription') || str.includes('Prescriptions')) return 'Prescriptions & Medicines';
  if (str.includes('Nutrition') || str.includes('Health Supplements') || str.includes('Wellness')) return 'Nutrition & Health';
  if (str.includes('Medical Devices') || str.includes('Equipment')) return 'Medical Devices';
  if (str.includes('Baby') || str.includes('Pediatric') || str.includes('Kid')) return 'Baby & Kids';
  if (str.includes('Dermocosmetics') || str.includes('Skin')) return 'Skin Care';
  return str;
};

const ICON_MAP = {
  'Prescriptions & Medicines':              { icon: Pill, color: '#0F766E', bg: 'transparent', ring: '#99f6e4' },
  'Prescriptions & Pharmacy':               { icon: Pill, color: '#0F766E', bg: 'transparent', ring: '#99f6e4' },
  'Medicine Prescription and General Care': { icon: Pill, color: '#0F766E', bg: 'transparent', ring: '#99f6e4' },
  'Nutrition & Health':                     { icon: Activity, color: '#2563EB', bg: 'transparent', ring: '#93c5fd' },
  'Nutrition & Wellness':                   { icon: Activity, color: '#2563EB', bg: 'transparent', ring: '#93c5fd' },
  'Nutrition and Health Supplements':       { icon: Activity, color: '#2563EB', bg: 'transparent', ring: '#93c5fd' },
  'Medical Devices':                        { icon: Stethoscope, color: '#7c3aed', bg: 'transparent', ring: '#c4b5fd' },
  'Medical Devices & Equipment':            { icon: Stethoscope, color: '#7c3aed', bg: 'transparent', ring: '#c4b5fd' },
  'Baby & Kids':                            { icon: Baby, color: '#db2777', bg: 'transparent', ring: '#f9a8d4' },
  "Baby & Kid's Essentials":                { icon: Baby, color: '#db2777', bg: 'transparent', ring: '#f9a8d4' },
  "Kid's Essentials":                       { icon: Baby, color: '#db2777', bg: 'transparent', ring: '#f9a8d4' },
  'Skin Care':                              { icon: Sparkles, color: '#ea580c', bg: 'transparent', ring: '#fdba74' },
  'Skin Care & Dermocosmetics':             { icon: Sparkles, color: '#ea580c', bg: 'transparent', ring: '#fdba74' },
  'Dermocosmetics (Skin Care)':             { icon: Sparkles, color: '#ea580c', bg: 'transparent', ring: '#fdba74' },
};

export const CategoryCard = ({ category, isSelected, onClick }) => {
  const meta = ICON_MAP[category.categoryName] || ICON_MAP[formatCategoryName(category.categoryName)] || {
    icon: Layers, color: '#64748b', bg: 'transparent', ring: '#cbd5e1',
  };
  const Icon = meta.icon;

  return (
    <motion.div
      onClick={onClick}
      className={`cat-hero-card ${isSelected ? 'cat-hero-card--active' : ''}`}
      style={{
        '--card-color': meta.color,
        '--card-bg': meta.bg,
        '--card-ring': meta.ring,
      }}
      whileHover={{ y: -6, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Icon Circle */}
      <div className="cat-hero-card__icon-wrap">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.categoryName}
            className="cat-hero-card__img"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className="cat-hero-card__icon-fallback" style={{ display: category.imageUrl ? 'none' : 'flex' }}>
          <Icon style={{ color: meta.color, width: 28, height: 28 }} />
        </div>
      </div>

      {/* Name */}
      <p className="cat-hero-card__name">{formatCategoryName(category.categoryName)}</p>

      {/* Active indicator */}
      {isSelected && (
        <motion.div
          className="cat-hero-card__active-dot"
          layoutId="activeCatDot"
          style={{ background: meta.color }}
        />
      )}
    </motion.div>
  );
};

export default React.memo(CategoryCard);

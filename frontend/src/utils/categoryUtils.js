export function formatCategoryName(rawName) {
  if (!rawName) return 'Healthcare Category';
  const name = String(rawName).trim();
  const lower = name.toLowerCase();

  if (lower.includes('baby') || lower.includes('pediatric') || lower.includes("kid's") || lower.includes('kid')) {
    return 'Baby & Kids';
  }
  if (lower.includes('dermo') || lower.includes('skin')) {
    return 'Skin Care';
  }
  if (lower.includes('device') || lower.includes('equipment')) {
    return 'Medical Devices';
  }
  if (lower.includes('nutrition') || lower.includes('supplement') || lower.includes('health')) {
    return 'Nutrition & Health';
  }
  if (lower.includes('medicine') || lower.includes('prescription') || lower.includes('pharmacy')) {
    return 'Prescriptions & Pharmacy';
  }
  return name;
}

export function toCategorySlug(rawCategory) {
  if (!rawCategory) return 'all-products';
  let name = typeof rawCategory === 'object'
    ? (rawCategory.categoryName || rawCategory.name || String(rawCategory.categoryId || ''))
    : String(rawCategory || '');

  const canonical = formatCategoryName(name);
  const lower = canonical.toLowerCase();

  if (lower.includes('skin')) return 'skin-care';
  if (lower.includes('prescription') || lower.includes('pharmacy')) return 'prescriptions-pharmacy';
  if (lower.includes('nutrition') || lower.includes('health')) return 'nutrition-health';
  if (lower.includes('device')) return 'medical-devices';
  if (lower.includes('baby') || lower.includes('kid')) return 'baby-kids';

  return lower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'healthcare';
}

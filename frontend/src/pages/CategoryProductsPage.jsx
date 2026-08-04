import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Filter, SlidersHorizontal, Package, CheckCircle2,
  ChevronRight, Sparkles, LayoutGrid, Heart, ShoppingBag, ArrowUpDown
} from 'lucide-react';

import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import DashboardFooter from '../components/DashboardFooter';
import CartDrawer from '../components/CartDrawer';
import FavoritesDrawer from '../components/FavoritesDrawer';
import OrdersModal from '../components/OrdersModal';
import ProductDetailsModal from '../components/ProductDetailsModal';
import CheckoutModal from '../components/CheckoutModal';
import BuyNowModal from '../components/BuyNowModal';
import BrandLoader from '../components/BrandLoader';
import ToastNotification from '../components/ToastNotification';
import { useAuth } from '../context/AuthContext';
import shopService from '../api/shopService';
import { formatCategoryName, toCategorySlug } from '../utils/categoryUtils';

const API_BASE = 'http://localhost:8080/api';

const CATEGORY_META = {
  1: { name: 'Prescriptions & Pharmacy', icon: '💊', desc: 'Authentic prescription medicines, antibiotics, cardiac & healthcare treatments.', color: '#059669', bgGrad: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)' },
  2: { name: 'Nutrition & Health', icon: '🥗', desc: 'Daily vitamins, protein supplements, mineral boosters & wellness drinks.', color: '#0d9488', bgGrad: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)' },
  3: { name: 'Medical Devices', icon: '🩺', desc: 'Certified BP monitors, oximeters, thermometers, nebulizers & surgical equipment.', color: '#2563eb', bgGrad: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' },
  4: { name: "Baby & Kids", icon: '👶', desc: 'Gentle baby skincare, diapers, wipes, pediatric nutrition & infant care.', color: '#ec4899', bgGrad: 'linear-gradient(135deg, #831843 0%, #db2777 100%)' },
  5: { name: 'Skin Care', icon: '✨', desc: 'Dermatologist-tested face washes, hydration serums, sunscreens & lotions.', color: '#7c3aed', bgGrad: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)' },
};



export function CategoryProductsPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Cart, Favorites & Drawers state
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  // Reset drawers & pagination on route/filter change
  useEffect(() => {
    setIsFavoritesOpen(false);
    setIsCartOpen(false);
    setIsOrdersOpen(false);
    setSearchQuery('');
    setCurrentPage(1);
  }, [categoryId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, inStockOnly]);

  // Fetch products & categories
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      shopService.getProducts({}),
      shopService.getCategories(),
    ])
      .then(([prodsRes, catsRes]) => {
        if (isMounted) {
          const prodsList = prodsRes && prodsRes.success && Array.isArray(prodsRes.data)
            ? prodsRes.data
            : Array.isArray(prodsRes) ? prodsRes : [];
          const catsList = catsRes && catsRes.success && Array.isArray(catsRes.data)
            ? catsRes.data
            : Array.isArray(catsRes) ? catsRes : [];

          setAllProducts(prodsList);
          setCategories(catsList);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Fetch category products error:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Determine current active category meta
  const currentCatMeta = useMemo(() => {
    const rawStr = String(categoryId || '').trim();
    const numId = parseInt(rawStr, 10);

    // 1. Direct match by numeric ID in CATEGORY_META (1 to 5)
    if (!isNaN(numId) && CATEGORY_META[numId]) {
      return { id: numId, ...CATEGORY_META[numId] };
    }

    // 2. Normalize category name from raw URL param string (handling dashes/spaces)
    const normalizedName = formatCategoryName(rawStr.replace(/[-_]/g, ' '));
    const metaEntry = Object.values(CATEGORY_META).find(m => m.name.toLowerCase() === normalizedName.toLowerCase());

    if (metaEntry) {
      const catObj = categories.find(c => formatCategoryName(c.categoryName).toLowerCase() === normalizedName.toLowerCase());
      return {
        id: catObj ? catObj.categoryId : rawStr,
        ...metaEntry
      };
    }

    return {
      id: rawStr,
      name: normalizedName || 'Healthcare Category',
      icon: '🏥',
      desc: 'Explore high-quality medical and healthcare essentials.',
      color: '#059669',
      bgGrad: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
    };
  }, [categoryId, categories]);

  // Auto replace numeric ID or un-slugified string in browser URL bar with clean category slug (e.g. /category/skin-care)
  useEffect(() => {
    if (currentCatMeta && currentCatMeta.name) {
      const targetSlug = toCategorySlug(currentCatMeta.name);
      if (categoryId && String(categoryId).trim() !== targetSlug) {
        navigate(`/category/${targetSlug}`, { replace: true });
      }
    }
  }, [currentCatMeta, categoryId, navigate]);

  // Filter & sort products for this category page
  const categoryProducts = useMemo(() => {
    let prods = [...allProducts];
    if (!prods.length) return [];

    const targetCategoryName = currentCatMeta.name;

    prods = prods.filter(p => {
      if (!p) return false;

      // Extract category name from product
      const pCatName = p.categoryName || p.category?.categoryName || p.category?.name || '';
      const pFormattedCatName = formatCategoryName(pCatName);

      // 1. Canonical formatted category name match (e.g. "Skin Care" === "Skin Care")
      if (pFormattedCatName.toLowerCase() === targetCategoryName.toLowerCase()) {
        return true;
      }

      // 2. Numeric ID match if available
      const targetCatId = Number(currentCatMeta.id);
      const pCatId = Number(p.categoryId || p.category?.categoryId);
      if (!isNaN(targetCatId) && !isNaN(pCatId) && targetCatId === pCatId) {
        return true;
      }

      // 3. Substring match fallback
      if (pCatName && targetCategoryName) {
        const pLower = pCatName.toLowerCase();
        const targetLower = targetCategoryName.toLowerCase();
        if (pLower.includes(targetLower) || targetLower.includes(pLower)) {
          return true;
        }
      }

      return false;
    });

    // Multi-keyword search query
    if (searchQuery.trim()) {
      const kws = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      prods = prods.filter(p => {
        const text = `${p.name || ''} ${p.brand || ''} ${p.description || ''}`.toLowerCase();
        return kws.every(kw => text.includes(kw));
      });
    }

    // In Stock Only
    if (inStockOnly) {
      prods = prods.filter(p => p.stock > 0);
    }

    // Sort products
    if (sortBy === 'price-low') {
      prods.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (sortBy === 'price-high') {
      prods.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    } else if (sortBy === 'rating') {
      prods.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    } else if (sortBy === 'name-az') {
      prods.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }

    return prods;
  }, [allProducts, categoryId, currentCatMeta.name, searchQuery, inStockOnly, sortBy]);

  const totalPages = Math.ceil(categoryProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedCategoryProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return categoryProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [categoryProducts, currentPage]);

  // Cart & Favorites handlers
  const favoritesMap = useMemo(() => {
    const map = {};
    favorites.forEach(f => { map[f.productId] = true; });
    return map;
  }, [favorites]);

  const handleToggleFavorite = (prod) => {
    const pId = prod?.productId || prod;
    const isFav = favorites.some(f => f.productId === pId);
    setFavorites(prev => {
      const exists = prev.some(f => f.productId === pId);
      if (exists) return prev.filter(f => f.productId !== pId);
      return [...prev, prod];
    });
    setToast({
      type: isFav ? 'fav-remove' : 'fav-add',
      title: isFav ? 'Removed from Wishlist' : 'Saved to Wishlist!',
      message: isFav ? `${prod?.name || 'Product'} removed from your wishlist.` : `${prod?.name || 'Product'} saved to your wishlist.`
    });
  };

  const handleAddToCart = (prod) => {
    const targetProd = typeof prod === 'object' ? prod : allProducts.find(p => p.productId === prod);
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.product?.productId === (targetProd?.productId || prod));
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...prev, { product: targetProd || { productId: prod, name: 'Product' }, quantity: 1 }];
    });
    setToast({
      type: 'cart-add',
      title: 'Added to Cart!',
      message: `${targetProd?.name || 'Product'} added to your cart.`
    });
  };

  const handleUpdateQuantity = (cartItemId, newQty) => {
    setCartItems(prev => prev.map(item => {
      const idMatches = item.cartItemId === cartItemId || item.product?.productId === cartItemId;
      if (idMatches) {
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (prodId) => {
    setCartItems(prev => prev.filter(item => item.product?.productId !== prodId));
    setToast({ type: 'cart-remove', title: 'Removed from Cart', message: 'Item removed from your cart.' });
  };

  const handleStartBuyNow = (prod) => {
    setBuyNowProduct(prod);
    setIsBuyNowOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const relatedProducts = useMemo(() => {
    if (!selectedProductDetails) return [];
    return allProducts
      .filter(p => p.productId !== selectedProductDetails.productId)
      .slice(0, 4);
  }, [allProducts, selectedProductDetails]);

  if (loading) {
    return <BrandLoader fullScreen message={`Loading ${currentCatMeta?.name || 'Category'}...`} />;
  }

  return (
    <div className="dashboard-page light" style={{ minHeight: '100vh', backgroundImage: "linear-gradient(180deg, rgba(248, 250, 252, 0.45) 0%, rgba(241, 245, 249, 0.55) 100%), url('/custom_medical_bg_light.jpg')", backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center' }}>
      {/* Navbar */}
      <Navbar
        user={user}
        cartCount={cartItems.length}
        favoriteCount={favorites.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onLogout={handleLogout}
        categories={categories}
        onScrollToCategory={(catTarget) => navigate(`/category/${catTarget}`)}
      />

      <main className="dashboard-main" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        {/* Row 1: Back Button Pinned to Far-Left Screen Corner */}
        <div style={{ width: '100%', padding: '0 2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'flex-start' }}>
          <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1.1rem',
                borderRadius: '0.75rem',
                background: '#ffffff',
                border: '1.5px solid #a7f3d0',
                color: '#047857',
                fontWeight: 800,
                fontSize: '0.85rem',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowLeft style={{ width: 18, height: 18, color: '#059669' }} />
              <span>Back</span>
            </Link>
          </motion.div>
        </div>



        {/* Product Grid Catalog */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#059669' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(5, 150, 105, 0.2)', borderTopColor: '#059669', borderRadius: '50%', margin: '0 auto 1rem auto', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontWeight: 600 }}>Loading {currentCatMeta.name} catalog...</p>
            </div>
          ) : categoryProducts.length === 0 ? (
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '3.5rem 2rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
              <Package size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>No products found</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0 0 1.5rem 0' }}>No items matched your search query in this category.</p>
              <button
                onClick={() => { setSearchQuery(''); setInStockOnly(false); }}
                style={{ padding: '0.6rem 1.25rem', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Clear Search Filters
              </button>
            </div>
          ) : (
            <div>
              {/* Exact Product Grid directly on background */}
              <div className="cat-section__grid">
                {paginatedCategoryProducts.map((prod, i) => (
                  <ProductCard
                    key={prod.productId}
                    product={prod}
                    index={i}
                    isFavorite={!!favoritesMap[prod.productId]}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleStartBuyNow}
                    onOpenDetails={(p) => setSelectedProductDetails(p)}
                  />
                ))}
              </div>

              {/* Pagination Controls for Separate Pages */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '2.5rem', paddingBottom: '1.5rem' }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(prev => Math.max(1, prev - 1));
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                    style={{
                      padding: '0.45rem 0.95rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1',
                      background: currentPage === 1 ? '#f8fafc' : '#ffffff', color: currentPage === 1 ? '#cbd5e1' : '#0f172a',
                      fontWeight: 800, fontSize: '0.8rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)', transition: 'all 0.2s',
                    }}
                  >
                    ‹ Prev Page
                  </motion.button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }}
                        style={{
                          width: 36, height: 36, borderRadius: '0.65rem',
                          border: isActive ? 'none' : '1.5px solid #cbd5e1',
                          background: isActive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#ffffff',
                          color: isActive ? '#ffffff' : '#0f172a',
                          fontWeight: 900, fontSize: '0.84rem', cursor: 'pointer',
                          boxShadow: isActive ? '0 4px 12px rgba(16, 185, 129, 0.35)' : '0 1px 3px rgba(0,0,0,0.02)',
                          transition: 'all 0.2s',
                        }}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(prev => Math.min(totalPages, prev + 1));
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                    style={{
                      padding: '0.45rem 0.95rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1',
                      background: currentPage === totalPages ? '#f8fafc' : '#ffffff', color: currentPage === totalPages ? '#cbd5e1' : '#0f172a',
                      fontWeight: 800, fontSize: '0.8rem', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)', transition: 'all 0.2s',
                    }}
                  >
                    Next Page ›
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <DashboardFooter />

      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Drawers & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={(prodId) => setFavorites(prev => prev.filter(f => f.productId !== prodId))}
        onAddToCart={handleAddToCart}
      />

      {isOrdersOpen && (
        <OrdersModal
          orders={orders}
          onClose={() => setIsOrdersOpen(false)}
        />
      )}

      {selectedProductDetails && (
        <ProductDetailsModal
          product={selectedProductDetails}
          relatedProducts={relatedProducts}
          isFavorite={!!favoritesMap[selectedProductDetails.productId]}
          onClose={() => setSelectedProductDetails(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleStartBuyNow}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          cartItems={cartItems}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderComplete={() => {
            setCartItems([]);
            setIsCheckoutOpen(false);
          }}
        />
      )}

      {isBuyNowOpen && buyNowProduct && (
        <BuyNowModal
          product={buyNowProduct}
          onClose={() => {
            setIsBuyNowOpen(false);
            setBuyNowProduct(null);
          }}
          onOrderComplete={() => {
            setIsBuyNowOpen(false);
            setBuyNowProduct(null);
          }}
        />
      )}
    </div>
  );
}

export default CategoryProductsPage;

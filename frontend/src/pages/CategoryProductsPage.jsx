import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Filter, SlidersHorizontal, Package, CheckCircle2,
  ChevronRight, Sparkles, LayoutGrid, Heart, ShoppingBag, ArrowUpDown
} from 'lucide-react';

import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import BrandLoader from '../components/BrandLoader';
import ToastNotification from '../components/ToastNotification';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getCookie } from '../utils/cookieUtils';
import shopService from '../api/shopService';
import { formatCategoryName, toCategorySlug } from '../utils/categoryUtils';

const CartDrawer = lazy(() => import('../components/CartDrawer'));
const FavoritesDrawer = lazy(() => import('../components/FavoritesDrawer'));
const OrdersModal = lazy(() => import('../components/OrdersModal'));
const ProductDetailsModal = lazy(() => import('../components/ProductDetailsModal'));
const CheckoutModal = lazy(() => import('../components/CheckoutModal'));
const BuyNowModal = lazy(() => import('../components/BuyNowModal'));
const ProfileSidebar = lazy(() => import('../components/ProfileSidebar'));
const SanjeevaniBot = lazy(() => import('../components/SanjeevaniBot'));

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');

const CATEGORY_META = {
  1: { name: 'Prescriptions & Pharmacy', icon: '💊', desc: 'Authentic prescription medicines, antibiotics, cardiac & healthcare treatments.', color: '#0D5C75', bgGrad: 'linear-gradient(135deg, #09475B 0%, #0D5C75 100%)' },
  2: { name: 'Nutrition & Health', icon: '🥗', desc: 'Daily vitamins, protein supplements, mineral boosters & wellness drinks.', color: '#4D8B31', bgGrad: 'linear-gradient(135deg, #386723 0%, #4D8B31 100%)' },
  3: { name: 'Medical Devices', icon: '🩺', desc: 'Certified BP monitors, oximeters, thermometers, nebulizers & surgical equipment.', color: '#2A7697', bgGrad: 'linear-gradient(135deg, #1D546C 0%, #2A7697 100%)' },
  4: { name: "Baby & Kids", icon: '👶', desc: 'Gentle baby skincare, diapers, wipes, pediatric nutrition & infant care.', color: '#A4C3D2', bgGrad: 'linear-gradient(135deg, #6B8B9B 0%, #A4C3D2 100%)' },
  5: { name: 'Skin Care', icon: '✨', desc: 'Dermatologist-tested face washes, hydration serums, sunscreens & lotions.', color: '#907AA9', bgGrad: 'linear-gradient(135deg, #5D4D71 0%, #907AA9 100%)' },
};



export function CategoryProductsPage() {
  const params = useParams();
  const categoryId = params.categorySlug || params.categoryId;
  const navigate = useNavigate();
  const { user, logout, updateShoppingState } = useAuth();
  const { language, t, translateData } = useLanguage();

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Cart, Favorites & Drawers state
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  const cartItemsMap = useMemo(() => {
    const map = {};
    (cartItems || []).forEach(item => {
      const pId = item.productId || item.product?.productId;
      if (pId) map[pId] = true;
    });
    return map;
  }, [cartItems]);

  // Reset drawers & pagination on route/filter change and scroll to top
  useEffect(() => {
    setIsFavoritesOpen(false);
    setIsCartOpen(false);
    setIsOrdersOpen(false);
    setSearchQuery('');
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [categoryId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, inStockOnly]);

  // Fetch cart, favorites & orders
  const fetchCart = useCallback(async () => {
    const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token') || getCookie('auth_token');
    if (!activeToken) return;
    try {
      const res = await shopService.getCart();
      if (res && res.success && Array.isArray(res.data)) {
        setCartItems(res.data);
      }
    } catch (e) { /* Ignore guest sessions */ }
  }, []);

  const fetchFavorites = useCallback(async () => {
    const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token') || getCookie('auth_token');
    if (!activeToken) return;
    try {
      const res = await shopService.getFavorites();
      if (res && res.success && Array.isArray(res.data)) {
        setFavorites(res.data);
      }
    } catch (e) { /* Ignore guest sessions */ }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await shopService.getOrders();
      if (res && res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (Array.isArray(res)) {
        setOrders(res);
      }
    } catch (e) { /* Ignore guest sessions */ }
  }, []);

  // Sync shopping counts to AuthContext / cookies
  useEffect(() => {
    const safeCartCount = Array.isArray(cartItems) ? cartItems.length : 0;
    const safeFavCount = Array.isArray(favorites) ? favorites.length : 0;
    if (typeof updateShoppingState === 'function') {
      updateShoppingState(safeCartCount, safeFavCount);
    }
  }, [cartItems, favorites, updateShoppingState]);

  // Fetch products & categories immediately on mount and category change
  useEffect(() => {
    let isMounted = true;

    // Immediately load existing cached products or catalog so UI renders instantly
    shopService.getProducts({}).then(res => {
      if (isMounted && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setAllProducts(res.data);
        setLoading(false);
      }
    }).catch(() => {});

    Promise.allSettled([
      shopService.getProducts({}),
      shopService.getCategories(),
      fetchCart(),
      fetchFavorites(),
      fetchOrders(),
    ])
      .then((results) => {
        if (!isMounted) return;
        const prodsRes = results[0]?.status === 'fulfilled' ? results[0].value : null;
        const catsRes = results[1]?.status === 'fulfilled' ? results[1].value : null;

        if (prodsRes) {
          const prodsList = prodsRes.success && Array.isArray(prodsRes.data)
            ? prodsRes.data
            : (Array.isArray(prodsRes) ? prodsRes : []);
          if (prodsList.length > 0) {
            setAllProducts(prodsList);
          }
        }

        if (catsRes) {
          const catsList = catsRes.success && Array.isArray(catsRes.data)
            ? catsRes.data
            : (Array.isArray(catsRes) ? catsRes : []);
          if (catsList.length > 0) {
            setCategories(catsList);
          }
        }
      })
      .catch((err) => {
        console.error('Fetch category products error:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [categoryId, fetchCart, fetchFavorites, fetchOrders]);

  // Determine current active category meta
  const currentCatMeta = useMemo(() => {
    let rawStr = String(categoryId || '').trim();
    try { rawStr = decodeURIComponent(rawStr).trim(); } catch (e) {}
    const lowerRaw = rawStr.toLowerCase();
    const numId = parseInt(lowerRaw, 10);

    // 0. All products / All categories check
    if (lowerRaw === 'all' || lowerRaw === 'all-products' || lowerRaw === 'all-categories' || lowerRaw === '0' || lowerRaw === 'all products') {
      return {
        id: 'all-products',
        isAll: true,
        name: 'All Products',
        icon: '🏪',
        desc: 'Explore our complete catalog of authentic healthcare & medical products.',
        color: '#0D5C75',
        bgGrad: 'linear-gradient(135deg, #09475B 0%, #0D5C75 100%)',
      };
    }

    // 1. Direct match by numeric ID in CATEGORY_META (1 to 5)
    if (!isNaN(numId) && CATEGORY_META[numId]) {
      return { id: numId, ...CATEGORY_META[numId] };
    }

    // 2. Normalize category name from raw URL param string (handling dashes/spaces)
    const normalizedName = formatCategoryName(rawStr.replace(/[-_]/g, ' '));
    const metaPair = Object.entries(CATEGORY_META).find(([k, m]) => 
      m.name.toLowerCase() === normalizedName.toLowerCase() || 
      toCategorySlug(m.name) === toCategorySlug(rawStr)
    );

    if (metaPair) {
      const [catIdKey, metaEntry] = metaPair;
      const catObj = categories.find(c => 
        formatCategoryName(c.categoryName).toLowerCase() === normalizedName.toLowerCase() || 
        toCategorySlug(c.categoryName) === toCategorySlug(rawStr)
      );
      return {
        id: catObj ? catObj.categoryId : Number(catIdKey),
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

  // Active category slug synchronization
  useEffect(() => {
    // Keep category state in sync without forcing route re-navigation
  }, [currentCatMeta]);

  // Filter & sort products for this category page
  const categoryProducts = useMemo(() => {
    let prods = [...allProducts];
    if (!prods.length) return [];

    const targetCategoryName = currentCatMeta.name;
    const isAllMode = currentCatMeta.isAll || categoryId === 'all' || categoryId === 'all-products' || targetCategoryName === 'All Products';

    // Only filter by category if NOT in All Products mode
    if (!isAllMode) {
      const matched = prods.filter(p => {
        if (!p) return false;

        let rawDecodedCat = String(categoryId || '');
        try { rawDecodedCat = decodeURIComponent(rawDecodedCat); } catch (e) {}

        const pCatName = p.categoryName || p.category?.categoryName || p.category?.name || '';
        const pSlug = toCategorySlug(pCatName);
        const rawSlug = toCategorySlug(rawDecodedCat);
        const targetSlug = toCategorySlug(targetCategoryName);

        // 1. Direct slug match (e.g. "skin-care" === "skin-care")
        if (pSlug && (pSlug === rawSlug || pSlug === targetSlug)) {
          return true;
        }

        // 2. Canonical formatted category name match (e.g. "Skin Care" === "Skin Care")
        const pFormattedCatName = formatCategoryName(pCatName);
        if (pFormattedCatName.toLowerCase() === targetCategoryName.toLowerCase()) {
          return true;
        }

        // 3. Numeric ID match if available
        const targetCatId = Number(currentCatMeta.id);
        const pCatId = Number(p.categoryId || p.category?.categoryId);
        if (!isNaN(targetCatId) && !isNaN(pCatId) && targetCatId > 0 && pCatId > 0 && targetCatId === pCatId) {
          return true;
        }

        // 4. Substring match fallback
        if (pCatName && targetCategoryName) {
          const pLower = pCatName.toLowerCase().replace(/[^a-z0-9]/g, '');
          const targetLower = targetCategoryName.toLowerCase().replace(/[^a-z0-9]/g, '');
          const rawLower = rawDecodedCat.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (pLower.includes(targetLower) || targetLower.includes(pLower) || pLower.includes(rawLower) || rawLower.includes(pLower)) {
            return true;
          }
        }

        return false;
      });

      // If category filter returns products, use them; otherwise fallback to showing full catalog so page is NEVER blank!
      prods = matched.length > 0 ? matched : prods;
    }

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
    (favorites || []).forEach(f => {
      const pId = f.productId || f.product?.productId;
      if (pId) map[pId] = true;
    });
    return map;
  }, [favorites]);

  const handleToggleFavorite = async (prod) => {
    const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!activeToken) {
      navigate('/login');
      return;
    }
    const targetPId = typeof prod === 'object' ? prod.productId : prod;
    const targetProd = typeof prod === 'object' ? prod : allProducts.find(p => p.productId === targetPId);
    const prodName = targetProd?.name || 'Product';
    const isFav = !!favoritesMap[targetPId];

    try {
      await shopService.toggleFavorite(targetPId);
      await fetchFavorites();
      setToast({
        type: isFav ? 'fav-remove' : 'fav-add',
        title: isFav ? 'Removed from Wishlist' : 'Saved to Wishlist!',
        message: isFav ? `${prodName} removed from your wishlist.` : `${prodName} saved to your wishlist.`
      });
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  const handleAddToCart = async (prod, quantity = 1) => {
    const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!activeToken) {
      navigate('/login');
      return;
    }
    const targetPId = typeof prod === 'object' ? prod.productId : prod;
    const targetProd = typeof prod === 'object' ? prod : allProducts.find(p => p.productId === targetPId);
    const prodName = targetProd?.name || 'Product';
    try {
      const res = await shopService.addToCart(targetPId, quantity);
      if (res && res.success) {
        await fetchCart();
        setToast({
          type: 'cart-add',
          title: 'Added to Cart!',
          message: `${prodName} added to your cart.`
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart.');
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQty) => {
    if (newQty < 1) return;
    try {
      const res = await shopService.updateCartItem(cartItemId, newQty);
      if (res && res.success) {
        fetchCart();
      }
    } catch (err) {
      console.error('Update cart item error:', err);
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    try {
      const res = await shopService.removeCartItem(cartItemId);
      if (res && res.success) {
        fetchCart();
        setToast({ type: 'cart-remove', title: 'Removed from Cart', message: 'Item removed from your cart.' });
      }
    } catch (err) {
      console.error('Remove cart item error:', err);
    }
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
    <div className="dashboard-page light" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #d1fae5 50%, #f0fdf4 100%)' }}>
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
        onOpenChatbot={() => {
          const botEl = document.querySelector('.sanjeevani-bot-fab');
          if (botEl) botEl.click();
        }}
        onOpenProfile={() => setIsProfileOpen(v => !v)}
        onLogout={handleLogout}
        categories={categories}
        onScrollToCategory={(catTarget) => navigate(`/category/${catTarget}`)}
      />

      {/* Profile Left Push Sidebar */}
      <ProfileSidebar
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenWishlist={() => setIsFavoritesOpen(true)}
        onOpenChatbot={() => {
          const botEl = document.querySelector('.sanjeevani-bot-fab');
          if (botEl) botEl.click();
        }}
        onChangePassword={() => navigate('/change-password')}
      />

      <main className="dashboard-main" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>



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
                    isInCart={!!cartItemsMap[prod.productId]}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleStartBuyNow}
                    onOpenDetails={(p) => navigate(`/product/${p.productId}`)}
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

      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <Suspense fallback={null}>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }}
            onProceedToCheckout={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }}
          />
        )}

        {isFavoritesOpen && (
          <FavoritesDrawer
            isOpen={isFavoritesOpen}
            onClose={() => setIsFavoritesOpen(false)}
            favorites={favorites}
            onRemoveFavorite={async (prodId) => {
              try {
                await shopService.removeFavorite(prodId);
                fetchFavorites();
              } catch (e) { console.error(e); }
            }}
            onAddToCart={handleAddToCart}
            onOpenDetails={(p) => setSelectedProductDetails(p)}
          />
        )}

        {selectedProductDetails && (
          <ProductDetailsModal
            product={selectedProductDetails}
            relatedProducts={allProducts.filter(p => p.categoryName === selectedProductDetails.categoryName && (p.productId || p.id) !== (selectedProductDetails.productId || selectedProductDetails.id))}
            isFavorite={favorites.some(f => (f.productId || f.id) === (selectedProductDetails.productId || selectedProductDetails.id))}
            onClose={() => setSelectedProductDetails(null)}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onBuyNow={handleStartBuyNow}
            onSelectProduct={(p) => setSelectedProductDetails(p)}
          />
        )}

        {isOrdersOpen && (
          <OrdersModal
            isOpen={isOrdersOpen}
            orders={orders}
            onClose={() => setIsOrdersOpen(false)}
          />
        )}

        {isCheckoutOpen && (
          <CheckoutModal
            cartItems={cartItems}
            onClose={() => setIsCheckoutOpen(false)}
            onOrderComplete={() => {
              fetchCart();
              fetchOrders();
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

        <SanjeevaniBot
          onOpenCart={() => setIsCartOpen(true)}
          onOpenOrders={() => setIsOrdersOpen(true)}
        />
      </Suspense>

      {/* ── RESPONSIVE MEDIA QUERIES FOR ALL DEVICE VIEWPORTS (3 PRODUCTS PER ROW ON LAPTOP & PC) ── */}
      <style>{`
        @media (max-width: 640px) {
          .cat-section__grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
          }
          .dashboard-main {
            padding-top: 0.85rem !important;
            padding-bottom: 5rem !important;
          }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .cat-section__grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 1.25rem !important;
          }
        }
        @media (min-width: 1024px) {
          .cat-section__grid {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 1.6rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default CategoryProductsPage;

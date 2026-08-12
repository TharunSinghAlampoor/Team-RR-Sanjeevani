import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import authService from '../api/authService';
import shopService from '../api/shopService';

import Navbar from '../components/Navbar';
import CategorySection from '../components/CategorySection';
import CategoryCard from '../components/CategoryCard';
import { formatCategoryName, toCategorySlug } from '../utils/categoryUtils';
import ProductCard from '../components/ProductCard';
import BrandLoader from '../components/BrandLoader';
import ToastNotification from '../components/ToastNotification';
import { getCookie } from '../utils/cookieUtils';

// Lazy-loaded heavy drawers & modals for optimized bundle size & fast initial page load
const ProductDetailsModal = lazy(() => import('../components/ProductDetailsModal'));
const CartDrawer = lazy(() => import('../components/CartDrawer'));
const FavoritesDrawer = lazy(() => import('../components/FavoritesDrawer'));
const BuyNowModal = lazy(() => import('../components/BuyNowModal'));
const CheckoutModal = lazy(() => import('../components/CheckoutModal'));
const OrdersModal = lazy(() => import('../components/OrdersModal'));
const OrderSuccessModal = lazy(() => import('../components/OrderSuccessModal'));
const ProfileSidebar = lazy(() => import('../components/ProfileSidebar'));
const SanjeevaniBot = lazy(() => import('../components/SanjeevaniBot'));

import { Search, SlidersHorizontal, RotateCcw, LayoutGrid } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Dashboard = () => {
  const { user, logout, updateShoppingState } = useAuth();
  const { language, t, translateData } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Data States
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  // Toast Notification state
  const [toast, setToast] = useState(null);

  // Trigger login success toast when navigated from Login page
  useEffect(() => {
    if (location.state?.loginSuccess) {
      const displayName = location.state?.userName || user?.fullName || 'User';
      setToast({
        type: 'success',
        title: 'Login Successful! 🎉',
        message: `Welcome back, ${displayName}! You are logged in.`
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user]);
  // Filter / Search
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Modal / Drawer States
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [buyNowTargetProduct, setBuyNowTargetProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Favorites lookup map
  const favoritesMap = useMemo(() => {
    const map = {};
    const favList = Array.isArray(favorites) ? favorites : [];
    favList.forEach((item) => {
      if (!item) return;
      const pId = item.productId || item.product?.productId;
      if (pId) map[pId] = true;
    });
    return map;
  }, [favorites]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ─── Data Fetchers ───────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await shopService.getCategories();
      const rawCat = (res && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
      setCategories(rawCat);
    } catch (e) {
      console.error('Fetch categories:', e);
      setCategories([]);
    }
  }, []);

  const fetchAllProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await shopService.getProducts({});
      const rawProducts = (res && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
      if (rawProducts.length > 0) {
        // Fisher-Yates shuffle to randomize product order
        const shuffled = [...rawProducts];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setAllProducts(shuffled);
      } else {
        setAllProducts([]);
      }
    } catch (e) {
      console.error('Fetch products:', e);
      setAllProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchCart = useCallback(async () => {
    const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token') || getCookie('auth_token');
    if (!activeToken) return;
    try {
      const res = await shopService.getCart();
      if (res && res.success && Array.isArray(res.data)) {
        setCartItems(res.data);
      }
    } catch (e) { /* Ignore 401 for guest sessions */ }
  }, []);

  const fetchFavorites = useCallback(async () => {
    const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token') || getCookie('auth_token');
    if (!activeToken) return;
    try {
      const res = await shopService.getFavorites();
      if (res && res.success && Array.isArray(res.data)) {
        setFavorites(res.data);
      }
    } catch (e) { /* Ignore 401 for guest sessions */ }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await shopService.getOrders();
      const rawList = (res && res.success && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
      
      // Deduplicate orders by unique orderId / id
      const uniqueMap = new Map();
      rawList.forEach(o => {
        if (!o) return;
        if (String(o.status || '').toUpperCase() === 'FAILED') return;
        const key = String(o.orderId || o.id || Math.random()).trim().toLowerCase();
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, o);
        }
      });

      const cleanOrders = Array.from(uniqueMap.values()).sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (tA !== tB) return tB - tA; // Newest first
        const nA = Number(String(a.orderId || a.id || '').replace(/[^0-9]/g, '')) || 0;
        const nB = Number(String(b.orderId || b.id || '').replace(/[^0-9]/g, '')) || 0;
        return nB - nA;
      });

      setOrders(cleanOrders);
    } catch (e) {
      console.error('Fetch orders error:', e);
    }
  }, []);

  useEffect(() => {
    if (isOrdersOpen) {
      fetchOrders();
    }
  }, [isOrdersOpen, fetchOrders]);

  // Initial load on mount
  useEffect(() => {
    let isMounted = true;

    // Safety fallback: max 1.2s loader duration
    const safetyTimer = setTimeout(() => {
      if (isMounted) setPageLoading(false);
    }, 1200);

    Promise.allSettled([
      fetchCategories(),
      fetchAllProducts(),
      fetchCart(),
      fetchFavorites(),
      fetchOrders()
    ]).finally(() => {
      if (isMounted) setPageLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  // Sync shopping counts to cookies whenever cart or favorites change
  useEffect(() => {
    const safeCartCount = Array.isArray(cartItems) ? cartItems.length : 0;
    const safeFavCount = Array.isArray(favorites) ? favorites.length : 0;
    if (typeof updateShoppingState === 'function') {
      updateShoppingState(safeCartCount, safeFavCount);
    }
  }, [cartItems, favorites, updateShoppingState]);

  // ─── Deep Link Product Purchase Auto-Open ─────────────────────
  useEffect(() => {
    const safeProducts = Array.isArray(allProducts) ? allProducts : [];
    if (safeProducts.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('productId') || params.get('buy') || params.get('product');
    if (targetId) {
      const found = safeProducts.find(p => p && String(p.productId) === String(targetId));
      if (found) {
        handleOpenDetails(found);
      }
    }
  }, [allProducts]);

  // ─── Live API Search Sync ─────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(async () => {
      try {
        const res = await shopService.getProducts({
          search: searchQuery.trim(),
          inStock: inStockOnly || undefined,
        });
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setAllProducts(prev => {
            const map = new Map();
            const safePrev = Array.isArray(prev) ? prev : [];
            res.data.forEach(p => { if (p) map.set(p.productId, p); });
            safePrev.forEach(p => { if (p && !map.has(p.productId)) map.set(p.productId, p); });
            return Array.from(map.values());
          });
        }
      } catch (e) { console.error('Search sync:', e); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, inStockOnly]);

  // ─── Deduplicated Unique Categories for Display (with Automatic Fallbacks) ───
  const displayCategories = useMemo(() => {
    const map = new Map();
    const safeCategories = Array.isArray(categories) ? categories : [];
    const safeProducts = Array.isArray(allProducts) ? allProducts : [];

    // 1. Process API categories if present
    if (safeCategories.length > 0) {
      safeCategories.forEach(cat => {
        if (!cat || !cat.categoryName) return;
        const formatted = formatCategoryName(cat.categoryName);
        if (!map.has(formatted)) {
          map.set(formatted, {
            ...cat,
            categoryName: formatted,
            categoryIds: [cat.categoryId],
            productCount: cat.productCount || 0,
          });
        } else {
          const existing = map.get(formatted);
          if (cat.categoryId && !existing.categoryIds.includes(cat.categoryId)) {
            existing.categoryIds.push(cat.categoryId);
          }
          existing.productCount += (cat.productCount || 0);
        }
      });
    }

    // 2. Fallback to categories derived from allProducts if API categories is empty
    if (map.size === 0 && safeProducts.length > 0) {
      safeProducts.forEach(p => {
        if (!p) return;
        const rawName = p.categoryName || 'Prescriptions & Pharmacy';
        const formatted = formatCategoryName(rawName);
        if (!map.has(formatted)) {
          map.set(formatted, {
            categoryId: p.categoryId || 1,
            categoryName: formatted,
            categoryIds: [p.categoryId || 1],
            productCount: 1,
          });
        } else {
          const existing = map.get(formatted);
          if (p.categoryId && !existing.categoryIds.includes(p.categoryId)) {
            existing.categoryIds.push(p.categoryId);
          }
          existing.productCount += 1;
        }
      });
    }

    // 3. Ultimate Fallback to standard healthcare categories if still empty
    if (map.size === 0) {
      const DEFAULT_CATS = [
        { categoryId: 1, categoryName: 'Prescriptions & Pharmacy', categoryIds: [1], productCount: 0 },
        { categoryId: 2, categoryName: 'Nutrition & Health', categoryIds: [2], productCount: 0 },
        { categoryId: 3, categoryName: 'Medical Devices', categoryIds: [3], productCount: 0 },
        { categoryId: 4, categoryName: "Kid's Essentials", categoryIds: [4], productCount: 0 },
        { categoryId: 5, categoryName: 'Dermocosmetics (Skin Care)', categoryIds: [5], productCount: 0 },
      ];
      DEFAULT_CATS.forEach(c => map.set(c.categoryName, c));
    }

    return Array.from(map.values());
  }, [categories, allProducts]);

  const handleSelectCategory = useCallback((catIdOrName) => {
    setIsFavoritesOpen(false);
    setIsCartOpen(false);
    setIsOrdersOpen(false);
    if (!catIdOrName) return;
    const slug = toCategorySlug(catIdOrName);
    navigate(`/category/${slug}`);
  }, [navigate]);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    if (query && query.trim() !== '') {
      setSelectedCategory(null);
      setTimeout(() => {
        const el = document.getElementById('products-catalog-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }, []);

  // ─── Computed: Products filtered by multi-keyword search & stock ──
  const filteredProducts = useMemo(() => {
    let items = Array.isArray(allProducts) ? allProducts : [];

    // If active search query exists, search across ALL products
    if (searchQuery.trim()) {
      const keywords = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      items = items.filter(p => {
        if (!p) return false;
        const text = `${p.name || ''} ${p.brand || ''} ${p.description || ''} ${p.categoryName || ''} ${formatCategoryName(p.categoryName) || ''}`.toLowerCase();
        return keywords.every(kw => text.includes(kw));
      });
    } else if (selectedCategory !== null) {
      // Filter by selected category when not actively searching
      const targetCat = displayCategories.find(
        c => c.categoryId === selectedCategory || c.categoryName === selectedCategory || (c.categoryIds && c.categoryIds.includes(selectedCategory))
      );
      if (targetCat) {
        items = items.filter(p => (p.categoryId && targetCat.categoryIds.includes(p.categoryId)) || formatCategoryName(p.categoryName) === targetCat.categoryName);
      } else {
        items = items.filter(p => p.categoryId === selectedCategory || (p.categoryName && formatCategoryName(p.categoryName).toLowerCase().includes(String(selectedCategory).toLowerCase())));
      }
    }

    if (inStockOnly) {
      items = items.filter(p => p.stock > 0);
    }
    return items;
  }, [allProducts, searchQuery, inStockOnly, selectedCategory, displayCategories]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const map = {};
    displayCategories.forEach(cat => { map[cat.categoryName] = []; });
    filteredProducts.forEach(product => {
      if (!product) return;
      const formattedCat = formatCategoryName(product.categoryName);
      let matchedKey = Object.keys(map).find(k => k.toLowerCase() === formattedCat.toLowerCase());

      if (!matchedKey && product.categoryId) {
        const catObj = displayCategories.find(c => c.categoryIds && c.categoryIds.includes(product.categoryId));
        if (catObj) matchedKey = catObj.categoryName;
      }

      if (matchedKey && map[matchedKey]) {
        map[matchedKey].push(product);
      } else if (displayCategories.length > 0) {
        const fallbackCatName = displayCategories[0].categoryName;
        if (!map[fallbackCatName]) map[fallbackCatName] = [];
        map[fallbackCatName].push(product);
      }
    });
    return map;
  }, [displayCategories, filteredProducts]);

  const cartItemsMap = useMemo(() => {
    const map = {};
    (cartItems || []).forEach(item => {
      const pId = item.productId || item.product?.productId;
      if (pId) map[pId] = true;
    });
    return map;
  }, [cartItems]);

  const isSearchActive = searchQuery.trim() !== '' || inStockOnly || selectedCategory !== null;
  const totalFiltered = filteredProducts.length;

  // ─── Pagination for Separate Product Pages ─────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, inStockOnly]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // ─── Cart Handlers ────────────────────────────────────────────────
  const handleAddToCart = async (productId, quantity = 1) => {
    const targetPId = typeof productId === 'object' ? productId.productId : productId;
    const prod = allProducts.find(p => p && p.productId === targetPId);
    const prodName = prod?.name || 'Product';
    try {
      const res = await shopService.addToCart(targetPId, quantity);
      if (res.success) {
        fetchCart();
        setToast({ type: 'cart-add', title: 'Added to Cart!', message: `${prodName} added to your cart.` });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart.');
    }
  };

  const handleUpdateCartQuantity = async (cartItemId, newQty) => {
    try {
      const res = await shopService.updateCartItem(cartItemId, newQty);
      if (res.success) fetchCart();
    } catch (err) { console.error(err); }
  };

  const handleRemoveCartItem = async (cartItemId) => {
    try {
      const res = await shopService.removeCartItem(cartItemId);
      if (res.success) {
        fetchCart();
        setToast({ type: 'cart-remove', title: 'Removed from Cart', message: 'Item removed from your cart.' });
      }
    } catch (err) { console.error(err); }
  };

  // ─── Favorite Handlers ────────────────────────────────────────────
  const handleToggleFavorite = async (productId) => {
    const targetPId = typeof productId === 'object' ? productId.productId : productId;
    const isFav = !!favoritesMap[targetPId];
    const prod = allProducts.find(p => p && p.productId === targetPId);
    const prodName = prod?.name || 'Product';
    try {
      const res = await shopService.toggleFavorite(targetPId);
      if (res.success) {
        await fetchFavorites();
        setToast({
          type: isFav ? 'fav-remove' : 'fav-add',
          title: isFav ? 'Removed from Wishlist' : 'Saved to Wishlist!',
          message: isFav ? `${prodName} removed from your wishlist.` : `${prodName} saved to your wishlist.`
        });
      }
    } catch (err) { console.error(err); }
  };

  const handleRemoveFavorite = async (productId) => {
    const targetPId = typeof productId === 'object' ? productId.productId : productId;
    setFavorites((prev) => prev.filter((item) => (item.productId || item.product?.productId) !== targetPId));
    setToast({ type: 'fav-remove', title: 'Removed from Wishlist', message: 'Product removed from your wishlist.' });
    try {
      await shopService.removeFavorite(targetPId);
      await fetchFavorites();
    } catch (err) {
      console.error('Remove favorite error:', err);
      await fetchFavorites();
    }
  };

  // ─── Product Details Handler (Navigates to dedicated page) ─────────
  const handleOpenDetails = (product) => {
    if (product && product.productId) {
      navigate(`/product/${product.productId}`);
    }
  };

  // ─── Buy Now Handlers ─────────────────────────────────────────────
  const handleStartBuyNow = (product) => setBuyNowTargetProduct(product);

  const handleConfirmBuyNow = async (payload) => {
    setIsProcessingOrder(true);
    try {
      const res = await shopService.buyNow(payload);
      if (res.success) {
        setBuyNowTargetProduct(null);
        fetchOrders();
        fetchAllProducts();
        alert(`✅ Order Placed! Order ID: ${res.data.orderId}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Buy Now failed.');
    } finally { setIsProcessingOrder(false); }
  };

  // ─── Cart Checkout / Buy Now (Razorpay Payment Success) ──────────────
  const handlePaymentSuccess = (orderData) => {
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setBuyNowTargetProduct(null);
    fetchCart();
    fetchOrders();
    fetchAllProducts();
    setCompletedOrder(orderData);
  };

  const handleCategorySelectFromBanner = (catName) => {
    const el = document.getElementById(`cat-section-${catName.replace(/\s+/g, '-').toLowerCase()}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setInStockOnly(false);
    setSelectedCategory(null);
  };

  const scrollToCategory = (catName) => {
    const id = `cat-section-${catName.replace(/\s+/g, '-').toLowerCase()}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (pageLoading) {
    return <BrandLoader fullScreen message="Loading Sanjeevani Store..." />;
  }

  return (
    <div className="dashboard-page" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #d1fae5 50%, #f0fdf4 100%)', minHeight: '100vh' }}>
      {/* ── Sticky Navbar ─────────────────────────── */}
      <Navbar
        user={user}
        cartCount={cartItems.length}
        favoriteCount={favorites.length}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenOrders={() => {
          fetchOrders();
          setIsOrdersOpen(true);
        }}
        onOpenChatbot={() => {
          const botEl = document.querySelector('.sanjeevani-bot-fab');
          if (botEl) botEl.click();
        }}
        onOpenProfile={() => setIsProfileOpen(v => !v)}
        onLogout={handleLogout}
        categories={displayCategories}
        onScrollToCategory={handleSelectCategory}
      />

      {/* ── Profile Left Push Sidebar ───────────────────── */}
      <ProfileSidebar
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenOrders={() => {
          fetchOrders();
          setIsOrdersOpen(true);
        }}
        onOpenWishlist={() => setIsFavoritesOpen(true)}
        onOpenChatbot={() => {
          const botEl = document.querySelector('.sanjeevani-bot-fab');
          if (botEl) botEl.click();
        }}
        onChangePassword={() => navigate('/change-password')}
      />

      {/* ── Main content ──────────────────────────── */}
      <main className="dashboard-main">

        {/* ── Shop by Category Row ────────────────────── */}
        <div id="shop-categories-section">
        {displayCategories.length > 0 && (
          <motion.div
            className="cat-hero-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="cat-hero-row__header">
              <h2 className="cat-hero-row__title">🏪 {translateData('Shop by Category')}</h2>
              <p className="cat-hero-row__subtitle">{translateData('Explore our curated healthcare product categories')}</p>
            </div>
            <div className="cat-hero-cards">
              {/* All Products option */}
              <motion.div
                onClick={(e) => {
                  if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                  handleSelectCategory(null);
                }}
                className={`cat-hero-card ${selectedCategory === null ? 'cat-hero-card--active' : ''}`}
                style={{
                  '--card-color': '#0D5C75',
                  '--card-bg': 'transparent',
                  '--card-ring': '#709775',
                }}
                whileHover={{ y: -6, scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="cat-hero-card__icon-wrap">
                  <div className="cat-hero-card__icon-fallback" style={{ display: 'flex' }}>
                    <LayoutGrid style={{ color: '#0D5C75', width: 28, height: 28 }} />
                  </div>
                </div>
                <p className="cat-hero-card__name">{translateData('All Products')}</p>
              </motion.div>
              {displayCategories.map((cat) => (
                <CategoryCard
                  key={cat.categoryId}
                  category={cat}
                  isSelected={selectedCategory === cat.categoryId || (cat.categoryIds && cat.categoryIds.includes(selectedCategory))}
                  onClick={(e) => {
                    if (e) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                    handleSelectCategory(cat.categoryId);
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
        </div>

        {/* ── Category-wise Product Sections ───────── */}
        <div id="products-catalog-section">
        {isSearchActive ? (
          /* When searching/filtering: flat grid with matched results paginated across separate pages */
          <section className="cat-section">
            <div className="cat-section__header" style={{ borderLeftColor: '#0D5C75', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="cat-section__title-group">
                <div className="cat-section__icon-wrap" style={{ background: '#E8F3EF' }}>
                  <Search style={{ color: '#0D5C75', width: 22, height: 22 }} />
                </div>
                <div>
                  <h2 className="cat-section__title" style={{ color: '#1A2E35' }}>
                    {selectedCategory && !searchQuery.trim()
                      ? translateData(displayCategories.find(c => c.categoryId === selectedCategory || c.categoryIds?.includes(selectedCategory))?.categoryName || 'Category')
                      : translateData('Search Results')}
                  </h2>
                </div>
              </div>

              {totalPages > 1 && (
                <span style={{ fontSize: '0.78rem', color: '#0D5C75', fontWeight: 800, background: '#E8F3EF', padding: '0.25rem 0.75rem', borderRadius: 99, border: '1px solid #A4C3D2' }}>
                  {translateData('Page')} {currentPage} {translateData('of')} {totalPages} ({filteredProducts.length} {translateData('Total Items')})
                </span>
              )}
            </div>
            <div className="cat-section__divider" style={{ background: 'linear-gradient(90deg, rgba(13, 92, 117, 0.25), transparent)' }} />
            <div className="cat-section__grid" style={{ minHeight: loadingProducts ? 300 : 'auto', display: loadingProducts ? 'flex' : 'grid', alignItems: 'center', justifyContent: 'center' }}>
              {loadingProducts
                ? <BrandLoader fullScreen={false} message="Loading Healthcare Essentials..." />
                : paginatedProducts.map((product, i) => (
                    <ProductCard
                      key={product.productId}
                      product={product}
                      index={i}
                      isFavorite={!!favoritesMap[product.productId]}
                      onToggleFavorite={handleToggleFavorite}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleStartBuyNow}
                      onOpenDetails={handleOpenDetails}
                    />
                  ))
              }
            </div>
            {!loadingProducts && filteredProducts.length === 0 && (
              <div className="cat-section__empty">
                <Search style={{ color: '#94a3b8', width: 44, height: 44, opacity: 0.4 }} />
                <p>No products found{searchQuery ? ` matching "${searchQuery}"` : ' in this category'}.</p>
              </div>
            )}

            {/* Pagination Controls for Separate Pages */}
            {!loadingProducts && totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '2rem', padding: '1rem 0' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1));
                    const el = document.getElementById('products-catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                        const el = document.getElementById('products-catalog-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                    const el = document.getElementById('products-catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          </section>
        ) : (
          /* Default: one section per category */
          displayCategories.map(category => (
            <div
              key={category.categoryId}
              id={`cat-section-${category.categoryName.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <CategorySection
                category={category}
                products={productsByCategory[category.categoryName] || []}
                loading={loadingProducts}
                favoritesMap={favoritesMap}
                onToggleFavorite={handleToggleFavorite}
                onAddToCart={handleAddToCart}
                onBuyNow={handleStartBuyNow}
                onOpenDetails={handleOpenDetails}
              />
            </div>
          ))
        )}
        </div>
      </main>

      {/* Global Toast Popup Notifications */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* ── Modals & Drawers ──────────────────────── */}
      <React.Suspense fallback={null}>

        {isCartOpen && (
          <CartDrawer
            cartItems={cartItems}
            onClose={() => setIsCartOpen(false)}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
          />
        )}

        {isFavoritesOpen && (
          <FavoritesDrawer
            favorites={favorites}
            onClose={() => setIsFavoritesOpen(false)}
            onRemoveFavorite={handleRemoveFavorite}
            onAddToCart={handleAddToCart}
            onOpenDetails={handleOpenDetails}
          />
        )}

        {selectedProductDetails && (
          <ProductDetailsModal
            product={selectedProductDetails}
            relatedProducts={products.filter(p => p.categoryName === selectedProductDetails.categoryName && (p.productId || p.id) !== (selectedProductDetails.productId || selectedProductDetails.id))}
            isFavorite={favorites.some(f => (f.productId || f.id) === (selectedProductDetails.productId || selectedProductDetails.id))}
            onClose={() => setSelectedProductDetails(null)}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onBuyNow={handleStartBuyNow}
            onSelectProduct={(p) => setSelectedProductDetails(p)}
          />
        )}

        {buyNowTargetProduct && (
          <BuyNowModal
            product={buyNowTargetProduct}
            onClose={() => setBuyNowTargetProduct(null)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {isCheckoutOpen && (
          <CheckoutModal
            cartItems={cartItems}
            onClose={() => setIsCheckoutOpen(false)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {isOrdersOpen && (
          <OrdersModal
            orders={orders}
            onClose={() => setIsOrdersOpen(false)}
            onOrderCreated={fetchOrders}
          />
        )}

        {completedOrder && (
          <OrderSuccessModal
            order={completedOrder}
            onClose={() => setCompletedOrder(null)}
            onOpenOrders={() => {
              setCompletedOrder(null);
              setIsOrdersOpen(true);
            }}
          />
        )}

        <SanjeevaniBot
          onOpenCart={() => setIsCartOpen(true)}
          onOpenOrders={() => setIsOrdersOpen(true)}
        />
        <ToastNotification toast={toast} onClose={() => setToast(null)} />
      </React.Suspense>
    </div>
  );
};

export default Dashboard;

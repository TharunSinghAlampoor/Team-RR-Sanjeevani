import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import authService from '../api/authService';
import shopService from '../api/shopService';

import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import CategorySection from '../components/CategorySection';
import CategoryCard, { formatCategoryName } from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import DashboardFooter from '../components/DashboardFooter';

// Direct modal & drawer imports for instant UI responsiveness
import ProductDetailsModal from '../components/ProductDetailsModal';
import CartDrawer from '../components/CartDrawer';
import FavoritesDrawer from '../components/FavoritesDrawer';
import BuyNowModal from '../components/BuyNowModal';
import CheckoutModal from '../components/CheckoutModal';
import OrdersModal from '../components/OrdersModal';
import OrderSuccessModal from '../components/OrderSuccessModal';

import { Search, SlidersHorizontal, RotateCcw, LayoutGrid } from 'lucide-react';

export const Dashboard = () => {
  const { user, logout, updateShoppingState } = useAuth();
  const navigate = useNavigate();

  // Data States
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Filter / Search
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Loading
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Modal / Drawer States
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [buyNowTargetProduct, setBuyNowTargetProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
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

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    finally { logout(); navigate('/login'); }
  };

  // ─── Data Fetchers ───────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await shopService.getCategories();
      if (res && res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        setCategories([]);
      }
    } catch (e) {
      console.error('Fetch categories:', e);
      setCategories([]);
    }
  }, []);

  const fetchAllProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await shopService.getProducts({});
      if (res && res.success && Array.isArray(res.data)) {
        // Fisher-Yates shuffle to randomize product order
        const shuffled = [...res.data];
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
    const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!activeToken) return;
    try {
      const res = await shopService.getCart();
      if (res && res.success && Array.isArray(res.data)) {
        setCartItems(res.data);
      }
    } catch (e) { /* Ignore 401 for guest sessions */ }
  }, []);

  const fetchFavorites = useCallback(async () => {
    const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!activeToken) return;
    try {
      const res = await shopService.getFavorites();
      if (res && res.success && Array.isArray(res.data)) {
        setFavorites(res.data);
      }
    } catch (e) { /* Ignore 401 for guest sessions */ }
  }, []);

  const fetchOrders = useCallback(async () => {
    const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!activeToken) return;
    try {
      const res = await shopService.getOrders();
      if (res && res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (e) { /* Ignore 401 for guest sessions */ }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
    fetchCart();
    fetchFavorites();
    fetchOrders();
  }, [fetchCategories, fetchAllProducts, fetchCart, fetchFavorites, fetchOrders]);

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

  const handleSelectCategory = useCallback((catId) => {
    if (catId === null || catId === undefined) {
      setSelectedCategory(null);
      return;
    }
    navigate(`/category/${catId}`);
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
        items = items.filter(p => targetCat.categoryIds.includes(p.categoryId) || formatCategoryName(p.categoryName) === targetCat.categoryName);
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
      const formattedCat = formatCategoryName(product.categoryName);
      if (map[formattedCat]) {
        map[formattedCat].push(product);
      } else if (displayCategories.length > 0) {
        const fallbackCatName = displayCategories[0].categoryName;
        if (!map[fallbackCatName]) map[fallbackCatName] = [];
        map[fallbackCatName].push(product);
      }
    });
    return map;
  }, [displayCategories, filteredProducts]);

  const isSearchActive = searchQuery.trim() !== '' || inStockOnly || selectedCategory !== null;
  const totalFiltered = filteredProducts.length;

  // ─── Cart Handlers ────────────────────────────────────────────────
  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      const res = await shopService.addToCart(productId, quantity);
      if (res.success) { fetchCart(); }
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
      if (res.success) fetchCart();
    } catch (err) { console.error(err); }
  };

  // ─── Favorite Handlers ────────────────────────────────────────────
  const handleToggleFavorite = async (productId) => {
    try {
      const res = await shopService.toggleFavorite(productId);
      if (res.success) {
        await fetchFavorites();
      }
    } catch (err) { console.error(err); }
  };

  const handleRemoveFavorite = async (productId) => {
    // Optimistically remove from state for instant UI responsiveness
    setFavorites((prev) => prev.filter((item) => (item.productId || item.product?.productId) !== productId));
    try {
      await shopService.removeFavorite(productId);
      await fetchFavorites();
    } catch (err) {
      console.error('Remove favorite error:', err);
      await fetchFavorites();
    }
  };

  // ─── Product Details Handler ──────────────────────────────────────
  const handleOpenDetails = async (product) => {
    setSelectedProductDetails(product);
    try {
      const res = await shopService.getRelatedProducts(product.productId);
      if (res.success) setRelatedProducts(res.data || []);
    } catch { setRelatedProducts([]); }
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

  return (
    <div className="dashboard-page light">
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
        onLogout={handleLogout}
        categories={displayCategories}
        onScrollToCategory={handleSelectCategory}
      />

      {/* ── Main content ──────────────────────────── */}
      <main className="dashboard-main">

        {/* ── Offers & Special Promotional Hero Banners ──────────────── */}
        <HeroBanner onExploreOffers={() => {
          setSelectedCategory(null);
          setSearchQuery('');
          const el = document.getElementById('shop-categories-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }} />

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
              <h2 className="cat-hero-row__title">🏪 Shop by Category</h2>
              <p className="cat-hero-row__subtitle">Explore our curated healthcare product categories</p>
            </div>
            <div className="cat-hero-cards">
              {/* All Products option */}
              <motion.div
                onClick={() => handleSelectCategory(null)}
                className={`cat-hero-card ${selectedCategory === null ? 'cat-hero-card--active' : ''}`}
                style={{
                  '--card-color': '#059669',
                  '--card-bg': 'transparent',
                  '--card-ring': '#6ee7b7',
                }}
                whileHover={{ y: -6, scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="cat-hero-card__icon-wrap">
                  <div className="cat-hero-card__icon-fallback" style={{ display: 'flex' }}>
                    <LayoutGrid style={{ color: '#059669', width: 28, height: 28 }} />
                  </div>
                </div>
                <p className="cat-hero-card__name">All Products</p>
              </motion.div>
              {displayCategories.map((cat) => (
                <CategoryCard
                  key={cat.categoryId}
                  category={cat}
                  isSelected={selectedCategory === cat.categoryId || (cat.categoryIds && cat.categoryIds.includes(selectedCategory))}
                  onClick={() => handleSelectCategory(cat.categoryId)}
                />
              ))}
            </div>
          </motion.div>
        )}
        </div>

        {/* ── Category-wise Product Sections ───────── */}
        <div id="products-catalog-section">
        {isSearchActive ? (
          /* When searching/filtering: flat grid with all matched results */
          <section className="cat-section">
            <div className="cat-section__header" style={{ borderLeftColor: '#059669' }}>
              <div className="cat-section__title-group">
                <div className="cat-section__icon-wrap" style={{ background: '#d1fae5' }}>
                  <Search style={{ color: '#059669', width: 22, height: 22 }} />
                </div>
                <div>
                  <h2 className="cat-section__title">
                    {selectedCategory && !searchQuery.trim()
                      ? displayCategories.find(c => c.categoryId === selectedCategory || c.categoryIds?.includes(selectedCategory))?.categoryName || 'Category'
                      : 'Search Results'}
                  </h2>
                </div>
              </div>
            </div>
            <div className="cat-section__divider" style={{ background: 'linear-gradient(90deg, #05966940, transparent)' }} />
            <div className="cat-section__grid">
              {loadingProducts
                ? Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="pcard pcard--skeleton">
                      <div className="pcard-skel-img" />
                      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="pcard-skel-line" style={{ width: '45%', height: 8 }} />
                        <div className="pcard-skel-line" style={{ width: '85%', height: 10 }} />
                        <div className="pcard-skel-line" style={{ width: '60%', height: 8 }} />
                      </div>
                    </div>
                  ))
                : filteredProducts.map((product, i) => (
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

      {/* ── Footer ───────────────────────────────── */}
      <DashboardFooter />

      {/* ── Modals & Drawers ──────────────────────── */}
      <React.Suspense fallback={null}>
        {selectedProductDetails && (
          <ProductDetailsModal
            product={selectedProductDetails}
            relatedProducts={relatedProducts}
            isFavorite={!!favoritesMap[selectedProductDetails.productId]}
            onClose={() => setSelectedProductDetails(null)}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onBuyNow={handleStartBuyNow}
            onSelectProduct={handleOpenDetails}
          />
        )}

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
      </React.Suspense>
    </div>
  );
};

export default Dashboard;

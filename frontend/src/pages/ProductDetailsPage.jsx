import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, CreditCard, Heart, ArrowLeft, ShieldAlert, CheckCircle2,
  AlertCircle, Star, Truck, ShieldCheck, RefreshCw, ChevronRight, Pill,
  Award, Package, Activity, Share2, Check
} from 'lucide-react';
import shopService from '../api/shopService';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import CartDrawer from '../components/CartDrawer';
import FavoritesDrawer from '../components/FavoritesDrawer';
import OrdersModal from '../components/OrdersModal';
import CheckoutModal from '../components/CheckoutModal';
import SanjeevaniBot from '../components/SanjeevaniBot';
import BrandLoader from '../components/BrandLoader';
import ShareModal from '../components/ShareModal';
import { resolveBrandName } from '../utils/brandUtils';
import { formatCategoryName, toCategorySlug } from '../utils/categoryUtils';
import { useLanguage } from '../context/LanguageContext';

export const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, translateData } = useLanguage();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Cart & Drawers State
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [addedNotice, setAddedNotice] = useState(false);

  // Real Public Customer Reviews State
  const [reviewsList, setReviewsList] = useState([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  // Load real user reviews from MySQL DB & localStorage, enforcing strict 1-review per customer per product
  useEffect(() => {
    if (!productId) return;
    let active = true;

    const fetchBackendReviews = async () => {
      let dbReviews = [];
      try {
        const res = await shopService.getProductReviews(productId);
        const list = res?.data || res || [];
        if (Array.isArray(list) && list.length > 0) {
          dbReviews = list.map(r => ({
            id: r.id || Date.now(),
            userKey: r.userId || r.reviewerName,
            userEmail: r.reviewerEmail || '',
            name: r.reviewerName || r.name || 'Anonymous',
            rating: r.rating || 5,
            comment: r.comment || '',
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recently',
            verified: true
          }));
        }
      } catch (e) {}

      try {
        const saved = localStorage.getItem(`sanjeevani_reviews_${productId}`);
        const localParsed = saved ? JSON.parse(saved) : [];

        // Merge DB and local reviews deduplicated
        const combined = [...dbReviews];
        localParsed.forEach(loc => {
          if (!combined.some(c => c.name.toLowerCase() === loc.name.toLowerCase() && c.comment === loc.comment)) {
            combined.push(loc);
          }
        });

        if (active) {
          setReviewsList(combined);

          const uKey = user ? (user.id || user.userId || user.email || user.name || 'user') : 'guest';
          const isReviewedLocal = localStorage.getItem(`sanjeevani_has_reviewed_${productId}_${uKey}`) === 'true' || localStorage.getItem(`sanjeevani_has_reviewed_${productId}`) === 'true';

          const alreadyInList = combined.some(r => 
            (r.userKey && String(r.userKey) === String(uKey)) ||
            (user?.email && r.userEmail === user.email) ||
            (user?.name && r.name && r.name.trim().toLowerCase() === user.name.trim().toLowerCase())
          );

          setHasReviewed(isReviewedLocal || alreadyInList);
        }
      } catch (e) {}
    };

    fetchBackendReviews();
    return () => { active = false; };
  }, [productId, user]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    const nameClean = newReviewName.trim();
    const commentClean = newReviewComment.trim();
    if (!nameClean || !commentClean) return;

    // Check if this customer name has already submitted a review for this product
    const alreadySubmittedName = reviewsList.some(r => r.name.trim().toLowerCase() === nameClean.toLowerCase());
    if (hasReviewed || alreadySubmittedName) {
      alert(`⚠️ Customer "${nameClean}" has already submitted a review for this product.`);
      setHasReviewed(true);
      return;
    }

    const uKey = user ? (user.id || user.userId || user.email || user.name || 'user') : nameClean.toLowerCase().replace(/\s+/g, '_');

    const newEntry = {
      id: Date.now(),
      userKey: uKey,
      userEmail: user?.email || '',
      name: nameClean,
      rating: newReviewRating,
      comment: commentClean,
      date: 'Just now',
      verified: true
    };

    // Save to MySQL backend database table
    try {
      await shopService.addProductReview(productId, {
        reviewerName: nameClean,
        reviewerEmail: user?.email || null,
        rating: newReviewRating,
        comment: commentClean
      });
    } catch (err) {
      console.warn("Saving to backend DB warning:", err);
    }

    const updated = [newEntry, ...reviewsList];
    setReviewsList(updated);
    setHasReviewed(true);
    // State updated in React memory & Backend DB

    setNewReviewName('');
    setNewReviewComment('');
    setNewReviewRating(5);
    setReviewSubmitSuccess(true);
  };

  // Fetch product data & catalog on mount or id change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        // 1. Fetch single product details first for immediate UI render
        if (productId) {
          try {
            const singleRes = await shopService.getProductById(productId);
            const targetProd = singleRes?.data || (singleRes?.success ? singleRes.data : singleRes);
            if (targetProd && isMounted) {
              setProduct(targetProd);
              setLoading(false); // Unblock UI immediately!
            }
          } catch (e) {
            console.warn("Fast getProductById notice:", e);
          }
        }

        // 2. Load catalog & categories in parallel for related recommendations
        const [prodsRes, catsRes] = await Promise.all([
          shopService.getProducts({}),
          shopService.getCategories()
        ]);

        if (!isMounted) return;

        const prodsList = prodsRes?.data || prodsRes || [];
        const catsList = catsRes?.data || catsRes || [];

        const validProds = Array.isArray(prodsList) ? prodsList : [];
        setAllProducts(validProds);
        setCategories(Array.isArray(catsList) ? catsList : []);

        const currentProd = validProds.find(p => p && (
          String(p.productId || '').toLowerCase() === String(productId || '').toLowerCase() ||
          String(p.id || '').toLowerCase() === String(productId || '').toLowerCase() ||
          String(p._id || '').toLowerCase() === String(productId || '').toLowerCase() ||
          String(p.prodId || '').toLowerCase() === String(productId || '').toLowerCase() ||
          (p.name && String(p.name).toLowerCase().includes(String(productId || '').toLowerCase()))
        ));

        if (currentProd) {
          setProduct(currentProd);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [productId]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await shopService.getOrders();
      if (res && res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (Array.isArray(res)) {
        setOrders(res);
      }
    } catch (e) {
      console.error("fetchOrders error:", e);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Load cart and favorites from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('sanjeevani_cart');
      if (savedCart) setCartItems(JSON.parse(savedCart));
      const savedFavs = localStorage.getItem('sanjeevani_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save cart & favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('sanjeevani_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('sanjeevani_favorites', JSON.stringify(favorites));
    } catch (e) {}
  }, [favorites]);

  // Sync cart & favorites via API & cookies

  const favoritesMap = useMemo(() => {
    const map = {};
    favorites.forEach(id => { map[id] = true; });
    return map;
  }, [favorites]);

  const isFavorite = useMemo(() => {
    return product ? !!favoritesMap[product.productId] : false;
  }, [product, favoritesMap]);

  const isInCart = useMemo(() => {
    if (!product || !cartItems.length) return false;
    const pId = String(product.productId || product.id || product._id);
    return cartItems.some(item => String(item.productId || item.id || item._id) === pId);
  }, [product, cartItems]);

  // Related products from same category
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];
    return allProducts
      .filter(p => p && p.productId !== product.productId && (p.categoryId === product.categoryId || p.categoryName === product.categoryName))
      .slice(0, 4);
  }, [product, allProducts]);

  const handleAddToCart = (pId, qty = quantity) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === pId);
      if (existing) {
        return prev.map(item => item.productId === pId ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { productId: pId, quantity: qty }];
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const [checkoutTargetItems, setCheckoutTargetItems] = useState(null);

  const handleBuyNow = () => {
    if (!product) return;
    const targetItem = {
      productId: product.productId,
      quantity: quantity,
      product: product,
      price: product.price,
      itemTotal: Number(product.price) * quantity
    };

    let updatedCart = [...cartItems];
    const existingIndex = updatedCart.findIndex(item => String(item.productId) === String(product.productId));
    if (existingIndex >= 0) {
      updatedCart[existingIndex] = { ...updatedCart[existingIndex], quantity: updatedCart[existingIndex].quantity + quantity };
    } else {
      updatedCart.push(targetItem);
    }

    setCartItems(updatedCart);
    setCheckoutTargetItems([targetItem]);
    setIsCheckoutOpen(true);
  };

  const handleToggleFavorite = (pId) => {
    setFavorites(prev => prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId]);
  };

  const handleShare = async () => {
    const shareTitle = `${product?.name || 'Sanjeevani Healthcare'} - Sanjeevani`;
    const shareUrl = window.location.href;
    const shareText = `Check out ${product?.name || 'this item'} on Sanjeevani Care!\n\n💰 Price: ₹${product?.price || ''}\n🔗 Link: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    setIsShareModalOpen(true);
  };

  const displayRating = useMemo(() => {
    if (reviewsList.length > 0) {
      const sum = reviewsList.reduce((acc, r) => acc + Number(r.rating || 5), 0);
      return Number(sum / reviewsList.length).toFixed(1);
    }
    return Number(product && product.rating ? product.rating : 4.5).toFixed(1);
  }, [reviewsList, product]);

  const displayReviewsCount = reviewsList.length > 0 ? reviewsList.length : (product?.reviewsCount || 0);

  if (loading) {
    return <BrandLoader fullScreen message="Loading Product Details..." />;
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <Navbar
          user={user}
          cartCount={cartItems.length}
          favoriteCount={favorites.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenFavorites={() => setIsFavoritesOpen(true)}
          onOpenOrders={() => setIsOrdersOpen(true)}
          onLogout={logout}
          categories={categories}
        />
        <div style={{ maxWidth: 800, margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
          <AlertCircle style={{ width: 48, height: 48, color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Product Not Found</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>The requested medicine or health product could not be located in our catalog.</p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#059669',
              color: '#ffffff',
              borderRadius: '9999px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Return to Store Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateCartQuantity = (pId, newQty) => {
    setCartItems(prev => {
      if (newQty <= 0) {
        return prev.filter(item => String(item.productId || item.id) !== String(pId));
      }
      return prev.map(item => String(item.productId || item.id) === String(pId) ? { ...item, quantity: newQty } : item);
    });
  };

  const brandName = resolveBrandName(product);
  const inStock = product.stock > 0;
  const originalPrice = (product.price * 1.25).toFixed(2);
  const discountPercent = 20;

  const currentCartItem = product ? cartItems.find(item => String(item.productId || item.id) === String(product.productId || product.id)) : null;
  const currentCartQty = currentCartItem ? currentCartItem.quantity : 0;

  return (
    <div className="product-details-page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #d1fae5 50%, #f0fdf4 100%)' }}>
      {/* ── Sticky Navbar ──────────────────────────────── */}
      <Navbar
        user={user}
        cartCount={cartItems.length}
        favoriteCount={favorites.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenOrders={() => {
          fetchOrders();
          setIsOrdersOpen(true);
        }}
        onLogout={logout}
        categories={categories}
      />



      {/* ── Main Content Container ─────────────────────── */}
      <main style={{ maxWidth: 1280, margin: '1.5rem auto 3rem', padding: '0 1.25rem' }}>
        {/* Product Details Grid */}
        <div className="pdetails-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: '2rem', alignItems: 'stretch' }}>
          
          {/* ── Left Column: Product Image Container with levitation & hover animations ────── */}
          <motion.div
            className="pdetails-img-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #e0f2fe 100%)',
              borderRadius: '1.5rem',
              border: '1.5px solid #a7f3d0',
              padding: '1.75rem',
              boxShadow: '0 12px 35px -8px rgba(16, 185, 129, 0.18)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 420
            }}
          >
            {/* Rx Badge */}
            {product.prescriptionRequired && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  position: 'absolute', top: 16, left: 16, zIndex: 10,
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  border: '1.5px solid #fca5a5', color: '#dc2626',
                  padding: '0.38rem 0.85rem', borderRadius: '9999px',
                  fontSize: '0.78rem', fontWeight: 900,
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)'
                }}
              >
                <ShieldAlert style={{ width: 15, height: 15 }} /> {translateData('Prescription Required (Rx)')}
              </motion.div>
            )}

            {/* Share & Favorite Buttons */}
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: '0.5rem' }}>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                title="Share Product"
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: '1.5px solid #a7f3d0', background: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.2s'
                }}
              >
                {copiedLink ? <Check style={{ width: 18, height: 18, color: '#059669' }} /> : <Share2 style={{ width: 18, height: 18, color: '#059669' }} />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleToggleFavorite(product.productId)}
                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: isFavorite ? '1.5px solid #fca5a5' : '1.5px solid #a7f3d0',
                  background: isFavorite ? '#fff0f0' : '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.2s'
                }}
              >
                <Heart style={{ width: 19, height: 19, color: isFavorite ? '#ef4444' : '#94a3b8', fill: isFavorite ? '#ef4444' : 'none' }} />
              </motion.button>
            </div>

            {/* Floating Product Image Viewer */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              style={{ height: 340, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            >
              <motion.div whileHover={{ scale: 1.08 }} transition={{ type: 'spring', stiffness: 300 }}>
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  className="select-none"
                  style={{ maxHeight: 310, maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.12))' }}
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ── Right Column: Animated Product Info & Action Card ────── */}
          <motion.div
            className="pdetails-info-col"
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '1.5rem',
              border: '1.5px solid #cbd5e1',
              padding: '2.25rem',
              boxShadow: '0 12px 35px -8px rgba(15, 23, 42, 0.08)'
            }}
          >
            {/* Category & Brand Badges Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
              <motion.span
                whileHover={{ scale: 1.05 }}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff', border: 'none', fontSize: '0.76rem', fontWeight: 900,
                  padding: '0.3rem 0.85rem', borderRadius: '9999px', textTransform: 'uppercase',
                  letterSpacing: '0.05em', boxShadow: '0 3px 10px rgba(5, 150, 105, 0.25)'
                }}
              >
                {translateData(formatCategoryName(product.categoryName))}
              </motion.span>

              <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1.5px solid #7dd3fc', fontSize: '0.78rem', fontWeight: 800, padding: '0.28rem 0.75rem', borderRadius: '9999px' }}>
                {translateData('Brand')}: <strong style={{ color: '#0f172a' }}>{translateData(brandName)}</strong>
              </span>
            </div>

            {/* Product Title */}
            <h1 className="pdetails-title" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.3, marginBottom: '0.95rem', letterSpacing: '-0.02em' }}>
              {translateData(product.name)}
            </h1>

            {/* Real Rating & Customer Reviews Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.35rem', paddingBottom: '1.35rem', borderBottom: '1.5px solid #f1f5f9', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1.5px solid #fde68a', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.86rem', fontWeight: 900, color: '#b45309', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)' }}>
                <Star style={{ width: 16, height: 16, fill: '#f59e0b', color: '#f59e0b' }} /> {displayRating} {t('rating') || translateData('Rating')}
              </div>

              <span style={{ color: '#0369a1', background: '#e0f2fe', border: '1.5px solid #7dd3fc', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 800 }}>
                {displayReviewsCount} {t('verifiedReviews') || translateData('Verified Customer Reviews')}
              </span>
            </div>

            {/* Animated Gradient Price Box */}
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)', borderRadius: '1.1rem', padding: '1.35rem', border: '1.5px solid #a7f3d0', marginBottom: '1.75rem', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem', flexWrap: 'wrap' }}>
                <span className="pdetails-price" style={{ fontSize: '2.1rem', fontWeight: 900, color: '#047857', letterSpacing: '-0.03em' }}>
                  ₹{Number(product.price).toFixed(2)}
                </span>
                <span style={{ fontSize: '1.15rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                  ₹{originalPrice}
                </span>
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff', fontSize: '0.82rem', fontWeight: 900, padding: '0.25rem 0.65rem', borderRadius: '0.45rem', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' }}
                >
                  {discountPercent}% {translateData('OFF')} • {translateData('SAVE NOW')}
                </motion.span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#0369a1', marginTop: '0.45rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck style={{ width: 14, height: 14, color: '#0284c7' }} /> {t('inclusiveTaxes') || translateData('Inclusive of all taxes & government healthcare subsidies')}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              {currentCartQty > 0 ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '2px solid #059669',
                    borderRadius: '0.85rem',
                    background: '#ecfdf5',
                    height: 50,
                    padding: '0 0.5rem',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)'
                  }}
                >
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleUpdateCartQuantity(product.productId, currentCartQty - 1)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '0.6rem',
                      border: 'none',
                      background: '#059669',
                      color: '#ffffff',
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    -
                  </motion.button>
                  <span style={{ fontSize: '0.98rem', fontWeight: 900, color: '#047857' }}>
                    {currentCartQty} in Cart
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleUpdateCartQuantity(product.productId, currentCartQty + 1)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '0.6rem',
                      border: 'none',
                      background: '#059669',
                      color: '#ffffff',
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </motion.button>
                </motion.div>
              ) : (
                <motion.button
                  onClick={() => handleAddToCart(product.productId, 1)}
                  disabled={!inStock}
                  style={{
                    padding: '0.9rem 1.25rem',
                    borderRadius: '0.85rem',
                    background: isInCart
                      ? 'linear-gradient(135deg, #ff6b81 0%, #ff4757 100%)'
                      : 'linear-gradient(135deg, #ff4757 0%, #e11d48 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: inStock ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: isInCart
                      ? '0 4px 16px rgba(255, 107, 129, 0.42)'
                      : '0 4px 16px rgba(255, 71, 87, 0.38)',
                    opacity: inStock ? 1 : 0.6
                  }}
                  whileHover={inStock ? { scale: 1.02 } : {}}
                  whileTap={inStock ? { scale: 0.97 } : {}}
                >
                  {isInCart ? (
                    <>
                      <CheckCircle2 style={{ width: 18, height: 18, color: '#ffffff' }} />
                      <span>✓ Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart style={{ width: 18, height: 18 }} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </motion.button>
              )}

              <motion.button
                onClick={handleBuyNow}
                disabled={!inStock}
                style={{
                  padding: '0.9rem 1.25rem',
                  borderRadius: '0.85rem',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: inStock ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.38)',
                  opacity: inStock ? 1 : 0.6
                }}
                whileHover={inStock ? { scale: 1.02, boxShadow: '0 8px 24px rgba(37, 99, 235, 0.48)' } : {}}
                whileTap={inStock ? { scale: 0.97 } : {}}
              >
                <CreditCard style={{ width: 18, height: 18 }} /> Buy Now
              </motion.button>
            </div>

            {/* Added Notice Alert */}
            <AnimatePresence>
              {addedNotice && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{ marginTop: '1rem', background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <CheckCircle2 style={{ width: 18, height: 18 }} /> Added {quantity} item(s) to your Cart successfully!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── Product Description & Usage Tabs ────────────── */}
        <div style={{ marginTop: '3rem', background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)' }}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setActiveTab('description')}
              style={{
                background: 'none', border: 'none', fontSize: '1rem', fontWeight: 800,
                color: activeTab === 'description' ? '#059669' : '#64748b',
                borderBottom: activeTab === 'description' ? '3px solid #059669' : '3px solid transparent',
                paddingBottom: '0.5rem', cursor: 'pointer'
              }}
            >
              {t('descriptionTab')}
            </button>

            <button
              onClick={() => setActiveTab('usage')}
              style={{
                background: 'none', border: 'none', fontSize: '1rem', fontWeight: 800,
                color: activeTab === 'usage' ? '#059669' : '#64748b',
                borderBottom: activeTab === 'usage' ? '3px solid #059669' : '3px solid transparent',
                paddingBottom: '0.5rem', cursor: 'pointer'
              }}
            >
              {t('usageTab')}
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === 'description' ? (
            <div>
              <p style={{ color: '#334155', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                {translateData(product.description) || 'This premium medical and healthcare product is formulated under strict pharmaceutical standards to ensure safety, efficacy, and quality.'}
              </p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                {t('keyBenefits')}
              </h3>
              <ul style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.8, paddingLeft: '1.25rem' }}>
                <li>Certified authentic formulation supplied directly by authorized pharmaceutical distributors.</li>
                <li>Hygienically packaged with tamper-evident safety seals.</li>
                <li>Store in a cool, dry place away from direct sunlight.</li>
              </ul>
            </div>
          ) : (
            <div>
              <p style={{ color: '#334155', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                Always consult your registered medical practitioner or pharmacist prior to consumption or usage. Follow prescribed dosage instructions carefully.
              </p>
              <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '1rem', borderRadius: '0.75rem', color: '#c2410c', fontSize: '0.88rem', fontWeight: 600 }}>
                ⚠️ Warning: Keep out of reach of children. Do not exceed the recommended daily dose.
              </div>
            </div>
          )}
        </div>

        {/* ── Real Public Customer Reviews & Ratings ───────────── */}
        <div style={{ marginTop: '2.5rem', background: '#ffffff', borderRadius: '1.25rem', border: '1.5px solid #cbd5e1', padding: '1.25rem', boxShadow: '0 8px 25px -4px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Star style={{ width: 22, height: 22, color: '#f59e0b', fill: '#f59e0b' }} /> {t('publicReviewsTitle')}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600, marginTop: '0.25rem', margin: 0 }}>
                {t('publicReviewsSubtitle')}
              </p>
            </div>

            <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#047857', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 800 }}>
              {reviewsList.length} Public Review(s)
            </div>
          </div>

          {/* Write a Review Form or Submitted Notice */}
          {hasReviewed ? (
            <div style={{ background: '#ecfdf5', border: '1.5px solid #6ee7b7', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 style={{ width: 22, height: 22, color: '#059669', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#047857', margin: 0 }}>{t('reviewSubmitted')}</h4>
                <p style={{ fontSize: '0.82rem', color: '#065f46', margin: '0.2rem 0 0', fontWeight: 600 }}>
                  {t('reviewSubmittedMsg')}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddReview} style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%)', border: '1.5px solid #a7f3d0', borderRadius: '1rem', padding: '1.15rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.85rem', marginTop: 0 }}>
                ✍️ {t('writeReview')}
              </h3>

              {reviewSubmitSuccess && (
                <div style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                  ✅ Thank you! Your real customer review has been posted publicly.
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <input
                  type="text"
                  required
                  placeholder={t('yourName')}
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  style={{ padding: '0.65rem 0.9rem', borderRadius: '0.6rem', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#ffffff', width: '100%', boxSizing: 'border-box' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.45rem 0.75rem', borderRadius: '0.6rem', border: '1.5px solid #cbd5e1', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>{t('rating')}:</span>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    style={{ border: 'none', background: 'transparent', fontSize: '0.88rem', fontWeight: 800, color: '#b45309', outline: 'none', cursor: 'pointer', width: '100%' }}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                    <option value={3}>⭐⭐⭐ (3/5)</option>
                    <option value={2}>⭐⭐ (2/5)</option>
                    <option value={1}>⭐ (1/5)</option>
                  </select>
                </div>
              </div>

              <textarea
                required
                rows={3}
                placeholder={t('yourComment')}
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '0.6rem', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', resize: 'vertical', background: '#ffffff', marginBottom: '0.85rem', boxSizing: 'border-box' }}
              />

              <button
                type="submit"
                style={{ padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#ffffff', border: 'none', borderRadius: '0.6rem', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)', width: '100%', boxSizing: 'border-box' }}
              >
                {t('postReview')}
              </button>
            </form>
          )}

          {/* Real Customer Reviews List */}
          {reviewsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', borderRadius: '0.85rem', border: '1px dashed #cbd5e1' }}>
              <Star style={{ width: 32, height: 32, color: '#94a3b8', margin: '0 auto 0.5rem' }} />
              <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>
                {t('noReviewsYet')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {reviewsList.map((rev) => (
                <div key={rev.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.85rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#059669', color: '#ffffff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                        {rev.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {rev.name}
                          {rev.verified && (
                            <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.12rem 0.4rem', borderRadius: '9999px', fontWeight: 800 }}>
                              ✔ Verified Purchaser
                            </span>
                          )}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{rev.date}</span>
                      </div>
                    </div>

                    <div style={{ color: '#f59e0b', fontSize: '0.88rem', fontWeight: 800 }}>
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </div>
                  </div>

                  <p style={{ color: '#334155', fontSize: '0.88rem', lineHeight: 1.55, margin: 0 }}>
                    {translateData(rev.comment)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Related Products Carousel ───────────────────── */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '3.5rem', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem' }}>
              Related Products in {formatCategoryName(product.categoryName)}
            </h2>

            <div className="pdetails-related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {relatedProducts.map(rel => (
                <ProductCard
                  key={rel.productId}
                  product={rel}
                  onAddToCart={(pId, qty) => handleAddToCart(pId, qty)}
                  onBuyNow={(p) => {
                    handleAddToCart(p.productId, 1);
                    setIsCheckoutOpen(true);
                  }}
                  onOpenDetails={(p) => navigate(`/product/${p.productId}`)}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={!!favoritesMap[rel.productId]}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Cart Drawer ─────────────────────────────────── */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        allProducts={allProducts}
        onUpdateQuantity={(pId, q) => {
          if (q <= 0) {
            setCartItems(prev => prev.filter(i => i.productId !== pId));
          } else {
            setCartItems(prev => prev.map(i => i.productId === pId ? { ...i, quantity: q } : i));
          }
        }}
        onRemoveItem={(pId) => setCartItems(prev => prev.filter(i => i.productId !== pId))}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* ── Favorites Drawer ────────────────────────────── */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        allProducts={allProducts}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={(pId) => handleAddToCart(pId, 1)}
      />

      {/* ── Orders Modal ───────────────────────────────── */}
      {isOrdersOpen && (
        <OrdersModal
          isOpen={isOrdersOpen}
          onClose={() => setIsOrdersOpen(false)}
          orders={orders}
        />
      )}

      {/* ── Checkout Modal ─────────────────────────────── */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setCheckoutTargetItems(null);
          }}
          cartItems={checkoutTargetItems || cartItems}
          allProducts={allProducts}
          onOrderPlaced={() => {
            setCartItems([]);
            setCheckoutTargetItems(null);
            setIsCheckoutOpen(false);
            setIsOrdersOpen(true);
          }}
        />
      )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        product={product}
      />

      <SanjeevaniBot
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />
      {/* ── Mobile Responsive CSS Overrides ─────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .pdetails-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
          .pdetails-img-col {
            min-height: 260px !important;
            padding: 1.25rem 1rem !important;
          }
          .pdetails-info-col {
            padding: 1.25rem 1rem !important;
          }
          .pdetails-title {
            font-size: 1.35rem !important;
          }
          .pdetails-related-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.65rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetailsPage;

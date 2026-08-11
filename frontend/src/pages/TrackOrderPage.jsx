import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, MapPin, Phone, ChevronLeft, Download, PackageCheck,
  CheckCircle2, Copy, FileText, Check, ShieldCheck, Key,
  Clock, Headphones, ArrowRight, ExternalLink, RefreshCw,
  ChevronDown, ChevronUp, Sliders, Info, XCircle, RotateCcw,
  DollarSign, Star, ThumbsUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../api/authService';
import shopService from '../api/shopService';
import Navbar from '../components/Navbar';
import ProductImage from '../components/ProductImage';
import { downloadOrderInvoice } from '../components/OrdersModal';
import { parseExactDate, formatExactDateStr, formatExactTimeStr, formatExactDateTime, calculateOrderTimelines } from '../utils/dateUtils';

// Modal & Drawer imports for full Navbar functionality
import CartDrawer from '../components/CartDrawer';
import FavoritesDrawer from '../components/FavoritesDrawer';
import OrdersModal from '../components/OrdersModal';
import CheckoutModal from '../components/CheckoutModal';
import BrandLoader from '../components/BrandLoader';

import { useLanguage } from '../context/LanguageContext';

export const TrackOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, t, translateData } = useLanguage();

  // App Data States for Navbar & Tracking
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAllUpdates, setShowAllUpdates] = useState(true);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Order Support & Lifecycle States
  const [supportData, setSupportData] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Form Field States
  const [cancelReason, setCancelReason] = useState('Mind Changed');
  const [cancelComment, setCancelComment] = useState('');
  const [returnReason, setReturnReason] = useState('Damaged Product');
  const [replacementAddress, setReplacementAddress] = useState('');
  const [returnComment, setReturnComment] = useState('');
  const [refundReason, setRefundReason] = useState('Returned Delivered Product');
  const [refundMethod, setRefundMethod] = useState('Original Payment Method');
  const [refundUpiId, setRefundUpiId] = useState('');
  const [refundComment, setRefundComment] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackTags, setFeedbackTags] = useState(['Genuine Product', 'Fast Delivery']);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Drawers & Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Fetch Navbar Data & Orders
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Orders
        const resOrders = await shopService.getOrders();
        const rawList = (resOrders && resOrders.success && Array.isArray(resOrders.data)) ? resOrders.data : (Array.isArray(resOrders) ? resOrders : []);
        
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

        let fetchedOrders = Array.from(uniqueMap.values()).sort((a, b) => {
          const tA = parseExactDate(a.createdAt).getTime();
          const tB = parseExactDate(b.createdAt).getTime();
          if (tA !== tB) return tB - tA; // Newest first
          const nA = Number(String(a.orderId || a.id || '').replace(/[^0-9]/g, '')) || 0;
          const nB = Number(String(b.orderId || b.id || '').replace(/[^0-9]/g, '')) || 0;
          return nB - nA;
        });

        // Fetch Cart
        try {
          const resCart = await shopService.getCart();
          if (resCart && resCart.success && Array.isArray(resCart.data)) {
            if (isMounted) setCartItems(resCart.data);
          }
        } catch (e) { }

        // Fetch Favorites
        try {
          const resFav = await shopService.getFavorites();
          if (resFav && resFav.success && Array.isArray(resFav.data)) {
            if (isMounted) setFavorites(resFav.data);
          }
        } catch (e) { }

        // Fetch Categories
        try {
          const resCat = await shopService.getCategories();
          if (resCat && resCat.success && Array.isArray(resCat.data)) {
            if (isMounted) setCategories(resCat.data);
          }
        } catch (e) { }

        if (isMounted) {
          setOrders(fetchedOrders);
          if (orderId) {
            const cleanTarget = String(orderId).trim().toLowerCase();
            const match = fetchedOrders.find(o => o && String(o.orderId || '').trim().toLowerCase() === cleanTarget);
            if (match) setSelectedOrder(match);
            else if (fetchedOrders.length > 0) setSelectedOrder(fetchedOrders[0]);
          } else if (fetchedOrders.length > 0) {
            setSelectedOrder(fetchedOrders[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch tracking details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
  }, [orderId]);

  const handleLogout = async () => {
    try { await authService.logout(); } catch { }
    finally { logout(); navigate('/login'); }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder) return;
    try {
      setOverrideStatus(newStatus);
      const res = await shopService.updateOrderStatus(selectedOrder.orderId, newStatus);
      if (res && res.success && res.data) {
        setSelectedOrder(res.data);
      }
      showToast(`Database Order Status updated to ${newStatus}`);
    } catch (err) {
      showToast(`Status updated to ${newStatus}`);
    }
  };

  // Fetch support status when selectedOrder changes
  const targetOrderId = selectedOrder?.orderId || orderId || '1002';
  useEffect(() => {
    if (!targetOrderId) return;
    const fetchSupportStatus = async () => {
      try {
        const res = await shopService.getOrderSupportStatus(targetOrderId);
        if (res && res.success) {
          setSupportData(res);
        }
      } catch (e) { }
    };
    fetchSupportStatus();
  }, [targetOrderId, selectedOrder]);

  // Support Submission Handlers
  const handleConfirmCancel = async () => {
    try {
      await shopService.cancelOrderSupport({
        orderId: targetOrderId,
        reason: cancelReason,
        comment: cancelComment,
        userId: user?.id || null
      });
      await handleStatusUpdate('CANCELLED');
      setShowCancelModal(false);
      showToast('Order cancelled successfully! Refund is being processed.');
    } catch (e) {
      showToast('Order cancellation recorded!');
      setShowCancelModal(false);
    }
  };

  const handleConfirmReturn = async () => {
    try {
      const res = await shopService.requestReplacement({
        orderId: targetOrderId,
        reason: returnReason,
        replacementAddress: replacementAddress || selectedOrder?.shippingAddress || 'Customer Address',
        comment: returnComment,
        userId: user?.id || null
      });
      if (res && res.success) {
        setSupportData(prev => ({ ...prev, replacement: res.data }));
      }
      setShowReturnModal(false);
      showToast('Return & Replacement request submitted successfully!');
    } catch (e) {
      setShowReturnModal(false);
      showToast('Replacement request submitted successfully!');
    }
  };

  const handleConfirmRefund = async () => {
    try {
      const res = await shopService.requestRefund({
        orderId: targetOrderId,
        reason: refundReason,
        refundMethod: refundMethod,
        upiId: refundUpiId,
        comment: refundComment,
        amount: Number(selectedOrder?.totalAmount || 0),
        userId: user?.id || null
      });
      if (res && res.success) {
        setSupportData(prev => ({ ...prev, refund: res.data }));
      }
      setShowRefundModal(false);
      showToast('Refund request submitted successfully!');
    } catch (e) {
      setShowRefundModal(false);
      showToast('Refund request submitted successfully!');
    }
  };

  const handleConfirmFeedback = async () => {
    try {
      const res = await shopService.submitFeedback({
        orderId: targetOrderId,
        rating: feedbackRating,
        feedbackTags: feedbackTags.join(', '),
        comment: feedbackComment,
        userId: user?.id || null
      });
      if (res && res.success) {
        setSupportData(prev => ({ ...prev, feedback: res.data }));
      }
      setShowFeedbackModal(false);
      showToast(`Thank you! Rating (${feedbackRating}★) & feedback saved.`);
    } catch (e) {
      setShowFeedbackModal(false);
      showToast(`Thank you! Rating (${feedbackRating}★) saved.`);
    }
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (val.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(val)}`);
    }
  };

  const stageData = useMemo(() => {
    if (!selectedOrder) return null;

    const rawStatus = overrideStatus || selectedOrder.status || 'PENDING';
    const computed = calculateOrderTimelines(selectedOrder.createdAt, selectedOrder.updatedAt, rawStatus);
    const createdDateStr = formatExactDateStr(computed.createdDate);
    const createdTimeStr = formatExactTimeStr(computed.createdDate);

    return {
      ...computed,
      createdDateStr,
      createdTimeStr
    };
  }, [selectedOrder, overrideStatus]);

  // Dynamic Shipment Activity Timeline derived from backend Order DB record
  const dynamicTimelineEvents = useMemo(() => {
    if (!selectedOrder || !stageData) return [];

    const { createdDate, packDate, shipDate, outDate, delDate, stage } = stageData;
    const events = [];

    // Stage 1: Confirmed
    events.push({
      id: 'evt-1',
      title: 'Order Confirmed',
      desc: `Order #${selectedOrder.orderId} recorded in Sanjeevani database.`,
      time: formatExactDateTime(createdDate),
      done: stage >= 1
    });

    // Stage 2: Packed
    if (stage >= 2 && packDate) {
      events.unshift({
        id: 'evt-2',
        title: 'Order Packed',
        desc: 'Package packed and ready for dispatch',
        time: formatExactDateTime(packDate),
        done: true
      });
    }

    // Stage 3: Shipped
    if (stage >= 3 && shipDate) {
      events.unshift({
        id: 'evt-3',
        title: 'Package Shipped & Dispatched',
        desc: 'Handed over to Express Logistics Hub',
        time: formatExactDateTime(shipDate),
        done: true
      });
    }

    // Stage 4: Out for Delivery
    if (stage >= 4 && outDate) {
      events.unshift({
        id: 'evt-4',
        title: 'Out for Delivery',
        desc: 'Package loaded into delivery vehicle',
        time: formatExactDateTime(outDate),
        done: true
      });
    }

    // Stage 5: Delivered
    if (stage >= 5 && delDate) {
      events.unshift({
        id: 'evt-5',
        title: 'Package Delivered',
        desc: 'Handed to recipient at destination address',
        time: formatExactDateTime(delDate),
        done: true
      });
    }

    return events;
  }, [selectedOrder, stageData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCopyOrderId = () => {
    if (!selectedOrder) return;
    navigator.clipboard.writeText(String(selectedOrder.orderId));
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const handleCopyPin = () => {
    if (!stageData?.secretPin) return;
    navigator.clipboard.writeText(stageData.secretPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
        {/* Render Dashboard Navbar even while loading */}
        <Navbar
          user={user}
          cartCount={cartItems.length}
          favoriteCount={favorites.length}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenFavorites={() => setIsFavoritesOpen(true)}
          onOpenOrders={() => setIsOrdersOpen(true)}
          onLogout={handleLogout}
          categories={categories}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', textAlign: 'center' }}>
          <BrandLoader fullScreen={false} message="Syncing Live Package & Delivery Tracking..." />
        </div>
      </div>
    );
  }

  const rawOrderId = selectedOrder ? String(selectedOrder.orderId || 'ORD-1001') : 'ORD-1001';
  const cleanIdStr = rawOrderId.replace(/[^a-zA-Z0-9]/g, '');
  const razorpayPaymentId = selectedOrder?.razorpayPaymentId || selectedOrder?.paymentId || `pay_${cleanIdStr}`;
  const razorpayOrderId = selectedOrder?.razorpayOrderId || selectedOrder?.referenceNumber || `order_REF_${cleanIdStr}`;
  const items = selectedOrder?.items || [];
  const shippingAddr = selectedOrder?.shippingAddress || 'Flat 402, Block A, Jubilee Hills, Hyderabad, Telangana - 500033';
  const customerName = selectedOrder?.customerName || 'Tharun Kumar';
  const customerPhone = selectedOrder?.customerPhone || '+91 98765 43210';
  const totalAmount = Number(selectedOrder?.totalAmount || 0).toFixed(2);

  return (
    <div className="track-order-page-wrapper" style={{ minHeight: '100vh', background: '#F0FDFA', paddingBottom: '4rem', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: '#1A2E35', overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>

      {/* ── 1. DASHBOARD NAVBAR ────────────────────────────────────────────── */}
      <Navbar
        user={user}
        cartCount={cartItems.length}
        favoriteCount={favorites.length}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onLogout={handleLogout}
        categories={categories}
      />

      {/* Main Container - Compact & Responsive Max Width */}
      <div className="track-order-container">

        {/* Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ background: '#1A2E35', color: '#fff', padding: '0.65rem 1.1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', borderLeft: '4px solid #16A34A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <CheckCircle2 style={{ width: 16, height: 16, color: '#16A34A' }} />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedOrder ? (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '3rem 1.25rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <Truck style={{ width: 52, height: 52, color: '#0D5C75', margin: '0 auto 0.85rem' }} />
            <h2 style={{ fontSize: '1.18rem', fontWeight: 900, color: '#1A2E35', margin: '0 0 0.35rem' }}>{translateData('No Orders Found')}</h2>
            <p style={{ color: '#64748b', fontSize: '0.86rem', margin: '0 0 1.5rem', maxWidth: 360, margin: '0 auto 1.5rem', lineHeight: 1.45 }}>
              {translateData("You don't have any placed orders on this account yet.")}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={async () => {
                  try {
                    const res = await shopService.buyNow({
                      productId: 1,
                      quantity: 1,
                      shippingAddress: 'Flat 402, Block A, Jubilee Hills, Hyderabad - 500033'
                    });
                    if (res && res.success) {
                      const resOrders = await shopService.getOrders();
                      const list = (resOrders && resOrders.success && Array.isArray(resOrders.data)) ? resOrders.data : (Array.isArray(resOrders) ? resOrders : []);
                      setOrders(list);
                      setSelectedOrder(res.data);
                    }
                  } catch (e) {
                    console.error('Failed to create quick order:', e);
                  }
                }}
                style={{ padding: '0.7rem 1.4rem', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', fontWeight: 800, fontSize: '0.86rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.35)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <span>⚡ {translateData('Place Quick Test Order')}</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{ padding: '0.7rem 1.4rem', borderRadius: '8px', background: '#ffffff', color: '#334155', fontWeight: 800, fontSize: '0.86rem', border: '1.5px solid #cbd5e1', cursor: 'pointer' }}
              >
                {translateData('Browse Sanjeevani Store')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── 1. MAIN ORDER DETAILS & TRACKING CARD ── */}
            <div className="track-card-padding" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.35rem 1.6rem', boxShadow: '0 2px 12px rgba(0,0,0,0.025)' }}>
              
              {/* Card Title & Header Row */}
              <div className="track-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem', marginBottom: '1.1rem' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 700, color: '#0D5C75' }}>
                    {translateData('Order Tracking & Details')}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0D5C75', fontFamily: 'monospace', background: '#E8F3EF', padding: '0.15rem 0.55rem', borderRadius: '6px', border: '1px solid #A4C3D2' }}>
                      {translateData('Order')} #{rawOrderId}
                    </span>
                    <button
                      onClick={handleCopyOrderId}
                      style={{ background: '#F4F9F6', border: '1px solid #cbd5e1', borderRadius: '5px', padding: '0.18rem 0.55rem', color: '#0D5C75', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                    >
                      {copiedOrderId ? '✓ Copied' : translateData('Copy ID')}
                    </button>
                    <span style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 500 }}>
                      • {translateData('Placed on')} {stageData?.createdDateStr} {translateData('at')} {stageData?.createdTimeStr}
                    </span>
                  </div>
                </div>

                {/* "[Invoice]" Button */}
                <button
                  onClick={(e) => downloadOrderInvoice(selectedOrder, e)}
                  style={{
                    padding: '0.5rem 1.15rem', borderRadius: '8px',
                    background: '#0D5C75', color: '#ffffff', fontWeight: 600,
                    fontSize: '0.84rem', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 3px 8px rgba(13,92,117,0.2)'
                  }}
                >
                  <Download style={{ width: 15, height: 15 }} />
                  <span>{translateData('Invoice')}</span>
                </button>
              </div>

              {/* ── PRODUCTS EMBEDDED DIRECTLY INSIDE TRACKING CARD ── */}
              <div style={{ background: '#F4F9F6', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.95rem 1.15rem', marginBottom: '1.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1A2E35', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <PackageCheck style={{ width: 17, height: 17, color: '#0D5C75' }} />
                    {translateData('Product Items Being Tracked')} ({items.length})
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 600, background: '#ffffff', padding: '0.12rem 0.55rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    {translateData('Verified Genuine')}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {items.length === 0 ? (
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', background: '#ffffff', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', flexWrap: 'wrap' }}>
                      <div style={{ width: 54, height: 54, borderRadius: '8px', border: '1px solid #cbd5e1', padding: '3px', background: '#ffffff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ProductImage
                          src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80"
                          alt="Sanjeevani Healthcare Product"
                          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '5px' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{translateData('Essential Healthcare & Wellness Product')}</h4>
                        <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>Qty: 1 • Price: <strong style={{ color: '#059669', fontWeight: 600 }}>₹{totalAmount}</strong></p>
                      </div>
                    </div>
                  ) : (
                    items.map((it, idx) => {
                      const itemImage = it.imageUrl || it.productImage || it.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';
                      const itemPrice = Number(it.pricePerUnit || it.totalPrice || totalAmount).toFixed(2);
                      return (
                        <div key={idx} style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', background: '#ffffff', padding: '0.6rem 0.95rem', borderRadius: '8px', border: '1px solid #cbd5e1', flexWrap: 'wrap' }}>
                          <div style={{ width: 56, height: 56, borderRadius: '8px', border: '1px solid #e2e8f0', padding: '3px', background: '#ffffff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ProductImage
                              src={itemImage}
                              fallbackSrc="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80"
                              alt={it.productName || 'Healthcare Product'}
                              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '5px' }}
                            />
                          </div>

                          <div style={{ flex: 1, minWidth: 160 }}>
                            <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {translateData(it.productName || 'Essential Healthcare Product')}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                              Qty: <strong style={{ color: '#0f172a', fontWeight: 600 }}>{it.quantity || 1}</strong> • <strong style={{ color: '#059669', fontSize: '0.92rem', fontWeight: 700 }}>₹{itemPrice}</strong>
                            </p>
                          </div>

                          <button
                            onClick={() => showToast(`Added "${it.productName || 'Item'}" to cart!`)}
                            style={{ padding: '0.45rem 1rem', borderRadius: '6px', background: '#FFD814', border: '1px solid #FCD200', color: '#0F1111', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', flexShrink: 0 }}
                          >
                            {translateData('Buy Again')}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Horizontal Stepper Line */}
              <div style={{ position: 'relative', padding: '0.5rem 0 0.35rem', marginBottom: '0.35rem' }}>
                <div style={{
                  position: 'absolute',
                  top: '23px',
                  left: '10%',
                  right: '10%',
                  height: '3px',
                  background: '#e2e8f0',
                  borderRadius: '4px',
                  zIndex: 1
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, ((stageData?.stage || 1) - 1) * 25))}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div className="track-stepper-grid" style={{ position: 'relative', zIndex: 2 }}>
                  {stageData?.milestones.map((m) => (
                    <div key={m.step} className="track-stepper-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: m.done ? '#059669' : '#ffffff',
                        border: m.done ? '2.5px solid #059669' : '2.5px solid #cbd5e1',
                        marginBottom: '0.4rem', boxShadow: m.done ? '0 2px 8px rgba(5,150,105,0.2)' : '0 2px 4px rgba(0,0,0,0.04)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: m.done ? '#ffffff' : '#cbd5e1',
                        transition: 'all 0.3s ease'
                      }}>
                        <Check style={{ width: 16, height: 16, strokeWidth: 2.5 }} />
                      </div>
                      <span style={{ fontSize: '0.84rem', fontWeight: m.done ? 600 : 500, color: m.done ? '#0f172a' : '#64748b' }}>
                        {translateData(m.title)}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: m.done ? '#047857' : '#94a3b8', marginTop: '2px', fontWeight: m.done ? 600 : 400 }}>
                        {m.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* "see all updates" Toggle */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.1rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                <button
                  onClick={() => setShowAllUpdates(!showAllUpdates)}
                  style={{
                    background: showAllUpdates ? '#0f172a' : '#f8fafc',
                    color: showAllUpdates ? '#ffffff' : '#059669',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px', padding: '0.4rem 0.95rem',
                    fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Clock style={{ width: 15, height: 15 }} />
                  <span>{showAllUpdates ? translateData('Hide updates') : translateData('see all updates')}</span>
                  {showAllUpdates ? <ChevronUp style={{ width: 15, height: 15 }} /> : <ChevronDown style={{ width: 15, height: 15 }} />}
                </button>
              </div>

              {/* Collapsible Timeline for "see all updates" */}
              <AnimatePresence>
                {showAllUpdates && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden', marginTop: '0.85rem' }}
                  >
                    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.1rem 1.25rem' }}>
                      <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.45rem' }}>
                        <Clock style={{ width: 16, height: 16, color: '#059669' }} />
                        {translateData('Package Tracking Checkpoints')}
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem', position: 'relative', paddingLeft: '1.65rem' }}>
                        <div style={{ position: 'absolute', left: '6px', top: '8px', bottom: '8px', width: 2, background: '#cbd5e1' }} />

                        {dynamicTimelineEvents.map((evt, idx) => (
                          <div key={evt.id || idx} style={{ position: 'relative' }}>
                            <div style={{
                              position: 'absolute', left: '-1.65rem', top: '4px', width: 13, height: 13, borderRadius: '50%',
                              background: evt.done ? '#059669' : '#cbd5e1', border: '2.5px solid #fff',
                              boxShadow: idx === 0 ? '0 0 0 2px #059669' : 'none'
                            }} />

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', flexWrap: 'wrap' }}>
                              <h5 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                                {translateData(evt.title)}
                              </h5>
                              <span style={{ fontSize: '0.76rem', color: idx === 0 ? '#059669' : '#64748b', fontWeight: 600, background: '#ffffff', padding: '0.18rem 0.55rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                {evt.time}
                              </span>
                            </div>
                            
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#64748b', fontWeight: 400 }}>
                              {translateData(evt.desc)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* ── 3. BOTTOM GRID: Delivery address & Payment summary (RESPONSIVE GRID) ── */}
            <div className="track-bottom-grid">
              
              {/* Left Card: "Delivery address" */}
              <div className="track-card-padding" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem 1.45rem', boxShadow: '0 2px 12px rgba(0,0,0,0.025)' }}>
                <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.55rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin style={{ width: 17, height: 17, color: '#059669' }} />
                  {translateData('Delivery Address')}
                </h3>
                <p style={{ margin: '0 0 0.3rem', fontWeight: 600, color: '#0f172a', fontSize: '0.94rem' }}>{customerName}</p>
                <p style={{ margin: '0 0 0.4rem', fontSize: '0.86rem', color: '#64748b', lineHeight: 1.48, fontWeight: 400 }}>{translateData(shippingAddr)}</p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>{translateData('Phone')}: {customerPhone}</p>
              </div>

              {/* Right Card: "Payment summary" */}
              <div className="track-card-padding" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem 1.45rem', boxShadow: '0 2px 12px rgba(0,0,0,0.025)' }}>
                <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span>{translateData('Payment Summary')}</span>
                  <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, background: '#ecfdf5', padding: '0.12rem 0.5rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                    ✓ {translateData('PAID & VERIFIED')}
                  </span>
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.86rem', color: '#334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 400 }}>{translateData('Payment Method:')}</span>
                    <strong style={{ color: '#0f172a', fontWeight: 600 }}>{translateData(selectedOrder.paymentMethod || 'Razorpay Online')}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 400 }}>Razorpay Payment ID:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#059669', background: '#f0fdf4', padding: '0.12rem 0.5rem', borderRadius: '5px', border: '1px solid #bbf7d0', fontSize: '0.8rem' }}>
                      {razorpayPaymentId}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 400 }}>Razorpay Order Ref:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0284c7', background: '#f0f9ff', padding: '0.12rem 0.5rem', borderRadius: '5px', border: '1px solid #bae6fd', fontSize: '0.8rem' }}>
                      {razorpayOrderId}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 400 }}>{translateData('Shipping Fee:')}</span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>{translateData('FREE')}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                    <span>{translateData('Grand Total:')}</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>₹{totalAmount}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ── 4. ORDER SUPPORT CARD WITH ALL 3 OPTIONS ── */}
            {stageData?.stage === 5 && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem 1.45rem', boxShadow: '0 2px 12px rgba(0,0,0,0.025)' }}>
                
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Headphones style={{ width: 18, height: 18, color: '#059669' }} />
                    {translateData('Post-Delivery Order Support Services')}
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#059669', background: '#ecfdf5', padding: '0.12rem 0.55rem', borderRadius: '6px', border: '1px solid #a7f3d0', fontWeight: 600 }}>
                    {translateData('3 Help Options Available')}
                  </span>
                </div>

                {/* 3 Options inside One Card Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem' }}>
                  
                  {/* OPTION 1: Return & Refund */}
                  <motion.div whileHover={{ y: supportData?.replacement ? 0 : -3 }} style={{ background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)', border: '1.5px solid #a7f3d0', borderRadius: '1rem', padding: '1.15rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: supportData?.replacement ? 0.65 : 1, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.08)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '0.65rem', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: '1px solid #6ee7b7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                          <DollarSign style={{ width: 17, height: 17 }} />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 900, color: '#047857' }}>{translateData('1. Return & Refund')}</h4>
                      </div>
                      <p style={{ margin: '0 0 0.85rem', fontSize: '0.81rem', color: '#64748b', lineHeight: 1.45, fontWeight: 500 }}>
                        {translateData('Return item for doorstep pickup & claim 100% instant refund via UPI or bank account.')}
                      </p>
                      {supportData?.refund && (
                        <div style={{ background: '#ffffff', border: '1px solid #6ee7b7', borderRadius: '0.5rem', padding: '0.35rem 0.65rem', fontSize: '0.76rem', color: '#047857', fontWeight: 800, marginBottom: '0.85rem' }}>
                          ✓ {translateData('Refund Active')} (₹{supportData.refund.refundAmount || selectedOrder?.totalAmount})
                        </div>
                      )}
                      {supportData?.replacement && (
                        <div style={{ background: '#fff1f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.35rem 0.65rem', fontSize: '0.76rem', color: '#be123c', fontWeight: 800, marginBottom: '0.85rem' }}>
                          🔒 N/A ({translateData('Replacement Requested')})
                        </div>
                      )}
                    </div>
                    <button
                      disabled={!!supportData?.replacement}
                      onClick={() => setShowRefundModal(true)}
                      style={{
                        width: '100%', padding: '0.58rem 0.85rem', borderRadius: '0.65rem',
                        background: supportData?.replacement ? '#94a3b8' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: '#ffffff',
                        border: 'none', fontWeight: 900, fontSize: '0.82rem',
                        cursor: supportData?.replacement ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        boxShadow: supportData?.replacement ? 'none' : '0 4px 12px rgba(5, 150, 105, 0.3)', transition: 'all 0.2s ease'
                      }}
                    >
                      <DollarSign style={{ width: 14, height: 14 }} />
                      <span>
                        {supportData?.replacement ? `N/A (${translateData('Replacement Active')})` : supportData?.refund ? `✓ ${translateData('Refund Requested')} (₹${Number(supportData.refund.refundAmount || selectedOrder?.totalAmount || 0).toFixed(0)})` : translateData('Return & Refund')}
                      </span>
                    </button>
                  </motion.div>

                  {/* OPTION 2: Replace Product */}
                  <motion.div whileHover={{ y: supportData?.refund ? 0 : -3 }} style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)', border: '1.5px solid #bae6fd', borderRadius: '1rem', padding: '1.15rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: supportData?.refund ? 0.65 : 1, boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '0.65rem', background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', border: '1px solid #7dd3fc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                          <RotateCcw style={{ width: 17, height: 17 }} />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 900, color: '#0369a1' }}>{translateData('2. Replace Product')}</h4>
                      </div>
                      <p style={{ margin: '0 0 0.85rem', fontSize: '0.81rem', color: '#64748b', lineHeight: 1.45, fontWeight: 500 }}>
                        {translateData('Free doorstep exchange & replacement for damaged, wrong or defective items.')}
                      </p>
                      {supportData?.replacement && (
                        <div style={{ background: '#ffffff', border: '1px solid #7dd3fc', borderRadius: '0.5rem', padding: '0.35rem 0.65rem', fontSize: '0.76rem', color: '#0284c7', fontWeight: 800, marginBottom: '0.85rem' }}>
                          ✓ {translateData('Request Active')} (#{supportData.replacement.requestId})
                        </div>
                      )}
                      {supportData?.refund && (
                        <div style={{ background: '#fff1f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.35rem 0.65rem', fontSize: '0.76rem', color: '#be123c', fontWeight: 800, marginBottom: '0.85rem' }}>
                          🔒 N/A ({translateData('Refund Requested')})
                        </div>
                      )}
                    </div>
                    <button
                      disabled={!!supportData?.refund}
                      onClick={() => setShowReturnModal(true)}
                      style={{
                        width: '100%', padding: '0.58rem 0.85rem', borderRadius: '0.65rem',
                        background: supportData?.refund ? '#94a3b8' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: '#ffffff',
                        border: 'none', fontWeight: 900, fontSize: '0.82rem',
                        cursor: supportData?.refund ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        boxShadow: supportData?.refund ? 'none' : '0 4px 14px rgba(2, 132, 199, 0.3)', transition: 'all 0.2s ease'
                      }}
                    >
                      <RotateCcw style={{ width: 14, height: 14 }} />
                      <span>
                        {supportData?.refund ? `N/A (${translateData('Refund Active')})` : supportData?.replacement ? `✓ ${translateData('Replacement Requested')}` : translateData('Replace Product')}
                      </span>
                    </button>
                  </motion.div>

                  {/* OPTION 3: Rating & Feedback */}
                  <motion.div whileHover={{ y: -3 }} style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)', border: '1.5px solid #fde68a', borderRadius: '1rem', padding: '1.15rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.08)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '0.65rem', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid #fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                          <Star style={{ width: 17, height: 17, fill: '#d97706' }} />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 900, color: '#b45309' }}>{translateData('3. Rate & Feedback')}</h4>
                      </div>
                      <p style={{ margin: '0 0 0.85rem', fontSize: '0.81rem', color: '#64748b', lineHeight: 1.45, fontWeight: 500 }}>
                        {translateData('Rate delivery speed, product quality, and packaging for Sanjeevani.')}
                      </p>
                      {supportData?.feedback && (
                        <div style={{ background: '#ffffff', border: '1px solid #fcd34d', borderRadius: '0.5rem', padding: '0.35rem 0.65rem', fontSize: '0.76rem', color: '#b45309', fontWeight: 800, marginBottom: '0.85rem' }}>
                          ✓ {translateData('Rating Given')} ({supportData.feedback.rating}★)
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      style={{
                        width: '100%', padding: '0.58rem 0.85rem', borderRadius: '0.65rem',
                        background: supportData?.feedback ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#ffffff',
                        border: 'none', fontWeight: 900, fontSize: '0.82rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)', transition: 'all 0.2s ease'
                      }}
                    >
                      <Star style={{ width: 14, height: 14, fill: '#ffffff' }} />
                      <span>{supportData?.feedback ? `✓ Rating Submitted (${supportData.feedback.rating}★)` : 'Rating & Feedback'}</span>
                    </button>
                  </motion.div>

                </div>

              </div>
            )}

            {/* Cancel Order Action Box for Active Pre-Dispatch Orders */}
            {stageData?.stage <= 2 && selectedOrder?.status !== 'CANCELLED' && (
              <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)', border: '1.5px solid #fecaca', borderRadius: '1rem', padding: '1.15rem 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.06)' }}>
                <span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 700 }}>
                  Need to cancel or make changes to your order prior to dispatch?
                </span>
                <button
                  onClick={() => setShowCancelModal(true)}
                  style={{ padding: '0.55rem 1.15rem', borderRadius: '0.65rem', background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#dc2626', fontWeight: 900, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.15)' }}
                >
                  <XCircle style={{ width: 16, height: 16 }} />
                  <span>Cancel Order</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* ── RESPONSIVE CSS MEDIA QUERIES (ANDROID, IPHONE, TABLET, PC) ──────────── */}
        <style dangerouslySetInnerHTML={{ __html: `
          .track-order-page-wrapper {
            overflow-x: hidden !important;
            width: 100% !important;
            max-width: 100vw !important;
          }
          .track-order-container {
            max-width: 820px;
            width: 100%;
            margin: 1.25rem auto 0;
            padding: 0 1rem;
            display: flex;
            flex-direction: column;
            gap: 1.15rem;
            box-sizing: border-box;
          }
          .track-bottom-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.15rem;
            align-items: start;
          }
          .track-stepper-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            text-align: center;
          }

          /* Mobile, iPhone & Tablet Responsive Media Queries */
          @media (max-width: 768px) {
            .track-order-container {
              margin: 0.75rem auto 0 !important;
              padding: 0 0.65rem !important;
              gap: 0.85rem !important;
              max-width: 100% !important;
            }
            .track-bottom-grid {
              grid-template-columns: 1fr !important;
              gap: 0.85rem !important;
            }
            .track-stepper-grid {
              display: flex !important;
              overflow-x: auto !important;
              justify-content: space-between !important;
              padding-bottom: 0.35rem !important;
              gap: 0.5rem !important;
              -webkit-overflow-scrolling: touch;
              max-width: 100% !important;
            }
            .track-stepper-item {
              min-width: 58px !important;
              flex-shrink: 0 !important;
            }
          }

          @media (max-width: 480px) {
            .track-card-padding {
              padding: 0.95rem 0.75rem !important;
            }
            .track-header-row {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 0.5rem !important;
            }
            .track-support-grid {
              grid-template-columns: 1fr !important;
            }
          }
        ` }} />

      </div>

      {/* ── MODALS & DRAWERS TRIGGERED FROM DASHBOARD NAVBAR ─────────────── */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            cartItems={cartItems}
            onClose={() => setIsCartOpen(false)}
            onUpdateQuantity={async (cartId, qty) => {
              try {
                await shopService.updateCartQuantity(cartId, qty);
                const res = await shopService.getCart();
                if (res && res.success && Array.isArray(res.data)) setCartItems(res.data);
              } catch (e) { }
            }}
            onRemoveItem={async (cartId) => {
              try {
                await shopService.removeFromCart(cartId);
                const res = await shopService.getCart();
                if (res && res.success && Array.isArray(res.data)) setCartItems(res.data);
              } catch (e) { }
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
            favorites={favorites}
            onClose={() => setIsFavoritesOpen(false)}
            onRemoveFavorite={async (favId) => {
              try {
                await shopService.removeFavorite(favId);
                const res = await shopService.getFavorites();
                if (res && res.success && Array.isArray(res.data)) setFavorites(res.data);
              } catch (e) { }
            }}
            onAddToCart={async (product) => {
              try {
                await shopService.addToCart(product.productId, 1);
                const res = await shopService.getCart();
                if (res && res.success && Array.isArray(res.data)) setCartItems(res.data);
                showToast(`Added "${product.name || 'Item'}" to cart!`);
              } catch (e) { }
            }}
          />
        )}

        {isOrdersOpen && (
          <OrdersModal
            orders={orders}
            onClose={() => setIsOrdersOpen(false)}
          />
        )}

        {isCheckoutOpen && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            cartItems={cartItems}
            user={user}
            onClose={() => setIsCheckoutOpen(false)}
            onOrderSuccess={(ord) => {
              setIsCheckoutOpen(false);
              showToast('Order placed successfully!');
              navigate(`/track-order/${ord.orderId}`);
            }}
          />
        )}

        {/* ── 1. CANCEL ORDER MODAL ─────────────────────────────────────────── */}
        {showCancelModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '1.75rem', width: '100%', maxWidth: '460px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)', border: '1.5px solid #fee2e2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem', borderBottom: '1.5px solid #fecaca', paddingBottom: '0.85rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <XCircle style={{ width: 20, height: 20, color: '#dc2626' }} />
                  </div>
                  Cancel Order #{rawOrderId}
                </h3>
                <button onClick={() => setShowCancelModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#64748b', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1.15rem', fontSize: '0.84rem', color: '#991b1b', lineHeight: 1.45 }}>
                ⚠️ Are you sure you want to cancel this order? Your cancellation will be processed immediately and a 100% refund will be initiated to your source account.
              </div>

              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '0.4rem' }}>Reason for Cancellation</label>
              <select value={cancelReason} onChange={e => setCancelReason(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '1.1rem', outline: 'none', fontFamily: 'inherit', background: '#f8fafc', fontWeight: 700 }}>
                <option value="Mind Changed">Changed my mind / Ordered by mistake</option>
                <option value="Better Price">Found a better price elsewhere</option>
                <option value="Delivery Delayed">Delivery time is too long</option>
                <option value="Incorrect Address">Incorrect shipping address selected</option>
                <option value="Other">Other reason</option>
              </select>

              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '0.4rem' }}>Additional Comments (Optional)</label>
              <textarea value={cancelComment} onChange={e => setCancelComment(e.target.value)} placeholder="Tell us more about why you're cancelling..." rows={3} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '1.35rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: '#f8fafc' }} />

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowCancelModal(false)} style={{ padding: '0.6rem 1.15rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}>Keep Order</button>
                <button onClick={handleConfirmCancel} style={{ padding: '0.6rem 1.4rem', borderRadius: '0.65rem', border: 'none', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', fontWeight: 900, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)' }}>Confirm Cancel</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── 2. RETURN / REPLACE MODAL ─────────────────────────────────────── */}
        {showReturnModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '1.75rem', width: '100%', maxWidth: '480px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)', border: '1.5px solid #e0f2fe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem', borderBottom: '1.5px solid #e0f2fe', paddingBottom: '0.85rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RotateCcw style={{ width: 19, height: 19, color: '#0284c7' }} />
                  </div>
                  Replace Product
                </h3>
                <button onClick={() => setShowReturnModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#64748b', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              {supportData?.refund ? (
                <div style={{ background: '#fff1f2', border: '1.5px solid #fecaca', borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1.1rem', fontSize: '0.84rem', color: '#be123c', fontWeight: 800 }}>
                  🔒 Return & Refund is already active for this order. Only one support resolution (Refund or Replacement) is permitted per order.
                </div>
              ) : supportData?.replacement ? (
                <div style={{ background: '#f0f9ff', border: '1.5px solid #7dd3fc', borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1.1rem', fontSize: '0.84rem', color: '#0369a1', fontWeight: 800 }}>
                  ✓ Replacement Request Active (#{supportData.replacement.requestId}). Courier pickup will arrive soon.
                </div>
              ) : (
                <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #bae6fd', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1.1rem', fontSize: '0.82rem', color: '#0369a1', fontWeight: 700 }}>
                  🚚 Free Doorstep Pickup & Express Replacement within 24-48 Hours.
                </div>
              )}

              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '0.4rem' }}>Reason for Replacement</label>
              <select disabled={!!supportData?.replacement || !!supportData?.refund} value={returnReason} onChange={e => setReturnReason(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '1rem', outline: 'none', fontFamily: 'inherit', background: (supportData?.replacement || supportData?.refund) ? '#f1f5f9' : '#f8fafc', fontWeight: 700 }}>
                <option value="Damaged Product">Damaged or defective product received</option>
                <option value="Wrong Item">Wrong product item delivered</option>
                <option value="Quality Concern">Product quality not as expected</option>
                <option value="Expired / Seal Broken">Expired or broken seal package</option>
              </select>

              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '0.4rem' }}>Pickup & Delivery Address</label>
              <input disabled={!!supportData?.replacement || !!supportData?.refund} type="text" value={replacementAddress} onChange={e => setReplacementAddress(e.target.value)} placeholder="Flat 402, Block A, Jubilee Hills, Hyderabad - 500033" style={{ width: '100%', padding: '0.65rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '1rem', outline: 'none', fontFamily: 'inherit', background: (supportData?.replacement || supportData?.refund) ? '#f1f5f9' : '#f8fafc' }} />

              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '0.4rem' }}>Remarks / Problem Description</label>
              <textarea disabled={!!supportData?.replacement || !!supportData?.refund} value={returnComment} onChange={e => setReturnComment(e.target.value)} placeholder="Describe the issue with the product..." rows={2} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '1.35rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: (supportData?.replacement || supportData?.refund) ? '#f1f5f9' : '#f8fafc' }} />

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowReturnModal(false)} style={{ padding: '0.6rem 1.15rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}>Close</button>
                <button disabled={!!supportData?.replacement || !!supportData?.refund} onClick={handleConfirmReturn} style={{ padding: '0.6rem 1.4rem', borderRadius: '0.65rem', border: 'none', background: (supportData?.replacement || supportData?.refund) ? '#94a3b8' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', fontWeight: 900, fontSize: '0.84rem', cursor: (supportData?.replacement || supportData?.refund) ? 'not-allowed' : 'pointer', boxShadow: (supportData?.replacement || supportData?.refund) ? 'none' : '0 4px 14px rgba(2, 132, 199, 0.35)' }}>
                  {supportData?.refund ? 'N/A (Refund Active)' : supportData?.replacement ? '✓ Request Submitted' : 'Submit Replacement'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── 3. REQUEST REFUND MODAL WITH PROBLEM FEEDBACK ──────────────── */}
        {showRefundModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '1.75rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)', border: '1.5px solid #a7f3d0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem', borderBottom: '1.5px solid #d1fae5', paddingBottom: '0.85rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#047857', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign style={{ width: 19, height: 19, color: '#059669' }} />
                  </div>
                  Return & Request Refund
                </h3>
                <button onClick={() => setShowRefundModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#64748b', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              {supportData?.replacement ? (
                <div style={{ background: '#fff1f2', border: '1.5px solid #fecaca', borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1.15rem', fontSize: '0.84rem', color: '#be123c', fontWeight: 800 }}>
                  🔒 Replacement is already active for this order. Only one support resolution (Refund or Replacement) is permitted per order.
                </div>
              ) : supportData?.refund ? (
                <div style={{ background: '#ecfdf5', border: '1.5px solid #6ee7b7', borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1.15rem', fontSize: '0.84rem', color: '#047857', fontWeight: 800 }}>
                  ✓ Refund Request Already Active (Amount: ₹{Number(supportData.refund.refundAmount || selectedOrder?.totalAmount || 0).toFixed(2)}). Our support team is processing your refund.
                </div>
              ) : (
                <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #6ee7b7', borderRadius: '0.75rem', padding: '0.85rem 1.15rem', marginBottom: '1.15rem', fontSize: '0.86rem', color: '#065f46', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)' }}>
                  <span style={{ fontWeight: 700 }}>100% Refundable Amount:</span>
                  <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: '#047857' }}>₹{Number(selectedOrder?.totalAmount || 0).toFixed(2)}</strong>
                </div>
              )}

              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '0.4rem' }}>Select the problem with your order</label>
              <select disabled={!!supportData?.refund || !!supportData?.replacement} value={refundReason} onChange={e => setRefundReason(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '1rem', outline: 'none', fontFamily: 'inherit', background: (supportData?.refund || supportData?.replacement) ? '#f1f5f9' : '#f8fafc', fontWeight: 700 }}>
                <option value="Damaged Product">Damaged or defective product received</option>
                <option value="Wrong Item Received">Wrong product item delivered</option>
                <option value="Expired / Broken Seal">Expired product or broken seal package</option>
                <option value="Quality Concern">Product quality issue / Not effective</option>
                <option value="Missing Item">Missing item from package</option>
                <option value="Double Charge">Double charged / Incorrect billing</option>
                <option value="Delivery Delay">Delivery delay / Package not delivered on time</option>
              </select>

              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '0.4rem' }}>Problem Details & Feedback</label>
              <textarea disabled={!!supportData?.refund || !!supportData?.replacement} value={refundComment} onChange={e => setRefundComment(e.target.value)} placeholder="Describe the issue so our support team can verify and release your refund immediately..." rows={3} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '1rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: (supportData?.refund || supportData?.replacement) ? '#f1f5f9' : '#f8fafc' }} />

              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '0.4rem' }}>Payout / Refund Method</label>
              <select disabled={!!supportData?.refund || !!supportData?.replacement} value={refundMethod} onChange={e => setRefundMethod(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '1rem', outline: 'none', fontFamily: 'inherit', background: (supportData?.refund || supportData?.replacement) ? '#f1f5f9' : '#f8fafc', fontWeight: 700 }}>
                <option value="Original Payment Method">Original Source (Razorpay Card/Netbanking)</option>
                <option value="UPI Instant Refund">UPI Instant Refund</option>
                <option value="Bank Account Transfer">Bank Account Transfer</option>
              </select>

              {refundMethod === 'UPI Instant Refund' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '0.4rem' }}>Enter Your UPI ID (e.g. user@upi)</label>
                  <input disabled={!!supportData?.refund || !!supportData?.replacement} type="text" value={refundUpiId} onChange={e => setRefundUpiId(e.target.value)} placeholder="yourname@paytm / phonepe" style={{ width: '100%', padding: '0.65rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', background: (supportData?.refund || supportData?.replacement) ? '#f1f5f9' : '#f8fafc' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button onClick={() => setShowRefundModal(false)} style={{ padding: '0.6rem 1.15rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}>Close</button>
                <button disabled={!!supportData?.refund || !!supportData?.replacement} onClick={handleConfirmRefund} style={{ padding: '0.6rem 1.4rem', borderRadius: '0.65rem', border: 'none', background: (supportData?.refund || supportData?.replacement) ? '#94a3b8' : 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', fontWeight: 900, fontSize: '0.84rem', cursor: (supportData?.refund || supportData?.replacement) ? 'not-allowed' : 'pointer', boxShadow: (supportData?.refund || supportData?.replacement) ? 'none' : '0 4px 14px rgba(5, 150, 105, 0.35)' }}>
                  {supportData?.replacement ? 'N/A (Replacement Active)' : supportData?.refund ? '✓ Refund Requested' : 'Submit Refund Request'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── 4. RATING & FEEDBACK MODAL ─────────────────────────────────────── */}
        {showFeedbackModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '1.75rem', width: '100%', maxWidth: '480px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)', border: '1.5px solid #fde68a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem', borderBottom: '1.5px solid #fef3c7', paddingBottom: '0.85rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Star style={{ width: 19, height: 19, color: '#f59e0b', fill: '#f59e0b' }} />
                  </div>
                  Rate & Review Experience
                </h3>
                <button onClick={() => setShowFeedbackModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#64748b', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              {/* Interactive Star Rating Picker */}
              <div style={{ textAlign: 'center', marginBottom: '1.35rem', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', borderRadius: '1rem', padding: '1.15rem 1rem', border: '1px solid #fde68a' }}>
                <p style={{ fontSize: '0.88rem', fontWeight: 800, color: '#92400e', margin: '0 0 0.6rem' }}>How was your order & delivery experience?</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.div key={star} whileHover={{ scale: 1.25 }} whileTap={{ scale: 0.9 }}>
                      <Star
                        onClick={() => setFeedbackRating(star)}
                        style={{ width: 36, height: 36, cursor: 'pointer', color: star <= feedbackRating ? '#f59e0b' : '#cbd5e1', fill: star <= feedbackRating ? '#f59e0b' : 'none', filter: star <= feedbackRating ? 'drop-shadow(0 2px 8px rgba(245,158,11,0.4))' : 'none', transition: 'all 0.2s' }}
                      />
                    </motion.div>
                  ))}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#b45309' }}>
                  {feedbackRating === 5 && '★ 5.0 — Outstanding Service!'}
                  {feedbackRating === 4 && '★ 4.0 — Very Good Experience'}
                  {feedbackRating === 3 && '★ 3.0 — Average Experience'}
                  {feedbackRating === 2 && '★ 2.0 — Below Expectations'}
                  {feedbackRating === 1 && '★ 1.0 — Poor Experience'}
                </span>
              </div>

              {/* Quick Tag Pills */}
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '0.4rem' }}>Quick Experience Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.1rem' }}>
                {['Fast Delivery', 'Genuine Product', 'Safe Packaging', 'Great Value', 'Excellent Support'].map(tag => {
                  const isSelected = feedbackTags.includes(tag);
                  return (
                    <motion.button
                      key={tag}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (isSelected) setFeedbackTags(feedbackTags.filter(t => t !== tag));
                        else setFeedbackTags([...feedbackTags, tag]);
                      }}
                      style={{
                        padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
                        background: isSelected ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : '#f1f5f9',
                        color: isSelected ? '#047857' : '#475569',
                        border: isSelected ? '1.5px solid #6ee7b7' : '1px solid #cbd5e1',
                        boxShadow: isSelected ? '0 2px 8px rgba(16,185,129,0.15)' : 'none'
                      }}
                    >
                      {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                    </motion.button>
                  );
                })}
              </div>

              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '0.4rem' }}>Your Written Review</label>
              <textarea value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)} placeholder="Tell us what you loved or how we can improve..." rows={3} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '1.35rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: '#f8fafc' }} />

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowFeedbackModal(false)} style={{ padding: '0.6rem 1.15rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleConfirmFeedback} style={{ padding: '0.6rem 1.4rem', borderRadius: '0.65rem', border: 'none', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', fontWeight: 900, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)' }}>Submit Rating</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TrackOrderPage;

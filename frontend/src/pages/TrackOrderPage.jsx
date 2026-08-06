import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Clock, MapPin, Phone, MessageSquare, ChevronLeft, Search,
  RefreshCw, Download, PackageCheck, ShieldCheck, UserCheck, ChevronDown,
  ChevronUp, FileText, ArrowRight, Edit3, CheckCircle2, RotateCcw,
  Sparkles, Key, HelpCircle, Shield, AlertCircle, Check
} from 'lucide-react';
import shopService from '../api/shopService';
import ProductImage from '../components/ProductImage';
import { downloadOrderInvoice } from '../components/OrdersModal';

// Mock driver profiles
const MOCK_DRIVERS = [
  { name: 'Rajesh Varma', phone: '+91 98765 43210', rating: '4.9', vehicle: 'TS 09 EQ 4821 (Electric Bike)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { name: 'Kiran Kumar', phone: '+91 98123 76543', rating: '4.8', vehicle: 'TS 07 EX 9102 (Hero Electric)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Suresh Reddy', phone: '+91 99456 12389', rating: '5.0', vehicle: 'TS 10 EV 3381 (TVS iQube)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
];

// Helper to strictly map Order Status from DB to customer milestones with EXACT Date & Time stamps from database
const getFlipkartAppStageInfo = (statusRaw, orderId, createdAt, updatedAt) => {
  const status = (statusRaw || 'PENDING').toUpperCase().trim();
  const rawIdStr = String(orderId || '1002').replace(/[^0-9]/g, '');
  const deliveryPin = rawIdStr ? (Number(rawIdStr) * 3 + 1234).toString().slice(-4) : '4821';

  const createdDate = createdAt ? new Date(createdAt) : new Date();
  
  // If updatedAt is valid and after createdAt, use exact updatedAt; else default to (createdAt + 15 mins)
  const updatedDate = (updatedAt && new Date(updatedAt).getTime() > createdDate.getTime())
    ? new Date(updatedAt)
    : new Date(createdDate.getTime() + 15 * 60 * 1000);

  // Formats exact Date & Time (e.g. "4 Aug, 01:17 am" or "5 Aug, 11:20 am")
  const formatExactDateTime = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return 'Pending';
    return dateObj.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const createdStr = formatExactDateTime(createdDate);

  // Numerical stage index from DB status
  let currentStageIndex = 1; // 1 = Placed
  if (status === 'CONFIRMED' || status === 'SUCCESS' || status === 'COMPLETED') currentStageIndex = 2;
  else if (status === 'PACKED') currentStageIndex = 3;
  else if (status === 'SHIPPED' || status === 'OUT_FOR_DELIVERY' || status === 'IN_TRANSIT') currentStageIndex = 4;
  else if (status === 'DELIVERED') currentStageIndex = 5;
  else if (status === 'CANCELLED') currentStageIndex = -1;

  // Exact step timestamp assignment
  const getStepTimeStr = (stepIndex, curStageIndex) => {
    if (stepIndex > curStageIndex) return 'Pending';
    if (stepIndex === 1) return createdStr;

    // Active current stage displays the exact DB update timestamp
    if (stepIndex === curStageIndex) {
      return formatExactDateTime(updatedDate);
    }

    // Intermediate steps scale chronologically between createdDate and updatedDate
    const startMs = createdDate.getTime();
    const endMs = updatedDate.getTime();
    const validEndMs = Math.max(endMs, startMs + curStageIndex * 5 * 60000);
    const fraction = (stepIndex - 1) / (curStageIndex - 1);
    const stepMs = startMs + fraction * (validEndMs - startMs);

    return formatExactDateTime(new Date(stepMs));
  };

  if (status === 'CANCELLED') {
    return {
      currentStageIndex: -1,
      statusBadgeText: 'CANCELLED',
      statusBadgeBg: '#fee2e2',
      statusBadgeColor: '#dc2626',
      headline: 'Order Cancelled ❌',
      subtext: 'This order was cancelled by system administration.',
      deliveryPin: null,
      showCourierDriver: false,
      isCancelled: true,
      isDelivered: false,
      milestones: [
        { id: 1, title: 'Order Placed', desc: 'Order received & payment verified', done: true, current: false, time: createdStr },
        { id: 2, title: 'Order Cancelled', desc: 'Cancelled by Sanjeevani Logistics', done: false, current: true, time: formatExactDateTime(updatedDate), failed: true },
      ]
    };
  }

  // 5 Milestones with EXACT Date & Time stamps from database
  const milestones = [
    {
      id: 1,
      title: 'Order Placed',
      desc: 'Order received & payment verified',
      done: true,
      current: currentStageIndex === 1,
      time: createdStr,
    },
    {
      id: 2,
      title: 'Order Confirmed',
      desc: currentStageIndex >= 2 ? 'Prescription & items verified' : 'Awaiting verification',
      done: currentStageIndex >= 2,
      current: currentStageIndex === 2,
      time: getStepTimeStr(2, currentStageIndex),
    },
    {
      id: 3,
      title: 'Packed & Quality Verified',
      desc: currentStageIndex >= 3 ? 'Packed & cold-chain sealed in warehouse' : 'Awaiting warehouse packing',
      done: currentStageIndex >= 3,
      current: currentStageIndex === 3,
      time: getStepTimeStr(3, currentStageIndex),
    },
    {
      id: 4,
      title: 'Out for Delivery',
      desc: currentStageIndex >= 4 ? 'Courier executive is out for doorstep delivery' : 'Awaiting courier pickup',
      done: currentStageIndex >= 4,
      current: currentStageIndex === 4,
      time: getStepTimeStr(4, currentStageIndex),
    },
    {
      id: 5,
      title: 'Delivered',
      desc: currentStageIndex >= 5 ? 'Package handed over at doorstep & verified' : 'Expected doorstep arrival soon',
      done: currentStageIndex >= 5,
      current: currentStageIndex === 5,
      time: getStepTimeStr(5, currentStageIndex),
    },
  ];

  // Headline & Badges based on status
  let badgeText = 'ORDER PLACED';
  let badgeBg = '#f1f5f9';
  let badgeColor = '#475569';
  let headlineText = 'Order Placed — Processing Order ⏳';
  let subtextText = 'Order received. Awaiting confirmation & stage update.';

  if (currentStageIndex === 2) {
    badgeText = 'ORDER CONFIRMED';
    badgeBg = '#ecfdf5';
    badgeColor = '#047857';
    headlineText = 'Order Confirmed ✅';
    subtextText = 'Prescription & items approved. Sent to warehouse for packing.';
  } else if (currentStageIndex === 3) {
    badgeText = 'PACKED & SEALED';
    badgeBg = '#fef3c7';
    badgeColor = '#b45309';
    headlineText = 'Order Packed & Cold-Chain Sealed 📦';
    subtextText = 'Packed in temperature-controlled box. Awaiting courier handover.';
  } else if (currentStageIndex === 4) {
    badgeText = 'OUT FOR DELIVERY TODAY';
    badgeBg = '#e0f2fe';
    badgeColor = '#0284c7';
    headlineText = 'Arriving Today — Package is Out for Delivery 🚚';
    subtextText = 'Courier executive is on the way to your delivery address.';
  } else if (currentStageIndex === 5) {
    badgeText = 'DELIVERED';
    badgeBg = '#d1fae5';
    badgeColor = '#047857';
    headlineText = 'Package Delivered to Doorstep! 🎉';
    subtextText = 'Delivered & handed directly to recipient. Thank you for choosing Sanjeevani!';
  }

  return {
    currentStageIndex,
    statusBadgeText: badgeText,
    statusBadgeBg: badgeBg,
    statusBadgeColor: badgeColor,
    headline: headlineText,
    subtext: subtextText,
    deliveryPin: currentStageIndex >= 3 ? deliveryPin : null,
    showCourierDriver: currentStageIndex >= 3,
    isCancelled: false,
    isDelivered: currentStageIndex >= 5,
    milestones,
  };
};

export const TrackOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  // Delivery Note state
  const [deliveryNote, setDeliveryNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [savedNote, setSavedNote] = useState('Please ring doorbell and leave package with security guard if unavailable.');

  const driver = MOCK_DRIVERS[0];

  // Dynamic Stage Calculation with exact createdAt & updatedAt timestamps
  const appStageInfo = useMemo(() => {
    return getFlipkartAppStageInfo(
      selectedOrder?.status,
      selectedOrder?.orderId || orderId,
      selectedOrder?.createdAt,
      selectedOrder?.updatedAt
    );
  }, [selectedOrder?.status, selectedOrder?.orderId, selectedOrder?.createdAt, selectedOrder?.updatedAt, orderId]);

  // Fetch User Orders on Mount & Real-time Auto-Polling every 4s
  useEffect(() => {
    let isMounted = true;
    
    const fetchUserOrders = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await shopService.getOrders();
        let fetchedOrders = [];
        if (res && res.success && Array.isArray(res.data)) {
          fetchedOrders = res.data.filter(o => o && o.status !== 'FAILED');
        }
        if (isMounted) {
          setOrders(fetchedOrders);
          if (orderId) {
            const match = fetchedOrders.find(o => String(o.orderId).toLowerCase() === String(orderId).toLowerCase());
            if (match) {
              setSelectedOrder(match);
            } else if (fetchedOrders.length > 0) {
              setSelectedOrder(fetchedOrders[0]);
            }
          } else if (fetchedOrders.length > 0) {
            setSelectedOrder(fetchedOrders[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user orders for tracking:', err);
      } finally {
        if (isMounted && !silent) setLoading(false);
      }
    };

    fetchUserOrders(false);

    // Auto-poll orders every 4 seconds to sync status updates in real time!
    const pollInterval = setInterval(() => {
      fetchUserOrders(true);
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [orderId]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const getOrderItems = (order) => {
    if (!order) return [];
    if (Array.isArray(order.items)) return order.items;
    if (typeof order.items === 'string') {
      try { return JSON.parse(order.items); } catch { return []; }
    }
    return [];
  };

  const orderItems = getOrderItems(selectedOrder);
  const rawOrderId = selectedOrder ? String(selectedOrder.orderId || 'ORD-0000') : (orderId || 'ORD-0000');
  const createdDate = selectedOrder?.createdAt ? new Date(selectedOrder.createdAt) : new Date();

  const handleSearchOrder = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = orders.find(o => String(o.orderId).toLowerCase().includes(searchQuery.trim().toLowerCase()));
    if (match) {
      setSelectedOrder(match);
      navigate(`/track-order/${match.orderId}`);
    } else {
      alert(`No order found matching "${searchQuery}".`);
    }
  };

  const handleCopyPin = () => {
    if (appStageInfo.deliveryPin) {
      navigator.clipboard.writeText(appStageInfo.deliveryPin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const handleSaveDeliveryNote = () => {
    if (deliveryNote.trim()) {
      setSavedNote(deliveryNote.trim());
    }
    setIsEditingNote(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', color: '#0f172a', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", paddingBottom: '4rem' }}>
      
      {/* ── Header Bar ─────────────────────────────────────────────── */}
      <header style={{ background: '#131921', color: '#ffffff', padding: '0.75rem 1.25rem', borderBottom: '3px solid #febd69', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 0.85rem', borderRadius: '0.5rem',
                border: '1px solid #374151', background: '#1f2937',
                color: '#ffffff', fontWeight: 800, fontSize: '0.82rem',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <ChevronLeft style={{ width: 16, height: 16, color: '#f59e0b' }} />
              <span>My Orders</span>
            </button>

            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', textDecoration: 'none' }}>
              <img src="/sanjeevani_symbol.png" alt="Sanjeevani" style={{ width: 30, height: 30, objectFit: 'contain' }} />
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                SANJEEVANI <span style={{ color: '#10b981', fontSize: '0.82rem', fontWeight: 800 }}>ORDER TRACKING</span>
              </span>
            </Link>
          </div>

          <form onSubmit={handleSearchOrder} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', borderRadius: '0.5rem', padding: '0.25rem 0.65rem', width: '100%', maxWidth: 360, border: '2px solid #febd69' }}>
            <Search style={{ width: 16, height: 16, color: '#4b5563' }} />
            <input
              type="text"
              placeholder="Search Order ID (e.g. ORD-1002)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.82rem', fontWeight: 700, width: '100%', color: '#0f172a' }}
            />
            <button type="submit" style={{ background: '#febd69', color: '#111827', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '0.35rem', fontSize: '0.78rem', fontWeight: 900, cursor: 'pointer' }}>
              Search
            </button>
          </form>

          <button
            onClick={handleManualRefresh}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.45rem 0.85rem', borderRadius: '0.5rem',
              border: '1px solid #059669', background: '#065f46',
              color: '#ffffff', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer',
            }}
          >
            <RefreshCw style={{ width: 13, height: 13, animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            <span>Sync Status</span>
          </button>

        </div>
      </header>

      {/* ── Main App Container ────────────────────────────────────────── */}
      <main style={{ maxWidth: 1040, margin: '1.25rem auto 0', padding: '0 1rem' }}>
        
        {/* Breadcrumbs */}
        <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Link to="/dashboard" style={{ color: '#0284c7', textDecoration: 'none' }}>Your Account</Link>
          <span>›</span>
          <span style={{ color: '#0284c7', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Your Orders</span>
          <span>›</span>
          <span style={{ color: '#0f172a', fontWeight: 900 }}>Track #{rawOrderId}</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', background: '#ffffff', borderRadius: '1rem', border: '1px solid #cbd5e1' }}>
            <RefreshCw style={{ width: 44, height: 44, color: '#059669', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Syncing Order Status...</h3>
          </div>
        ) : !selectedOrder ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', background: '#ffffff', borderRadius: '1rem', border: '1px solid #cbd5e1' }}>
            <Truck style={{ width: 64, height: 64, color: '#cbd5e1', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem' }}>No Placed Orders Found</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1.5rem' }}>Your active orders will show detailed milestone tracking here.</p>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ padding: '0.75rem 1.75rem', borderRadius: '0.65rem', background: '#f59e0b', color: '#111827', fontWeight: 900, border: 'none', cursor: 'pointer' }}
            >
              Browse Medicines & Order Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Quick Order Switcher */}
            {orders.length > 1 && (
              <div style={{ background: '#ffffff', borderRadius: '0.85rem', padding: '0.75rem 1.1rem', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '0.85rem', overflowX: 'auto' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', flexShrink: 0 }}>
                  Switch Order ({orders.length}):
                </span>
                <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto' }}>
                  {orders.map((ord) => {
                    const isSelected = ord.orderId === selectedOrder.orderId;
                    return (
                      <button
                        key={ord.orderId}
                        onClick={() => {
                          setSelectedOrder(ord);
                          navigate(`/track-order/${ord.orderId}`);
                        }}
                        style={{
                          padding: '0.35rem 0.75rem', borderRadius: '0.55rem',
                          border: isSelected ? '2px solid #059669' : '1px solid #cbd5e1',
                          background: isSelected ? '#ecfdf5' : '#f8fafc',
                          color: isSelected ? '#047857' : '#334155',
                          fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                      >
                        {ord.orderId} ({ord.status || 'PAID'})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Flipkart/Amazon App Primary Delivery Headline Card ─────── */}
            <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #cbd5e1', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{
                    background: appStageInfo.statusBadgeBg,
                    color: appStageInfo.statusBadgeColor,
                    padding: '0.25rem 0.75rem', borderRadius: 99,
                    fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.04em',
                    border: `1px solid ${appStageInfo.statusBadgeColor}40`,
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: appStageInfo.statusBadgeColor, display: 'inline-block', animation: 'pulse 1.2s infinite' }} />
                    STATUS: {appStageInfo.statusBadgeText}
                  </span>

                  <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: appStageInfo.isCancelled ? '#dc2626' : '#047857', margin: '0.65rem 0 0.25rem', letterSpacing: '-0.02em' }}>
                    {appStageInfo.headline}
                  </h1>
                  
                  <p style={{ margin: 0, fontSize: '0.92rem', color: '#475569', fontWeight: 700 }}>
                    {appStageInfo.subtext}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    onClick={(e) => downloadOrderInvoice(selectedOrder, e)}
                    style={{
                      padding: '0.55rem 1rem', borderRadius: '0.6rem',
                      border: '1.5px solid #059669', background: '#ecfdf5',
                      color: '#047857', fontWeight: 800, fontSize: '0.82rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                      boxShadow: '0 2px 8px rgba(5,150,105,0.15)',
                    }}
                  >
                    <Download style={{ width: 15, height: 15 }} />
                    <span>Download Invoice PDF</span>
                  </button>
                </div>
              </div>

              {/* Order Meta Brief */}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.82rem', color: '#64748b', fontWeight: 700, flexWrap: 'wrap' }}>
                <span>Order ID: <strong style={{ color: '#0f172a' }}>{rawOrderId}</strong></span>
                <span>•</span>
                <span>Order Date: <strong>{createdDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                <span>•</span>
                <span>Total Amount: <strong style={{ color: '#059669' }}>₹{Number(selectedOrder?.totalAmount || 0).toFixed(2)}</strong></span>
              </div>
            </div>

            {/* ── Delivery Secret PIN Card (Only Visible When Status >= PACKED) ────── */}
            {appStageInfo.deliveryPin && !appStageInfo.isCancelled && (
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1.5px solid #a7f3d0', borderRadius: '1rem', padding: '1.1rem 1.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                    <Key style={{ width: 22, height: 22 }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Secure Doorstep Handover PIN
                    </span>
                    <h4 style={{ margin: '0.1rem 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                      Share Delivery PIN: <span style={{ fontFamily: 'monospace', color: '#059669', background: '#fff', padding: '0.15rem 0.6rem', borderRadius: '0.45rem', border: '1.5px solid #a7f3d0' }}>{appStageInfo.deliveryPin}</span>
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>
                      Share this 4-digit secret PIN with courier agent Rajesh upon arrival.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyPin}
                  style={{
                    padding: '0.5rem 0.9rem', borderRadius: '0.6rem',
                    border: '1.5px solid #059669', background: '#ffffff',
                    color: '#047857', fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                  }}
                >
                  {copiedPin ? <Check style={{ width: 14, height: 14, color: '#059669' }} /> : <Key style={{ width: 14, height: 14 }} />}
                  <span>{copiedPin ? 'PIN Copied!' : 'Copy PIN'}</span>
                </button>
              </div>
            )}

            {/* ── Main Two-Column App Layout ────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.25rem', alignItems: 'start' }} className="responsive-track-grid">
              
              {/* LEFT COLUMN: Milestone Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* 📍 Milestone Tracker */}
                <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #cbd5e1', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PackageCheck style={{ width: 22, height: 22, color: '#059669' }} />
                    Order Status Milestone Timeline
                  </h3>

                  {/* Vertical Timeline */}
                  <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '0.5rem' }}>
                    {appStageInfo.milestones.map((m, idx) => {
                      const isLast = idx === appStageInfo.milestones.length - 1;
                      return (
                        <div key={idx} style={{ display: 'flex', gap: '1.25rem', position: 'relative', paddingBottom: isLast ? '0' : '1.75rem' }}>
                          
                          {/* Connecting Line */}
                          {!isLast && (
                            <div style={{
                              position: 'absolute', top: 32, left: 15, bottom: 0, width: 3,
                              background: m.done && appStageInfo.milestones[idx + 1]?.done ? '#059669' : '#e2e8f0',
                              zIndex: 1, transition: 'background 0.4s ease',
                            }} />
                          )}

                          {/* Milestone Icon Node */}
                          <div style={{ zIndex: 2, flexShrink: 0 }}>
                            {m.failed ? (
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fee2e2', border: '2px solid #ef4444', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem' }}>
                                ✕
                              </div>
                            ) : m.done ? (
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', boxShadow: '0 3px 8px rgba(5,150,105,0.3)', border: '2px solid #ffffff' }}>
                                ✓
                              </div>
                            ) : m.current ? (
                              <motion.div
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{ width: 34, height: 34, borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '2px solid #ffffff', boxShadow: '0 4px 12px rgba(2,132,199,0.4)' }}
                              >
                                <Truck style={{ width: 18, height: 18 }} />
                              </motion.div>
                            ) : (
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f1f5f9', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', border: '2px solid #cbd5e1' }}>
                                {m.id}
                              </div>
                            )}
                          </div>

                          {/* Milestone Content */}
                          <div style={{ flex: 1, minWidth: 0, paddingTop: '0.15rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.4rem' }}>
                              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: m.done || m.current ? '#0f172a' : '#94a3b8' }}>
                                {m.title}
                              </h4>
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: m.current ? '#0284c7' : m.done ? '#059669' : '#94a3b8' }}>
                                {m.time}
                              </span>
                            </div>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: m.done || m.current ? '#475569' : '#94a3b8', lineHeight: 1.4, fontWeight: 600 }}>
                              {m.desc}
                            </p>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 🛵 Courier Agent Details Card */}
                {appStageInfo.showCourierDriver && !appStageInfo.isCancelled && (
                  <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.35rem', border: '1px solid #cbd5e1', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.85rem' }}>
                      Assigned Courier Partner: Sanjeevani Express
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={driver.avatar} alt={driver.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #10b981', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                          {driver.name}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: 900, padding: '0.1rem 0.45rem', borderRadius: '0.35rem', border: '1px solid #fde68a' }}>
                            ★ {driver.rating}
                          </span>
                          <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>Sanjeevani Express Courier</span>
                        </div>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.76rem', color: '#475569', fontWeight: 600 }}>
                          Vehicle: {driver.vehicle}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: '1.1rem' }}>
                      <a
                        href={`tel:${driver.phone}`}
                        style={{
                          padding: '0.6rem 0.85rem', borderRadius: '0.65rem',
                          background: '#059669', color: '#ffffff', fontWeight: 800, fontSize: '0.82rem',
                          textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                          boxShadow: '0 3px 10px rgba(5,150,105,0.25)',
                        }}
                      >
                        <Phone style={{ width: 14, height: 14 }} />
                        <span>Call Driver</span>
                      </a>
                      
                      <button
                        onClick={() => alert(`Opening chat with driver ${driver.name} for Order #${rawOrderId}`)}
                        style={{
                          padding: '0.6rem 0.85rem', borderRadius: '0.65rem',
                          border: '1.5px solid #cbd5e1', background: '#ffffff',
                          color: '#334155', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        }}
                      >
                        <MessageSquare style={{ width: 14, height: 14, color: '#0284c7' }} />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: Address, Notes, Items & Support */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Shipping & Delivery Address Card */}
                <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
                    <MapPin style={{ width: 18, height: 18, color: '#ef4444' }} />
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 900, color: '#0f172a' }}>
                      Shipping Address
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                    {selectedOrder?.customerName || 'Valued Customer'}
                  </p>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, fontWeight: 600 }}>
                    {selectedOrder?.shippingAddress || 'Flat 402, Block A, Jubilee Hills, Hyderabad - 500033'}
                  </p>
                  {selectedOrder?.customerPhone && (
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                      Phone: {selectedOrder.customerPhone}
                    </p>
                  )}
                </div>

                {/* Delivery Instructions Box */}
                <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' }}>
                      Delivery Instructions
                    </span>
                    <button
                      onClick={() => setIsEditingNote(!isEditingNote)}
                      style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      <Edit3 style={{ width: 13, height: 13 }} />
                      <span>{isEditingNote ? 'Cancel' : 'Edit Note'}</span>
                    </button>
                  </div>

                  {isEditingNote ? (
                    <div>
                      <textarea
                        rows={2}
                        placeholder="e.g. Leave package at door or ring bell..."
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', padding: '0.45rem', fontSize: '0.8rem', outline: 'none', fontFamily: 'inherit' }}
                      />
                      <button
                        onClick={handleSaveDeliveryNote}
                        style={{ marginTop: '0.4rem', padding: '0.35rem 0.75rem', background: '#febd69', border: 'none', borderRadius: '0.4rem', fontSize: '0.76rem', fontWeight: 900, cursor: 'pointer' }}
                      >
                        Save Note
                      </button>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, fontWeight: 600 }}>
                      "{savedNote}"
                    </p>
                  )}
                </div>

                {/* Purchased Items & Buy Again */}
                <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' }}>
                      Items in this order ({orderItems.length})
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#059669' }}>
                      ₹{Number(selectedOrder?.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingRight: '0.2rem' }}>
                    {orderItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem', borderRadius: '0.6rem', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', padding: '0.15rem', flexShrink: 0 }}>
                          <ProductImage src={item.productImage} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.productName}
                          </p>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Qty: {item.quantity} • ₹{Number(item.pricePerUnit || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                      marginTop: '0.85rem', width: '100%',
                      padding: '0.55rem', borderRadius: '0.55rem',
                      border: '1.5px solid #febd69', background: '#fffbeb',
                      color: '#92400e', fontWeight: 900, fontSize: '0.8rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    }}
                  >
                    <RotateCcw style={{ width: 14, height: 14 }} />
                    <span>Buy Items Again</span>
                  </button>
                </div>

                {/* 24x7 Customer Support Card */}
                <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.1rem 1.25rem', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <HelpCircle style={{ width: 20, height: 20 }} />
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, color: '#0f172a' }}>Need help with this order?</h5>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>24x7 Sanjeevani Customer Assistance</p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .responsive-track-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  );
};

export default TrackOrderPage;

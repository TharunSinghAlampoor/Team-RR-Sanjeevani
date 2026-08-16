import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Check, Download, Truck, ShoppingBag, MapPin, Calendar, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import ProductImage from './ProductImage';
import { downloadOrderInvoice } from './OrdersModal';
import { parseExactDate, formatExactDateStr, formatExactTimeStr } from '../utils/dateUtils';

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1200,
    background: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(10px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  },
  dialog: {
    background: '#ffffff',
    borderRadius: '1.5rem',
    width: '100%', maxWidth: 580,
    maxHeight: '92vh', overflowY: 'auto',
    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.35)',
    border: '1.5px solid #e2e8f0',
    position: 'relative',
    overflow: 'hidden',
  },
  topDecoration: {
    height: 8,
    background: 'linear-gradient(90deg, #10b981, #059669, #06b6d4, #10b981)',
    backgroundSize: '200% 100%',
    animation: 'gradientMove 3s linear infinite',
  },
  body: { padding: '2rem 1.75rem' },

  /* Confetti Animation Header */
  animContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    marginBottom: '1.5rem', position: 'relative',
  },
  checkmarkCircle: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 12px 30px rgba(16, 185, 129, 0.4)',
    marginBottom: '1.1rem',
  },
  title: { fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.3rem' },
  subtitle: { fontSize: '0.85rem', color: '#64748b', margin: 0 },

  /* Order ID Pill */
  idPill: {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.45rem 0.9rem', borderRadius: 99,
    background: '#f0fdf4', border: '1.5px solid #a7f3d0',
    fontSize: '0.82rem', fontWeight: 800, color: '#065f46',
    marginTop: '0.85rem',
  },
  copyBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#059669', display: 'flex', alignItems: 'center', padding: '0.1rem',
  },

  /* Card Section */
  card: {
    background: '#f8fafc',
    borderRadius: '1rem',
    border: '1.5px solid #e2e8f0',
    padding: '1.1rem 1.25rem',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '0.78rem', fontWeight: 800, color: '#334155',
    textTransform: 'uppercase', letterSpacing: '0.04em',
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    marginBottom: '0.75rem',
  },

  /* Stepper */
  stepper: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    position: 'relative', marginTop: '0.5rem',
  },
  stepItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
    zIndex: 2, flex: 1, textAlign: 'center',
  },
  stepIconActive: {
    width: 28, height: 28, borderRadius: '50%',
    background: '#10b981', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.72rem', fontWeight: 800,
    boxShadow: '0 4px 10px rgba(16,185,129,0.3)',
  },
  stepIconPending: {
    width: 28, height: 28, borderRadius: '50%',
    background: '#e2e8f0', color: '#94a3b8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.72rem', fontWeight: 800,
  },
  stepLabel: { fontSize: '0.68rem', fontWeight: 700, color: '#1e293b' },

  /* Buttons */
  btnGroup: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
    marginTop: '1.5rem',
  },
  primaryBtn: {
    padding: '0.85rem', borderRadius: '0.85rem', border: 'none',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff', fontWeight: 800, fontSize: '0.88rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
  },
  secondaryBtn: {
    padding: '0.85rem', borderRadius: '0.85rem',
    border: '1.5px solid #cbd5e1', background: '#ffffff',
    color: '#334155', fontWeight: 800, fontSize: '0.88rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  },
};

export const OrderSuccessModal = ({
  order,
  onClose,
  onOpenOrders,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const orderId = order.orderId || 'ORD-SUCCESS';
  const totalAmount = order.totalAmount || order.amount || 0;
  const items = order.items || [];
  const customerName = order.customerName || 'Valued Customer';
  const address = order.shippingAddress || '123 Sanjeevani Healthcare Hub, Medical Block A, Hyd';
  const createdDate = order.createdAt ? new Date(order.createdAt) : new Date();

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadInvoice = () => {
    downloadOrderInvoice(order);
  };

  return (
    <div style={s.overlay}>
      <motion.div
        style={{
          background: '#ffffff',
          borderRadius: '1.5rem',
          width: '94%', maxWidth: 560,
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.35)',
          border: '1.5px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden',
        }}
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div style={s.topDecoration} />

        {/* Scrollable Modal Body */}
        <div style={{ padding: '1.25rem 1.5rem', flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {/* Animated Checkmark Header */}
          <div style={s.animContainer}>
            <motion.div
              style={s.checkmarkCircle}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
            >
              <CheckCircle2 style={{ width: 44, height: 44, color: '#ffffff' }} />
            </motion.div>

            <h2 style={s.title}>Order Confirmed! 🎉</h2>
            <p style={s.subtitle}>Thank you for your purchase, {customerName}!</p>

            <div style={s.idPill}>
              <span>Order ID: <strong>{orderId}</strong></span>
              <button style={s.copyBtn} onClick={handleCopyId} title="Copy Order ID">
                {copied ? <Check style={{ width: 14, height: 14, color: '#059669' }} /> : <Copy style={{ width: 14, height: 14 }} />}
              </button>
            </div>
          </div>

          {/* Delivery & Address Card */}
          <div style={s.card}>
            <div style={s.cardTitle}>
              <MapPin style={{ width: 14, height: 14, color: '#10b981' }} />
              <span>Ship To Address</span>
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem' }}>{customerName}</p>
            <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>{address}</p>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar style={{ width: 14, height: 14, color: '#059669' }} />
                <span>{formatExactDateStr(createdDate)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock style={{ width: 14, height: 14, color: '#06b6d4' }} />
                <span>{formatExactTimeStr(createdDate)}</span>
              </div>
            </div>
          </div>

          {/* Ordered Items Preview */}
          <div style={s.card}>
            <div style={s.cardTitle}>
              <ShoppingBag style={{ width: 14, height: 14, color: '#6366f1' }} />
              <span>Order Summary ({items.length} item{items.length !== 1 ? 's' : ''})</span>
            </div>
            <div style={{ maxHeight: 110, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                    {item.productName} (x{item.quantity})
                  </span>
                  <span style={{ fontWeight: 800, color: '#059669' }}>₹{Number(item.totalPrice || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', fontWeight: 900, color: '#0f172a', paddingTop: '0.5rem', marginTop: '0.4rem', borderTop: '1.5px solid #e2e8f0' }}>
              <span>Total Paid</span>
              <span style={{ color: '#059669' }}>₹{Number(totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer Always Visible On Screen */}
        <div style={{ padding: '0.9rem 1.4rem 1.1rem', background: '#ffffff', borderTop: '1.5px solid #e2e8f0', boxShadow: '0 -4px 15px rgba(0,0,0,0.04)', flexShrink: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button style={s.secondaryBtn} onClick={handleDownloadInvoice}>
              <Download style={{ width: 16, height: 16 }} />
              <span>Download Invoice</span>
            </button>
            <button style={s.primaryBtn} onClick={() => { onClose(); navigate(`/track-order/${orderId}`); }}>
              <Truck style={{ width: 16, height: 16 }} />
              <span>Track Order</span>
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '0.65rem' }}>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccessModal;

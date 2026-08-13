import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Search, Eye, FileText, CheckCircle2, Clock,
  XCircle, RotateCcw, DollarSign, RefreshCw, Star, ShieldCheck,
  MessageSquare, User, Calendar, CreditCard, Tag, ArrowRight, X, AlertCircle
} from 'lucide-react';
import adminService from '../../api/adminService';
import shopService from '../../api/shopService';
import BrandLoader from '../../components/BrandLoader';
import ToastNotification from '../../components/ToastNotification';
import MedicalInvoiceModal from '../../components/MedicalInvoiceModal';

export function AdminOrders() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'refunds' | 'replacements' | 'ratings'
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [replacements, setReplacements] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [refundModalOrder, setRefundModalOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [resOrders, resRefunds, resReplacements, resRatings] = await Promise.allSettled([
        adminService.getOrders(),
        shopService.getAdminRefunds(),
        shopService.getAdminReplacements(),
        shopService.getAdminRatings()
      ]);

      if (resOrders.status === 'fulfilled' && resOrders.value?.data) {
        setOrders(Array.isArray(resOrders.value.data) ? resOrders.value.data : []);
      }
      if (resRefunds.status === 'fulfilled' && resRefunds.value?.data) {
        setRefunds(Array.isArray(resRefunds.value.data) ? resRefunds.value.data : []);
      }
      if (resReplacements.status === 'fulfilled' && resReplacements.value?.data) {
        setReplacements(Array.isArray(resReplacements.value.data) ? resReplacements.value.data : []);
      }
      if (resRatings.status === 'fulfilled' && resRatings.value?.data) {
        setRatings(Array.isArray(resRatings.value.data) ? resRatings.value.data : []);
      }
    } catch (err) {
      console.error('Fetch admin orders & support data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (searchQuery.trim()) {
      const kw = searchQuery.toLowerCase().trim();
      result = result.filter(o =>
        (o.orderId && String(o.orderId).toLowerCase().includes(kw)) ||
        (o.customerName && o.customerName.toLowerCase().includes(kw)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(kw))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(o => String(o.status || '').toUpperCase() === statusFilter);
    }

    return result;
  }, [orders, searchQuery, statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setToast({ type: 'success', title: 'Order Status Updated', message: `Order #${orderId} set to ${newStatus}.` });
      loadAllData();
    } catch (err) {
      setToast({ type: 'error', title: 'Update Failed', message: err.response?.data?.message || 'Failed to update order status.' });
    }
  };

  const handleProcessRefundOrReplace = async (orderId, newStatus, message) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setToast({ type: 'success', title: 'Request Processed', message: message || `Order #${orderId} updated to ${newStatus}.` });
      setRefundModalOrder(null);
      loadAllData();
    } catch (err) {
      setToast({ type: 'error', title: 'Action Failed', message: err.response?.data?.message || 'Failed to process request.' });
    }
  };

  const handleUpdateRefundStatus = async (id, status) => {
    try {
      await shopService.updateAdminRefundStatus(id, status);
      setToast({ type: 'success', title: 'Refund Status Updated', message: `Refund request #${id} marked as ${status}.` });
      loadAllData();
    } catch (err) {
      setToast({ type: 'error', title: 'Update Failed', message: 'Failed to update refund status.' });
    }
  };

  const handleUpdateReplacementStatus = async (id, status) => {
    try {
      await shopService.updateAdminReplacementStatus(id, status);
      setToast({ type: 'success', title: 'Replacement Status Updated', message: `Replacement request #${id} marked as ${status}.` });
      loadAllData();
    } catch (err) {
      setToast({ type: 'error', title: 'Update Failed', message: 'Failed to update replacement status.' });
    }
  };

  if (loading) {
    return <BrandLoader message="Loading Orders, Refunds, Replacements & Ratings..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
          Order & Support Command Center
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
          Manage customer orders, process returns/refunds/replacements, and view real-time ratings & feedback.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e2e8f0',
        overflowX: 'auto',
        paddingBottom: '0.2rem',
        whiteSpace: 'nowrap'
      }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.65rem 1.15rem',
            borderRadius: '0.75rem 0.75rem 0 0',
            border: 'none',
            background: activeTab === 'orders' ? '#0f172a' : 'transparent',
            color: activeTab === 'orders' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <ShoppingBag size={18} />
          <span>All Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('refunds')}
          style={{
            padding: '0.65rem 1.15rem',
            borderRadius: '0.75rem 0.75rem 0 0',
            border: 'none',
            background: activeTab === 'refunds' ? '#059669' : 'transparent',
            color: activeTab === 'refunds' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <DollarSign size={18} />
          <span>Refunds & Returns ({refunds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('replacements')}
          style={{
            padding: '0.65rem 1.15rem',
            borderRadius: '0.75rem 0.75rem 0 0',
            border: 'none',
            background: activeTab === 'replacements' ? '#0284c7' : 'transparent',
            color: activeTab === 'replacements' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <RefreshCw size={18} />
          <span>Replacements ({replacements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ratings')}
          style={{
            padding: '0.65rem 1.15rem',
            borderRadius: '0.75rem 0.75rem 0 0',
            border: 'none',
            background: activeTab === 'ratings' ? '#d97706' : 'transparent',
            color: activeTab === 'ratings' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <Star size={18} />
          <span>Order Ratings ({ratings.length})</span>
        </button>
      </div>

      {/* TAB 1: ALL ORDERS */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Search Toolbar */}
          <div style={{
            background: '#ffffff',
            borderRadius: '1rem',
            padding: '0.85rem 1.15rem',
            border: '1.5px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.85rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
              <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.6rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 600 }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.6rem 1rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="SUCCESS">PAID / SUCCESS</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PACKED">PACKED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="RETURN_REQUESTED">🔄 RETURN REQUESTED</option>
              <option value="REFUNDED">💰 REFUNDED</option>
              <option value="REPLACED">📦 REPLACED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Orders Table Container (Mobile Responsive Scroll) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
            {filteredOrders.length === 0 ? (
              <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                <ShoppingBag size={48} style={{ margin: '0 auto 1rem auto', color: '#cbd5e1' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>No Orders Found</h4>
                <p style={{ fontSize: '0.88rem', margin: 0 }}>No orders match your search or filter criteria.</p>
              </div>
            ) : (
              <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '1rem' }}>Order ID</th>
                    <th style={{ padding: '1rem' }}>Customer</th>
                    <th style={{ padding: '1rem' }}>Amount</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Update Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => {
                    const st = String(o.status || '').toUpperCase();
                    const isReturnOrRefund = st === 'RETURN_REQUESTED' || st === 'REFUNDED' || st === 'REPLACED';

                    return (
                      <tr key={o.orderId} style={{ borderBottom: '1px solid #f1f5f9', background: st === 'RETURN_REQUESTED' ? '#fffbeb' : 'transparent' }}>
                        <td style={{ padding: '1rem', fontWeight: 900, color: '#0f172a' }}>
                          {o.orderId}
                          {st === 'RETURN_REQUESTED' && (
                            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#d97706', marginTop: 2 }}>
                              🔄 RETURN REQ
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{o.customerName || 'Customer'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.customerEmail}</div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 900, color: '#059669' }}>
                          ₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: 99,
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            background: st === 'DELIVERED' || st === 'SUCCESS' ? '#d1fae5' : st === 'SHIPPED' || st === 'OUT_FOR_DELIVERY' ? '#e0f2fe' : st === 'RETURN_REQUESTED' ? '#fef3c7' : st === 'REFUNDED' || st === 'REPLACED' ? '#f3e8ff' : st === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                            color: st === 'DELIVERED' || st === 'SUCCESS' ? '#047857' : st === 'SHIPPED' || st === 'OUT_FOR_DELIVERY' ? '#0284c7' : st === 'RETURN_REQUESTED' ? '#b45309' : st === 'REFUNDED' || st === 'REPLACED' ? '#6b21a8' : st === 'CANCELLED' ? '#b91c1c' : '#b45309'
                          }}>
                            {st === 'RETURN_REQUESTED' ? '🔄 RETURN REQUESTED' : st === 'REFUNDED' ? '💰 REFUNDED' : st === 'REPLACED' ? '📦 REPLACED' : st}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <select
                            value={st}
                            onChange={(e) => handleUpdateStatus(o.orderId, e.target.value)}
                            style={{ padding: '0.35rem 0.65rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="SUCCESS">PAID / SUCCESS</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PACKED">PACKED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="RETURN_REQUESTED">🔄 RETURN REQUESTED</option>
                            <option value="REFUNDED">💰 REFUNDED</option>
                            <option value="REPLACED">📦 REPLACED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {isReturnOrRefund ? (
                              <button
                                onClick={() => setRefundModalOrder(o)}
                                style={{ padding: '0.45rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #d97706', background: '#fffbeb', color: '#b45309', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <RotateCcw size={14} />
                                <span>Manage Return</span>
                              </button>
                            ) : null}

                            <button
                              onClick={() => setSelectedOrderDetails(o)}
                              style={{ padding: '0.45rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#059669', color: '#fff', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 2px 6px rgba(5,150,105,0.25)' }}
                            >
                              <FileText size={14} />
                              <span>Tax Invoice</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REFUNDS & RETURNS */}
      {activeTab === 'refunds' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {refunds.length === 0 ? (
            <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
              <DollarSign size={48} style={{ margin: '0 auto 1rem auto', color: '#cbd5e1' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>No Refund Requests</h4>
              <p style={{ fontSize: '0.88rem', margin: 0 }}>There are currently no refund or return requests submitted by customers.</p>
            </div>
          ) : (
            <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#ecfdf5', borderBottom: '1.5px solid #a7f3d0', textAlign: 'left', color: '#065f46', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Request ID</th>
                  <th style={{ padding: '1rem' }}>Order ID</th>
                  <th style={{ padding: '1rem' }}>Refund Amount</th>
                  <th style={{ padding: '1rem' }}>Method & Details</th>
                  <th style={{ padding: '1rem' }}>Reason</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map(r => (
                  <tr key={r.id || r.requestId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: 900, color: '#0f172a' }}>{r.requestId}</td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#0284c7' }}>#{r.orderId}</td>
                    <td style={{ padding: '1rem', fontWeight: 900, color: '#059669' }}>
                      ₹{Number(r.refundAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{r.refundMethod || 'UPI Refund'}</div>
                      {r.upiId && <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}>UPI: {r.upiId}</div>}
                    </td>
                    <td style={{ padding: '1rem', color: '#475569', maxWidth: 220 }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.reason || 'Item Return'}</div>
                      {r.comment && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>"{r.comment}"</div>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: 99,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: r.status === 'REFUNDED' || r.status === 'APPROVED' ? '#d1fae5' : r.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                        color: r.status === 'REFUNDED' || r.status === 'APPROVED' ? '#047857' : r.status === 'REJECTED' ? '#b91c1c' : '#b45309'
                      }}>
                        {r.status || 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {r.status !== 'REFUNDED' && (
                          <button
                            onClick={() => handleUpdateRefundStatus(r.id, 'REFUNDED')}
                            style={{ padding: '0.35rem 0.65rem', borderRadius: '0.5rem', border: 'none', background: '#059669', color: '#fff', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                          >
                            Approve & Refund
                          </button>
                        )}
                        {r.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateRefundStatus(r.id, 'REJECTED')}
                            style={{ padding: '0.35rem 0.65rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#dc2626', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 3: REPLACEMENTS */}
      {activeTab === 'replacements' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {replacements.length === 0 ? (
            <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
              <RefreshCw size={48} style={{ margin: '0 auto 1rem auto', color: '#cbd5e1' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>No Replacement Requests</h4>
              <p style={{ fontSize: '0.88rem', margin: 0 }}>There are currently no medicine replacement requests submitted by customers.</p>
            </div>
          ) : (
            <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f0f9ff', borderBottom: '1.5px solid #bae6fd', textAlign: 'left', color: '#0369a1', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Request ID</th>
                  <th style={{ padding: '1rem' }}>Order ID</th>
                  <th style={{ padding: '1rem' }}>Reason</th>
                  <th style={{ padding: '1rem' }}>Replacement Address</th>
                  <th style={{ padding: '1rem' }}>Estimated Delivery</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {replacements.map(rep => (
                  <tr key={rep.id || rep.requestId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: 900, color: '#0f172a' }}>{rep.requestId}</td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#0284c7' }}>#{rep.orderId}</td>
                    <td style={{ padding: '1rem', color: '#475569' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{rep.reason || 'Damaged Medicine'}</div>
                      {rep.comment && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>"{rep.comment}"</div>}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#334155', maxWidth: 220 }}>
                      {rep.replacementAddress || 'Same as Order Shipping Address'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                      {rep.estimatedDelivery || 'Next Day Dispatch'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: 99,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: rep.status === 'COMPLETED' || rep.status === 'DISPATCHED' ? '#d1fae5' : rep.status === 'REJECTED' ? '#fee2e2' : '#e0f2fe',
                        color: rep.status === 'COMPLETED' || rep.status === 'DISPATCHED' ? '#047857' : rep.status === 'REJECTED' ? '#b91c1c' : '#0369a1'
                      }}>
                        {rep.status || 'SCHEDULED'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {rep.status !== 'DISPATCHED' && (
                          <button
                            onClick={() => handleUpdateReplacementStatus(rep.id, 'DISPATCHED')}
                            style={{ padding: '0.35rem 0.65rem', borderRadius: '0.5rem', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                          >
                            Dispatch Package
                          </button>
                        )}
                        {rep.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateReplacementStatus(rep.id, 'REJECTED')}
                            style={{ padding: '0.35rem 0.65rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#dc2626', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 4: RATINGS & FEEDBACK */}
      {activeTab === 'ratings' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {ratings.length === 0 ? (
            <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
              <Star size={48} style={{ margin: '0 auto 1rem auto', color: '#cbd5e1' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>No Customer Reviews Yet</h4>
              <p style={{ fontSize: '0.88rem', margin: 0 }}>Customer order ratings and feedback will appear here as orders are completed.</p>
            </div>
          ) : (
            <table style={{ width: '100%', minWidth: 750, borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#fffbeb', borderBottom: '1.5px solid #fde68a', textAlign: 'left', color: '#92400e', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Order ID</th>
                  <th style={{ padding: '1rem' }}>Rating</th>
                  <th style={{ padding: '1rem' }}>Feedback Tags</th>
                  <th style={{ padding: '1rem' }}>Customer Review / Comment</th>
                  <th style={{ padding: '1rem' }}>Submitted Date</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map(f => (
                  <tr key={f.id || f.orderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: 900, color: '#0284c7' }}>#{f.orderId}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 900 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill={i < (f.rating || 5) ? '#f59e0b' : 'none'} color={i < (f.rating || 5) ? '#f59e0b' : '#cbd5e1'} />
                        ))}
                        <span style={{ marginLeft: '0.3rem', color: '#0f172a', fontSize: '0.85rem' }}>({f.rating || 5}/5)</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {f.feedbackTags ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {f.feedbackTags.split(',').map((tag, idx) => (
                            <span key={idx} style={{ background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.72rem', fontWeight: 800 }}>
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Standard Review</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', color: '#334155', fontWeight: 600, maxWidth: 300 }}>
                      {f.comment ? `"${f.comment}"` : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No written comment provided.</span>}
                    </td>
                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.78rem' }}>
                      {f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Process Refund / Replacement Modal */}
      {refundModalOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '1.5rem', width: '100%', maxWidth: 500, border: '1.5px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <RotateCcw size={22} style={{ color: '#d97706' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>Return & Refund Action</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Order #{refundModalOrder.orderId}</p>
                </div>
              </div>
              <button onClick={() => setRefundModalOrder(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.85rem', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Customer Name:</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{refundModalOrder.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Total Order Value:</span>
                <span style={{ fontWeight: 900, color: '#059669' }}>₹{Number(refundModalOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => handleProcessRefundOrReplace(refundModalOrder.orderId, 'REFUNDED', 'Refund of ₹' + refundModalOrder.totalAmount + ' approved & processed.')}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#ffffff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}
              >
                <DollarSign size={18} />
                <span>Approve & Process Refund (₹{refundModalOrder.totalAmount})</span>
              </button>

              <button
                onClick={() => handleProcessRefundOrReplace(refundModalOrder.orderId, 'REPLACED', 'Replacement medicine package created.')}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
              >
                <RefreshCw size={18} />
                <span>Approve & Ship Replacement Package</span>
              </button>

              <button
                onClick={() => handleProcessRefundOrReplace(refundModalOrder.orderId, 'DELIVERED', 'Return request rejected. Order remains delivered.')}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#64748b', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                <span>Reject Return Request (Keep Delivered)</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Official Medical Tax Invoice Modal */}
      {selectedOrderDetails && (
        <MedicalInvoiceModal
          order={selectedOrderDetails}
          onClose={() => setSelectedOrderDetails(null)}
        />
      )}

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default AdminOrders;

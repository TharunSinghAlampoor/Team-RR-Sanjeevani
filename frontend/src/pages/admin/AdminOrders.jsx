import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Filter, Eye, Printer, CheckCircle2, Clock,
  XCircle, Truck, PackageCheck, AlertTriangle, FileText, MapPin, User, Mail, Phone, X,
  RotateCcw, DollarSign, RefreshCw, Star, ShieldCheck, ArrowRight
} from 'lucide-react';
import adminService from '../../api/adminService';
import BrandLoader from '../../components/BrandLoader';
import ToastNotification from '../../components/ToastNotification';
import MedicalInvoiceModal from '../../components/MedicalInvoiceModal';

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [refundModalOrder, setRefundModalOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const loadOrders = async () => {
    try {
      const res = await adminService.getOrders();
      if (res && res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
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
      loadOrders();
    } catch (err) {
      setToast({ type: 'error', title: 'Update Failed', message: err.response?.data?.message || 'Failed to update order status.' });
    }
  };

  const handleProcessRefundOrReplace = async (orderId, newStatus, message) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setToast({ type: 'success', title: 'Request Processed', message: message || `Order #${orderId} updated to ${newStatus}.` });
      setRefundModalOrder(null);
      loadOrders();
    } catch (err) {
      setToast({ type: 'error', title: 'Action Failed', message: err.response?.data?.message || 'Failed to process request.' });
    }
  };

  if (loading) {
    return <BrandLoader message="Loading System Orders & Refund Requests..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Order & Refund Control Center</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
            Manage customer purchases, process returns/refunds/replacements, and print medical tax invoices.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1rem 1.25rem',
        border: '1.5px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by Order ID or Customer Name / Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.6rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 600 }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.65rem 1rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Paid / Success</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PACKED">Packed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="RETURN_REQUESTED">🔄 Return Requested</option>
          <option value="REFUNDED">💰 Refund Processed</option>
          <option value="REPLACED">📦 Replacement Shipped</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '1.25rem',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        {filteredOrders.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
            <ShoppingBag size={48} style={{ margin: '0 auto 1rem auto', color: '#cbd5e1' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>No Orders Found</h4>
            <p style={{ fontSize: '0.88rem', margin: 0 }}>No orders match your filter criteria.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Order ID</th>
                <th style={{ padding: '1rem' }}>Customer</th>
                <th style={{ padding: '1rem' }}>Total Amount</th>
                <th style={{ padding: '1rem' }}>Order Stage</th>
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

      {/* Process Refund / Replacement Modal */}
      {refundModalOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '1.75rem', width: '100%', maxWidth: 520, border: '1.5px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <RotateCcw size={22} style={{ color: '#d97706' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>Return & Refund Action</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Order #{refundModalOrder.orderId}</p>
                </div>
              </div>
              <button onClick={() => setRefundModalOrder(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Customer Name:</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{refundModalOrder.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Total Order Value:</span>
                <span style={{ fontWeight: 900, color: '#059669' }}>₹{Number(refundModalOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Current Stage:</span>
                <span style={{ fontWeight: 800, color: '#b45309' }}>{refundModalOrder.status}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '1rem' }}>
              Select resolution action for this customer request:
            </p>

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

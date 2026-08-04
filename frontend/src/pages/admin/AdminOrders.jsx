import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Search, Filter, Eye, Printer, CheckCircle2, Clock,
  XCircle, Truck, PackageCheck, AlertTriangle, FileText, MapPin, User, Mail, Phone, X
} from 'lucide-react';
import adminService from '../../api/adminService';
import BrandLoader from '../../components/BrandLoader';
import ToastNotification from '../../components/ToastNotification';

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
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
        (o.orderId && o.orderId.toLowerCase().includes(kw)) ||
        (o.customerName && o.customerName.toLowerCase().includes(kw)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(kw))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(o => o.status === statusFilter);
    }

    return result;
  }, [orders, searchQuery, statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setToast({ type: 'success', title: 'Order Status Updated', message: `Order #${orderId} set to ${newStatus}.` });
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  if (loading) {
    return <BrandLoader message="Loading System Orders..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Order Management Center</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
            Manage customer purchases, update order dispatch stages, and print invoices.
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
          style={{ padding: '0.65rem 1rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PACKED">Packed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
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
              {filteredOrders.map(o => (
                <tr key={o.orderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 900, color: '#0f172a' }}>{o.orderId}</td>
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
                      background: o.status === 'DELIVERED' || o.status === 'SUCCESS' ? '#d1fae5' : o.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                      color: o.status === 'DELIVERED' || o.status === 'SUCCESS' ? '#047857' : o.status === 'CANCELLED' ? '#b91c1c' : '#b45309'
                    }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateStatus(o.orderId, e.target.value)}
                      style={{ padding: '0.35rem 0.65rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PACKED">PACKED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedOrderDetails(o)}
                      style={{ padding: '0.45rem 0.85rem', borderRadius: '0.5.rem', border: '1px solid #cbd5e1', background: '#fff', color: '#0284c7', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrderDetails && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            width: '100%', maxWidth: 640, background: '#ffffff', borderRadius: '1.25rem', padding: '2rem',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Order #{selectedOrderDetails.orderId}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Placed on {new Date(selectedOrderDetails.createdAt).toLocaleString()}</span>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* Customer Details */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.85rem', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Customer & Shipping Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><User size={14} style={{ display: 'inline', marginRight: 6, color: '#059669' }} /><strong>{selectedOrderDetails.customerName}</strong></div>
                <div><Mail size={14} style={{ display: 'inline', marginRight: 6, color: '#059669' }} />{selectedOrderDetails.customerEmail}</div>
                <div style={{ gridColumn: 'span 2' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: 6, color: '#059669' }} />
                  {selectedOrderDetails.shippingAddress || 'Standard Express Pharmacy Delivery'}
                </div>
              </div>
            </div>

            {/* Itemized Medicine List */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Itemized Medicines</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {(selectedOrderDetails.items || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '0.65rem', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={item.productImage || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=80&q=80'} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'contain' }} />
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{item.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.quantity} x ₹{Number(item.pricePerUnit || 0).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 900, color: '#059669' }}>
                      ₹{Number(item.totalPrice || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Total Order Amount</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669' }}>₹{Number(selectedOrderDetails.totalAmount || 0).toLocaleString('en-IN')}</div>
              </div>

              <button
                onClick={() => window.print()}
                style={{ padding: '0.65rem 1.25rem', borderRadius: '0.65rem', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={16} />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default AdminOrders;

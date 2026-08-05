import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Search, Filter, Eye, Printer, CheckCircle2, Clock,
  XCircle, Truck, PackageCheck, AlertTriangle, FileText, MapPin, User, Mail, Phone, X
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
      setToast({ type: 'error', title: 'Update Failed', message: err.response?.data?.message || 'Failed to update order status.' });
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
          <option value="SUCCESS">Paid / Success</option>
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
                      background: o.status === 'DELIVERED' || o.status === 'SUCCESS' ? '#d1fae5' : o.status === 'SHIPPED' || o.status === 'OUT_FOR_DELIVERY' ? '#e0f2fe' : o.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                      color: o.status === 'DELIVERED' || o.status === 'SUCCESS' ? '#047857' : o.status === 'SHIPPED' || o.status === 'OUT_FOR_DELIVERY' ? '#0284c7' : o.status === 'CANCELLED' ? '#b91c1c' : '#b45309'
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
                      <option value="SUCCESS">PAID / SUCCESS</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PACKED">PACKED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
              ))}
            </tbody>
          </table>
        )}
      </div>

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

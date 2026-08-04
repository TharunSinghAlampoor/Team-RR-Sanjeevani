import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingBag, Users, Pill, FolderTree, AlertTriangle,
  Clock, CheckCircle2, TrendingUp, Sparkles, ArrowRight, ShieldCheck,
  PlusCircle, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../../api/adminService';
import BrandLoader from '../../components/BrandLoader';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(res => {
        if (res && res.success && res.data) {
          setStats(res.data);
        }
      })
      .catch(err => console.error('Error fetching admin stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <BrandLoader message="Loading Admin Dashboard Analytics..." />;
  }

  const statCards = [
    { title: "Total Revenue", value: `₹${Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: '#059669', bg: '#ecfdf5', note: 'All-time sales revenue' },
    { title: "Today's Revenue", value: `₹${Number(stats?.todayRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: '#0284c7', bg: '#f0f9ff', note: "Today's total earnings" },
    { title: "Monthly Revenue", value: `₹${Number(stats?.monthlyRevenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: '#7c3aed', bg: '#f5f3ff', note: 'This month earnings' },
    { title: "Yearly Revenue", value: `₹${Number(stats?.yearlyRevenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: '#d97706', bg: '#fffbeb', note: 'This year earnings' },

    { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingBag, color: '#2563eb', bg: '#eff6ff', note: 'All processed orders' },
    { title: "Pending Orders", value: stats?.pendingOrders || 0, icon: Clock, color: '#eab308', bg: '#fefce8', note: 'Awaiting confirmation' },
    { title: "Delivered Orders", value: stats?.deliveredOrders || 0, icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4', note: 'Completed deliveries' },
    { title: "Cancelled Orders", value: stats?.cancelledOrders || 0, icon: AlertTriangle, color: '#dc2626', bg: '#fef2f2', note: 'Cancelled / Returned' },

    { title: "Total Customers", value: stats?.totalUsers || 0, icon: Users, color: '#0891b2', bg: '#ecfeff', note: 'Registered user accounts' },
    { title: "Total Medicines", value: stats?.totalMedicines || 0, icon: Pill, color: '#059669', bg: '#ecfdf5', note: 'Cataloged products' },
    { title: "Total Categories", value: stats?.totalCategories || 0, icon: FolderTree, color: '#4f46e5', bg: '#eef2ff', note: 'Healthcare categories' },
    { title: "Low / Out of Stock", value: (stats?.lowStockMedicines || 0) + (stats?.outOfStockMedicines || 0), icon: AlertTriangle, color: '#ea580c', bg: '#fff7ed', note: 'Requires restocking' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '1.25rem',
          padding: '2rem 2.25rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(5, 150, 105, 0.2)', border: '1px solid #10b981', padding: '0.35rem 0.85rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 800, color: '#34d399', marginBottom: '0.8rem' }}>
            <Sparkles size={14} />
            <span>Healthcare Operations Control</span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 0.5rem 0' }}>
            Sanjeevani Administrator Command Center
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>
            Real-time management of medicines, inventory, customer orders, and financial metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', position: 'relative', zIndex: 2 }}>
          <Link
            to="/admin/products"
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '0.75rem',
              background: '#059669',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)'
            }}
          >
            <PlusCircle size={18} />
            <span>Add Medicine</span>
          </Link>
          <Link
            to="/admin/reports"
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '0.75rem',
              background: '#334155',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FileText size={18} />
            <span>Export Reports</span>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem'
      }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                background: '#ffffff',
                borderRadius: '1rem',
                padding: '1.35rem 1.25rem',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '0.85rem',
                background: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon style={{ width: 24, height: 24, color: card.color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{card.title}</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0.1rem 0' }}>{card.value}</div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{card.note}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders & Users Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Orders Widget */}
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Recent Customer Orders</h3>
            <Link to="/admin/orders" style={{ fontSize: '0.84rem', fontWeight: 800, color: '#059669', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View All Orders <ArrowRight size={14} />
            </Link>
          </div>

          {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>
              No recent orders recorded yet.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #f1f5f9', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.65rem' }}>Order ID</th>
                  <th style={{ padding: '0.65rem' }}>Customer</th>
                  <th style={{ padding: '0.65rem' }}>Amount</th>
                  <th style={{ padding: '0.65rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(o => (
                  <tr key={o.orderId} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '0.75rem 0.65rem', fontWeight: 800, color: '#0f172a' }}>{o.orderId}</td>
                    <td style={{ padding: '0.75rem 0.65rem', fontWeight: 600, color: '#334155' }}>{o.customerName}</td>
                    <td style={{ padding: '0.75rem 0.65rem', fontWeight: 800, color: '#059669' }}>₹{Number(o.amount || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.75rem 0.65rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: 99,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: o.status === 'DELIVERED' || o.status === 'SUCCESS' ? '#d1fae5' : o.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                        color: o.status === 'DELIVERED' || o.status === 'SUCCESS' ? '#047857' : o.status === 'CANCELLED' ? '#b91c1c' : '#b45309'
                      }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Registered Users Widget */}
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>New Registered Users</h3>
            <Link to="/admin/users" style={{ fontSize: '0.84rem', fontWeight: 800, color: '#059669', textDecoration: 'none' }}>
              Manage
            </Link>
          </div>

          {(!stats?.recentUsers || stats.recentUsers.length === 0) ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>
              No registered users.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {stats.recentUsers.map(u => (
                <div key={u.userId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#059669', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 99, background: u.role === 'ADMIN' ? '#dbeafe' : '#f1f5f9', color: u.role === 'ADMIN' ? '#1d4ed8' : '#475569' }}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

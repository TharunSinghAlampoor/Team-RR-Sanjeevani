import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Users, ShoppingBag, FolderTree } from 'lucide-react';
import adminService from '../../api/adminService';
import BrandLoader from '../../components/BrandLoader';

export function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(res => {
        if (res && res.success && res.data) setStats(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <BrandLoader message="Loading Business Analytics & Sales Trends..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Business Analytics & Sales Growth</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
          Comprehensive financial trends, order performance metrics, and sales breakdowns.
        </p>
      </div>

      {/* Analytics Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '1.5rem', border: '1.5px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Overall Revenue</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>₹{Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Cumulative lifetime sales</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '1.5rem', border: '1.5px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>Monthly Sales</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>₹{Number(stats?.monthlyRevenue || 0).toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Current month performance</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '1.5rem', border: '1.5px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>Total Processed Orders</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>{stats?.totalOrders || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Orders fulfilled & in-transit</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '1.5rem', border: '1.5px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>Registered Customers</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>{stats?.totalUsers || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Active customer user accounts</div>
        </div>
      </div>

      {/* Visual Analytics Chart simulation */}
      <div style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '2rem', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem' }}>Revenue Distribution & Sales Stages</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', height: 200, alignItems: 'flex-end', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', background: 'linear-gradient(180deg, #10b981, #059669)', borderRadius: '0.5rem 0.5rem 0 0', height: '80%' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>Total Rev</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', background: 'linear-gradient(180deg, #38bdf8, #0284c7)', borderRadius: '0.5rem 0.5rem 0 0', height: '55%' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>Monthly</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', background: 'linear-gradient(180deg, #a78bfa, #7c3aed)', borderRadius: '0.5rem 0.5rem 0 0', height: '40%' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>Yearly</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', background: 'linear-gradient(180deg, #fbbf24, #d97706)', borderRadius: '0.5rem 0.5rem 0 0', height: '25%' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;

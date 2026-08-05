import React from 'react';
import { FileSpreadsheet, Download, FileText, Package, ShoppingBag, Users, DollarSign, Pill } from 'lucide-react';
import adminService from '../../api/adminService';

export function AdminReports() {
  const handleExport = async (type) => {
    try {
      await adminService.exportReport(type);
    } catch (err) {
      alert('Report export failed. Please try again.');
    }
  };

  const reports = [
    { title: 'Sales Report', type: 'sales', desc: 'Complete breakdown of all customer orders, total amounts, dates, and order statuses.', icon: ShoppingBag, color: '#059669', bg: '#ecfdf5' },
    { title: 'Revenue Report', type: 'revenue', desc: 'Financial transaction details, tax totals, and daily revenue streams.', icon: DollarSign, color: '#0284c7', bg: '#f0f9ff' },
    { title: 'Inventory & Stock Report', type: 'inventory', desc: 'Full medicine stock audit containing prices, current stock levels, descriptions, and categories.', icon: Package, color: '#7c3aed', bg: '#f5f3ff' },
    { title: 'Medicine Catalog Report', type: 'medicine', desc: 'Detailed catalog list with generic names, brands, batch numbers, and expiry dates.', icon: Pill, color: '#d97706', bg: '#fffbeb' },
    { title: 'Order History Report', type: 'order', desc: 'Fulfillment times, shipping addresses, delivery statuses, and customer names.', icon: FileText, color: '#2563eb', bg: '#eff6ff' },
    { title: 'Customer Account Report', type: 'customer', desc: 'Registered user profiles, email addresses, phone numbers, role privileges, and account status.', icon: Users, color: '#0891b2', bg: '#ecfeff' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Reports & Export Center</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
          Generate and download instant CSV/Excel spreadsheets for sales, revenue, inventory, medicines, orders, and customer data.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {reports.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.type} style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '1.75rem', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
              <div>
                <div style={{ width: 48, height: 48, borderRadius: '0.85rem', background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon style={{ width: 24, height: 24, color: r.color }} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem 0' }}>{r.title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{r.desc}</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleExport(r.type)}
                  style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '0.75rem', border: 'none', background: r.color, color: '#ffffff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: `0 4px 14px ${r.color}35` }}
                >
                  <Download size={16} />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminReports;

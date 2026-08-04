import React from 'react';
import { FileSpreadsheet, Download, FileText, Package, ShoppingBag, Users } from 'lucide-react';
import adminService from '../../api/adminService';

export function AdminReports() {
  const handleExport = (type) => {
    adminService.exportReport(type);
  };

  const reports = [
    { title: 'Sales & Revenue Report', type: 'sales', desc: 'Complete breakdown of all customer orders, total amounts, dates, and order statuses.', icon: DollarSignIcon, color: '#059669', bg: '#ecfdf5' },
    { title: 'Inventory & Medicine Report', type: 'inventory', desc: 'Full medicine catalog list containing prices, current stock levels, descriptions, and categories.', icon: Package, color: '#0284c7', bg: '#f0f9ff' },
    { title: 'Customer Account Report', type: 'customers', desc: 'Registered user profiles, email addresses, phone numbers, and registration dates.', icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Reports & Data Export Center</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
          Generate downloadable CSV & Excel spreadsheets for sales, inventory, and customer activity.
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

              <button
                onClick={() => handleExport(r.type)}
                style={{ padding: '0.75rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: r.color, color: '#ffffff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: `0 4px 14px ${r.color}35` }}
              >
                <Download size={16} />
                <span>Export CSV Report</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DollarSignIcon(props) {
  return <FileSpreadsheet {...props} />;
}

export default AdminReports;

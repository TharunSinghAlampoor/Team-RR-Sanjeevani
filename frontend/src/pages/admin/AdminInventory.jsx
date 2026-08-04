import React, { useState, useEffect } from 'react';
import { PackageCheck, AlertTriangle, CheckCircle2, RefreshCw, Edit3, Save } from 'lucide-react';
import shopService from '../../api/shopService';
import adminService from '../../api/adminService';
import BrandLoader from '../../components/BrandLoader';
import ToastNotification from '../../components/ToastNotification';

export function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockInput, setStockInput] = useState('');
  const [toast, setToast] = useState(null);

  const loadData = async () => {
    try {
      const res = await shopService.getProducts({});
      const prods = (res && res.success && Array.isArray(res.data)) ? res.data : Array.isArray(res) ? res : [];
      setProducts(prods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalProds = products.length;
  const availableProds = products.filter(p => p.stock > 0).length;
  const lowStockProds = products.filter(p => p.stock > 0 && p.stock < 10);
  const outOfStockProds = products.filter(p => !p.stock || p.stock === 0);

  const handleUpdateStock = async (prod) => {
    const newStock = Number(stockInput);
    if (isNaN(newStock) || newStock < 0) {
      alert('Please enter a valid non-negative stock number.');
      return;
    }

    try {
      await adminService.updateProduct(prod.productId, { stock: newStock });
      setToast({ type: 'success', title: 'Stock Updated', message: `${prod.name} stock set to ${newStock}.` });
      setEditingStockId(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock.');
    }
  };

  if (loading) {
    return <BrandLoader message="Loading Pharmacy Inventory Overview..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Inventory Health & Restock Center</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
          Monitor stock levels, identify out-of-stock shortages, and execute instant stock adjustments.
        </p>
      </div>

      {/* Overview Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.25rem', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PackageCheck style={{ width: 22, height: 22, color: '#059669' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Products</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{totalProds}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.25rem', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 style={{ width: 22, height: 22, color: '#16a34a' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>In-Stock</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a' }}>{availableProds}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.25rem', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle style={{ width: 22, height: 22, color: '#d97706' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Low Stock (&lt;10)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#d97706' }}>{lowStockProds.length}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.25rem', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle style={{ width: 22, height: 22, color: '#dc2626' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Out of Stock</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#dc2626' }}>{outOfStockProds.length}</div>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div style={{ background: '#ffffff', borderRadius: '1.25rem', border: '1.5px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem' }}>Medicine</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Current Stock</th>
              <th style={{ padding: '1rem' }}>Stock Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Quick Adjust</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', fontWeight: 800, color: '#0f172a' }}>{p.name}</td>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>{p.categoryName || 'General Care'}</td>
                <td style={{ padding: '1rem', fontWeight: 900 }}>
                  {editingStockId === p.productId ? (
                    <input
                      type="number"
                      value={stockInput}
                      onChange={(e) => setStockInput(e.target.value)}
                      style={{ width: 80, padding: '0.35rem', borderRadius: '0.4rem', border: '1.5px solid #059669', fontWeight: 800 }}
                    />
                  ) : (
                    <span>{p.stock || 0} units</span>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 800,
                    background: !p.stock || p.stock === 0 ? '#fee2e2' : p.stock < 10 ? '#fef3c7' : '#d1fae5',
                    color: !p.stock || p.stock === 0 ? '#b91c1c' : p.stock < 10 ? '#b45309' : '#047857'
                  }}>
                    {!p.stock || p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? 'Low Stock Warning' : 'Healthy Stock'}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {editingStockId === p.productId ? (
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleUpdateStock(p)} style={{ padding: '0.35rem 0.65rem', borderRadius: '0.4rem', border: 'none', background: '#059669', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                        Save
                      </button>
                      <button onClick={() => setEditingStockId(null)} style={{ padding: '0.35rem 0.65rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingStockId(p.productId); setStockInput(String(p.stock || 0)); }}
                      style={{ padding: '0.45rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', color: '#0284c7', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Edit3 size={14} />
                      <span>Adjust Stock</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default AdminInventory;

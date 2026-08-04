import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill, Plus, Search, Filter, Edit, Trash2, X, Check, AlertCircle,
  Package, ShieldAlert, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';
import shopService from '../../api/shopService';
import adminService from '../../api/adminService';
import BrandLoader from '../../components/BrandLoader';
import ToastNotification from '../../components/ToastNotification';

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    categoryId: '',
    price: '',
    stock: '',
    imageUrl: '',
    prescriptionRequired: false,
  });

  const loadData = async () => {
    try {
      const [prodsRes, catsRes] = await Promise.all([
        shopService.getProducts({}),
        shopService.getCategories(),
      ]);
      const prods = (prodsRes && prodsRes.success && Array.isArray(prodsRes.data)) ? prodsRes.data : Array.isArray(prodsRes) ? prodsRes : [];
      const cats = (catsRes && catsRes.success && Array.isArray(catsRes.data)) ? catsRes.data : Array.isArray(catsRes) ? catsRes : [];

      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const kw = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(kw)) ||
        (p.brand && p.brand.toLowerCase().includes(kw)) ||
        (p.description && p.description.toLowerCase().includes(kw))
      );
    }

    if (selectedCategory !== 'ALL') {
      result = result.filter(p => String(p.categoryId) === String(selectedCategory));
    }

    if (stockFilter === 'LOW') {
      result = result.filter(p => p.stock > 0 && p.stock < 10);
    } else if (stockFilter === 'OUT') {
      result = result.filter(p => !p.stock || p.stock === 0);
    }

    return result;
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      brand: '',
      description: '',
      categoryId: categories.length > 0 ? categories[0].categoryId : '',
      price: '',
      stock: '',
      imageUrl: '',
      prescriptionRequired: false,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      brand: prod.brand || '',
      description: prod.description || '',
      categoryId: prod.categoryId || (categories.length > 0 ? categories[0].categoryId : ''),
      price: prod.price || '',
      stock: prod.stock !== undefined ? prod.stock : '',
      imageUrl: prod.imageUrl || '',
      prescriptionRequired: !!prod.prescriptionRequired,
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Medicine Name is required.');
      return;
    }
    if (Number(formData.price) <= 0) {
      alert('Price must be greater than 0.');
      return;
    }
    if (Number(formData.stock) < 0) {
      alert('Stock cannot be negative.');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        price: Number(formData.price),
        stock: Number(formData.stock),
        imageUrl: formData.imageUrl.trim(),
        prescriptionRequired: formData.prescriptionRequired,
      };

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.productId, payload);
        setToast({ type: 'success', title: 'Medicine Updated', message: `${formData.name} updated successfully.` });
      } else {
        await adminService.createProduct(payload);
        setToast({ type: 'success', title: 'Medicine Added', message: `${formData.name} added to inventory.` });
      }

      setIsAddModalOpen(false);
      setEditingProduct(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save medicine.');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await adminService.deleteProduct(id);
      setToast({ type: 'success', title: 'Medicine Deleted', message: 'Item deleted from inventory.' });
      setDeletingProductId(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete medicine.');
    }
  };

  if (loading) {
    return <BrandLoader message="Loading Medicine Inventory..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Medicine & Product Catalog</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
            Total {filteredProducts.length} medicines listed across categories.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)'
          }}
        >
          <Plus size={18} />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Filters Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by Medicine Name, Brand, or Generic Name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.6rem',
                borderRadius: '0.65rem',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                fontWeight: 600
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            style={{ padding: '0.65rem 1rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '0.65rem 1rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}
          >
            <option value="ALL">All Stock Status</option>
            <option value="LOW">Low Stock (&lt; 10)</option>
            <option value="OUT">Out of Stock (= 0)</option>
          </select>
        </div>
      </div>

      {/* Medicines Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '1.25rem',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        {paginatedProducts.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
            <Package size={48} style={{ margin: '0 auto 1rem auto', color: '#cbd5e1' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>No Medicines Found</h4>
            <p style={{ fontSize: '0.88rem', margin: 0 }}>Try clearing filters or search query.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Medicine</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem' }}>Stock</th>
                <th style={{ padding: '1rem' }}>Rx Req.</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(p => (
                <tr key={p.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=120&q=80'}
                        alt={p.name}
                        style={{ width: 44, height: 44, borderRadius: '0.65rem', objectFit: 'contain', border: '1px solid #e2e8f0', background: '#f8fafc', padding: 2 }}
                      />
                      <div>
                        <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.92rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 800, textTransform: 'uppercase' }}>{p.brand || 'GENERIC'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#334155' }}>
                    {p.categoryName || 'General Care'}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 900, color: '#059669' }}>
                    ₹{Number(p.price || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: 99,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: !p.stock || p.stock === 0 ? '#fee2e2' : p.stock < 10 ? '#fef3c7' : '#d1fae5',
                      color: !p.stock || p.stock === 0 ? '#b91c1c' : p.stock < 10 ? '#b45309' : '#047857'
                    }}>
                      {!p.stock || p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: p.prescriptionRequired ? '#7c3aed' : '#64748b',
                      background: p.prescriptionRequired ? '#f5f3ff' : '#f1f5f9',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 6
                    }}>
                      {p.prescriptionRequired ? 'Yes (Rx)' : 'No'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        style={{ padding: '0.45rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0284c7', cursor: 'pointer' }}
                        title="Edit Medicine"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingProductId(p.productId)}
                        style={{ padding: '0.45rem', borderRadius: '0.5rem', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}
                        title="Delete Medicine"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', alignSelf: 'center' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Medicine Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: '100%', maxWidth: 560, background: '#ffffff',
              borderRadius: '1.25rem', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              maxHeight: '90vh', overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                {editingProduct ? 'Edit Medicine Details' : 'Add New Medicine'}
              </h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Medicine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dolo 650 Tablet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Brand / Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Micro Labs"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 700 }}
                  >
                    {categories.map(c => (
                      <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="199.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://ik.imagekit.io/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter medical usage details, formulation, and warnings..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600, fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                  style={{ padding: '0.75rem 1.25rem', borderRadius: '0.65rem', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '0.65rem', border: 'none', background: '#059669', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            maxWidth: 420, width: '100%', background: '#ffffff', borderRadius: '1.25rem', padding: '2rem', textAlign: 'center'
          }}>
            <ShieldAlert size={48} style={{ color: '#dc2626', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Delete Medicine?</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1.5rem 0' }}>
              Are you sure you want to permanently delete this medicine from the inventory catalog?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setDeletingProductId(null)}
                style={{ padding: '0.65rem 1.25rem', borderRadius: '0.65rem', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deletingProductId)}
                style={{ padding: '0.65rem 1.25rem', borderRadius: '0.65rem', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default AdminProducts;

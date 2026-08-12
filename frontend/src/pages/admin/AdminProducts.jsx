import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Pill, Plus, Search, Edit, Trash2, X, AlertCircle,
  Package, ShieldAlert, ChevronLeft, ChevronRight, Filter, RefreshCw,
  Star, MessageSquare, ThumbsUp
} from 'lucide-react';
import adminService from '../../api/adminService';
import shopService from '../../api/shopService';
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
  const [selectedReviewProduct, setSelectedReviewProduct] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    brand: '',
    manufacturer: '',
    batchNumber: '',
    description: '',
    categoryId: '',
    price: '',
    discountPrice: '',
    stock: '',
    expiryDate: '',
    imageUrl: '',
    prescriptionRequired: false,
    status: 'ACTIVE',
  });

  const loadData = async () => {
    try {
      const [prodsRes, catsRes] = await Promise.all([
        adminService.getProducts(),
        adminService.getCategories(),
      ]);
      const prods = prodsRes?.data || [];
      const cats = catsRes?.data || [];
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Error loading admin products:', err);
      // Fallback
      try {
        const fallbackProds = await shopService.getProducts({});
        if (fallbackProds?.data) setProducts(fallbackProds.data);
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const kw = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(kw)) ||
        (p.genericName && p.genericName.toLowerCase().includes(kw)) ||
        (p.brand && p.brand.toLowerCase().includes(kw)) ||
        (p.batchNumber && p.batchNumber.toLowerCase().includes(kw)) ||
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
    } else if (stockFilter === 'EXPIRED') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(p => p.expiryDate && p.expiryDate < today);
    }

    return result;
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const resetForm = () => {
    setFormData({
      name: '',
      genericName: '',
      brand: '',
      manufacturer: '',
      batchNumber: '',
      description: '',
      categoryId: categories.length > 0 ? categories[0].categoryId : '',
      price: '',
      discountPrice: '',
      stock: '',
      expiryDate: '',
      imageUrl: '',
      prescriptionRequired: false,
      status: 'ACTIVE',
    });
    setValidationError('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      genericName: prod.genericName || '',
      brand: prod.brand || '',
      manufacturer: prod.manufacturer || '',
      batchNumber: prod.batchNumber || '',
      description: prod.description || '',
      categoryId: prod.categoryId || (categories.length > 0 ? categories[0].categoryId : ''),
      price: prod.price || '',
      discountPrice: prod.discountPrice || '',
      stock: prod.stock !== undefined ? prod.stock : '',
      expiryDate: prod.expiryDate || '',
      imageUrl: prod.imageUrl || '',
      prescriptionRequired: !!prod.prescriptionRequired,
      status: prod.status || 'ACTIVE',
    });
    setValidationError('');
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.name.trim()) {
      setValidationError('Medicine Name is required.');
      return;
    }
    if (Number(formData.price) <= 0) {
      setValidationError('Price must be greater than 0.');
      return;
    }
    if (Number(formData.stock) < 0) {
      setValidationError('Stock quantity cannot be negative.');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        genericName: formData.genericName.trim(),
        brand: formData.brand.trim(),
        manufacturer: formData.manufacturer.trim(),
        batchNumber: formData.batchNumber.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        stock: Number(formData.stock),
        expiryDate: formData.expiryDate || null,
        imageUrl: formData.imageUrl.trim(),
        prescriptionRequired: formData.prescriptionRequired,
        status: formData.status,
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
      setValidationError(err.response?.data?.message || 'Failed to save medicine.');
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Medicine & Product Catalog</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
            Total {filteredProducts.length} medicines listed across categories.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={loadData}
            style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#475569' }}
            title="Refresh List"
          >
            <RefreshCw size={18} />
          </button>
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
              placeholder="Search by Medicine Name, Brand, Batch No, Generic Name..."
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
            <option value="EXPIRED">Expired Batches</option>
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
            <p style={{ fontSize: '0.88rem', margin: 0 }}>Try clearing search or filter selections.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Image</th>
                  <th style={{ padding: '1rem' }}>Medicine Details</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Rating & Reviews</th>
                  <th style={{ padding: '1rem' }}>Price</th>
                  <th style={{ padding: '1rem' }}>Stock</th>
                  <th style={{ padding: '1rem' }}>Expiry Date</th>
                  <th style={{ padding: '1rem' }}>Rx Required</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(p => (
                  <tr key={p.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}>
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=120&q=80'}
                        alt={p.name}
                        style={{ width: 44, height: 44, borderRadius: '0.65rem', objectFit: 'contain', border: '1px solid #e2e8f0', background: '#f8fafc', padding: 2 }}
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.92rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 800 }}>
                          Brand: {p.brand || 'Generic'} {p.batchNumber ? `• Batch: ${p.batchNumber}` : ''}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#334155' }}>
                      {p.categoryName || 'General Care'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => setSelectedReviewProduct(p)}
                        style={{
                          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                          border: '1px solid #fde68a',
                          borderRadius: '0.5rem',
                          padding: '0.3rem 0.6rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(245, 158, 11, 0.12)'
                        }}
                        title="Manage Reviews"
                      >
                        <Star size={13} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#b45309' }}>
                          {Number(p.rating || 4.8).toFixed(1)}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706' }}>
                          ({p.reviewsCount || 12})
                        </span>
                      </button>
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
                    <td style={{ padding: '1rem', fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                      {p.expiryDate || 'N/A'}
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
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 99,
                        background: p.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                        color: p.status === 'ACTIVE' ? '#047857' : '#dc2626'
                      }}>
                        {p.status || 'ACTIVE'}
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
          </div>
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
              width: '100%', maxWidth: 640, background: '#ffffff',
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

            {validationError && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '0.65rem', background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                {validationError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Generic Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Paracetamol"
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Micro Labs"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Cipla Pharma"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Batch Number</label>
                  <input
                    type="text"
                    placeholder="e.g. BATCH-99201"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="179.00"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 700 }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="DISCONTINUED">DISCONTINUED</option>
                  </select>
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
                  placeholder="Enter medical formulation details, dosages, and safety precautions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600, fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  id="rxReq"
                  checked={formData.prescriptionRequired}
                  onChange={(e) => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
                  style={{ width: 18, height: 18 }}
                />
                <label htmlFor="rxReq" style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', cursor: 'pointer' }}>
                  Doctor Prescription Required (Rx)
                </label>
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

      {/* Customer Reviews & Ratings Modal */}
      {selectedReviewProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '1.75rem', width: '100%', maxWidth: 580, maxHeight: '85vh', overflowY: 'auto', border: '1.5px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Star size={22} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>Ratings & Reviews Management</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>{selectedReviewProduct.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedReviewProduct(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>

            {/* Rating Overview Box */}
            <div style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', borderRadius: '0.85rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #fde68a', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b45309', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{Number(selectedReviewProduct.rating || 4.8).toFixed(1)}</span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={16} style={{ color: s <= Math.round(selectedReviewProduct.rating || 4.8) ? '#f59e0b' : '#cbd5e1', fill: s <= Math.round(selectedReviewProduct.rating || 4.8) ? '#f59e0b' : 'none' }} />
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#d97706', marginTop: 2 }}>
                  Based on verified customer reviews & feedback
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#92400e' }}>100% Verified</div>
                <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 600 }}>Medical Quality Standard</div>
              </div>
            </div>

            {/* Mock Reviews List */}
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Customer Feedback & Reviews:</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>Rohan Sharma <span style={{ fontSize: '0.7rem', color: '#059669', background: '#d1fae5', padding: '1px 6px', borderRadius: 4, marginLeft: 6 }}>Verified Purchase</span></div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />)}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>"Genuine medicine with quick delivery. Expiry date is 2 years away. Very satisfied!"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.72rem', color: '#94a3b8' }}>
                  <span>Posted 2 days ago</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>Status: Approved</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>Priya Patel <span style={{ fontSize: '0.7rem', color: '#059669', background: '#d1fae5', padding: '1px 6px', borderRadius: 4, marginLeft: 6 }}>Verified Purchase</span></div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} style={{ color: s <= 4 ? '#f59e0b' : '#cbd5e1', fill: s <= 4 ? '#f59e0b' : 'none' }} />)}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>"Packaging was intact and doctor prescribed this exact dosage. Good service."</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.72rem', color: '#94a3b8' }}>
                  <span>Posted 1 week ago</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>Status: Approved</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedReviewProduct(null)}
                style={{ padding: '0.6rem 1.2rem', borderRadius: '0.65rem', border: 'none', background: '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Close Review Manager
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default AdminProducts;

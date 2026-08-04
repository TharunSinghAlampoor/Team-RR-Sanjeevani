import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderTree, Plus, Edit, Trash2, X, AlertTriangle, Package, ShieldCheck } from 'lucide-react';
import shopService from '../../api/shopService';
import adminService from '../../api/adminService';
import BrandLoader from '../../components/BrandLoader';
import ToastNotification from '../../components/ToastNotification';

export function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [toast, setToast] = useState(null);

  const loadCategories = async () => {
    try {
      const res = await shopService.getCategories();
      if (res && res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setCategoryName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setCategoryName(cat.categoryName || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      if (editingCat) {
        await adminService.updateCategory(editingCat.categoryId, categoryName.trim());
        setToast({ type: 'success', title: 'Category Updated', message: `Category renamed to ${categoryName}.` });
      } else {
        await adminService.createCategory(categoryName.trim());
        setToast({ type: 'success', title: 'Category Added', message: `New category ${categoryName} created.` });
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category.');
    }
  };

  const handleDelete = async (cat) => {
    if (cat.productCount > 0) {
      alert(`Cannot delete category "${cat.categoryName}" because it contains ${cat.productCount} medicines. Remove or reassign medicines first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete category "${cat.categoryName}"?`)) return;

    try {
      await adminService.deleteCategory(cat.categoryId);
      setToast({ type: 'success', title: 'Category Deleted', message: 'Category removed.' });
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  if (loading) {
    return <BrandLoader message="Loading Category Management..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Category Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
            Organize products into structured medical categories.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '0.75rem',
            background: '#059669',
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
          <span>Add New Category</span>
        </button>
      </div>

      {/* Category Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem'
      }}>
        {categories.map((cat, i) => (
          <motion.div
            key={cat.categoryId || i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: '#ffffff',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '1rem',
                background: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FolderTree style={{ width: 26, height: 26, color: '#059669' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  {cat.categoryName}
                </h3>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#059669',
                  background: '#f0fdf4',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 99,
                  border: '1px solid #bbf7d0'
                }}>
                  {cat.productCount || 0} Medicines Listed
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => handleOpenEdit(cat)}
                style={{ padding: '0.5rem 0.85rem', borderRadius: '0.6rem', border: '1px solid #cbd5e1', background: '#fff', color: '#0284c7', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(cat)}
                style={{ padding: '0.5rem 0.85rem', borderRadius: '0.6rem', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            width: '100%', maxWidth: 440, background: '#ffffff', borderRadius: '1.25rem', padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                {editingCat ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surgical & Clinical Supplies"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.65rem 1.1rem', borderRadius: '0.65rem', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '0.65rem', border: 'none', background: '#059669', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default AdminCategories;

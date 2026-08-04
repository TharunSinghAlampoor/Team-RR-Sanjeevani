import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, UserCheck, Trash2, CheckCircle, AlertTriangle, UserX } from 'lucide-react';
import adminService from '../../api/adminService';
import BrandLoader from '../../components/BrandLoader';
import ToastNotification from '../../components/ToastNotification';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  const loadUsers = async () => {
    try {
      const res = await adminService.getUsers();
      if (res && res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const kw = searchQuery.toLowerCase().trim();
    const matchesKw = !kw || (u.fullName && u.fullName.toLowerCase().includes(kw)) || (u.email && u.email.toLowerCase().includes(kw));
    const matchesRole = roleFilter === 'ALL' || String(u.role).toUpperCase() === roleFilter;
    return matchesKw && matchesRole;
  });

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setToast({ type: 'success', title: 'Role Updated', message: `User role changed to ${newRole}.` });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      await adminService.deleteUser(userId);
      setToast({ type: 'success', title: 'User Deleted', message: 'User account permanently removed.' });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  if (loading) {
    return <BrandLoader message="Loading Registered User Accounts..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>User & Access Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
            Manage registered customer accounts, grant administrator privileges, and control access.
          </p>
        </div>
      </div>

      <div style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1rem 1.25rem',
        border: '1.5px solid #e2e8f0',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'space-between'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by User Name or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.6rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 600 }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '0.65rem 1rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">ADMIN Only</option>
          <option value="CUSTOMER">CUSTOMER Only</option>
        </select>
      </div>

      <div style={{
        background: '#ffffff',
        borderRadius: '1.25rem',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem' }}>User ID</th>
              <th style={{ padding: '1rem' }}>Name & Email</th>
              <th style={{ padding: '1rem' }}>Phone</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.userId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', fontWeight: 900, color: '#0f172a' }}>#{u.userId}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{u.fullName || 'User'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                </td>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#334155' }}>
                  {u.phoneNumber || 'N/A'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.userId, e.target.value)}
                    style={{ padding: '0.35rem 0.65rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 800, color: u.role === 'ADMIN' ? '#1d4ed8' : '#334155' }}
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 800, background: '#d1fae5', color: '#047857' }}>
                    Active
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDeleteUser(u.userId)}
                    style={{ padding: '0.45rem', borderRadius: '0.5rem', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}
                    title="Delete User"
                  >
                    <Trash2 size={16} />
                  </button>
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

export default AdminUsers;

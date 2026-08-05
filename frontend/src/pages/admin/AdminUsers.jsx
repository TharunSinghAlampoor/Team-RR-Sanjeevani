import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, UserCheck, Trash2, CheckCircle, AlertTriangle, UserX, Lock, Key, X } from 'lucide-react';
import adminService from '../../api/adminService';
import BrandLoader from '../../components/BrandLoader';
import ToastNotification from '../../components/ToastNotification';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  // Password Reset Modal State
  const [pwdModalUser, setPwdModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

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

  const handleStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'DEACTIVATED' ? 'ACTIVE' : 'DEACTIVATED';
    try {
      await adminService.updateUserStatus(userId, nextStatus);
      setToast({ type: 'success', title: 'Status Updated', message: `User account set to ${nextStatus}.` });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    try {
      await adminService.resetUserPassword(pwdModalUser.userId, newPassword);
      setToast({ type: 'success', title: 'Password Reset', message: `Password for ${pwdModalUser.email} has been updated.` });
      setPwdModalUser(null);
      setNewPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password.');
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>User Directory & Access Control</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
            Manage customer accounts, grant administrator privileges, reset credentials, and control access statuses.
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
              <th style={{ padding: '1rem' }}>Account Status</th>
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
                  <button
                    onClick={() => handleStatusToggle(u.userId, u.status)}
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: 99,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      background: u.status === 'DEACTIVATED' ? '#fee2e2' : '#d1fae5',
                      color: u.status === 'DEACTIVATED' ? '#b91c1c' : '#047857'
                    }}
                    title="Click to toggle status"
                  >
                    {u.status || 'ACTIVE'}
                  </button>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setPwdModalUser(u)}
                      style={{ padding: '0.45rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0284c7', cursor: 'pointer' }}
                      title="Reset User Password"
                    >
                      <Key size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.userId)}
                      style={{ padding: '0.45rem', borderRadius: '0.5rem', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}
                      title="Delete User Account"
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

      {/* Password Reset Modal */}
      {pwdModalUser && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            maxWidth: 440, width: '100%', background: '#ffffff', borderRadius: '1.25rem', padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Reset User Password</h3>
              <button onClick={() => setPwdModalUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Set new password for <strong style={{ color: '#0f172a' }}>{pwdModalUser.email}</strong>:
            </p>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPwdModalUser(null)}
                  style={{ padding: '0.65rem 1.1rem', borderRadius: '0.65rem', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '0.65rem', border: 'none', background: '#059669', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  Update Password
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

export default AdminUsers;

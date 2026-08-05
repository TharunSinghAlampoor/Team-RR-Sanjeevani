import React, { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Lock, Server, Save, Activity, Clock, RefreshCw } from 'lucide-react';
import adminService from '../../api/adminService';
import ToastNotification from '../../components/ToastNotification';

export function AdminSettings() {
  const [storeName, setStoreName] = useState('Sanjeevani Medical Store');
  const [supportEmail, setSupportEmail] = useState('admin@sanjeevani.com');
  const [supportPhone, setSupportPhone] = useState('+917702173084');
  const [enableRxVerify, setEnableRxVerify] = useState(true);
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await adminService.getAuditLogs();
      if (res?.data) setAuditLogs(res.data);
    } catch (e) {
      console.error('Audit log fetch error:', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setToast({ type: 'success', title: 'Settings Saved', message: 'Admin system preferences updated successfully.' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 900 }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>System Settings & Audit Log</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
          Manage store settings, healthcare compliance rules, and review administrator activity audit logs.
        </p>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '2rem', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={18} style={{ color: '#059669' }} />
              <span>General Store Properties</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Store Title</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #cbd5e1', fontWeight: 600 }}
                />
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0.5rem 0' }} />

          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} style={{ color: '#0284c7' }} />
              <span>Healthcare Compliance & Controls</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={enableRxVerify}
                  onChange={(e) => setEnableRxVerify(e.target.checked)}
                />
                Enforce Prescription (Rx) Upload Requirement for Schedule-H Medicines
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={enableEmailAlerts}
                  onChange={(e) => setEnableEmailAlerts(e.target.checked)}
                />
                Send Automated Admin Email Notifications on Low Inventory Alerts
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="submit"
              style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: '#059669', color: '#ffffff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)' }}
            >
              <Save size={18} />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Admin Audit Logs Table */}
      <div style={{ background: '#ffffff', borderRadius: '1.25rem', padding: '1.5rem', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} style={{ color: '#7c3aed' }} />
            <span>Administrator Audit Logs</span>
          </h3>
          <button onClick={fetchLogs} style={{ padding: '0.35rem 0.65rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
            <RefreshCw size={14} />
          </button>
        </div>

        {auditLogs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
            No admin actions recorded in audit log yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.65rem' }}>Timestamp</th>
                  <th style={{ padding: '0.65rem' }}>Admin Email</th>
                  <th style={{ padding: '0.65rem' }}>Action</th>
                  <th style={{ padding: '0.65rem' }}>Module</th>
                  <th style={{ padding: '0.65rem' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.65rem', fontWeight: 700, color: '#0f172a' }}>{log.adminEmail}</td>
                    <td style={{ padding: '0.65rem', fontWeight: 800, color: '#059669' }}>{log.action}</td>
                    <td style={{ padding: '0.65rem' }}>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: 99, background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 800 }}>
                        {log.module}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem', color: '#334155' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default AdminSettings;

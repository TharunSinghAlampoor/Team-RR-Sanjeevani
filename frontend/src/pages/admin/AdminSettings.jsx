import React, { useState } from 'react';
import { Settings, Shield, Bell, Lock, Server, Save, Activity } from 'lucide-react';
import ToastNotification from '../../components/ToastNotification';

export function AdminSettings() {
  const [storeName, setStoreName] = useState('Sanjeevani Medical Store');
  const [supportEmail, setSupportEmail] = useState('admin@sanjeevani.com');
  const [supportPhone, setSupportPhone] = useState('+917702173084');
  const [enableRxVerify, setEnableRxVerify] = useState(true);
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);
  const [toast, setToast] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setToast({ type: 'success', title: 'Settings Saved', message: 'Admin system preferences updated successfully.' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 800 }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>System Settings & Security Configuration</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
          Manage global store properties, security thresholds, and admin notification rules.
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
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default AdminSettings;

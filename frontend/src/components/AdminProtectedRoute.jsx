import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import BrandLoader from './BrandLoader';

export const AdminProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <BrandLoader fullScreen message="Verifying Administrator Access..." />;
  }

  // Ensure user is logged in AND has ADMIN role
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  const role = user.role ? String(user.role).toUpperCase() : '';
  if (role !== 'ADMIN') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#f8fafc',
        padding: '2rem',
        fontFamily: "'Outfit', system-ui, sans-serif"
      }}>
        <div style={{
          maxWidth: 480,
          width: '100%',
          background: 'rgba(30, 41, 59, 0.75)',
          border: '1.5px solid #ef4444',
          borderRadius: '1.25rem',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 40px rgba(239, 68, 68, 0.15)',
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <ShieldAlert style={{ width: 32, height: 32, color: '#ef4444' }} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
            Access Denied
          </h2>
          <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Administrator privileges are required to access this portal.
          </p>

          <div style={{
            padding: '0.85rem',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '0.75rem',
            fontSize: '0.82rem',
            color: '#94a3b8',
            marginBottom: '1.75rem',
            border: '1px solid #334155'
          }}>
            Logged in as: <strong style={{ color: '#cbd5e1' }}>{user.fullName || user.email}</strong> ({user.role || 'CUSTOMER'})
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                background: '#334155',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                textDecoration: 'none'
              }}
            >
              <ArrowLeft size={16} />
              Return to Store
            </Link>

            <Link
              to="/admin/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                background: '#059669',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}
            >
              <Lock size={16} />
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminProtectedRoute;

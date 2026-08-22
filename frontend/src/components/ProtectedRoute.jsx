import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLoader from './BrandLoader';

export const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <BrandLoader fullScreen message="Verifying your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = (user && user.role)
    ? String(user.role).toUpperCase()
    : String(sessionStorage.getItem('user_role') || localStorage.getItem('user_role') || '').toUpperCase();

  if (role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

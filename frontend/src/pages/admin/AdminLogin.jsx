import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Activity, Pill, Stethoscope, BarChart3, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../api/authService';
import ToastNotification from '../../components/ToastNotification';
import './AdminLogin.css';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState(null);

  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated as ADMIN, redirect to /admin/dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both Admin Email and Password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await authService.login(email.trim(), password);
      if (response && response.success && response.data) {
        const { token, user: userProfile } = response.data;

        if (userProfile.role !== 'ADMIN') {
          setErrorMsg('Access Denied. Administrator privileges are required.');
          setIsSubmitting(false);
          return;
        }

        login(userProfile, token);
        setToast({ type: 'success', title: 'Admin Login Successful', message: `Welcome back, ${userProfile.fullName}!` });
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        setErrorMsg(response?.message || 'Invalid Admin credentials.');
      }
    } catch (err) {
      console.error('Admin Login Error:', err);
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-bg-glow admin-bg-glow-1" />
      <div className="admin-bg-glow admin-bg-glow-2" />

      <div className="admin-login-grid">
        {/* Left Section - Hero Visuals */}
        <div className="admin-login-hero">
          <div className="admin-hero-brand">
            <img src="/sanjeevani_symbol.png" alt="Sanjeevani" className="admin-hero-logo" />
            <img src="/sanjeevani_text_transparent.png" alt="Sanjeevani" style={{ height: 42, filter: 'brightness(0) invert(1)' }} />
          </div>

          <div className="admin-hero-body">
            <div className="admin-hero-badge">
              <ShieldCheck size={16} />
              <span>Sanjeevani Admin Portal</span>
            </div>

            <h1 className="admin-hero-title">
              Welcome Back,<br />Administrator.
            </h1>

            <p className="admin-hero-subtitle">
              Manage medicines, users, orders, inventory, and business analytics from one secure healthcare management dashboard.
            </p>

            <div className="admin-visual-box">
              <div className="admin-visual-card">
                <Pill />
                <span>Medicines</span>
              </div>
              <div className="admin-visual-card">
                <Stethoscope />
                <span>Healthcare</span>
              </div>
              <div className="admin-visual-card">
                <BarChart3 />
                <span>Analytics</span>
              </div>
            </div>

            <div className="ecg-line-wrap">
              <Activity style={{ width: 44, height: 44, color: '#38bdf8' }} />
              <div style={{ height: 2, flex: 1, background: 'linear-gradient(90deg, #38bdf8, transparent)', marginLeft: 12 }} />
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
            © {new Date().getFullYear()} Sanjeevani Medical E-Commerce System • Secure Admin Gateway
          </div>
        </div>

        {/* Right Section - Login Card */}
        <div className="admin-login-form-panel">
          <motion.div
            className="admin-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="admin-card-header">
              <img src="/sanjeevani_text_transparent.png" alt="Sanjeevani Admin" className="admin-card-logo" />
              <h2 className="admin-card-title">Admin Sign In</h2>
              <p className="admin-card-sub">Enter your administrator credentials to proceed</p>
            </div>

            {errorMsg && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1.25rem'
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="admin-input-group">
                <label className="admin-input-label">Admin Email</label>
                <div className="admin-input-field-wrap">
                  <Mail className="admin-input-icon" />
                  <input
                    type="email"
                    className="admin-input"
                    placeholder="admin@sanjeevani.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label className="admin-input-label">Password</label>
                <div className="admin-input-field-wrap">
                  <Lock className="admin-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="admin-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="admin-toggle-pwd"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="admin-form-options">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember Me
                </label>
                <Link to="/forgot-password" className="admin-forgot-link">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="admin-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Authenticating Admin...' : (
                  <>
                    <span>Secure Admin Login</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default AdminLogin;

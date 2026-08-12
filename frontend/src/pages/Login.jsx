import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, 
  Sparkles, CheckCircle2, AlertCircle, LogIn, ChevronRight
} from 'lucide-react';
import authService from '../api/authService';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';

export const Login = () => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  });

  const [countryCode, setCountryCode] = useState('+91');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isSuccess) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, isSuccess]);

  const validateField = (name, value) => {
    if (name === 'email' && loginMethod === 'email') {
      if (!value) return 'Email address is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
    }
    if (name === 'phone' && loginMethod === 'phone') {
      if (!value) return 'Phone number is required';
      if (!/^\d{6,14}$/.test(value)) {
        return 'Phone number must contain between 6 and 14 digits';
      }
    }
    if (name === 'password') {
      if (!value) return 'Password is required';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const activeField = loginMethod === 'email' ? 'email' : 'phone';

    const newErrors = {};
    [activeField, 'password'].forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      let rawPhone = formData.phone.trim();
      if (rawPhone.startsWith('+91')) {
        rawPhone = rawPhone.substring(3);
      } else if (rawPhone.startsWith('91') && rawPhone.length > 10) {
        rawPhone = rawPhone.substring(2);
      } else if (rawPhone.startsWith('0')) {
        rawPhone = rawPhone.substring(1);
      }

      const identifier = loginMethod === 'email'
        ? formData.email.trim()
        : `${countryCode}${rawPhone}`;

      const response = await authService.login(identifier, formData.password);

      if (response && response.success && response.data) {
        const { token, user } = response.data;
        login(user, token);
        // Instant background pre-warming of catalog data for sub-1ms page transitions
        shopService.prefetchCatalog();
        navigate('/dashboard', { state: { loginSuccess: true, userName: user?.fullName } });
      } else {
        setApiError(response?.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setApiError(err.response.data.message || 'Login failed. Please check your credentials.');
      } else {
        setApiError('Network error. Please check backend connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 20% 20%, #f0fdf4 0%, #e0f2fe 50%, #f8fafc 100%)',
      padding: '1.5rem 1rem', position: 'relative', fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* Top Floating Language Switcher */}
      <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 100 }}>
        <LanguageSelector />
      </div>

      {/* Main Glassmorphic Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%', maxWidth: 440,
          background: '#ffffff',
          borderRadius: '24px',
          padding: '2.25rem 2rem 1.75rem',
          boxShadow: '0 20px 50px rgba(13, 92, 117, 0.12), 0 4px 16px rgba(0,0,0,0.04)',
          border: '1.5px solid #cbd5e1',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top Accent Gradient Bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '5px',
          background: 'linear-gradient(90deg, #0D5C75 0%, #059669 50%, #10b981 100%)'
        }} />

        {/* Brand Header */}
        <div style={{ textAlignment: 'center', textAlign: 'center', marginBottom: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <img src="/sanjeevani_symbol.png" alt="Sanjeevani" style={{ height: 42, width: 'auto' }} />
            <img src="/sanjeevani_text_transparent.png" alt="Sanjeevani" style={{ height: 38, width: 'auto' }} />
          </div>
          
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0',
            padding: '0.2rem 0.65rem', borderRadius: '99px', fontSize: '0.74rem', fontWeight: 800
          }}>
            <ShieldCheck style={{ width: 13, height: 13 }} />
            24/7 Verified Healthcare Portal
          </span>

          <h1 style={{ margin: '0.75rem 0 0.2rem', fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Sign In to Account
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
            Access verified medicines, healthcare items & live tracking
          </p>
        </div>

        {/* Error Alert */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fef2f2', border: '1.5px solid #fecdd3', color: '#e11d48',
              padding: '0.75rem 0.95rem', borderRadius: '12px', fontSize: '0.84rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.1rem'
            }}
          >
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{apiError}</span>
          </motion.div>
        )}

        {/* Segmented Method Tabs (Email / Phone) */}
        <div style={{
          background: '#f1f5f9', padding: '4px', borderRadius: '14px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '1.35rem'
        }}>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('email');
              setErrors({});
              setApiError('');
            }}
            style={{
              padding: '0.55rem 0.75rem', borderRadius: '10px', border: 'none',
              background: loginMethod === 'email' ? '#ffffff' : 'transparent',
              color: loginMethod === 'email' ? '#0D5C75' : '#64748b',
              fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer',
              boxShadow: loginMethod === 'email' ? '0 3px 10px rgba(0,0,0,0.06)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Mail style={{ width: 15, height: 15 }} />
            <span>Email Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMethod('phone');
              setErrors({});
              setApiError('');
            }}
            style={{
              padding: '0.55rem 0.75rem', borderRadius: '10px', border: 'none',
              background: loginMethod === 'phone' ? '#ffffff' : 'transparent',
              color: loginMethod === 'phone' ? '#0D5C75' : '#64748b',
              fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer',
              boxShadow: loginMethod === 'phone' ? '0 3px 10px rgba(0,0,0,0.06)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Phone style={{ width: 15, height: 15 }} />
            <span>Phone Login</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {loginMethod === 'email' ? (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail style={{ position: 'absolute', left: '14px', width: 18, height: 18, color: '#059669', pointerEvents: 'none' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  style={{
                    width: '100%', padding: '0.75rem 0.9rem 0.75rem 42px', borderRadius: '12px',
                    border: errors.email ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', outline: 'none',
                    background: '#f8fafc', transition: 'all 0.2s ease'
                  }}
                />
              </div>
              {errors.email && <span style={{ fontSize: '0.76rem', color: '#ef4444', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Phone Number
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  style={{
                    width: '80px', padding: '0.75rem 0.5rem', borderRadius: '12px',
                    border: '1.5px solid #cbd5e1', background: '#f8fafc', fontSize: '0.88rem',
                    fontWeight: 800, color: '#0f172a', outline: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>
                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Phone style={{ position: 'absolute', left: '14px', width: 18, height: 18, color: '#059669', pointerEvents: 'none' }} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    style={{
                      width: '100%', padding: '0.75rem 0.9rem 0.75rem 42px', borderRadius: '12px',
                      border: errors.phone ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                      fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', outline: 'none',
                      background: '#f8fafc', transition: 'all 0.2s ease'
                    }}
                  />
                </div>
              </div>
              {errors.phone && <span style={{ fontSize: '0.76rem', color: '#ef4444', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>{errors.phone}</span>}
            </div>
          )}

          {/* Password Field */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: '#0D5C75', fontWeight: 800, textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock style={{ position: 'absolute', left: '14px', width: 18, height: 18, color: '#059669', pointerEvents: 'none' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '0.75rem 42px 0.75rem 42px', borderRadius: '12px',
                  border: errors.password ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                  fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', outline: 'none',
                  background: '#f8fafc', transition: 'all 0.2s ease'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', background: 'none', border: 'none',
                  color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
              </button>
            </div>
            {errors.password && <span style={{ fontSize: '0.76rem', color: '#ef4444', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>{errors.password}</span>}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            style={{
              marginTop: '0.35rem', width: '100%', padding: '0.85rem 1rem', borderRadius: '12px',
              border: 'none', background: 'linear-gradient(135deg, #0D5C75 0%, #059669 100%)',
              color: '#ffffff', fontWeight: 900, fontSize: '0.95rem', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: '0 4px 16px rgba(13, 92, 117, 0.3)', transition: 'all 0.2s ease'
            }}
          >
            {isSubmitting ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Log In to Sanjeevani</span>
                <ArrowRight style={{ width: 18, height: 18 }} />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Navigation */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.86rem', color: '#475569', fontWeight: 600 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#059669', fontWeight: 900, textDecoration: 'none' }}>
              Create Account ➔
            </Link>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>Are you an Administrator?</span>
            <Link to="/admin/login" style={{ color: '#0D5C75', fontWeight: 800, textDecoration: 'none' }}>
              Admin Portal
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

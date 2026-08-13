import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, 
  ArrowRight, CheckCircle2, AlertCircle, Sparkles, X, FileText
} from 'lucide-react';
import authService from '../api/authService';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';

export const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'CUSTOMER',
    password: '',
    confirmPassword: '',
    agree: false,
  });

  const [countryCode, setCountryCode] = useState('+91');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'terms' | 'privacy' | null

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Calculate password strength
  useEffect(() => {
    const pwd = formData.password;
    if (!pwd) {
      setPasswordStrength(0);
      return;
    }
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/\d/.test(pwd)) strength += 1;
    if (/[!@#$%^&*]/.test(pwd)) strength += 1;

    setPasswordStrength(strength);
  }, [formData.password]);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'fullName':
        if (!value) error = 'Full Name is required';
        else if (value.trim().length < 2 || value.trim().length > 100) {
          error = 'Full Name must be between 2 and 100 characters';
        }
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (value && !/^\d{6,14}$/.test(value)) {
          error = 'Phone Number must contain between 6 and 14 digits';
        }
        break;
      case 'role':
        if (!value) error = 'Role is required';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) {
          error = 'Password must be at least 8 characters long';
        }
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password';
        else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      case 'agree':
        if (!value) error = 'You must agree to the terms and conditions';
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    const error = validateField(name, fieldValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
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
      const fullPhoneNumber = formData.phone ? `${countryCode}${formData.phone}` : null;
      const response = await authService.register(
        formData.fullName,
        formData.email,
        fullPhoneNumber,
        formData.password,
        formData.confirmPassword,
        formData.role
      );

      if (response && response.data && response.data.token && response.data.user) {
        const { token, user } = response.data;
        login(user, token);
        setApiSuccess(response.message || 'Registration successful! Auto-logging you in...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setApiSuccess(response.message || 'Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: 'CUSTOMER',
        password: '',
        confirmPassword: '',
        agree: false,
      });
    } catch (err) {
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.data && typeof errorData.data === 'object') {
          setErrors(errorData.data);
          setApiError('Validation failed. Please correct the highlighted fields.');
        } else {
          setApiError(errorData.message || 'Registration failed');
        }
      } else if (err.message) {
        setApiError(err.message);
      } else {
        setApiError('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return { label: 'Weak Password', color: '#ef4444' };
    if (passwordStrength <= 4) return { label: 'Good Password', color: '#f59e0b' };
    return { label: 'Strong Password', color: '#10b981' };
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 80% 20%, #f0fdf4 0%, #e0f2fe 50%, #f8fafc 100%)',
      padding: '2rem 1rem', position: 'relative', fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* Language Switcher */}
      <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 100 }}>
        <LanguageSelector />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%', maxWidth: 580,
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
          background: 'linear-gradient(90deg, #059669 0%, #0D5C75 50%, #0284c7 100%)'
        }} />

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <img src="/sanjeevani_symbol.png" alt="Sanjeevani" style={{ height: 40, width: 'auto' }} />
            <img src="/sanjeevani_text_transparent.png" alt="Sanjeevani" style={{ height: 36, width: 'auto' }} />
          </div>

          <h1 style={{ margin: '0.5rem 0 0.2rem', fontSize: '1.55rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Create Sanjeevani Account
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
            Join India's trusted 24/7 AI-powered healthcare & pharmacy platform
          </p>
        </div>

        {/* Alerts */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fef2f2', border: '1.5px solid #fecdd3', color: '#e11d48',
              padding: '0.75rem 0.95rem', borderRadius: '12px', fontSize: '0.84rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1rem'
            }}
          >
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{apiError}</span>
          </motion.div>
        )}

        {apiSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#ecfdf5', border: '1.5px solid #a7f3d0', color: '#047857',
              padding: '0.75rem 0.95rem', borderRadius: '12px', fontSize: '0.84rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1rem'
            }}
          >
            <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{apiSuccess}</span>
          </motion.div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Row 1: Full Name & Email */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User style={{ position: 'absolute', left: '14px', width: 18, height: 18, color: '#059669', pointerEvents: 'none' }} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Tharun Singh"
                  style={{
                    width: '100%', padding: '0.75rem 0.9rem 0.75rem 42px', borderRadius: '12px',
                    border: errors.fullName ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', outline: 'none', background: '#f8fafc'
                  }}
                />
              </div>
              {errors.fullName && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, marginTop: '0.2rem', display: 'block' }}>{errors.fullName}</span>}
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
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
                    fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', outline: 'none', background: '#f8fafc'
                  }}
                />
              </div>
              {errors.email && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, marginTop: '0.2rem', display: 'block' }}>{errors.email}</span>}
            </div>
          </div>

          {/* Row 2: Phone Number */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
              Phone Number
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={{
                  width: '78px', padding: '0.75rem 0.4rem', borderRadius: '12px',
                  border: '1.5px solid #cbd5e1', background: '#f8fafc', fontSize: '0.85rem',
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
                    fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', outline: 'none', background: '#f8fafc'
                  }}
                />
              </div>
            </div>
            {errors.phone && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, marginTop: '0.2rem', display: 'block' }}>{errors.phone}</span>}
          </div>

          {/* Row 3: Passwords */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
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
                    fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', outline: 'none', background: '#f8fafc'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, marginTop: '0.2rem', display: 'block' }}>{errors.password}</span>}
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Confirm Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock style={{ position: 'absolute', left: '14px', width: 18, height: 18, color: '#059669', pointerEvents: 'none' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '0.75rem 42px 0.75rem 42px', borderRadius: '12px',
                    border: errors.confirmPassword ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', outline: 'none', background: '#f8fafc'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  {showConfirmPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
              {errors.confirmPassword && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, marginTop: '0.2rem', display: 'block' }}>{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Password Strength Progress Bar */}
          {formData.password && (
            <div style={{ background: '#f1f5f9', padding: '0.65rem 0.85rem', borderRadius: '10px', marginTop: '-0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>Password Strength:</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: getStrengthText().color }}>{getStrengthText().label}</span>
              </div>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden', display: 'flex', gap: '3px' }}>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    style={{
                      flex: 1, height: '100%',
                      background: passwordStrength >= lvl ? getStrengthText().color : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Terms Checkbox */}
          <div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
                style={{ width: 18, height: 18, marginTop: '2px', accentColor: '#059669', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, lineHeight: 1.4 }}>
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setActiveModal('terms')}
                  style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 900, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 900, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >
                  Privacy Policy
                </button>
              </span>
            </label>
            {errors.agree && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>{errors.agree}</span>}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            style={{
              marginTop: '0.2rem', width: '100%', padding: '0.85rem 1rem', borderRadius: '12px',
              border: 'none', background: 'linear-gradient(135deg, #059669 0%, #0D5C75 100%)',
              color: '#ffffff', fontWeight: 900, fontSize: '0.95rem', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: '0 4px 16px rgba(5, 150, 105, 0.3)', transition: 'all 0.2s ease'
            }}
          >
            {isSubmitting ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Creating Account...
              </span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight style={{ width: 18, height: 18 }} />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', fontWeight: 600 }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: '#0D5C75', fontWeight: 900, textDecoration: 'none' }}>
              Log In to Account ➔
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Modal Dialog */}
      <AnimatePresence>
        {activeModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}
            >
              <div style={{ padding: '1rem 1.25rem', background: '#0D5C75', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText style={{ width: 20, height: 20 }} />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                    {activeModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                  </h3>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>

              <div style={{ padding: '1.25rem', maxHeight: '340px', overflowY: 'auto', fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
                {activeModal === 'terms' ? (
                  <>
                    <p>Welcome to Sanjeevani! By creating an account, you agree to abide by our healthcare service terms.</p>
                    <h4 style={{ color: '#0f172a', margin: '0.75rem 0 0.25rem' }}>1. Genuine Medicines & Rx</h4>
                    <p>Orders requiring prescription are checked by certified pharmacists before dispatch.</p>
                    <h4 style={{ color: '#0f172a', margin: '0.75rem 0 0.25rem' }}>2. Account Confidentiality</h4>
                    <p>Keep your login credentials secure. Never share your OTP codes with anyone.</p>
                  </>
                ) : (
                  <>
                    <p>At Sanjeevani, your medical information and privacy are protected by 256-bit SSL encryption.</p>
                    <h4 style={{ color: '#0f172a', margin: '0.75rem 0 0.25rem' }}>1. Data Collection</h4>
                    <p>We store your name, contact email, phone, and delivery addresses solely to process orders.</p>
                  </>
                )}
              </div>

              <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'right' }}>
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, agree: true }));
                    setActiveModal(null);
                    setErrors((prev) => ({ ...prev, agree: '' }));
                  }}
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', border: 'none', background: '#059669', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Accept & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;

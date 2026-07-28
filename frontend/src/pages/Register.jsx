import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from '../components/InputField';
import authService from '../api/authService';
import { useAuth } from '../context/AuthContext';

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

      setApiSuccess(response.message || 'Registration successful!');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: 'CUSTOMER',
        password: '',
        confirmPassword: '',
        agree: false,
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.data && typeof errorData.data === 'object') {
          setErrors(errorData.data);
          setApiError('Validation failed. Please correct the fields below.');
        } else {
          setApiError(errorData.message || 'Registration failed');
        }
      } else {
        setApiError('Network error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-header">
          <img src="/sanjeevani_text_transparent.png" alt="Sanjeevani" className="auth-logo-text" style={{ height: '44px', width: 'auto' }} />
        </div>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Register for a Sanjeevani health account</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}
        {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <InputField
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="Tharun Singh"
            required
          />

          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="john@gmail.com"
            required
          />

          <InputField
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="9876543210"
            countryCode={countryCode}
            onCountryCodeChange={(e) => setCountryCode(e.target.value)}
          />

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary, #1e293b)' }}>
              Account Role <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                fontSize: '1rem',
                backgroundColor: '#ffffff',
                color: '#334155',
                outline: 'none',
              }}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <InputField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            required
          />

          {formData.password && (
            <div className="strength-bar">
              <div className={`strength-step ${passwordStrength >= 1 ? (passwordStrength <= 2 ? 'active-weak' : passwordStrength <= 4 ? 'active-medium' : 'active-strong') : ''}`}></div>
              <div className={`strength-step ${passwordStrength >= 3 ? (passwordStrength <= 4 ? 'active-medium' : 'active-strong') : ''}`}></div>
              <div className={`strength-step ${passwordStrength >= 5 ? 'active-strong' : ''}`}></div>
            </div>
          )}

          <InputField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
            required
          />

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="agree"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
            />
            <label className="checkbox-label" htmlFor="agree">
              I agree to the{' '}
              <a
                href="#terms"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveModal('terms');
                }}
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="#privacy"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveModal('privacy');
                }}
              >
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.agree && <span className="error-text" style={{ marginTop: '-15px', marginBottom: '15px' }}>{errors.agree}</span>}

          <button type="submit" className="auth-btn" disabled={isSubmitting}>
            {isSubmitting ? <div className="spinner"></div> : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/login" className="auth-link">
            Log In
          </Link>
        </div>
      </div>

      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{activeModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</h2>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {activeModal === 'terms' ? (
                <div className="modal-content">
                  <p>Welcome to Sanjeevani! By registering for an account, you agree to comply with and be bound by the following Terms of Service. Please read them carefully.</p>
                  <h3>1. Acceptance of Terms</h3>
                  <p>By creating a Sanjeevani health account, you acknowledge that you have read, understood, and agree to these terms.</p>
                  <h3>2. Account Security</h3>
                  <p>You are responsible for safeguarding your login credentials (email, password, phone number, and OTP codes).</p>
                </div>
              ) : (
                <div className="modal-content">
                  <p>At Sanjeevani, your privacy and health data security are our top priorities.</p>
                  <h3>1. Information We Collect</h3>
                  <p>We collect essential personal information when you register, including your Full Name, Email Address, Phone Number, and Role.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-agree-btn" onClick={() => {
                setFormData(prev => ({ ...prev, agree: true }));
                setActiveModal(null);
                setErrors(prev => ({ ...prev, agree: '' }));
              }}>
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;

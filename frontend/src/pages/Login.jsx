import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from '../components/InputField';
import authService from '../api/authService';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  });

  const [countryCode, setCountryCode] = useState('+91');
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
      const identifier = loginMethod === 'email'
        ? formData.email.trim()
        : `${countryCode}${formData.phone.trim()}`;

      const response = await authService.login(identifier, formData.password);

      if (response.success && response.data) {
        const { token, user } = response.data;
        setIsSuccess(true);
        setTimeout(() => {
          login(user, token);
          navigate('/dashboard');
        }, 1500);
      } else {
        setApiError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setApiError(err.response.data.message || 'Login failed');
      } else {
        setApiError('Network error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card success-card">
          <div className="success-checkmark-wrapper">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <h1 className="success-title">Login Successful</h1>
          <p className="success-subtitle">Welcome to Sanjeevani. Redirecting you to the dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-header">
          <img src="/sanjeevani_text_transparent.png" alt="Sanjeevani" className="auth-logo-text" style={{ height: '44px', width: 'auto' }} />
        </div>
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your Sanjeevani account</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${loginMethod === 'email' ? 'active' : ''}`}
            onClick={() => {
              setLoginMethod('email');
              setErrors({});
              setApiError('');
            }}
          >
            Email Login
          </button>
          <button
            type="button"
            className={`login-tab ${loginMethod === 'phone' ? 'active' : ''}`}
            onClick={() => {
              setLoginMethod('phone');
              setErrors({});
              setApiError('');
            }}
          >
            Phone Login
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {loginMethod === 'email' ? (
            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="john@gmail.com"
              required
            />
          ) : (
            <InputField
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="9876543210"
              required
              countryCode={countryCode}
              onCountryCodeChange={(e) => setCountryCode(e.target.value)}
            />
          )}

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

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px', marginTop: '-10px' }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem' }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="auth-btn" disabled={isSubmitting}>
            {isSubmitting ? <div className="spinner"></div> : 'Log In'}
          </button>
        </form>

        <div className="auth-footer">
          <div>
            Don't have an account?
            <Link to="/register" className="auth-link">
              Sign Up
            </Link>
          </div>
          <div style={{ marginTop: '12px' }}>
            Are you an Admin?
            <Link to="/admin/login" className="auth-link">
              Admin Login
            </Link>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from '../components/InputField';
import authService from '../api/authService';
import { useAuth } from '../context/AuthContext';

export const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'newPassword') {
      if (!value) {
        setPasswordStrength(0);
        return;
      }
      let strength = 0;
      if (value.length >= 8) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      if (/[a-z]/.test(value)) strength += 1;
      if (/\d/.test(value)) strength += 1;
      if (/[!@#$%^&*]/.test(value)) strength += 1;
      setPasswordStrength(strength);
    }
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'currentPassword':
        if (!value) error = 'Current password is required';
        break;
      case 'newPassword':
        if (!value) error = 'New password is required';
        else if (value.length < 8) {
          error = 'Password must be at least 8 characters long';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(value)) {
          error = 'Password must contain uppercase, lowercase, digit, and special char (!@#$%^&*)';
        } else if (value === formData.currentPassword) {
          error = 'New password cannot be the same as current password';
        }
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your new password';
        else if (value !== formData.newPassword) {
          error = 'Passwords do not match';
        }
        break;
      default:
        break;
    }
    return error;
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
      const response = await authService.changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      setApiSuccess(response.message || 'Password changed successfully! Logging out...');
      
      // Clear token and logout locally after brief timeout, forcing re-login
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data) {
        setApiError(err.response.data.message || 'Password change failed');
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
        <h1>Change Password</h1>
        <p className="auth-subtitle">Verify current password and enter a new one</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}
        {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <InputField
            label="Current Password"
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handlePasswordChange}
            error={errors.currentPassword}
            placeholder="••••••••"
            required
          />

          <InputField
            label="New Password"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handlePasswordChange}
            error={errors.newPassword}
            placeholder="••••••••"
            required
          />

          {formData.newPassword && (
            <div className="strength-bar">
              <div className={`strength-step ${passwordStrength >= 1 ? (passwordStrength <= 2 ? 'active-weak' : passwordStrength <= 4 ? 'active-medium' : 'active-strong') : ''}`}></div>
              <div className={`strength-step ${passwordStrength >= 3 ? (passwordStrength <= 4 ? 'active-medium' : 'active-strong') : ''}`}></div>
              <div className={`strength-step ${passwordStrength >= 5 ? 'active-strong' : ''}`}></div>
            </div>
          )}

          <InputField
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handlePasswordChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
            required
          />

          <button type="submit" className="auth-btn" disabled={isSubmitting}>
            {isSubmitting ? <div className="spinner"></div> : 'Update Password'}
          </button>
          
          <button 
            type="button" 
            className="auth-btn btn-secondary" 
            style={{ marginTop: '12px' }}
            onClick={() => navigate('/dashboard')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from '../components/InputField';
import authService from '../api/authService';

export const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Enter email/phone, 2: Enter OTP, 3: Enter new password
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [receivedOtp, setReceivedOtp] = useState('');

  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300);

  const navigate = useNavigate();

  // Manage countdown timer for OTP
  useEffect(() => {
    if (step !== 2 || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Handle focus on entering step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        const firstInput = document.getElementById('otp-input-0');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }, [step]);

  // Handle password strength calculation
  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setNewPassword(val);

    if (!val) {
      setPasswordStrength(0);
      return;
    }
    let strength = 0;
    if (val.length >= 8) strength += 1;
    if (/[A-Z]/.test(val)) strength += 1;
    if (/[a-z]/.test(val)) strength += 1;
    if (/\d/.test(val)) strength += 1;
    if (/[!@#$%^&*]/.test(val)) strength += 1;
    setPasswordStrength(strength);
  };

  const getIdentifier = () => {
    return method === 'email' ? email.trim() : `${countryCode}${phone.trim()}`;
  };

  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    if (method === 'email') {
      if (!email) {
        setErrors({ email: 'Email address is required' });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrors({ email: 'Please enter a valid email address' });
        return;
      }
    } else {
      if (!phone) {
        setErrors({ phone: 'Phone number is required' });
        return;
      }
      if (!/^\d{6,14}$/.test(phone)) {
        setErrors({ phone: 'Phone number must contain between 6 and 14 digits' });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const identifier = getIdentifier();
      const response = await authService.forgotPassword(identifier);

      setApiSuccess(response.message || 'OTP sent successfully!');

      if (response.data && response.data.otp) {
        setReceivedOtp(response.data.otp);
      } else {
        setReceivedOtp('');
      }

      setStep(2);
      setOtpValues(['', '', '', '', '', '']);
      setOtp('');
      setTimeLeft(300); // 5 minutes countdown
      setErrors({});
    } catch (err) {
      if (err.response && err.response.data) {
        setApiError(err.response.data.message || 'Error sending OTP');
      } else {
        setApiError('Network error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setApiError('');
    setApiSuccess('');
    setIsSubmitting(true);
    try {
      const identifier = getIdentifier();
      const response = await authService.forgotPassword(identifier);

      setApiSuccess(response.message || 'OTP resent successfully!');

      if (response.data && response.data.otp) {
        setReceivedOtp(response.data.otp);
      } else {
        setReceivedOtp('');
      }

      setOtpValues(['', '', '', '', '', '']);
      setOtp('');
      setTimeLeft(300);
      setErrors({});

      setTimeout(() => {
        const firstInput = document.getElementById('otp-input-0');
        if (firstInput) firstInput.focus();
      }, 100);
    } catch (err) {
      if (err.response && err.response.data) {
        setApiError(err.response.data.message || 'Error sending OTP');
      } else {
        setApiError('Network error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpBoxChange = (val, index) => {
    if (val && !/^\d$/.test(val)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = val;
    setOtpValues(newOtpValues);
    setOtp(newOtpValues.join(''));

    if (val !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleOtpBoxKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtpValues = [...otpValues];

      if (otpValues[index] !== '') {
        newOtpValues[index] = '';
        setOtpValues(newOtpValues);
        setOtp(newOtpValues.join(''));
      } else if (index > 0) {
        newOtpValues[index - 1] = '';
        setOtpValues(newOtpValues);
        setOtp(newOtpValues.join(''));
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) {
          prevInput.focus();
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpBoxPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setOtpValues(digits);
    setOtp(pastedData);

    const lastInput = document.getElementById('otp-input-5');
    if (lastInput) lastInput.focus();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    if (!otp || otp.length < 6) {
      setErrors({ otp: 'Please enter all 6 digits of the OTP' });
      return;
    }

    setIsSubmitting(true);
    try {
      const identifier = getIdentifier();
      const response = await authService.verifyOtp(identifier, otp);
      setApiSuccess(response.message || 'OTP verified successfully!');
      setStep(3);
      setErrors({});
    } catch (err) {
      if (err.response && err.response.data) {
        setApiError(err.response.data.message || 'Invalid or expired OTP');
      } else {
        setApiError('Network error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    const newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const identifier = getIdentifier();
      const response = await authService.resetPassword(identifier, otp, newPassword, confirmPassword);

      setApiSuccess(response.message || 'Password reset successful!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data) {
        setApiError(err.response.data.message || 'Reset failed');
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
        <h1>Reset Password</h1>

        {step === 1 && (
          <p className="auth-subtitle">Choose a reset method to receive your OTP</p>
        )}
        {step === 2 && (
          <p className="auth-subtitle">Verify your identity using the One-Time Password</p>
        )}
        {step === 3 && (
          <p className="auth-subtitle">Choose a secure new password for your account</p>
        )}

        {apiError && <div className="alert alert-error">{apiError}</div>}
        {apiSuccess && step !== 2 && <div className="alert alert-success">{apiSuccess}</div>}

        {step === 1 && (
          <>
            <div className="login-tabs">
              <button
                type="button"
                className={`login-tab ${method === 'email' ? 'active' : ''}`}
                onClick={() => {
                  setMethod('email');
                  setErrors({});
                  setApiError('');
                }}
              >
                Reset via Email
              </button>
              <button
                type="button"
                className={`login-tab ${method === 'phone' ? 'active' : ''}`}
                onClick={() => {
                  setMethod('phone');
                  setErrors({});
                  setApiError('');
                }}
              >
                Reset via Phone
              </button>
            </div>

            <form onSubmit={handleIdentifierSubmit} noValidate>
              {method === 'email' ? (
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  placeholder="john@gmail.com"
                  required
                />
              ) : (
                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.phone}
                  placeholder="9876543210"
                  required
                  countryCode={countryCode}
                  onCountryCodeChange={(e) => setCountryCode(e.target.value)}
                />
              )}

              <button type="submit" className="auth-btn" disabled={isSubmitting}>
                {isSubmitting ? <div className="spinner"></div> : 'Send OTP'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} noValidate>
            {receivedOtp && (
              <div className="alert alert-success" style={{ marginBottom: '16px', textAlign: 'center', fontWeight: 'bold' }}>
                🔑 VERIFICATION OTP: {receivedOtp}
              </div>
            )}

            <div className="otp-info-container">
              <p className="otp-sent-text">
                OTP has been sent to your registered {method === 'email' ? 'email' : 'phone number'}:{' '}
                <span className="otp-target-highlight">
                  {method === 'email' ? email : `${countryCode} ${phone}`}
                </span>.
              </p>
              <p className="otp-expires-text">It expires in 5 minutes.</p>

              <div className={`otp-timer-badge ${timeLeft <= 60 ? 'timer-critical' : ''}`}>
                <svg className="timer-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{timeLeft > 0 ? formatTime(timeLeft) : 'Expired'}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '8px' }}>
                Enter 6-Digit OTP Code
              </label>
              <div className="otp-boxes-container">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpBoxChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpBoxKeyDown(e, index)}
                    onPaste={handleOtpBoxPaste}
                    className={`otp-box-input ${errors.otp ? 'has-error' : ''}`}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
              {errors.otp && <span className="error-text" style={{ textAlign: 'center' }}>{errors.otp}</span>}
            </div>

            {timeLeft === 0 && (
              <div className="resend-container">
                <p className="resend-text">Didn't receive the OTP?</p>
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Resending...' : 'Resend OTP'}
                </button>
              </div>
            )}

            <button type="submit" className="auth-btn" disabled={isSubmitting || timeLeft === 0}>
              {isSubmitting ? <div className="spinner"></div> : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="auth-btn btn-secondary"
              style={{ marginTop: '12px' }}
              onClick={() => setStep(1)}
              disabled={isSubmitting}
            >
              Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordResetSubmit} noValidate>
            <InputField
              label="New Password"
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={handlePasswordChange}
              error={errors.newPassword}
              placeholder="••••••••"
              required
            />

            {newPassword && (
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              placeholder="••••••••"
              required
            />

            <button type="submit" className="auth-btn" disabled={isSubmitting}>
              {isSubmitting ? <div className="spinner"></div> : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Back to
          <Link to="/login" className="auth-link">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

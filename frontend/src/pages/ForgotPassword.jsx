import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, Lock, Eye, EyeOff, KeyRound, Clock, 
  ArrowRight, CheckCircle2, AlertCircle, RefreshCw, ChevronLeft
} from 'lucide-react';
import authService from '../api/authService';

export const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: Enter new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300);
  const [fallbackOtp, setFallbackOtp] = useState('');
  const [showFallbackOtp, setShowFallbackOtp] = useState(false);
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

  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    setShowFallbackOtp(false);

    if (!email) {
      setErrors({ email: 'Email address is required' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsSubmitting(true);
    try {
      const identifier = email.trim();
      const response = await authService.forgotPassword(identifier);
      const returnedOtp = response?.data?.otpCode || response?.otpCode;
      if (returnedOtp) {
        const otpStr = String(returnedOtp).padStart(6, '0');
        setFallbackOtp(otpStr);
        setOtpValues(otpStr.split(''));
        setOtp(otpStr);
      }

      setApiSuccess(`✉️ Verification code sent to ${identifier}! (If not in Inbox, please check Spam/Junk folder).`);
      setStep(2);
      setTimeLeft(300);
      setErrors({});
    } catch (err) {
      console.error("Backend forgotPassword API error:", err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to send OTP. Please check that your email address is registered.';
      setApiError(`❌ ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setApiError('');
    setApiSuccess('');
    setShowFallbackOtp(false);
    setIsSubmitting(true);
    try {
      const identifier = email.trim();
      const response = await authService.forgotPassword(identifier);
      const returnedOtp = response?.data?.otpCode || response?.otpCode;
      if (returnedOtp) {
        const otpStr = String(returnedOtp).padStart(6, '0');
        setFallbackOtp(otpStr);
        setOtpValues(otpStr.split(''));
        setOtp(otpStr);
      }

      setApiSuccess(`✉️ New verification code sent to ${identifier}! Check Spam folder if delayed.`);
      setTimeLeft(300);
      setErrors({});
    } catch (err) {
      console.error("Backend resend OTP error:", err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to resend OTP. Please try again.';
      setApiError(`❌ ${errMsg}`);
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
      const identifier = email.trim();
      const response = await authService.verifyOtp(identifier, otp);
      setApiSuccess(response?.message || 'OTP verified successfully! Please enter your new password.');
      setStep(3);
      setErrors({});
    } catch (err) {
      console.error('OTP Verification Error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Invalid or expired OTP code. Please check your email inbox.';
      setApiError(`❌ ${errMsg}`);
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
      const identifier = email.trim();
      const response = await authService.resetPassword(identifier, otp, newPassword, confirmPassword);
      setApiSuccess(response?.message || 'Password reset successfully! Redirecting to login...');
      try {
        localStorage.setItem(`sanjeevani_user_pwd_${email.trim().toLowerCase()}`, newPassword);
      } catch (e) {}
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      console.error("Backend resetPassword error:", err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to reset password. Please verify your OTP.';
      setApiError(`❌ ${errMsg}`);
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
      background: 'radial-gradient(circle at 30% 30%, #f0fdf4 0%, #e0f2fe 50%, #f8fafc 100%)',
      padding: '2rem 1rem', position: 'relative', fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%', maxWidth: 450,
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
          background: 'linear-gradient(90deg, #0D5C75 0%, #059669 50%, #0284c7 100%)'
        }} />

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <img src="/sanjeevani_symbol.png" alt="Sanjeevani" style={{ height: 40, width: 'auto' }} />
            <img src="/sanjeevani_text_transparent.png" alt="Sanjeevani" style={{ height: 36, width: 'auto' }} />
          </div>

          <h1 style={{ margin: '0.5rem 0 0.2rem', fontSize: '1.55rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Reset Password
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
            {step === 1 && 'Enter your registered email address to receive verification OTP'}
            {step === 2 && 'Enter the 6-digit verification code sent to your email'}
            {step === 3 && 'Create a strong new password for your Sanjeevani account'}
          </p>
        </div>

        {/* 3-Step Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[
            { id: 1, label: 'Email' },
            { id: 2, label: 'Verify OTP' },
            { id: 3, label: 'New Password' }
          ].map((st, i) => (
            <React.Fragment key={st.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: step >= st.id ? '#0D5C75' : '#e2e8f0',
                  color: step >= st.id ? '#ffffff' : '#64748b',
                  fontSize: '0.75rem', fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {step > st.id ? '✓' : st.id}
                </div>
                <span style={{ fontSize: '0.76rem', fontWeight: step === st.id ? 800 : 600, color: step === st.id ? '#0D5C75' : '#94a3b8' }}>
                  {st.label}
                </span>
              </div>
              {i < 2 && <div style={{ width: 16, height: 2, background: step > st.id ? '#0D5C75' : '#e2e8f0' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Alerts */}
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

        {apiSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#ecfdf5', border: '1.5px solid #a7f3d0', color: '#047857',
              padding: '0.75rem 0.95rem', borderRadius: '12px', fontSize: '0.84rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.1rem'
            }}
          >
            <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{apiSuccess}</span>
          </motion.div>
        )}

        {/* ── STEP 1: ENTER EMAIL ── */}
        {step === 1 && (
          <form onSubmit={handleIdentifierSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Registered Email Address
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail style={{ position: 'absolute', left: '14px', width: 18, height: 18, color: '#059669', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{
                    width: '100%', padding: '0.75rem 0.9rem 0.75rem 42px', borderRadius: '12px',
                    border: errors.email ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', outline: 'none', background: '#f8fafc'
                  }}
                />
              </div>
              {errors.email && <span style={{ fontSize: '0.76rem', color: '#ef4444', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #0D5C75 0%, #059669 100%)',
                color: '#ffffff', fontWeight: 900, fontSize: '0.95rem', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 4px 16px rgba(13, 92, 117, 0.3)'
              }}
            >
              {isSubmitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Sending OTP...
                </span>
              ) : (
                <>
                  <span>Send Verification OTP</span>
                  <ArrowRight style={{ width: 18, height: 18 }} />
                </>
              )}
            </motion.button>
          </form>
        )}

        {/* ── STEP 2: VERIFY 6-DIGIT OTP ── */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0.9rem', textAlign: 'center' }}>
              <p style={{ margin: '0 0 0.35rem', fontSize: '0.84rem', color: '#475569', fontWeight: 600 }}>
                OTP sent to registered Email:
              </p>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#0D5C75', fontWeight: 900 }}>
                {email}
              </p>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: timeLeft <= 60 ? '#fef2f2' : '#ecfdf5', color: timeLeft <= 60 ? '#ef4444' : '#047857', border: timeLeft <= 60 ? '1px solid #fecdd3' : '1px solid #a7f3d0', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 800 }}>
                <Clock style={{ width: 14, height: 14 }} />
                <span>{timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'OTP Expired'}</span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', display: 'block', textAlign: 'center', marginBottom: '0.65rem' }}>
                Enter 6-Digit Verification Code
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.45rem' }}>
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
                    style={{
                      width: '44px', height: '50px', textAlign: 'center', borderRadius: '12px',
                      border: errors.otp ? '2px solid #ef4444' : (digit ? '2px solid #059669' : '1.5px solid #cbd5e1'),
                      fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', background: digit ? '#ecfdf5' : '#ffffff',
                      outline: 'none', transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>
              {errors.otp && <span style={{ fontSize: '0.76rem', color: '#ef4444', fontWeight: 700, marginTop: '0.4rem', textAlign: 'center', display: 'block' }}>{errors.otp}</span>}

              {fallbackOtp && (
                <div style={{ textAlign: 'center', marginTop: '0.65rem' }}>
                  {!showFallbackOtp ? (
                    <button
                      type="button"
                      onClick={() => setShowFallbackOtp(true)}
                      style={{ background: 'none', border: 'none', color: '#0D5C75', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Didn't receive email? View Fallback OTP Code
                    </button>
                  ) : (
                    <div style={{ display: 'inline-block', background: '#f0fdf4', border: '1px solid #a7f3d0', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857' }}>
                        Fallback OTP Code: <strong style={{ letterSpacing: '1px', fontSize: '0.9rem' }}>{fallbackOtp}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {timeLeft === 0 && (
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                  style={{ background: 'none', border: 'none', color: '#0D5C75', fontWeight: 900, fontSize: '0.86rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <RefreshCw style={{ width: 14, height: 14 }} />
                  Resend OTP Now
                </button>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting || timeLeft === 0}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #059669 0%, #0D5C75 100%)',
                color: '#ffffff', fontWeight: 900, fontSize: '0.95rem', cursor: isSubmitting || timeLeft === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 4px 16px rgba(5, 150, 105, 0.3)'
              }}
            >
              {isSubmitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Verifying OTP...
                </span>
              ) : (
                <>
                  <span>Verify OTP Code</span>
                  <KeyRound style={{ width: 18, height: 18 }} />
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
            >
              <ChevronLeft style={{ width: 16, height: 16 }} />
              Change Email Address
            </button>
          </form>
        )}

        {/* ── STEP 3: CREATE NEW PASSWORD ── */}
        {step === 3 && (
          <form onSubmit={handlePasswordResetSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                New Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock style={{ position: 'absolute', left: '14px', width: 18, height: 18, color: '#059669', pointerEvents: 'none' }} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '0.75rem 42px 0.75rem 42px', borderRadius: '12px',
                    border: errors.newPassword ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', outline: 'none', background: '#f8fafc'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  {showNewPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
              {errors.newPassword && <span style={{ fontSize: '0.76rem', color: '#ef4444', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>{errors.newPassword}</span>}
            </div>

            {/* Password Strength Meter */}
            {newPassword && (
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

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Confirm New Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock style={{ position: 'absolute', left: '14px', width: 18, height: 18, color: '#059669', pointerEvents: 'none' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '0.75rem 42px 0.75rem 42px', borderRadius: '12px',
                    border: errors.confirmPassword ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', outline: 'none', background: '#f8fafc'
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
              {errors.confirmPassword && <span style={{ fontSize: '0.76rem', color: '#ef4444', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>{errors.confirmPassword}</span>}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              style={{
                marginTop: '0.35rem', width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #0D5C75 0%, #059669 100%)',
                color: '#ffffff', fontWeight: 900, fontSize: '0.95rem', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 4px 16px rgba(13, 92, 117, 0.3)'
              }}
            >
              {isSubmitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Updating Password...
                </span>
              ) : (
                <>
                  <span>Save New Password</span>
                  <CheckCircle2 style={{ width: 18, height: 18 }} />
                </>
              )}
            </motion.button>
          </form>
        )}

        {/* Footer Navigation */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', fontWeight: 600 }}>
            Remembered your password?{' '}
            <Link to="/login" style={{ color: '#0D5C75', fontWeight: 900, textDecoration: 'none' }}>
              Back to Login ➔
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

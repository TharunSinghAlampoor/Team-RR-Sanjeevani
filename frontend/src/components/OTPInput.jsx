import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, RefreshCw, ArrowRight } from 'lucide-react';

/**
 * OTPInput — Reusable 6-Digit Individual Box OTP Component
 * Strictly follows Rule #11 Specifications:
 * - 6 individual boxes: [ ] [ ] [ ] [ ] [ ] [ ]
 * - Automatic focus movement & Backspace navigation
 * - Paste full OTP support
 * - Numeric input filtering
 * - Resend countdown timer ("Resend in 00:30" / "Resend OTP")
 * - Masked destination display (jo***@gmail.com or +91 ******4321)
 */
export const OTPInput = ({
  destinationMask = '',
  onVerify,
  onResend,
  isSubmitting = false,
  apiError = '',
}) => {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef([]);

  // Auto-focus first box on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    // Filter numeric digits only
    const digit = value.replace(/[^0-9]/g, '').slice(-1);

    const newValues = [...otpValues];
    newValues[index] = digit;
    setOtpValues(newValues);

    // Auto-advance focus to next box if digit entered
    if (digit && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-verify if all 6 digits completed
    const fullOtp = newValues.join('');
    if (fullOtp.length === 6 && !newValues.includes('')) {
      onVerify(fullOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace navigation to previous box if current is empty
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const digits = pastedData.split('');
    const newValues = ['', '', '', '', '', ''];
    digits.forEach((d, i) => {
      if (i < 6) newValues[i] = d;
    });
    setOtpValues(newValues);

    // Move focus to last filled box or box 6
    const nextFocusIndex = Math.min(digits.length, 5);
    if (inputRefs.current[nextFocusIndex]) {
      inputRefs.current[nextFocusIndex].focus();
    }

    if (pastedData.length === 6) {
      onVerify(pastedData);
    }
  };

  const handleResendClick = () => {
    if (countdown > 0) return;
    setCountdown(30);
    setOtpValues(['', '', '', '', '', '']);
    if (inputRefs.current[0]) inputRefs.current[0].focus();
    if (onResend) onResend();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');
    if (fullOtp.length === 6) {
      onVerify(fullOtp);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header Badge */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#DCFCE7',
            border: '2px solid #A7F3D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.85rem',
          }}
        >
          <ShieldCheck style={{ width: 28, height: 28, color: '#16A34A' }} />
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#172033', margin: '0 0 0.35rem 0' }}>
          Verify OTP
        </h2>

        <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Enter the 6-digit OTP sent to{' '}
          <strong style={{ color: '#172033', fontWeight: 700 }}>{destinationMask}</strong>
        </p>
      </div>

      {/* Error Alert */}
      {apiError && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            background: '#FEF2F2',
            border: '1px solid #FECDD3',
            color: '#DC2626',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            textAlign: 'center',
          }}
        >
          {apiError}
        </div>
      )}

      {/* 6 Individual OTP Boxes */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          {otpValues.map((val, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              style={{
                width: '46px',
                height: '52px',
                borderRadius: '0.75rem',
                border: apiError ? '2px solid #DC2626' : val ? '2px solid #16A34A' : '1.5px solid #E2E8F0',
                background: val ? '#DCFCE7' : '#FFFFFF',
                color: '#172033',
                fontSize: '1.35rem',
                fontWeight: 800,
                textAlign: 'center',
                outline: 'none',
                transition: 'all 0.18s ease',
                boxShadow: val ? '0 4px 12px rgba(22, 163, 74, 0.12)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Submit Verification Button */}
        <button
          type="submit"
          disabled={isSubmitting || otpValues.join('').length !== 6}
          style={{
            width: '100%',
            padding: '0.85rem 1.25rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
            color: '#FFFFFF',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: isSubmitting || otpValues.join('').length !== 6 ? 'not-allowed' : 'pointer',
            opacity: isSubmitting || otpValues.join('').length !== 6 ? 0.65 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
            marginBottom: '1.25rem',
          }}
        >
          {isSubmitting ? (
            <div className="spinner" />
          ) : (
            <>
              <span>Verify & Continue</span>
              <ArrowRight style={{ width: 18, height: 18 }} />
            </>
          )}
        </button>
      </form>

      {/* Resend Countdown Timer */}
      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
        {countdown > 0 ? (
          <span>
            Didn't receive the OTP? Resend in{' '}
            <strong style={{ color: '#16A34A', fontWeight: 800 }}>{formatTimer(countdown)}</strong>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResendClick}
            style={{
              background: 'none',
              border: 'none',
              color: '#16A34A',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              textDecoration: 'underline',
            }}
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
            <span>Resend OTP</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default OTPInput;

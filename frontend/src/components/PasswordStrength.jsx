import React from 'react';
import { Check, X } from 'lucide-react';

/**
 * PasswordStrength — Real-Time Password Requirement Checklist & Visual Meter
 * Strictly matches Spring Boot backend validation in ResetPasswordRequest.java:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one numeric digit (0-9)
 * - At least one special character (!@#$%^&*)
 */
export const PasswordStrength = ({ password = '' }) => {
  const requirements = [
    { label: '8+ characters minimum', met: password.length >= 8 },
    { label: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'Numeric digit (0-9)', met: /\d/.test(password) },
    { label: 'Special character (!@#$%^&*)', met: /[!@#$%^&*]/.test(password) },
  ];

  const metCount = requirements.filter((r) => r.met).length;

  const getStrengthMeta = () => {
    if (metCount === 0) return { label: 'Weak', color: '#E2E8F0', width: '0%' };
    if (metCount <= 2) return { label: 'Weak', color: '#DC2626', width: '25%' };
    if (metCount === 3) return { label: 'Medium', color: '#F59E0B', width: '50%' };
    if (metCount === 4) return { label: 'Strong', color: '#0D9488', width: '75%' };
    return { label: 'Very Strong', color: '#16A34A', width: '100%' };
  };

  const meta = getStrengthMeta();

  return (
    <div style={{ marginTop: '0.65rem', marginBottom: '1.25rem' }}>
      {/* Visual Strength Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Password Strength:</span>
        <span style={{ fontSize: '0.75rem', color: meta.color, fontWeight: 800 }}>{meta.label}</span>
      </div>

      <div
        style={{
          width: '100%',
          height: '5px',
          borderRadius: '99px',
          background: '#E2E8F0',
          overflow: 'hidden',
          marginBottom: '0.75rem',
        }}
      >
        <div
          style={{
            width: meta.width,
            height: '100%',
            background: meta.color,
            transition: 'all 0.3s ease',
            borderRadius: '99px',
          }}
        />
      </div>

      {/* Requirement Items Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem 0.5rem' }}>
        {requirements.map((req, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: req.met ? '#DCFCE7' : '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {req.met ? (
                <Check style={{ width: 10, height: 10, color: '#16A34A' }} />
              ) : (
                <X style={{ width: 9, height: 9, color: '#94A3B8' }} />
              )}
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                color: req.met ? '#15803D' : '#64748B',
                fontWeight: req.met ? 700 : 500,
              }}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;

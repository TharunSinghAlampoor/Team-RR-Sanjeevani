import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { detectUserLocation, getSavedAddress, saveAddress } from '../utils/locationUtils';

export const LocationAddressInput = ({
  value,
  onChange,
  label = 'Ship To Address',
  placeholder = 'Enter your delivery address...',
  className = '',
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'info' | 'success' | 'error'

  useEffect(() => {
    // If parent value is empty, try loading saved address from localStorage
    if (!value) {
      const saved = getSavedAddress();
      if (saved && onChange) {
        onChange(saved);
      }
    }
  }, []);

  const handleAddressChange = (e) => {
    const val = e.target.value;
    if (onChange) onChange(val);
    saveAddress(val);
    if (statusMsg) setStatusMsg('');
  };

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setStatusMsg('Accessing GPS & detecting address...');
    setStatusType('info');

    try {
      const locData = await detectUserLocation();
      if (locData && locData.formattedAddress) {
        const detected = locData.formattedAddress;
        if (onChange) onChange(detected);
        saveAddress(detected);
        setStatusMsg('Location auto-detected & address applied!');
        setStatusType('success');
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch (err) {
      console.error('Location detection error:', err);
      setStatusMsg(err.message || 'Could not detect location automatically.');
      setStatusType('error');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }} className={className}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          marginBottom: '0.45rem',
        }}
      >
        <label
          style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          <MapPin style={{ width: 15, height: 15, color: '#10b981' }} />
          <span>{label}</span>
        </label>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isDetecting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '0.5rem',
            border: '1.5px solid #10b981',
            background: isDetecting ? '#f0fdf4' : '#ecfdf5',
            color: '#047857',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: isDetecting ? 'wait' : 'pointer',
            transition: 'all 0.18s ease',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.12)',
          }}
          title="Click to detect current physical location via GPS"
        >
          {isDetecting ? (
            <>
              <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
              <span>Detecting...</span>
            </>
          ) : (
            <>
              <Navigation style={{ width: 13, height: 13, color: '#059669' }} />
              <span>📍 Detect My Location</span>
            </>
          )}
        </button>
      </div>

      <div
        style={{
          padding: '0.65rem',
          borderRadius: '0.85rem',
          border: '1.5px solid #d1fae5',
          background: '#f0fdf4',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
      >
        <textarea
          rows="3"
          value={value}
          onChange={handleAddressChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.65rem 0.75rem',
            borderRadius: '0.6rem',
            fontSize: '0.86rem',
            border: '1.5px solid #cbd5e1',
            background: '#ffffff',
            color: '#0f172a',
            boxSizing: 'border-box',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            fontWeight: 600,
          }}
        />

        {statusMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginTop: '0.45rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: statusType === 'error' ? '#dc2626' : statusType === 'success' ? '#059669' : '#0284c7',
            }}
          >
            {statusType === 'error' ? (
              <AlertCircle style={{ width: 13, height: 13 }} />
            ) : statusType === 'success' ? (
              <CheckCircle2 style={{ width: 13, height: 13 }} />
            ) : (
              <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
            )}
            <span>{statusMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationAddressInput;

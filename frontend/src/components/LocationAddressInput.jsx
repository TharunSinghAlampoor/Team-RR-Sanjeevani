import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { detectUserLocation, getSavedAddress, saveAddress } from '../utils/locationUtils';
import { useLanguage } from '../context/LanguageContext';

export const LocationAddressInput = ({
  value,
  onChange,
  label = 'Ship To Address',
  placeholder = 'Enter your delivery address...',
  className = '',
}) => {
  const { translateData } = useLanguage();
  const [isDetecting, setIsDetecting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('info');

  useEffect(() => {
    if (!value) {
      const saved = getSavedAddress();
      if (saved && onChange) onChange(saved);
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
    setStatusMsg('Detecting location via GPS...');
    setStatusType('info');

    try {
      const locData = await detectUserLocation();
      if (locData && locData.formattedAddress) {
        const detected = locData.formattedAddress;
        if (onChange) onChange(detected);
        saveAddress(detected);
        setStatusMsg('Location auto-detected!');
        setStatusType('success');
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch (err) {
      console.error('Location detection error:', err);
      setStatusMsg(err.message || 'Could not detect location.');
      setStatusType('error');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div style={{ marginBottom: '0.95rem' }} className={className}>
      {/* Top Header Label & Detect Location Button on Far Right Corner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          marginBottom: '0.45rem',
          width: '100%',
        }}
      >
        <label
          style={{
            fontSize: '0.76rem',
            fontWeight: 800,
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          <MapPin style={{ width: 14, height: 14, color: '#10b981' }} />
          <span>{translateData(label)}</span>
        </label>

        <motion.button
          whileHover={{ scale: 1.05, background: '#d1fae5' }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleDetectLocation}
          disabled={isDetecting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '0.5rem',
            border: '1.5px solid #a7f3d0',
            background: '#ecfdf5',
            color: '#047857',
            fontSize: '0.73rem',
            fontWeight: 800,
            cursor: isDetecting ? 'wait' : 'pointer',
            transition: 'all 0.18s ease',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            marginLeft: 'auto',
          }}
          title={translateData("Detect location using GPS")}
        >
          {isDetecting ? (
            <>
              <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} />
              <span>{translateData('Detecting...')}</span>
            </>
          ) : (
            <>
              <Navigation style={{ width: 12, height: 12, color: '#059669' }} />
              <span>{translateData('Detect Location')}</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Clean Address Textarea Box */}
      <div
        style={{
          borderRadius: '0.75rem',
          border: '1.5px solid #cbd5e1',
          background: '#ffffff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          overflow: 'hidden',
        }}
      >
        <textarea
          rows="2"
          value={value}
          onChange={handleAddressChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.65rem 0.75rem',
            fontSize: '0.84rem',
            border: 'none',
            background: '#ffffff',
            color: '#0f172a',
            boxSizing: 'border-box',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
            lineHeight: 1.45,
            fontWeight: 600,
          }}
        />

        {statusMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              background: statusType === 'error' ? '#fef2f2' : statusType === 'success' ? '#f0fdf4' : '#f0f9ff',
              borderTop: `1px solid ${statusType === 'error' ? '#fecdd3' : statusType === 'success' ? '#a7f3d0' : '#bae6fd'}`,
              fontSize: '0.72rem',
              fontWeight: 800,
              color: statusType === 'error' ? '#dc2626' : statusType === 'success' ? '#047857' : '#0284c7',
            }}
          >
            {statusType === 'error' ? (
              <AlertCircle style={{ width: 13, height: 13, flexShrink: 0 }} />
            ) : statusType === 'success' ? (
              <CheckCircle2 style={{ width: 13, height: 13, flexShrink: 0 }} />
            ) : (
              <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            )}
            <span>{statusMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationAddressInput;

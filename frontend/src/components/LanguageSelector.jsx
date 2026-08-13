import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' }
];

export const LanguageSelector = ({ isCompact = false }) => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lang-selector-btn"
        title="Change Language"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1.5px solid #a7f3d0',
          cursor: 'pointer',
          color: '#047857',
          boxShadow: '0 2px 8px rgba(5, 150, 105, 0.15)',
          transition: 'all 0.2s ease',
          padding: 0,
          flexShrink: 0,
        }}
      >
        <Globe style={{ width: 20, height: 20, color: '#059669', flexShrink: 0 }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '0.85rem',
            padding: '0.4rem',
            minWidth: '160px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
            zIndex: 99999,
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {languages.map((item) => {
            const isSelected = item.code === language;
            return (
              <button
                key={item.code}
                onClick={() => {
                  changeLanguage(item.code);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  border: 'none',
                  borderRadius: '0.55rem',
                  background: isSelected ? '#ecfdf5' : 'transparent',
                  color: isSelected ? '#047857' : '#334155',
                  fontWeight: isSelected ? 900 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{item.flag}</span>
                  <span>{item.native}</span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>({item.label})</span>
                </div>
                {isSelected && <Check style={{ width: 14, height: 14, color: '#059669' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default LanguageSelector;

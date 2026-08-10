import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, CheckCircle2, Sparkles, AlertCircle, ShoppingBag, Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_EXTRACTED_MEDS = [
  { id: 1, name: 'Paracetamol 500mg (Crocin)', category: 'Pain & Fever', price: 42, count: 1, confidence: '98%' },
  { id: 2, name: 'Amoxicillin 500mg Capsules', category: 'Antibiotics', price: 115, count: 1, confidence: '95%' },
  { id: 3, name: 'Vitamin C 1000mg Chewable', category: 'Supplements', price: 180, count: 1, confidence: '99%' },
  { id: 4, name: 'Omeprazole 20mg Antacid', category: 'Digestive Health', price: 65, count: 1, confidence: '94%' },
];

export const PrescriptionReaderModal = ({ isOpen, onClose, onAddToCart }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [selectedMeds, setSelectedMeds] = useState([1, 2, 3, 4]);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        setPreviewUrl(null);
      }
      startScanning();
    }
  };

  const startScanning = () => {
    setScanning(true);
    setScannedResult(null);
    setAddedSuccess(false);

    // Simulate AI OCR scanning pulse
    setTimeout(() => {
      setScanning(false);
      setScannedResult(MOCK_EXTRACTED_MEDS);
    }, 2800);
  };

  const toggleMed = (id) => {
    setSelectedMeds(prev =>
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleAddAllToCart = () => {
    const itemsToAdd = MOCK_EXTRACTED_MEDS.filter(m => selectedMeds.includes(m.id));
    if (onAddToCart) {
      itemsToAdd.forEach(item => {
        onAddToCart({
          productId: item.id + 990,
          productName: item.name,
          price: item.price,
          quantity: item.count,
        });
      });
    }
    setAddedSuccess(true);
    setTimeout(() => {
      onClose();
      navigate('/dashboard');
    }, 1600);
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem',
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            background: '#ffffff',
            borderRadius: '1.5rem',
            maxWidth: 540,
            width: '100%',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
            border: '1.5px solid #a7f3d0',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
              padding: '1.25rem 1.5rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <Sparkles style={{ width: 20, height: 20, color: '#ffffff' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>AI Prescription Reader</h3>
                <p style={{ fontSize: '0.78rem', opacity: 0.9, margin: 0 }}>Upload prescription to order medicines instantly</p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)', border: 'none',
                color: '#ffffff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.5rem' }}>
            {!scannedResult && !scanning && (
              <div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #10b981',
                    borderRadius: '1.25rem',
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    background: '#f0fdf4',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />

                  <div
                    style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: '#dcfce7', color: '#059669',
                      margin: '0 auto 0.75rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Upload style={{ width: 28, height: 28 }} />
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                    Click or Drag Prescription Image / PDF
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                    Supports PNG, JPG, JPEG, PDF up to 10MB
                  </p>
                </div>

                <div
                  style={{
                    marginTop: '1.25rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '0.85rem',
                    background: '#e0f2fe',
                    border: '1px solid #bae6fd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                  }}
                >
                  <ShieldCheck style={{ width: 20, height: 20, color: '#0284c7', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.78rem', color: '#0369a1', margin: 0, fontWeight: 600 }}>
                    100% Confidential & Encrypted. Reviewed by certified pharmacists.
                  </p>
                </div>
              </div>
            )}

            {/* Scanning Animation State */}
            {scanning && (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 1.5rem' }}>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Prescription preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem', border: '2px solid #a7f3d0' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%', height: '100%', borderRadius: '1rem',
                        background: '#ecfdf5', border: '2px solid #a7f3d0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <FileText style={{ width: 56, height: 56, color: '#059669' }} />
                    </div>
                  )}

                  {/* Laser Scanning Beam */}
                  <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute',
                      left: 0, right: 0,
                      height: 4,
                      background: '#10b981',
                      boxShadow: '0 0 12px #10b981, 0 0 20px #10b981',
                      borderRadius: 2,
                    }}
                  />
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                  AI Scanning Prescription...
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700, margin: 0 }}>
                  Extracting doctor's prescription & matching stock...
                </p>
              </div>
            )}

            {/* Result State */}
            {scannedResult && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontWeight: 800, fontSize: '0.9rem' }}>
                    <CheckCircle2 style={{ width: 18, height: 18 }} />
                    <span>4 Medicines Extracted from Prescription</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '0.2rem 0.6rem', borderRadius: 99, fontWeight: 700 }}>
                    AI Confidence: 97%
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: 240, overflowY: 'auto' }}>
                  {scannedResult.map((med) => {
                    const isSelected = selectedMeds.includes(med.id);
                    return (
                      <div
                        key={med.id}
                        onClick={() => toggleMed(med.id)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '0.85rem',
                          border: isSelected ? '1.5px solid #10b981' : '1.5px solid #e2e8f0',
                          background: isSelected ? '#f0fdf4' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            style={{ width: 16, height: 16, accentColor: '#059669' }}
                          />
                          <div>
                            <p style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{med.name}</p>
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{med.category} • Match: {med.confidence}</span>
                          </div>
                        </div>

                        <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.9rem' }}>
                          ₹{med.price}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {addedSuccess ? (
                  <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: '#dcfce7', borderRadius: '0.85rem', textAlign: 'center', color: '#166534', fontWeight: 800 }}>
                    ✓ Items Added to Cart! Redirecting to Dashboard...
                  </div>
                ) : (
                  <button
                    onClick={handleAddAllToCart}
                    disabled={selectedMeds.length === 0}
                    style={{
                      width: '100%',
                      padding: '0.9rem',
                      marginTop: '1.25rem',
                      borderRadius: '0.85rem',
                      border: 'none',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    <ShoppingBag style={{ width: 18, height: 18 }} />
                    <span>Add Selected ({selectedMeds.length}) to Cart & Checkout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PrescriptionReaderModal;

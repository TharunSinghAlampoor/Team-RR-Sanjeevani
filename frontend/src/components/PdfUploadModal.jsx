import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import shopService from '../api/shopService';

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1100,
    background: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  },
  dialog: {
    background: '#ffffff',
    borderRadius: '1.25rem',
    width: '100%', maxWidth: 440,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1.5px solid #e2e8f0',
    padding: '1.5rem',
    position: 'relative',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: '0.9rem',
    borderBottom: '1.5px solid #f1f5f9',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  title: { fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 },
  closeBtn: {
    width: 32, height: 32, borderRadius: '50%',
    border: '1px solid #e2e8f0', background: '#f8fafc',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  dropzone: {
    border: '2px dashed #cbd5e1', borderRadius: '1rem',
    padding: '1.5rem', textAlign: 'center', background: '#f8fafc',
    cursor: 'pointer', position: 'relative', margin: '1rem 0',
  },
  input: {
    width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.65rem',
    fontSize: '0.8rem', border: '1.5px solid #cbd5e1',
    background: '#f8fafc', color: '#0f172a', boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%', padding: '0.85rem', marginTop: '1.25rem',
    borderRadius: '0.85rem', border: 'none',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff', fontWeight: 800, fontSize: '0.88rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
  },
};

export const PdfUploadModal = ({ categories = [], onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a PDF product catalog file.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (selectedCategoryId) {
      formData.append('categoryId', selectedCategoryId);
    }

    try {
      const response = await shopService.importProductsFromPdf(formData);
      if (response.success) {
        setUploadResult(response.data);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(response.message || 'Failed to import PDF');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error uploading PDF file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.dialog}>
        <div style={s.header}>
          <div style={s.headerLeft}>
            <Upload style={{ width: 18, height: 18, color: '#10b981' }} />
            <h3 style={s.title}>Import Product Catalog PDF</h3>
          </div>
          <button style={s.closeBtn} onClick={onClose}>
            <X style={{ width: 16, height: 16, color: '#64748b' }} />
          </button>
        </div>

        {uploadResult ? (
          <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
            <CheckCircle2 style={{ width: 48, height: 48, color: '#10b981', margin: '0 auto 0.5rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Catalog Import Complete!</h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.4rem 0 1.25rem' }}>{uploadResult.message}</p>
            <button
              onClick={onClose}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '0.75rem', background: '#10b981', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}
            >
              Close & View Products
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ paddingTop: '0.75rem' }}>
            {errorMsg && (
              <div style={{ padding: '0.6rem 0.8rem', borderRadius: '0.65rem', background: '#fff1f2', border: '1px solid #fecdd3', fontSize: '0.78rem', color: '#e11d48', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Dropzone */}
            <div style={s.dropzone}>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
              />
              <FileText style={{ width: 36, height: 36, color: '#10b981', margin: '0 auto 0.4rem' }} />
              {selectedFile ? (
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{selectedFile.name}</p>
                  <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', margin: 0 }}>Click or Drag PDF Catalog File</p>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Extracts products & stock automatically</p>
                </div>
              )}
            </div>

            {/* Category Option */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                Link to Category (Optional)
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                style={s.input}
              >
                <option value="">Auto-detect / Default Category</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button type="submit" disabled={uploading} style={{ ...s.submitBtn, opacity: uploading ? 0.6 : 1 }}>
              {uploading ? (
                <span>Parsing PDF & Importing...</span>
              ) : (
                <>
                  <Upload style={{ width: 16, height: 16 }} />
                  <span>Upload & Import Products</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PdfUploadModal;

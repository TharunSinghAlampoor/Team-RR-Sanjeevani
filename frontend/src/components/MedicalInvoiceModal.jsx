import React from 'react';
import { Printer, X, ShieldCheck } from 'lucide-react';
import './MedicalInvoiceModal.css';

export function MedicalInvoiceModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNo = `INV-SJ-${order.orderId || '2026-001'}`;
  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    : new Date().toLocaleDateString('en-IN');

  const items = order.items || [];
  const subtotal = items.reduce((acc, item) => acc + Number(item.totalPrice || (item.pricePerUnit * item.quantity) || 0), 0);
  const gstTax = Math.round(subtotal * 0.12);
  const grandTotal = Number(order.totalAmount || (subtotal + gstTax));

  return (
    <div className="medical-invoice-overlay">
      <div className="medical-invoice-card">
        {/* Top Control Bar */}
        <div className="invoice-actions-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} style={{ color: '#10b981' }} />
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Tax Invoice Preview</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: '#059669',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Printer size={15} />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '0.4rem',
                color: '#ffffff',
                padding: '0.35rem',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Clean Invoice Document Sheet */}
        <div className="invoice-sheet">
          {/* Header */}
          <div className="invoice-header-row">
            <div>
              <div className="brand-logo-box">
                <img src="/sanjeevani_symbol.png" alt="" style={{ height: 28, width: 'auto' }} />
                <span className="brand-name">SANJEEVANI</span>
              </div>
              <div className="pharmacy-sub">Medical Store & Healthcare Supplier</div>
              <div className="pharmacy-sub">DL: 20B/21B-TS-HYD • GSTIN: 36AAACS1948E1Z9</div>
            </div>

            <div className="invoice-badge-box">
              <span className="invoice-title-tag">Tax Invoice</span>
              <div className="invoice-num">{invoiceNo}</div>
              <div className="invoice-date">Date: {formattedDate}</div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="invoice-details-grid">
            <div className="meta-card">
              <div className="meta-label">Billed & Delivered To</div>
              <div className="meta-val-primary">{order.customerName || 'Registered Customer'}</div>
              <div className="meta-val-sub">{order.customerEmail || 'customer@sanjeevani.com'}</div>
              <div className="meta-val-sub" style={{ marginTop: '0.2rem' }}>
                {order.shippingAddress || 'Standard Express Pharmacy Delivery, TS'}
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-label">Order Details</div>
              <div className="meta-val-primary">Order #{order.orderId}</div>
              <div className="meta-val-sub">
                Status: <strong style={{ color: '#059669' }}>{order.status || 'CONFIRMED'}</strong>
              </div>
              <div className="meta-val-sub">Payment Method: Online Prepaid</div>
            </div>
          </div>

          {/* Table */}
          <table className="invoice-items-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '50%' }}>Item Description</th>
                <th style={{ textAlign: 'center', width: '15%' }}>Qty</th>
                <th style={{ textAlign: 'right', width: '17%' }}>Unit Price</th>
                <th style={{ textAlign: 'right', width: '18%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '1.2rem' }}>
                    Prescription Medicine Item
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="item-name">{item.productName}</div>
                      <div className="item-sub">Batch: SJ-2026-B{index + 1}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>₹{Number(item.pricePerUnit || 0).toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                      ₹{Number(item.totalPrice || (item.pricePerUnit * item.quantity) || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Calculation Bottom Row */}
          <div className="invoice-bottom-grid">
            <div className="terms-note">
              <strong style={{ color: '#334155', display: 'block', marginBottom: '0.2rem' }}>Pharmacy Terms:</strong>
              1. Goods once sold are non-returnable.<br />
              2. Schedule H drugs dispensed under pharmacist supervision.<br />
              3. Computer generated invoice. No signature required.
            </div>

            <div className="totals-wrapper">
              <div className="tot-row">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="tot-row">
                <span>GST (12%):</span>
                <span>₹{gstTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="tot-row">
                <span>Delivery:</span>
                <span style={{ color: '#059669', fontWeight: 800 }}>FREE</span>
              </div>
              <div className="tot-row-grand">
                <span>Total Amount:</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="invoice-clean-footer">
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Sanjeevani Care: 1800-123-4321 • support@sanjeevani.com
            </div>

            <div className="sign-stamp">
              <div className="stamp-box">
                LICENSED PHARMACIST VERIFIED
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicalInvoiceModal;

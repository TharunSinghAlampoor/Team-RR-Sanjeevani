import React, { useState } from 'react';
import { X, PackageCheck, CheckCircle2, Calendar, Clock, MapPin, User, Download, Truck, AlertCircle, FileText, ChevronRight, Navigation, Phone, Mail, Send, Check, Copy } from 'lucide-react';
import ProductImage from './ProductImage';
import shopService from '../api/shopService';

// Shared Invoice Download Function
export const downloadOrderInvoice = (order, e) => {
  if (e) e.stopPropagation();
  if (!order || order.status === 'FAILED') {
    alert('Tax invoices cannot be issued for failed or cancelled orders.');
    return;
  }
  const invoiceWindow = window.open('', '_blank');
  if (!invoiceWindow) return;

  const createdDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const formattedDate = createdDate.toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const customerName = order.customerName || 'Valued Customer';
  const customerEmail = order.customerEmail || 'N/A';
  const customerPhone = order.customerPhone || 'N/A';
  const deliveryAddress = order.shippingAddress || 'Flat 402, Block A, Jubilee Hills, Hyderabad - 500033';
  const shippingAddress = 'Sanjeevani Central Logistics & Packing Facility, Hub #14, Industrial Zone, Hyderabad - 500032';

  const rawOrderId = String(order.orderId || 'ORD-0000');
  const cleanIdStr = rawOrderId.replace(/[^a-zA-Z0-9]/g, '');
  const paymentId = order.paymentId || order.razorpayPaymentId || `pay_${cleanIdStr}`;
  const referenceNumber = order.referenceNumber || order.razorpayOrderId || `order_REF_${cleanIdStr}`;

  // Price calculations for Order Summary breakdown matching receipt specs
  const itemsSubtotalVal = (order.items || []).reduce((acc, item) => acc + (Number(item.totalPrice) || (Number(item.pricePerUnit || 0) * (item.quantity || 1))), 0);
  const rawTotal = itemsSubtotalVal > 0 ? itemsSubtotalVal : Number(order.totalAmount || 0);
  const shippingFeeVal = 40.00;
  const isCod = (order.paymentMethod === 'COD' || order.paymentMethod === 'Cash on Delivery');
  const codFeeVal = isCod ? 8.80 : 0.00;
  const totalBeforePromoVal = rawTotal + shippingFeeVal + codFeeVal;
  const promoVal = 40.00;
  const grandTotalAmountVal = Number(order.totalAmount || 0) > 0 ? Number(order.totalAmount) : Math.max(0, totalBeforePromoVal - promoVal);

  const itemsHtml = (order.items || []).map((item, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0;">
        <div style="font-weight: 800; color: #0f172a; font-size: 14px;">${item.productName || 'Medical Equipment / Product'}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">SKU: SANJ-PROD-${item.productId || (idx + 101)}</div>
      </td>
      <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 800; color: #334155; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #475569; font-size: 14px;">₹${Number(item.pricePerUnit || 0).toFixed(2)}</td>
      <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 900; color: #059669; font-size: 14px;">₹${Number(item.totalPrice || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const originUrl = window.location.origin;
  const symbolUrl = `${originUrl}/sanjeevani_symbol.png`;
  const textUrl = `${originUrl}/sanjeevani_text_transparent.png`;

  invoiceWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Order — ${rawOrderId}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 40px; color: #0f172a; max-width: 880px; margin: 0 auto;
          background: #ffffff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
          line-height: 1.5;
        }
        .header {
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 3px solid #10b981; padding-bottom: 22px; margin-bottom: 28px;
        }
        .logo-wrap { display: flex; align-items: center; gap: 14px; }
        .logo-symbol { height: 52px; width: auto; object-fit: contain; flex-shrink: 0; }
        .logo-text-img { height: 38px; width: auto; object-fit: contain; flex-shrink: 0; }
        .order-id-badge {
          display: inline-block; font-family: monospace; font-size: 14px; font-weight: 800;
          color: #0f172a; background: #f1f5f9 !important; padding: 6px 14px; border-radius: 8px;
          border: 1px solid #cbd5e1;
          -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
        }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
        .box { background: #f8fafc !important; padding: 18px; border-radius: 12px; border: 1.5px solid #e2e8f0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .box-title { color: #059669; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
        table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 28px; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        th { background: #f1f5f9 !important; padding: 14px 16px; text-align: left; font-size: 11.5px; color: #475569; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; border-bottom: 2px solid #cbd5e1; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .footer { text-align: center; font-size: 12.5px; color: #64748b; margin-top: 40px; border-top: 1.5px dashed #cbd5e1; padding-top: 24px; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-wrap">
          <img src="${symbolUrl}" alt="Sanjeevani Symbol" class="logo-symbol" />
          <img src="${textUrl}" alt="Sanjeevani Healthcare" class="logo-text-img" />
        </div>

        <div style="text-align: right;">
          <div class="order-id-badge">${rawOrderId}</div>
        </div>
      </div>

      <div class="grid">
        <div class="box">
          <div class="box-title">🏬 SOLD BY (SELLER ORIGIN)</div>
          <div style="font-weight: 800; font-size: 14px; color: #0f172a;">Sanjeevani Healthcare Pvt. Ltd.</div>
          <div style="font-size: 12.5px; color: #475569; margin-top: 4px; line-height: 1.45;">${shippingAddress}</div>
          <div style="font-size: 11.5px; color: #0284c7; margin-top: 8px; font-weight: 700;">GSTIN: 36AAACS1234F1Z9 • Verified Seller</div>
        </div>

        <div class="box">
          <div class="box-title">🚚 SHIP TO (CUSTOMER DETAILS & ADDRESS)</div>
          <div style="font-weight: 800; font-size: 14px; color: #0f172a;">${customerName}</div>
          <div style="font-size: 12.5px; color: #475569; margin-top: 4px;">Email: ${customerEmail}</div>
          <div style="font-size: 12.5px; color: #475569; margin-top: 2px;">Phone: ${customerPhone}</div>
          <div style="font-size: 12.5px; color: #1e293b; font-weight: 700; margin-top: 8px; line-height: 1.45; border-top: 1px dashed #cbd5e1; padding-top: 8px;">Address: ${deliveryAddress}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="display: grid; grid-template-columns: 1fr 360px; gap: 20px; margin-top: 20px; align-items: start;">
        <!-- Left Side: Payment Details -->
        <div class="box">
          <div class="box-title">💳 PAYMENT DETAILS</div>
          <div style="font-size: 12.5px; color: #334155; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
              <span style="color: #64748b; font-weight: 600;">Order ID:</span>
              <strong style="font-family: monospace; color: #0f172a; font-weight: 800;">${rawOrderId}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
              <span style="color: #64748b; font-weight: 600;">Payment Method:</span>
              <strong style="color: #0f172a; font-weight: 700;">${order.paymentMethod || 'Razorpay Verified'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
              <span style="color: #64748b; font-weight: 600;">Razorpay Payment ID:</span>
              <strong style="font-family: monospace; color: #059669; font-weight: 800;">${paymentId}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
              <span style="color: #64748b; font-weight: 600;">Razorpay Order ID:</span>
              <strong style="font-family: monospace; color: #0284c7; font-weight: 800;">${referenceNumber}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 2px;">
              <span style="color: #64748b; font-weight: 600;">Order Date:</span>
              <strong style="color: #334155; font-weight: 700;">${formattedDate}</strong>
            </div>
          </div>
        </div>

        <!-- Right Side: Order Summary -->
        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Order Summary</div>
          
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #334155; margin-bottom: 6px;">
            <span>Item(s) Subtotal:</span>
            <span style="font-weight: 700; color: #0f172a;">₹${itemsSubtotalVal.toFixed(2)}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #334155; margin-bottom: 6px;">
            <span>Shipping:</span>
            <span style="font-weight: 700; color: #0f172a;">₹${shippingFeeVal.toFixed(2)}</span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #334155; margin-bottom: 6px;">
            <span>Cash/Pay on Delivery fee:</span>
            <span style="font-weight: 700; color: #0f172a;">₹${codFeeVal.toFixed(2)}</span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #0f172a; font-weight: 800; padding: 6px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; margin: 6px 0;">
            <span>Total:</span>
            <span>₹${totalBeforePromoVal.toFixed(2)}</span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #dc2626; font-weight: 700; margin-bottom: 8px;">
            <span>Promotion Applied:</span>
            <span>-₹${promoVal.toFixed(2)}</span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 16px; color: #0f172a; font-weight: 900; border-top: 2px solid #0f172a; padding-top: 10px;">
            <span>Grand Total:</span>
            <span style="color: #059669; font-size: 18px;">₹${grandTotalAmountVal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="footer">
        <p style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 4px;">Thank you for choosing Sanjeevani Healthcare!</p>
        <p style="margin: 0;">For official order assistance, contact <strong>support@sanjeevani.com</strong> or call toll-free <strong>18001234321</strong>.</p>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `);
  invoiceWindow.document.close();
};

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1100,
    background: 'rgba(15, 23, 42, 0.70)',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  },
  dialog: {
    background: '#ffffff',
    borderRadius: '1.25rem',
    width: '100%', maxWidth: 720,
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1.5px solid #e2e8f0',
    padding: '1.25rem',
    position: 'relative',
    WebkitOverflowScrolling: 'touch',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: '0.9rem',
    borderBottom: '1.5px solid #f1f5f9',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  title: { fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 },
  closeBtn: {
    width: 36, height: 36, borderRadius: '50%',
    border: '1px solid #e2e8f0', background: '#f8fafc',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  orderCard: {
    borderRadius: '0.95rem',
    background: '#ffffff',
    border: '1.5px solid #e2e8f0',
    margin: '0.85rem 0',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
  },
  orderHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 1.1rem',
    background: '#ffffff',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  badgeSuccess: {
    padding: '0.25rem 0.6rem', borderRadius: 99,
    fontSize: '0.72rem', fontWeight: 800,
    background: '#d1fae5', color: '#065f46',
    display: 'flex', alignItems: 'center', gap: '0.3rem',
  },
  badgeFailed: {
    padding: '0.25rem 0.6rem', borderRadius: 99,
    fontSize: '0.72rem', fontWeight: 800,
    background: '#fef2f2', color: '#dc2626',
    display: 'flex', alignItems: 'center', gap: '0.3rem',
  },
  addressBox: {
    padding: '0.65rem 1rem',
    background: '#f8fafc',
    borderTop: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    fontSize: '0.75rem',
  },
  viewDetailBtn: {
    padding: '0.4rem 0.8rem',
    borderRadius: '0.5rem',
    background: '#f0fdf4',
    border: '1px solid #a7f3d0',
    color: '#047857',
    fontWeight: 800,
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    cursor: 'pointer',
  },
};

const detailStyles = {
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1.25rem 1.6rem',
    borderBottom: '1.5px solid #e2e8f0',
    background: '#ffffff',
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: '50%',
    border: '1.5px solid #cbd5e1', background: '#f8fafc',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s ease', flexShrink: 0,
  },
  amazonCard: {
    background: '#ffffff',
    borderRadius: '1rem',
    border: '1.5px solid #e2e8f0',
    padding: '1.35rem',
    marginBottom: '1.2rem',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
  },
  amazonCardTitle: {
    fontSize: '1.05rem', fontWeight: 900, color: '#0f172a',
    marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  badgeSuccess: {
    padding: '0.3rem 0.75rem', borderRadius: 99,
    fontSize: '0.8rem', fontWeight: 800,
    background: '#d1fae5', color: '#065f46',
  },
  badgeFailed: {
    padding: '0.3rem 0.75rem', borderRadius: 99,
    fontSize: '0.8rem', fontWeight: 800,
    background: '#fef2f2', color: '#dc2626',
  },
  stepperTrack: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#f8fafc', padding: '0.9rem 1.25rem', borderRadius: '0.85rem',
    border: '1.5px solid #f1f5f9', margin: '0.85rem 0',
  },
  stepItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
  },
  stepActive: {
    width: 28, height: 28, borderRadius: '50%', background: '#10b981', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 900,
  },
  stepPending: {
    width: 28, height: 28, borderRadius: '50%', background: '#e2e8f0', color: '#94a3b8',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 900,
  },
  stepText: { fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' },
  itemRow: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '0.85rem 0', borderBottom: '1px solid #f1f5f9',
  },
  imgWrap: {
    width: 56, height: 56, borderRadius: '0.65rem', background: '#f8fafc',
    border: '1.5px solid #e2e8f0', padding: '0.35rem', flexShrink: 0,
  },
  invoiceBtn: {
    padding: '0.75rem 1.35rem', borderRadius: '0.75rem',
    border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff', fontWeight: 800, fontSize: '0.92rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
  },
  secondaryBtn: {
    padding: '0.75rem 1.4rem', borderRadius: '0.75rem',
    border: '1.5px solid #cbd5e1', background: '#ffffff',
    color: '#334155', fontWeight: 800, fontSize: '0.92rem',
    cursor: 'pointer', transition: 'all 0.2s ease',
  },
};

export const SelectedOrderDetailModal = ({ order, onClose }) => {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  if (!order) return null;

  const rawOrderId = String(order.orderId || 'ORD-0000');
  const createdDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const formattedDate = createdDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = createdDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const isFailed = order.status === 'FAILED';
  const customerName = order.customerName || 'Valued Customer';
  const customerEmail = order.customerEmail || 'N/A';
  const customerPhone = order.customerPhone || 'N/A';
  const deliveryAddress = order.shippingAddress || 'Flat 402, Block A, Jubilee Hills, Hyderabad - 500033';
  const shippingAddress = 'Sanjeevani Central Logistics & Packing Facility, Hub #14, Industrial Zone, Hyderabad - 500032';

  const cleanIdStr = rawOrderId.replace(/[^a-zA-Z0-9]/g, '');
  const paymentId = order.paymentId || order.razorpayPaymentId || `pay_${cleanIdStr}`;
  const referenceNumber = order.referenceNumber || order.razorpayOrderId || `order_REF_${cleanIdStr}`;
  const handleOpenInvoiceTab = (e) => {
    if (e) e.stopPropagation();
    downloadOrderInvoice(order, e);
  };

  const handleCopyOrderId = (e) => {
    if (e) e.stopPropagation();
    try {
      navigator.clipboard.writeText(rawOrderId);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    } catch (err) {
      console.error('Failed to copy Order ID:', err);
    }
  };

  // Robust items array parsing
  let orderItems = [];
  if (Array.isArray(order.items)) {
    orderItems = order.items;
  } else if (typeof order.items === 'string') {
    try { orderItems = JSON.parse(order.items); } catch { orderItems = []; }
  } else if (order.itemsJson && typeof order.itemsJson === 'string') {
    try { orderItems = JSON.parse(order.itemsJson); } catch { orderItems = []; }
  }

  // Order summary calculations
  const itemsSubtotalVal = orderItems.reduce((acc, item) => acc + (Number(item.totalPrice) || (Number(item.pricePerUnit || 0) * (item.quantity || 1))), 0);
  const rawTotal = itemsSubtotalVal > 0 ? itemsSubtotalVal : Number(order.totalAmount || 0);
  const shippingFeeVal = 40.00;
  const isCod = (order.paymentMethod === 'COD' || order.paymentMethod === 'Cash on Delivery');
  const codFeeVal = isCod ? 8.80 : 0.00;
  const totalBeforePromoVal = rawTotal + shippingFeeVal + codFeeVal;
  const promoVal = 40.00;
  const grandTotalAmountVal = Number(order.totalAmount || 0) > 0 ? Number(order.totalAmount) : Math.max(0, totalBeforePromoVal - promoVal);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', background: '#ffffff' }}>
      {/* Modal Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem', borderBottom: '1.5px solid #e2e8f0', background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            style={{
              padding: '0.45rem 0.85rem', borderRadius: '0.55rem',
              border: '1.5px solid #cbd5e1', background: '#ffffff',
              color: '#0f172a', fontWeight: 800, fontSize: '0.84rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}
            onClick={onClose}
          >
            ← Back to Orders
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Order Details
              </h3>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.2rem 0.6rem', borderRadius: '0.45rem',
                  background: '#f1f5f9', border: '1px solid #cbd5e1',
                  fontSize: '0.82rem', fontWeight: 800, color: '#0f172a',
                  fontFamily: 'monospace', cursor: 'pointer',
                }}
                onClick={handleCopyOrderId}
                title="Click to copy Order ID"
              >
                <span>#{rawOrderId}</span>
                {copiedOrderId ? <Check style={{ width: 13, height: 13, color: '#059669' }} /> : <Copy style={{ width: 13, height: 13, color: '#64748b' }} />}
              </span>
            </div>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              Ordered on {formattedDate} at {formattedTime}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {!isFailed && (
            <button style={detailStyles.invoiceBtn} onClick={handleOpenInvoiceTab}>
              <Download style={{ width: 15, height: 15 }} />
              Download Invoice
            </button>
          )}
          <button style={s.closeBtn} onClick={onClose} title="Close order details">
            <X style={{ width: 18, height: 18, color: '#64748b' }} />
          </button>
        </div>
      </div>

      {/* Modal Scrollable Body */}
      <div style={{ padding: '1.25rem', background: '#f8fafc', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', WebkitOverflowScrolling: 'touch' }}>
        
        {/* 1. Product Details */}
        <div style={detailStyles.amazonCard}>
          <div style={detailStyles.amazonCardTitle}>
            <span>Product Details ({orderItems.length} Item{orderItems.length === 1 ? '' : 's'})</span>
          </div>
          {orderItems.map((item, idx) => (
            <div key={item.id || item.productId || idx} style={detailStyles.itemRow}>
              <div style={detailStyles.imgWrap}>
                <ProductImage src={item.productImage} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 800, color: '#0f172a', margin: 0, fontSize: '1rem', lineHeight: 1.35 }}>
                  {item.productName}
                </p>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0.25rem 0 0', fontWeight: 600 }}>
                  Qty: {item.quantity} • Unit Price: ₹{Number(item.pricePerUnit || 0).toFixed(2)}
                </p>
                <p style={{ fontSize: '1.05rem', fontWeight: 900, color: '#059669', margin: '0.35rem 0 0' }}>
                  ₹{Number(item.totalPrice || 0).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Ship To (Customer Details & Delivery Address) */}
        <div style={detailStyles.amazonCard}>
          <div style={detailStyles.amazonCardTitle}>
            <span>Ship To</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="responsive-order-grid">
            {/* Recipient Details */}
            <div>
              <p style={{ margin: '0 0 0.45rem', fontSize: '0.8rem', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User style={{ width: 15, height: 15 }} />
                Recipient Information
              </p>
              <p style={{ fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem', fontSize: '1rem' }}>
                {customerName}
              </p>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.86rem', lineHeight: 1.45, fontWeight: 600 }}>
                Email: {customerEmail}
              </p>
              {customerPhone && (
                <p style={{ margin: '0.25rem 0 0', color: '#475569', fontSize: '0.86rem', fontWeight: 600 }}>
                  Phone: {customerPhone}
                </p>
              )}
            </div>

            {/* Delivery Address */}
            <div style={{ borderLeft: '1.5px solid #e2e8f0', paddingLeft: '1.25rem' }}>
              <p style={{ margin: '0 0 0.45rem', fontSize: '0.8rem', fontWeight: 900, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Navigation style={{ width: 15, height: 15 }} />
                Delivery Address
              </p>
              <p style={{ margin: 0, color: '#334155', fontSize: '0.9rem', lineHeight: 1.5, fontWeight: 600 }}>
                {deliveryAddress}
              </p>
              <p style={{ margin: '0.4rem 0 0', color: '#059669', fontSize: '0.8rem', fontWeight: 800 }}>
                Express Doorstep Delivery
              </p>
            </div>
          </div>
        </div>

        {/* 3. Payment Details */}
        <div style={detailStyles.amazonCard}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }} className="responsive-order-grid">
            {/* Left: Payment Info */}
            <div>
              <div style={detailStyles.amazonCardTitle}>
                <span>Payment Details</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontWeight: 700 }}>Order ID:</span>
                  <span
                    style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 900, background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '0.45rem', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                    onClick={handleCopyOrderId}
                    title="Click to copy Order ID"
                  >
                    {order.orderId}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontWeight: 700 }}>Payment Method:</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{order.paymentMethod || 'Razorpay Verified'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontWeight: 700 }}>Razorpay Payment ID:</span>
                  <span style={{ fontFamily: 'monospace', color: '#059669', fontWeight: 800 }}>{paymentId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 700 }}>Razorpay Order ID:</span>
                  <span style={{ fontFamily: 'monospace', color: '#0284c7', fontWeight: 800 }}>{referenceNumber}</span>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '0.85rem', padding: '1.1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <h4 style={{ margin: '0 0 0.85rem', fontSize: '1rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.45rem' }}>
                Order Summary
              </h4>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#334155', marginBottom: '0.45rem' }}>
                <span>Item(s) Subtotal:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{itemsSubtotalVal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#334155', marginBottom: '0.45rem' }}>
                <span>Shipping:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{shippingFeeVal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#334155', marginBottom: '0.55rem' }}>
                <span style={{ lineHeight: 1.25 }}>Cash/Pay on Delivery<br />fee:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{codFeeVal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#0f172a', fontWeight: 800, padding: '0.45rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '0.45rem' }}>
                <span>Total:</span>
                <span>₹{totalBeforePromoVal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#dc2626', fontWeight: 700, marginBottom: '0.65rem' }}>
                <span>Promotion Applied:</span>
                <span>-₹{promoVal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', color: '#0f172a', fontWeight: 900, borderTop: '2px solid #0f172a', paddingTop: '0.65rem' }}>
                <span>Grand Total:</span>
                <span style={{ color: '#059669', fontSize: '1.15rem' }}>₹{grandTotalAmountVal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Tracking */}
        <div style={detailStyles.amazonCard}>
          <div style={detailStyles.amazonCardTitle}>
            <span style={{ color: isFailed ? '#dc2626' : '#059669', fontSize: '1.05rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {isFailed ? <AlertCircle style={{ width: 20, height: 20 }} /> : <CheckCircle2 style={{ width: 20, height: 20 }} />}
              {isFailed ? 'Payment Failed — Order Suspended' : 'Order Tracking & Delivery Status'}
            </span>
            <span style={isFailed ? detailStyles.badgeFailed : detailStyles.badgeSuccess}>
              {order.status || 'SUCCESS'}
            </span>
          </div>

          {!isFailed && (
            <div style={{ position: 'relative', margin: '1rem 0' }}>
              <div style={{ position: 'absolute', top: 14, left: '8%', right: '8%', height: 3, background: '#cbd5e1', zIndex: 1 }} />
              <div style={{ position: 'absolute', top: 14, left: '8%', width: '60%', height: 3, background: '#10b981', zIndex: 2 }} />

              <div style={{ position: 'relative', zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={detailStyles.stepItem}>
                  <div style={detailStyles.stepActive}>✓</div>
                  <span style={detailStyles.stepText}>Ordered</span>
                </div>
                <div style={detailStyles.stepItem}>
                  <div style={detailStyles.stepActive}>✓</div>
                  <span style={detailStyles.stepText}>Paid</span>
                </div>
                <div style={detailStyles.stepItem}>
                  <div style={detailStyles.stepActive}>✓</div>
                  <span style={detailStyles.stepText}>Packed</span>
                </div>
                <div style={detailStyles.stepItem}>
                  <div style={detailStyles.stepPending}>4</div>
                  <span style={{ ...detailStyles.stepText, color: '#94a3b8' }}>Out for Delivery</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ padding: '0.85rem 1.4rem', borderTop: '1.5px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexShrink: 0 }}>
        <button style={detailStyles.secondaryBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};


const drawerStyles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1100,
    background: 'rgba(15, 23, 42, 0.60)',
    backdropFilter: 'blur(6px)',
    display: 'flex', justifyContent: 'flex-end',
  },
  drawerPanel: {
    width: '100%', maxWidth: 440,
    background: '#ffffff', height: '100vh',
    display: 'flex', flexDirection: 'column',
    boxShadow: '-8px 0 40px rgba(0, 0, 0, 0.2)',
    borderLeft: '1.5px solid #e2e8f0',
    overflowY: 'hidden', position: 'relative',
    animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  drawerHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1.2rem 1.4rem 1rem',
    borderBottom: '1.5px solid #f1f5f9',
    background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
    flexShrink: 0,
  },
  scrollArea: {
    flex: 1, overflowY: 'auto',
    padding: '1rem 1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.85rem',
    WebkitOverflowScrolling: 'touch',
  },
  detailOverlay: {
    position: 'fixed', inset: 0, zIndex: 1400,
    background: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  },
};

export const OrdersModal = ({ orders = [], onClose, initialOrderId = null }) => {
  // Sort orders from Latest / Newest first to Oldest last
  const sortedOrders = [...orders].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;

    const idA = Number(String(a.orderId || '').replace(/[^0-9]/g, '')) || 0;
    const idB = Number(String(b.orderId || '').replace(/[^0-9]/g, '')) || 0;
    return idB - idA;
  });

  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(() => {
    if (initialOrderId) {
      const match = sortedOrders.find(o => String(o.orderId) === String(initialOrderId));
      if (match) return match;
    }
    return null;
  });

  // If user selected an order, render the Order Details Modal centered on screen
  if (selectedOrderForDetail) {
    return (
      <div
        style={drawerStyles.detailOverlay}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedOrderForDetail(null);
          }
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            width: '94%', maxWidth: 800,
            height: '90vh', maxHeight: '90vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.40)',
            border: '1.5px solid #cbd5e1',
            overflow: 'hidden',
            position: 'relative',
            animation: 'fadeInScale 0.25s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <SelectedOrderDetailModal
            order={selectedOrderForDetail}
            onClose={() => setSelectedOrderForDetail(null)}
          />
        </div>
        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @media (max-width: 768px) {
            .responsive-order-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    );
  }

  // Default view: Right Sidebar Drawer listing all orders
  return (
    <div style={drawerStyles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={drawerStyles.drawerPanel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={drawerStyles.drawerHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <PackageCheck style={{ width: 22, height: 22, color: '#10b981' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              My Orders
            </h3>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#10b981', color: '#fff', borderRadius: 99, padding: '0.15rem 0.55rem' }}>
              {sortedOrders.length}
            </span>
          </div>
          <button style={s.closeBtn} onClick={onClose} title="Close orders drawer">
            <X style={{ width: 18, height: 18, color: '#64748b' }} />
          </button>
        </div>

        {/* Orders Scrollable Drawer Body */}
        <div style={drawerStyles.scrollArea}>
          {sortedOrders.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
              <PackageCheck style={{ width: 56, height: 56, strokeWidth: 1.5, margin: '0 auto 0.75rem', color: '#cbd5e1' }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#475569', margin: 0 }}>No order history</p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.3rem 0 0' }}>Your placed orders will show up here.</p>
            </div>
          ) : (
            sortedOrders.map((order) => {
              const createdDate = order.createdAt ? new Date(order.createdAt) : new Date();
              const isFailed = order.status === 'FAILED';
              const deliveryAddress = order.shippingAddress || 'Flat 402, Block A, Jubilee Hills, Hyderabad - 500033';

              return (
                <div
                  key={order.orderId}
                  style={{
                    borderRadius: '0.95rem',
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOrderForDetail(order);
                  }}
                >
                  {/* Header Row */}
                  <div style={{ padding: '0.95rem 1.1rem', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0f172a' }}>
                          {order.orderId}
                        </span>
                        <span style={isFailed ? s.badgeFailed : s.badgeSuccess}>
                          {isFailed ? <AlertCircle style={{ width: 12, height: 12 }} /> : <CheckCircle2 style={{ width: 12, height: 12 }} />}
                          {order.status || 'SUCCESS'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.3rem', fontWeight: 700 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar style={{ width: 12, height: 12, color: '#059669' }} />
                          {createdDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span>{createdDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.02rem', fontWeight: 900, color: isFailed ? '#dc2626' : '#059669', display: 'block' }}>
                        ₹{Number(order.totalAmount || 0).toFixed(2)}
                      </span>
                      <button
                        style={{
                          marginTop: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: '0.45rem',
                          border: '1px solid #bae6fd', background: '#f0f9ff', color: '#0284c7',
                          fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrderForDetail(order);
                        }}
                      >
                        <span>Details</span>
                        <ChevronRight style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  </div>

                  {/* Purchased Items Thumbnails */}
                  <div style={{ padding: '0.55rem 1.1rem', background: '#fafafa', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto' }}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '0.45rem', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                        <div style={{ width: 24, height: 24, flexShrink: 0 }}>
                          <ProductImage src={item.productImage} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.productName} (x{item.quantity})
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Destination & Quick PDF Invoice */}
                  <div style={{ padding: '0.6rem 1.1rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Navigation style={{ width: 13, height: 13, color: '#10b981', flexShrink: 0 }} />
                      <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis' }}>{deliveryAddress}</span>
                    </div>

                    {!isFailed && (
                      <button
                        style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}
                        onClick={(e) => downloadOrderInvoice(order, e)}
                        title="Download Tax Invoice"
                      >
                        <Download style={{ width: 12, height: 12 }} />
                        <span>Download Invoice</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 768px) {
          .responsive-order-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default OrdersModal;

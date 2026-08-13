import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PackageCheck, CheckCircle2, Calendar, Clock, MapPin, User, Download, Truck, AlertCircle, FileText, ChevronRight, Navigation, Phone, Mail, Send, Check, Copy, Sparkles, ShieldCheck } from 'lucide-react';
import ProductImage from './ProductImage';
import shopService from '../api/shopService';
import { parseExactDate, formatExactDateTime, formatExactDateStr, formatExactTimeStr } from '../utils/dateUtils';

// Helper to load jsPDF library dynamically from CDN
const loadJsPdf = () => {
  return new Promise((resolve, reject) => {
    if (window.jspdf && window.jspdf.jsPDF) {
      resolve(window.jspdf.jsPDF);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve(window.jspdf.jsPDF);
      } else {
        reject(new Error('jsPDF not found'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load jsPDF library'));
    document.head.appendChild(script);
  });
};

// Helper to convert Image URL to Base64 Data URL for jsPDF
const getBase64ImageFromUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (err) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
  });
};

// Shared Invoice Download Function (Native Vector .PDF file direct download)
export const downloadOrderInvoice = async (order, e) => {
  if (e) e.stopPropagation();
  if (!order || order.status === 'FAILED') {
    alert('Tax invoices cannot be issued for failed or cancelled orders.');
    return;
  }

  const createdDate = parseExactDate(order.createdAt);
  const formattedDate = formatExactDateTime(createdDate);

  const customerName = order.customerName || 'Valued Customer';
  const customerEmail = order.customerEmail || 'N/A';
  const customerPhone = order.customerPhone || 'N/A';
  const deliveryAddress = order.shippingAddress || 'Flat 402, Block A, Jubilee Hills, Hyderabad - 500033';

  const rawOrderId = String(order.orderId || 'ORD-0000');
  const cleanIdStr = rawOrderId.replace(/[^a-zA-Z0-9]/g, '');
  const paymentId = order.paymentId || order.razorpayPaymentId || `pay_${cleanIdStr}`;
  const referenceNumber = order.referenceNumber || order.razorpayOrderId || `order_REF_${cleanIdStr}`;

  // Price calculations
  const itemsSubtotalVal = (order.items || []).reduce((acc, item) => acc + (Number(item.totalPrice) || (Number(item.pricePerUnit || 0) * (item.quantity || 1))), 0);
  const rawTotal = itemsSubtotalVal > 0 ? itemsSubtotalVal : Number(order.totalAmount || 0);
  const shippingFeeVal = 40.00;
  const isCod = (order.paymentMethod === 'COD' || order.paymentMethod === 'Cash on Delivery');
  const codFeeVal = isCod ? 8.80 : 0.00;
  const totalBeforePromoVal = rawTotal + shippingFeeVal + codFeeVal;
  const promoVal = 40.00;
  const grandTotalAmountVal = Number(order.totalAmount || 0) > 0 ? Number(order.totalAmount) : Math.max(0, totalBeforePromoVal - promoVal);

  const originUrl = window.location.origin;
  const symbolUrl = `${originUrl}/sanjeevani_symbol.png`;
  const textUrl = `${originUrl}/sanjeevani_text_transparent.png`;

  // Preload logo images as base64 for PDF embedding
  const [symbolBase64, textBase64] = await Promise.all([
    getBase64ImageFromUrl(symbolUrl),
    getBase64ImageFromUrl(textUrl)
  ]);

  try {
    const JsPdfClass = await loadJsPdf();
    const doc = new JsPdfClass({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    // Top Emerald accent line
    doc.setFillColor(16, 185, 129);
    doc.rect(14, 12, 182, 2.5, 'F');

    // Brand Logo Images or Styled Text Header
    let textX = 14;
    if (symbolBase64) {
      doc.addImage(symbolBase64, 'PNG', 14, 16, 11, 11);
      textX = 27;
    }
    if (textBase64) {
      doc.addImage(textBase64, 'PNG', textX, 17, 45, 9);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text('SANJEEVANI HEALTHCARE', textX, 23);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Official Tax Invoice & Order Receipt', textX, 28);

    // Order ID Pill
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(138, 15, 58, 13, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(138, 15, 58, 13, 2, 2, 'S');

    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(rawOrderId, 167, 23, { align: 'center' });

    // Horizontal Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, 33, 196, 33);

    // Left Box - Sold By
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 37, 88, 45, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 37, 88, 45, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(5, 150, 105);
    doc.text('SOLD BY (SELLER ORIGIN)', 18, 43);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Sanjeevani Healthcare Pvt. Ltd.', 18, 49);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const sellerAddrText = 'Sanjeevani Central Logistics & Packing Hub #14, Industrial Zone, Hyderabad - 500032';
    const splitSeller = doc.splitTextToSize(sellerAddrText, 80);
    doc.text(splitSeller, 18, 54);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(2, 132, 199);
    doc.text('GSTIN: 36AAACS1234F1Z9 • Verified Seller', 18, 76);

    // Right Box - Ship To
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(108, 37, 88, 45, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(108, 37, 88, 45, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(5, 150, 105);
    doc.text('SHIP TO (CUSTOMER DETAILS)', 112, 43);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(String(customerName), 112, 49);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Email: ${String(customerEmail)}`, 112, 54);
    doc.text(`Phone: ${String(customerPhone)}`, 112, 59);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    const shipAddrText = `Address: ${deliveryAddress}`;
    const splitShipAddr = doc.splitTextToSize(shipAddrText, 80);
    doc.text(splitShipAddr, 112, 64);

    // Table Header
    let startY = 88;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, startY, 182, 8, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.line(14, startY + 8, 196, startY + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('ITEM DESCRIPTION', 18, startY + 5.5);
    doc.text('QTY', 110, startY + 5.5, { align: 'center' });
    doc.text('UNIT PRICE', 145, startY + 5.5, { align: 'right' });
    doc.text('TOTAL AMOUNT', 192, startY + 5.5, { align: 'right' });

    // Table Rows
    let currentY = startY + 14;
    const itemsList = order.items || [];
    if (itemsList.length === 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('Healthcare Supplies & Medical Equipment', 18, currentY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text('1', 110, currentY, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Rs. ${rawTotal.toFixed(2)}`, 145, currentY, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(5, 150, 105);
      doc.text(`Rs. ${rawTotal.toFixed(2)}`, 192, currentY, { align: 'right' });
      currentY += 10;
    } else {
      itemsList.forEach((item, idx) => {
        if (currentY > 230) return;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(String(item.productName || 'Medical Equipment').substring(0, 42), 18, currentY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`SKU: SANJ-PROD-${item.productId || (idx + 101)}`, 18, currentY + 4);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(String(item.quantity || 1), 110, currentY + 2, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`Rs. ${Number(item.pricePerUnit || 0).toFixed(2)}`, 145, currentY + 2, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(5, 150, 105);
        doc.text(`Rs. ${Number(item.totalPrice || 0).toFixed(2)}`, 192, currentY + 2, { align: 'right' });

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(14, currentY + 7, 196, currentY + 7);

        currentY += 11;
      });
    }

    // Payment Details & Order Summary (Snaps cleanly under table)
    const summaryY = currentY + 8;

    // Left Box - Payment Details
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, summaryY, 95, 46, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, summaryY, 95, 46, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(5, 150, 105);
    doc.text('PAYMENT DETAILS', 18, summaryY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Order ID:', 18, summaryY + 12);
    doc.setFont('courier', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(rawOrderId, 104, summaryY + 12, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Payment Method:', 18, summaryY + 18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(String(order.paymentMethod || 'Razorpay Verified'), 104, summaryY + 18, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Razorpay Payment ID:', 18, summaryY + 24);
    doc.setFont('courier', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(String(paymentId).substring(0, 18), 104, summaryY + 24, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Razorpay Order ID:', 18, summaryY + 30);
    doc.setFont('courier', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text(String(referenceNumber).substring(0, 18), 104, summaryY + 30, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Order Date:', 18, summaryY + 36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(formattedDate, 104, summaryY + 36, { align: 'right' });

    // Right Box - Order Summary
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(115, summaryY, 81, 46, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(115, summaryY, 81, 46, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Order Summary', 119, summaryY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    doc.text('Item Subtotal:', 119, summaryY + 12);
    doc.text(`Rs. ${itemsSubtotalVal.toFixed(2)}`, 191, summaryY + 12, { align: 'right' });

    doc.text('Shipping:', 119, summaryY + 17);
    doc.text(`Rs. ${shippingFeeVal.toFixed(2)}`, 191, summaryY + 17, { align: 'right' });

    doc.text('COD Fee:', 119, summaryY + 22);
    doc.text(`Rs. ${codFeeVal.toFixed(2)}`, 191, summaryY + 22, { align: 'right' });

    doc.text('Promotion:', 119, summaryY + 27);
    doc.setTextColor(220, 38, 38);
    doc.text(`-Rs. ${promoVal.toFixed(2)}`, 191, summaryY + 27, { align: 'right' });

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.4);
    doc.line(119, summaryY + 31, 192, summaryY + 31);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Grand Total:', 119, summaryY + 39);

    doc.setFontSize(10.5);
    doc.setTextColor(5, 150, 105);
    doc.text(`Rs. ${grandTotalAmountVal.toFixed(2)}`, 191, summaryY + 39, { align: 'right' });

    // Footer
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(14, 272, 196, 272);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Thank you for choosing Sanjeevani Healthcare!', 105, 278, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('For official order assistance, contact support@sanjeevani.com or call toll-free 18001234321.', 105, 283, { align: 'center' });

    // Save Native Vector PDF File directly
    doc.save(`Sanjeevani_Invoice_${rawOrderId}.pdf`);
  } catch (err) {
    console.error('jsPDF generation failed:', err);
    alert('Failed to generate PDF invoice directly. Please try again.');
  }
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
    display: 'flex', alignItems: 'center', gap: '1.1rem',
    padding: '0.95rem 0', borderBottom: '1px solid #f1f5f9',
  },
  imgWrap: {
    width: 64, height: 64, borderRadius: '0.85rem', background: '#f8fafc',
    border: '1.5px solid #e2e8f0', padding: '0.4rem', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  invoiceBtn: {
    padding: '0.7rem 1.35rem', borderRadius: '0.85rem',
    border: 'none', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: '#ffffff', fontWeight: 800, fontSize: '0.88rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem',
    boxShadow: '0 6px 20px rgba(5, 150, 105, 0.35)',
    transition: 'all 0.2s ease',
    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
  },
  secondaryBtn: {
    padding: '0.7rem 1.4rem', borderRadius: '0.85rem',
    border: '1.5px solid #cbd5e1', background: '#ffffff',
    color: '#334155', fontWeight: 800, fontSize: '0.88rem',
    cursor: 'pointer', transition: 'all 0.2s ease',
    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', background: '#ffffff', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      {/* Modal Header Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '0.95rem 1.1rem', borderBottom: '1.5px solid #e2e8f0', background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)', flexShrink: 0 }}>
        {/* Top Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button
            style={{
              padding: '0.4rem 0.75rem', borderRadius: '0.55rem',
              border: '1.5px solid #cbd5e1', background: '#ffffff',
              color: '#0f172a', fontWeight: 800, fontSize: '0.8rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}
            onClick={onClose}
          >
            ← Back to Orders
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {!isFailed && (
              <button style={{ ...detailStyles.invoiceBtn, padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} onClick={handleOpenInvoiceTab}>
                <Download style={{ width: 14, height: 14 }} />
                <span>Invoice</span>
              </button>
            )}
            <button style={s.closeBtn} onClick={onClose} title="Close order details">
              <X style={{ width: 18, height: 18, color: '#64748b' }} />
            </button>
          </div>
        </div>

        {/* Order Details Subhead */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Order Details
            </h3>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
              Ordered on {formattedDate} at {formattedTime}
            </p>
          </div>

          <motion.span
            whileHover={{ scale: 1.04, background: '#e2e8f0' }}
            whileTap={{ scale: 0.96 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.22rem 0.65rem', borderRadius: '0.65rem',
              background: '#f8fafc', border: '1.5px solid #cbd5e1',
              fontSize: '0.82rem', fontWeight: 800, color: '#0f172a',
              letterSpacing: '0.02em', cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s ease',
            }}
            onClick={handleCopyOrderId}
            title="Click to copy Order ID"
          >
            <span>{rawOrderId}</span>
            {copiedOrderId ? <Check style={{ width: 12, height: 12, color: '#059669' }} /> : <Copy style={{ width: 12, height: 12, color: '#64748b' }} />}
          </motion.span>
        </div>
      </div>

      {/* Modal Scrollable Body */}
      <div style={{ padding: '1.25rem', background: '#f8fafc', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', WebkitOverflowScrolling: 'touch' }}>
        
        {/* 1. Product Details */}
        <div style={detailStyles.amazonCard}>
          <div style={detailStyles.amazonCardTitle}>
            <span>Product Details ({orderItems.length} Item{orderItems.length === 1 ? '' : 's'})</span>
          </div>
          {orderItems.map((item, idx) => {
            const itemImg = item.productImage || item.product?.imageUrl || item.imageUrl || item.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';
            const itemName = item.productName || item.product?.name || item.name || 'Healthcare Product';
            return (
              <div key={item.id || item.productId || idx} style={detailStyles.itemRow}>
                <div style={detailStyles.imgWrap}>
                  <ProductImage src={itemImg} alt={itemName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 800, color: '#0f172a', margin: 0, fontSize: '1rem', lineHeight: 1.35 }}>
                    {itemName}
                  </p>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0.25rem 0 0', fontWeight: 600 }}>
                    Qty: {item.quantity || 1} • Unit Price: ₹{Number(item.pricePerUnit || 0).toFixed(2)}
                  </p>
                  <p style={{ fontSize: '1.05rem', fontWeight: 900, color: '#059669', margin: '0.35rem 0 0' }}>
                    ₹{Number(item.totalPrice || (Number(item.pricePerUnit || 0) * (item.quantity || 1))).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
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
          <div style={{ display: 'grid', gap: '1.25rem', alignItems: 'start' }} className="responsive-order-payment-grid">
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

        {/* 4. Realtime Tracking Action CTA */}
        <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1.5px solid #a7f3d0', borderRadius: '1rem', padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: '#047857', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Truck style={{ width: 18, height: 18, color: '#059669' }} />
              Live Real-time Order GPS Tracking
            </h4>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>
              Track live GPS vehicle movement, ETA countdown, and driver details on a full page.
            </p>
          </div>
          <button
            style={{
              padding: '0.6rem 1.1rem', borderRadius: '0.75rem',
              border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff', fontWeight: 900, fontSize: '0.82rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
            onClick={() => {
              onClose();
              if (window.location.pathname !== `/track-order/${order.orderId}`) {
                window.location.href = `/track-order/${order.orderId}`;
              }
            }}
          >
            <span>Track Order Page</span>
            <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
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
    position: 'fixed', inset: 0, zIndex: 2000,
    background: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(8px)',
    display: 'flex', justifyContent: 'flex-end',
  },
  drawerPanel: {
    width: '100%', maxWidth: 460,
    background: '#ffffff', height: '100vh',
    display: 'flex', flexDirection: 'column',
    boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.25)',
    borderLeft: '1.5px solid #e2e8f0',
    overflowY: 'hidden', position: 'relative',
    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
  },
  drawerHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1.25rem 1.5rem 1.1rem',
    borderBottom: '1.5px solid #f1f5f9',
    background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
    flexShrink: 0,
  },
  scrollArea: {
    flex: 1, overflowY: 'auto',
    padding: '0.9rem',
    display: 'flex', flexDirection: 'column', gap: '0.95rem',
    WebkitOverflowScrolling: 'touch',
  },
  detailOverlay: {
    position: 'fixed', inset: 0, zIndex: 2200,
    background: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(10px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0.4rem',
  },
};

export const OrdersModal = ({ isOpen = true, orders = [], onClose, initialOrderId = null, onOrderCreated }) => {
  if (isOpen === false) return null;
  const navigate = useNavigate();
  const [creatingDemo, setCreatingDemo] = useState(false);
  const [modalOrders, setModalOrders] = useState(() => Array.isArray(orders) ? orders : []);

  React.useEffect(() => {
    let isMounted = true;
    if (Array.isArray(orders)) {
      setModalOrders(orders);
    }
    shopService.getOrders().then(res => {
      if (isMounted && res && res.success && Array.isArray(res.data)) {
        setModalOrders(res.data);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [orders]);

  const handleCreateSampleOrder = async () => {
    setCreatingDemo(true);
    const newDemoOrder = {
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      status: 'CONFIRMED',
      totalAmount: 499.00,
      createdAt: new Date().toISOString(),
      shippingAddress: 'Flat 402, Block A, Jubilee Hills, Hyderabad - 500033',
      paymentMethod: 'UPI / Online Payment',
      customerName: 'Sanjeevani User',
      customerEmail: 'customer@sanjeevani.com',
      items: [
        {
          productId: 1,
          productName: 'Protinex Health & Nutrition Powder (Chocolate 500g)',
          quantity: 1,
          pricePerUnit: 499.00,
          totalPrice: 499.00,
          imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'
        }
      ]
    };

    try {
      const res = await shopService.buyNow({
        productId: 1,
        quantity: 1,
        shippingAddress: 'Flat 402, Block A, Jubilee Hills, Hyderabad - 500033'
      });
      
      const createdObj = (res && res.success && res.data) ? res.data : newDemoOrder;
      
      // Save locally to device
      try {
        const existing = JSON.parse(localStorage.getItem('sanjeevani_orders') || '[]');
        const filtered = existing.filter(o => o && String(o.orderId || o.id) !== String(createdObj.orderId || createdObj.id));
        const updated = [createdObj, ...filtered];
        localStorage.setItem('sanjeevani_orders', JSON.stringify(updated));
      } catch (e) {}

      if (onOrderCreated) {
        await onOrderCreated();
      }
      
      const updated = await shopService.getOrders();
      if (updated && updated.success && Array.isArray(updated.data)) {
        setModalOrders(updated.data);
      }
    } catch (err) {
      console.log('Using fallback demo order:', err);
      try {
        const existing = JSON.parse(localStorage.getItem('sanjeevani_orders') || '[]');
        const filtered = existing.filter(o => o && String(o.orderId || o.id) !== String(newDemoOrder.orderId));
        const updated = [newDemoOrder, ...filtered];
        localStorage.setItem('sanjeevani_orders', JSON.stringify(updated));
      } catch (e) {}

      if (onOrderCreated) {
        await onOrderCreated();
      }
    } finally {
      setCreatingDemo(false);
    }
  };

  const [internalFetchedOrders, setInternalFetchedOrders] = React.useState([]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchApiOrders = async () => {
      try {
        const res = await shopService.getOrders();
        const rawList = (res && res.success && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
        if (isMounted && rawList.length > 0) {
          setInternalFetchedOrders(rawList);
        }
      } catch (e) {
        console.error('OrdersModal auto-fetch error:', e);
      }
    };
    fetchApiOrders();
    return () => { isMounted = false; };
  }, []);

  // Deduplicate and sort orders from Latest / Newest first (top) to Oldest last (bottom)
  const sortedOrders = React.useMemo(() => {
    const apiList = (Array.isArray(modalOrders) && modalOrders.length > 0)
      ? modalOrders
      : ((Array.isArray(orders) && orders.length > 0) ? orders : internalFetchedOrders);
    
    let combined = apiList;
    if (combined.length === 0) {
      let localSaved = [];
      try {
        const rawLocal1 = localStorage.getItem('sanjeevani_orders');
        const rawLocal2 = localStorage.getItem('sanjeevani_local_orders');
        let arr1 = rawLocal1 ? JSON.parse(rawLocal1) : [];
        let arr2 = rawLocal2 ? JSON.parse(rawLocal2) : [];
        if (!Array.isArray(arr1)) arr1 = [];
        if (!Array.isArray(arr2)) arr2 = [];
        localSaved = [...arr1, ...arr2];
      } catch (e) {}
      combined = localSaved;
    }
    if (!combined.length) return [];

    const uniqueMap = new Map();
    combined.forEach(o => {
      if (!o) return;
      if (String(o.status || '').toUpperCase() === 'FAILED') return;
      const key = String(o.orderId || o.id || Math.random()).trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, o);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => {
      const timeA = parseExactDate(a.createdAt).getTime();
      const timeB = parseExactDate(b.createdAt).getTime();
      if (timeA !== timeB) return timeB - timeA; // Newest first

      const idA = Number(String(a.orderId || a.id || '').replace(/[^0-9]/g, '')) || 0;
      const idB = Number(String(b.orderId || b.id || '').replace(/[^0-9]/g, '')) || 0;
      return idB - idA; // Higher order number first
    });
  }, [modalOrders, orders]);

  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(() => {
    if (initialOrderId) {
      const match = sortedOrders.find(o => String(o.orderId) === String(initialOrderId));
      if (match) return match;
    }
    return null;
  });

  return (
    <>
      {/* 1. Main Drawer Overlay & Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={drawerStyles.overlay}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          style={drawerStyles.drawerPanel}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={drawerStyles.drawerHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                <PackageCheck style={{ width: 22, height: 22, color: '#047857' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.18rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                  My Orders
                </h3>
                <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  Active order history & receipts
                </p>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 900, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', borderRadius: 99, padding: '0.22rem 0.7rem', marginLeft: '0.25rem', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' }}>
                {sortedOrders.length}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90, background: '#fee2e2', color: '#dc2626' }}
              whileTap={{ scale: 0.9 }}
              style={s.closeBtn}
              onClick={onClose}
              title="Close orders drawer"
            >
              <X style={{ width: 18, height: 18, color: '#64748b' }} />
            </motion.button>
          </div>

          {/* Orders Scrollable Drawer Body */}
          <div style={drawerStyles.scrollArea}>
            {sortedOrders.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                <PackageCheck style={{ width: 58, height: 58, strokeWidth: 1.5, margin: '0 auto 0.85rem', color: '#a7f3d0' }} />
                <p style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem' }}>No Placed Orders Found</p>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.35rem', maxWidth: 300, lineHeight: 1.45 }}>
                  You haven't placed any orders on this account yet. Place an order or generate a test order below.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', maxWidth: 280 }}>
                  <button
                    onClick={handleCreateSampleOrder}
                    disabled={creatingDemo}
                    style={{
                      padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff', fontWeight: 900, fontSize: '0.86rem', border: 'none',
                      cursor: creatingDemo ? 'wait' : 'pointer',
                      boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem'
                    }}
                  >
                    <Sparkles style={{ width: 16, height: 16 }} />
                    <span>{creatingDemo ? 'Creating Test Order...' : '⚡ Place Quick Test Order'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      const el = document.getElementById('products-catalog-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    style={{
                      padding: '0.65rem 1.25rem', borderRadius: '0.75rem',
                      background: '#ffffff', border: '1.5px solid #cbd5e1',
                      color: '#334155', fontWeight: 800, fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    🛍️ Explore Sanjeevani Store
                  </button>
                </div>
              </div>
            ) : (
              sortedOrders.map((order, idx) => {
                const createdDate = parseExactDate(order.createdAt);
                const deliveryAddress = order.shippingAddress || 'Flat 402, Block A, Jubilee Hills, Hyderabad - 500033';

                return (
                  <motion.div
                    key={order.orderId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                    whileHover={{ y: -3, boxShadow: '0 14px 28px -6px rgba(16, 185, 129, 0.18), 0 3px 10px rgba(0,0,0,0.03)', borderColor: '#6ee7b7' }}
                    whileTap={{ scale: 0.99 }}
                    style={{
                      borderRadius: '0.95rem',
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.02)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                      navigate(`/track-order/${order.orderId}`);
                    }}
                  >
                    {/* Top Accent Line */}
                    <div style={{ height: 3, background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #3b82f6 100%)' }} />

                    {/* Card Top Row */}
                    <div style={{ padding: '0.8rem 1rem', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0369a1', background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)', padding: '0.18rem 0.6rem', borderRadius: '0.5rem', border: '1.5px solid #93c5fd', letterSpacing: '0.01em', boxShadow: '0 1px 4px rgba(14, 165, 233, 0.1)' }}>
                            {order.orderId}
                          </span>
                          <span style={{ ...s.badgeSuccess, padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>
                            <CheckCircle2 style={{ width: 12, height: 12 }} />
                            {order.status || 'PAID'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', fontWeight: 700 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#047857' }}>
                            <Calendar style={{ width: 12, height: 12 }} />
                            {formatExactDateStr(createdDate)}
                          </span>
                          <span>•</span>
                          <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.1rem 0.45rem', borderRadius: '0.35rem', fontWeight: 800, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock style={{ width: 11, height: 11 }} />
                            {formatExactTimeStr(createdDate)}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.08rem', fontWeight: 900, color: '#059669', display: 'block', letterSpacing: '-0.02em' }}>
                          ₹{Number(order.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Purchased Items Thumbnails */}
                    <div style={{ padding: '0.45rem 1rem', background: '#fafafa', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto' }}>
                      {(order.items || []).map((item, itemIdx) => {
                        const itemImg = item.productImage || item.product?.imageUrl || item.imageUrl || item.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';
                        const itemName = item.productName || item.product?.name || item.name || 'Healthcare Item';
                        return (
                          <motion.div
                            key={itemIdx}
                            whileHover={{ scale: 1.04, borderColor: '#10b981', background: '#ecfdf5' }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', padding: '0.28rem 0.6rem', borderRadius: '0.55rem', border: '1.5px solid #e2e8f0', flexShrink: 0, transition: 'all 0.2s ease' }}
                          >
                            <div style={{ width: 24, height: 24, flexShrink: 0, background: '#ecfdf5', borderRadius: '0.35rem', padding: '0.1rem', border: '1px solid #a7f3d0' }}>
                              <ProductImage src={itemImg} alt={itemName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {itemName} <span style={{ color: '#059669', fontWeight: 900 }}>(x{item.quantity || 1})</span>
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Delivery Destination */}
                    <div style={{ padding: '0.55rem 1rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)', borderTop: '1px solid #d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.74rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Navigation style={{ width: 11, height: 11, color: '#047857' }} />
                        </div>
                        <span style={{ color: '#1e293b', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>{deliveryAddress}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* 2. Order Details Overlay Modal */}
      <AnimatePresence>
        {selectedOrderForDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={drawerStyles.detailOverlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedOrderForDetail(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              style={{
                background: '#ffffff',
                borderRadius: '1.25rem',
                width: '98%', maxWidth: 840,
                height: '94vh', maxHeight: '94dvh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.45)',
                border: '1.5px solid #cbd5e1',
                overflow: 'hidden',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <SelectedOrderDetailModal
                order={selectedOrderForDetail}
                onClose={() => setSelectedOrderForDetail(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .responsive-order-payment-grid {
          grid-template-columns: 1fr 340px;
        }
        @media (max-width: 768px) {
          .responsive-order-grid { grid-template-columns: 1fr !important; }
          .responsive-order-payment-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
};

export default OrdersModal;

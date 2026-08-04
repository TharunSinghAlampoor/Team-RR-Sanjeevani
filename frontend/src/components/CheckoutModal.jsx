import React, { useState } from 'react';
import { X, ShoppingBag, MapPin, CreditCard, Shield, Package, AlertTriangle, CheckCircle2, Loader2, QrCode, Smartphone, XCircle, Copy, Check } from 'lucide-react';
import shopService from '../api/shopService';
import ProductImage from './ProductImage';
import { loadRazorpayScript } from '../utils/razorpayUtils';
import LocationAddressInput from './LocationAddressInput';

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1100,
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0.75rem',
  },
  dialog: {
    background: '#ffffff',
    borderRadius: '1.25rem',
    width: '100%', maxWidth: 580,
    maxHeight: '92vh', overflowY: 'auto',
    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.35)',
    border: '1.5px solid #e2e8f0',
    position: 'relative',
    WebkitOverflowScrolling: 'touch',
  },

  /* Header */
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1.1rem 1.35rem 0.9rem',
    borderBottom: '1.5px solid #f1f5f9',
    background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
    borderRadius: '1.25rem 1.25rem 0 0',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  title: { fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 },
  closeBtn: {
    width: 36, height: 36, borderRadius: '50%',
    border: '1.5px solid #e2e8f0', background: '#f8fafc',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.18s', flexShrink: 0,
  },

  /* Content Body */
  body: { padding: '1.1rem 1.35rem' },

  /* Section Label */
  sectionLabel: {
    fontSize: '0.76rem', fontWeight: 800, color: '#334155',
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.03em',
  },

  /* Address */
  addressBox: {
    padding: '0.75rem',
    borderRadius: '0.75rem',
    border: '1.5px solid #d1fae5',
    background: '#f0fdf4',
    marginBottom: '1rem',
  },
  textarea: {
    width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.6rem',
    fontSize: '0.84rem', border: '1.5px solid #cbd5e1',
    background: '#ffffff', color: '#0f172a', boxSizing: 'border-box',
    outline: 'none', resize: 'vertical', fontFamily: 'inherit',
    lineHeight: 1.5,
  },

  /* Payment Mode Selection Tabs */
  tabContainer: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
    marginBottom: '1rem',
  },
  tabBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
    padding: '0.75rem 0.75rem', borderRadius: '0.75rem',
    border: '1.5px solid #e2e8f0', background: '#f8fafc',
    fontSize: '0.8rem', fontWeight: 800, color: '#475569',
    cursor: 'pointer', transition: 'all 0.2s', minHeight: 44,
  },
  tabBtnActive: {
    border: '1.5px solid #10b981',
    background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
    color: '#047857',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
  },

  /* QR Box Container */
  qrBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    padding: '1.1rem', borderRadius: '1rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    border: '1.5px solid #cbd5e1',
    marginBottom: '1rem',
  },
  qrImageWrap: {
    padding: '0.6rem', background: '#ffffff',
    borderRadius: '1rem', border: '2px solid #10b981',
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
    marginBottom: '0.75rem',
  },
  vpaBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.35rem 0.75rem', borderRadius: 99,
    background: '#ffffff', border: '1px solid #cbd5e1',
    fontSize: '0.76rem', fontWeight: 700, color: '#0f172a',
    margin: '0.35rem 0',
  },

  /* Cart Items */
  itemsContainer: {
    maxHeight: 160, overflowY: 'auto',
    marginBottom: '1rem',
    display: 'flex', flexDirection: 'column', gap: '0.45rem',
    WebkitOverflowScrolling: 'touch',
  },
  itemRow: {
    display: 'flex', alignItems: 'center', gap: '0.65rem',
    padding: '0.5rem 0.65rem',
    borderRadius: '0.7rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  itemImgWrap: {
    width: 42, height: 42, flexShrink: 0,
    borderRadius: '0.5rem',
    background: '#fff', border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0.15rem',
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: {
    fontSize: '0.78rem', fontWeight: 800, color: '#1e293b',
    margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  itemMeta: { fontSize: '0.68rem', color: '#64748b', margin: '0.1rem 0 0' },
  itemTotal: { fontSize: '0.82rem', fontWeight: 900, color: '#059669', flexShrink: 0 },

  /* Summary */
  summaryBox: {
    padding: '0.85rem 0.95rem',
    borderRadius: '0.75rem',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    marginBottom: '1rem',
  },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '0.78rem', color: '#64748b', marginBottom: '0.3rem',
  },
  grandRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '0.95rem', fontWeight: 900, color: '#0f172a',
    paddingTop: '0.5rem', marginTop: '0.4rem',
    borderTop: '1.5px solid #e2e8f0',
  },

  /* Test Mode Simulation Banner */
  testBanner: {
    padding: '0.6rem 0.8rem',
    borderRadius: '0.75rem',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
    border: '1px solid #fde68a',
    marginBottom: '1rem',
    fontSize: '0.72rem',
    color: '#92400e',
  },
  testBannerTitle: {
    fontWeight: 800, color: '#78350f', display: 'flex', alignItems: 'center', gap: '0.4rem',
    marginBottom: '0.2rem',
  },

  /* Buttons */
  razorpayBtn: {
    width: '100%', padding: '0.9rem',
    borderRadius: '0.85rem', border: 'none',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff', fontWeight: 900, fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.55rem',
    boxShadow: '0 6px 24px rgba(16, 185, 129, 0.35)',
    transition: 'all 0.2s',
    minHeight: 48,
  },

  /* Error Banner */
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.65rem 0.85rem',
    borderRadius: '0.65rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    fontSize: '0.78rem', fontWeight: 700, color: '#dc2626',
    marginBottom: '0.85rem',
  },

  /* Secure footer */
  secureNote: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
    fontSize: '0.7rem', color: '#64748b', marginTop: '0.75rem', fontWeight: 600,
    textAlign: 'center',
  },
};

export const CheckoutModal = ({
  cartItems = [],
  onClose,
  onPaymentSuccess,
}) => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('razorpay'); // 'razorpay' | 'qr'
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successOrderId, setSuccessOrderId] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.itemTotal) || 0), 0);
  const deliveryFee = subtotal >= 500 || (appliedCoupon && appliedCoupon.code === 'FREESHIP') ? 0 : 40;

  // Coupon discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'flat') {
      discountAmount = appliedCoupon.value;
    } else if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.min(appliedCoupon.maxDiscount || 150, (subtotal * appliedCoupon.value) / 100);
    }
  }

  const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).toUpperCase().trim();
    setCouponCode(code);
    setCouponError('');
    if (!code) return;

    if (code === 'SANJEEVANI50') {
      if (subtotal < 400) {
        setCouponError('Requires min order of ₹400');
        return;
      }
      setAppliedCoupon({ code: 'SANJEEVANI50', type: 'flat', value: 50, desc: '₹50 OFF Applied' });
    } else if (code === 'HEALTH10') {
      if (subtotal < 300) {
        setCouponError('Requires min order of ₹300');
        return;
      }
      setAppliedCoupon({ code: 'HEALTH10', type: 'percentage', value: 10, maxDiscount: 150, desc: '10% OFF Applied' });
    } else if (code === 'FIRST100') {
      if (subtotal < 750) {
        setCouponError('Requires min order of ₹750');
        return;
      }
      setAppliedCoupon({ code: 'FIRST100', type: 'flat', value: 100, desc: '₹100 OFF Applied' });
    } else if (code === 'FREESHIP') {
      setAppliedCoupon({ code: 'FREESHIP', type: 'flat', value: 0, desc: 'Free Delivery Applied' });
    } else {
      setCouponError('Invalid Coupon Code');
    }
  };

  const upiVpa = 'sanjeevani.health@razorpay';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    `upi://pay?pa=${upiVpa}&pn=Sanjeevani%20Healthcare&am=${grandTotal.toFixed(2)}&cu=INR`
  )}`;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const [showAddressPopup, setShowAddressPopup] = useState(false);

  const handlePayWithRazorpay = async () => {
    if (!shippingAddress || !shippingAddress.trim()) {
      setError('⚠️ Delivery Address Required: Please enter your complete shipping address to place the order.');
      setShowAddressPopup(true);
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      // Step 0: Ensure Razorpay SDK is dynamically loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay Payment Gateway. Please check your network connection.');
      }

      // Step 1: Create Razorpay order via backend
      const res = await shopService.createRazorpayOrder();
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to create payment order.');
      }

      const { orderId, amount, currency, keyId } = res.data;

      // Step 2: Configure Razorpay popup options
      const options = {
        key: keyId,
        amount: Math.round(amount * 100), // amount in paise
        currency: currency || 'INR',
        name: 'Sanjeevani Healthcare',
        description: 'Cart Order Payment',
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyRes = await shopService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              shippingAddress: shippingAddress.trim(),
            });

            if (verifyRes.success) {
              setSuccessOrderId(verifyRes.data.orderId);
              if (onPaymentSuccess) {
                onPaymentSuccess(verifyRes.data);
              }
            } else {
              setError(verifyRes.message || 'Payment verification failed.');
              shopService.recordPaymentFailure({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                amount: grandTotal,
                errorDescription: verifyRes.message || 'Signature verification failed',
              });
            }
          } catch (verifyErr) {
            const errMsg = verifyErr.response?.data?.message || 'Payment verification failed.';
            setError(errMsg);
            shopService.recordPaymentFailure({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              amount: grandTotal,
              errorDescription: errMsg,
            });
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setError('Payment was cancelled. Your cart items remain safe in your cart.');
            shopService.recordPaymentFailure({
              razorpayOrderId: orderId,
              amount: grandTotal,
              errorDescription: 'User cancelled payment popup',
            });
          },
        },
        prefill: {
          name: 'Sanjeevani User',
          email: 'user@sanjeevani.com',
          contact: '9999999999',
        },
        ...(paymentMode === 'qr' ? { upi: { flow: 'qr' } } : {}),
        theme: {
          color: '#10b981',
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        setIsProcessing(false);
        const desc = response.error?.description || 'Payment was declined';
        setError(`Payment failed: ${desc}. Your cart items remain safe.`);
        shopService.recordPaymentFailure({
          razorpayOrderId: orderId,
          razorpayPaymentId: response.error?.metadata?.payment_id || null,
          amount: grandTotal,
          errorDescription: `Payment failed: ${desc}`,
        });
      });

      rzp.open();
    } catch (err) {
      setIsProcessing(false);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Something went wrong starting payment. Please try again.'
      );
    }
  };

  // If payment succeeded, show success state
  if (successOrderId) {
    return (
      <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={{ ...s.dialog, padding: '2.25rem 1.25rem', textAlign: 'center' }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.1rem',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
          }}>
            <CheckCircle2 style={{ width: 34, height: 34, color: '#059669' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669', margin: '0 0 0.4rem' }}>
            Payment Confirmed! Order Placed
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.25rem' }}>
            Order ID: <strong style={{ color: '#0f172a' }}>{successOrderId}</strong>
          </p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 1.35rem' }}>
            Razorpay Signature Verified • Cart Cleared
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.8rem',
              borderRadius: '0.75rem', border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', fontWeight: 800, fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(5, 150, 105, 0.35)',
              minHeight: 44,
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.dialog} className="checkout-dialog-responsive">
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <ShoppingBag style={{ width: 22, height: 22, color: '#059669' }} />
            <h3 style={s.title}>Checkout ({cartItems.length} items)</h3>
          </div>
          <button style={s.closeBtn} onClick={onClose} disabled={isProcessing}>
            <X style={{ width: 18, height: 18, color: '#64748b' }} />
          </button>
        </div>

        <div style={s.body}>
          {/* Error Message */}
          {error && (
            <div style={s.errorBanner}>
              <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Ship To Address with GPS Location Auto-Detection */}
          <LocationAddressInput
            value={shippingAddress}
            onChange={setShippingAddress}
            label="Ship To Address"
            placeholder="Type or click 'Detect My Location' to auto-fill your delivery address..."
          />

          {/* Payment Method Tabs */}
          <div style={s.sectionLabel}>
            <CreditCard style={{ width: 14, height: 14, color: '#3b82f6' }} />
            <span>Choose Payment Option</span>
          </div>
          <div style={s.tabContainer}>
            <button
              onClick={() => setPaymentMode('razorpay')}
              style={{
                ...s.tabBtn,
                ...(paymentMode === 'razorpay' ? s.tabBtnActive : {}),
              }}
            >
              <Smartphone style={{ width: 16, height: 16 }} />
              <span>UPI Apps & Cards</span>
            </button>

            <button
              onClick={() => setPaymentMode('qr')}
              style={{
                ...s.tabBtn,
                ...(paymentMode === 'qr' ? s.tabBtnActive : {}),
              }}
            >
              <QrCode style={{ width: 16, height: 16 }} />
              <span>Scan UPI QR Code</span>
            </button>
          </div>

          {/* QR Code Display View */}
          {paymentMode === 'qr' && (
            <div style={s.qrBox}>
              <div style={s.qrImageWrap}>
                <img
                  src={qrCodeUrl}
                  alt="UPI Payment QR Code"
                  style={{ width: 160, height: 160, maxWidth: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#059669' }}>
                Scan & Pay ₹{grandTotal.toFixed(2)}
              </span>

              <div style={s.vpaBadge}>
                <span>VPA: <strong>{upiVpa}</strong></span>
                <button
                  onClick={handleCopyVpa}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#059669', display: 'flex', padding: 0 }}
                  title="Copy VPA"
                >
                  {copiedVpa ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
                </button>
              </div>

              <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                Scan with PhonePe, Google Pay, Paytm, BHIM or Amazon Pay
              </p>
            </div>
          )}

          {/* Cart Items */}
          <div style={s.sectionLabel}>
            <Package style={{ width: 14, height: 14, color: '#6366f1' }} />
            <span>Cart Summary</span>
          </div>
          <div style={s.itemsContainer}>
            {cartItems.map((item) => (
              <div key={item.id} style={s.itemRow}>
                <div style={s.itemImgWrap}>
                  <ProductImage
                    src={item.product?.imageUrl}
                    alt={item.product?.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={s.itemInfo}>
                  <p style={s.itemName}>{item.product?.name || 'Product'}</p>
                  <p style={s.itemMeta}>
                    Qty: {item.quantity} × ₹{Number(item.product?.price || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <span style={s.itemTotal}>₹{(Number(item.itemTotal) || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Coupons & Promo Section */}
          <div style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '0.85rem', background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)', border: '1.5px solid #a7f3d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#047857' }}>🏷️ Apply Promo Coupon</span>
              {appliedCoupon && (
                <button
                  onClick={() => setAppliedCoupon(null)}
                  style={{ fontSize: '0.72rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800 }}
                >
                  Remove Coupon
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="ENTER COUPON CODE"
                style={{
                  flex: 1, padding: '0.55rem 0.75rem', borderRadius: '0.55rem', border: '1.5px solid #a7f3d0',
                  fontSize: '0.8rem', fontWeight: 900, outline: 'none', letterSpacing: '0.05em', textTransform: 'uppercase', background: '#ffffff'
                }}
              />
              <button
                onClick={() => handleApplyCoupon()}
                style={{
                  padding: '0.55rem 1.1rem', borderRadius: '0.55rem', border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', fontSize: '0.8rem', fontWeight: 900, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                }}
              >
                Apply
              </button>
            </div>

            {couponError && (
              <p style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 700, margin: '0 0 0.4rem 0' }}>{couponError}</p>
            )}

            {/* Quick Coupon Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['SANJEEVANI50', 'HEALTH10', 'FIRST100'].map(code => (
                <button
                  key={code}
                  onClick={() => handleApplyCoupon(code)}
                  style={{
                    fontSize: '0.68rem', fontWeight: 800, padding: '0.22rem 0.6rem', borderRadius: 99,
                    background: appliedCoupon?.code === code ? '#10b981' : '#ffffff',
                    color: appliedCoupon?.code === code ? '#ffffff' : '#047857',
                    border: appliedCoupon?.code === code ? '1px solid #059669' : '1px solid #a7f3d0',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  🏷️ {code}
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary — Invoice Format */}
          <div style={{ ...s.summaryBox, background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '1rem', padding: '1rem' }}>
            <div style={s.summaryRow}>
              <span>Subtotal ({cartItems.length} items)</span>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={s.summaryRow}>
              <span>Delivery Charge</span>
              <span style={{ fontWeight: 900, color: deliveryFee === 0 ? '#047857' : '#0f172a', background: deliveryFee === 0 ? '#ecfdf5' : 'transparent', padding: deliveryFee === 0 ? '0.1rem 0.5rem' : '0', borderRadius: 99 }}>
                {deliveryFee === 0 ? 'FREE (Orders ≥ ₹500)' : `₹${deliveryFee}.00`}
              </span>
            </div>
            {discountAmount > 0 && (
              <div style={s.summaryRow}>
                <span style={{ color: '#047857', fontWeight: 800 }}>Promo Discount ({appliedCoupon.code})</span>
                <span style={{ fontWeight: 900, color: '#047857' }}>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ ...s.grandRow, borderTop: '1.5px solid #e2e8f0', paddingTop: '0.6rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>Total Amount</span>
              <span style={{ color: '#047857', fontSize: '1.18rem', fontWeight: 900 }}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePayWithRazorpay}
            disabled={isProcessing || cartItems.length === 0}
            style={{
              ...s.razorpayBtn,
              opacity: isProcessing || cartItems.length === 0 ? 0.6 : 1,
              cursor: isProcessing ? 'wait' : 'pointer',
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
                <span>Processing Payment...</span>
              </>
            ) : paymentMode === 'qr' ? (
              <>
                <QrCode style={{ width: 18, height: 18 }} />
                <span>Pay ₹{grandTotal.toFixed(2)} via UPI QR</span>
              </>
            ) : (
              <>
                <CreditCard style={{ width: 18, height: 18 }} />
                <span>Pay ₹{grandTotal.toFixed(2)} • Complete Order</span>
              </>
            )}
          </button>

          {/* Top-Middle Address Warning Pop-up Banner */}
          {showAddressPopup && (
            <div style={{
              position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999,
              background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '1rem', padding: '0.9rem 1.25rem',
              boxShadow: '0 20px 40px rgba(239, 68, 68, 0.35)', display: 'flex', alignItems: 'center', gap: '0.75rem',
              color: '#991b1b', width: '90%', maxWidth: '440px'
            }}>
              <AlertTriangle style={{ width: 24, height: 24, color: '#ef4444', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 900, fontSize: '0.9rem' }}>⚠️ Delivery Address Required!</p>
                <p style={{ margin: '2px 0 0 0', fontWeight: 700, fontSize: '0.78rem', color: '#b91c1c' }}>Please enter or detect your address to complete the order.</p>
              </div>
              <button
                onClick={() => setShowAddressPopup(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 900, fontSize: '1.1rem', padding: '0 0.2rem' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Secure Note */}
          <div style={s.secureNote}>
            <Shield style={{ width: 13, height: 13, color: '#10b981', flexShrink: 0 }} />
            <span>Encrypted by Razorpay • Works seamlessly on Mobile, Tablet & Laptop</span>
          </div>
        </div>
      </div>

      {/* CSS Media Queries for Responsive Touch Devices */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .checkout-dialog-responsive {
            max-width: 100% !important;
            max-height: 96vh !important;
            border-radius: 1.25rem 1.25rem 0 0 !important;
          }
        }
      ` }} />
    </div>
  );
};

export default CheckoutModal;

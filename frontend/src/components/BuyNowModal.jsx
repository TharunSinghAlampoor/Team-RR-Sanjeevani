import React, { useState } from 'react';
import { X, Zap, CreditCard, MapPin, CheckCircle2, Shield, AlertTriangle, Loader2, QrCode, Smartphone, XCircle, Copy, Check } from 'lucide-react';
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
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1.1rem 1.35rem 0.9rem',
    borderBottom: '1.5px solid #f1f5f9',
    background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
    borderRadius: '1.25rem 1.25rem 0 0',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  title: { fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '0.72rem', color: '#64748b', margin: '0.1rem 0 0' },
  closeBtn: {
    width: 36, height: 36, borderRadius: '50%',
    border: '1.5px solid #e2e8f0', background: '#f8fafc',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.18s', flexShrink: 0,
  },
  body: { padding: '1.1rem 1.35rem' },
  sectionLabel: {
    fontSize: '0.76rem', fontWeight: 800, color: '#334155',
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.03em',
  },
  prodCard: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.75rem', borderRadius: '0.85rem',
    background: '#f8fafc', border: '1.5px solid #e2e8f0',
    marginBottom: '1rem',
  },
  prodImg: {
    width: 52, height: 52, borderRadius: '0.55rem',
    background: '#fff', padding: '0.2rem',
    border: '1px solid #e2e8f0', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
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
    border: '1.5px solid #d97706',
    background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
    color: '#b45309',
    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.15)',
  },
  qrBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    padding: '1.1rem', borderRadius: '1rem',
    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    border: '1.5px solid #fde68a',
    marginBottom: '1rem',
  },
  qrImageWrap: {
    padding: '0.6rem', background: '#ffffff',
    borderRadius: '1rem', border: '2px solid #d97706',
    boxShadow: '0 8px 24px rgba(217, 119, 6, 0.2)',
    marginBottom: '0.75rem',
  },
  vpaBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.35rem 0.75rem', borderRadius: 99,
    background: '#ffffff', border: '1px solid #fde68a',
    fontSize: '0.76rem', fontWeight: 700, color: '#0f172a',
    margin: '0.35rem 0',
  },
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
  submitBtn: {
    width: '100%', padding: '0.9rem',
    borderRadius: '0.85rem', border: 'none',
    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    color: '#ffffff', fontWeight: 900, fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.55rem',
    boxShadow: '0 6px 24px rgba(217, 119, 6, 0.35)',
    transition: 'all 0.2s',
    minHeight: 48,
  },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.65rem 0.85rem',
    borderRadius: '0.65rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    fontSize: '0.78rem', fontWeight: 700, color: '#dc2626',
    marginBottom: '0.85rem',
  },
  secureNote: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
    fontSize: '0.7rem', color: '#64748b', marginTop: '0.75rem', fontWeight: 600,
    textAlign: 'center',
  },
};

export const BuyNowModal = ({
  product,
  onClose,
  onPaymentSuccess,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('razorpay'); // 'razorpay' | 'qr'
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successOrderId, setSuccessOrderId] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);

  if (!product) return null;

  const itemTotal = Number(product.price || 0) * quantity;
  const deliveryFee = 0;
  const grandTotal = itemTotal + deliveryFee;

  const upiVpa = 'sanjeevani.health@razorpay';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    `upi://pay?pa=${upiVpa}&pn=Sanjeevani%20Healthcare&am=${grandTotal.toFixed(2)}&cu=INR`
  )}`;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handlePayWithRazorpay = async () => {
    if (!shippingAddress.trim()) {
      setError('Please enter your Ship To address to proceed.');
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

      // Step 1: Create Razorpay Buy Now order via backend
      const res = await shopService.createBuyNowRazorpayOrder(product.productId, quantity);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to create payment order.');
      }

      const { orderId, amount, currency, keyId, productId: resProdId, quantity: resQty } = res.data;

      // Step 2: Open Razorpay popup
      const options = {
        key: keyId,
        amount: Math.round(amount * 100), // amount in paise
        currency: currency || 'INR',
        name: 'Sanjeevani Healthcare',
        description: `Buy Now: ${product.name}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyRes = await shopService.verifyBuyNowPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              productId: resProdId || product.productId,
              quantity: resQty || quantity,
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
                errorDescription: verifyRes.message || 'Buy Now signature verification failed',
              });
            }
          } catch (verifyErr) {
            const errMsg = verifyErr.response?.data?.message || 'Express payment verification failed.';
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
            setError('Express payment was cancelled. No order was placed.');
            shopService.recordPaymentFailure({
              razorpayOrderId: orderId,
              amount: grandTotal,
              errorDescription: 'User cancelled Express Buy Now payment',
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
          color: '#d97706',
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        setIsProcessing(false);
        const desc = response.error?.description || 'Payment was declined';
        setError(`Express payment failed: ${desc}. No order was placed.`);
        shopService.recordPaymentFailure({
          razorpayOrderId: orderId,
          razorpayPaymentId: response.error?.metadata?.payment_id || null,
          amount: grandTotal,
          errorDescription: `Express payment failed: ${desc}`,
        });
      });

      rzp.open();
    } catch (err) {
      setIsProcessing(false);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Something went wrong starting Buy Now payment. Please try again.'
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
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.1rem',
            boxShadow: '0 8px 32px rgba(217, 119, 6, 0.3)',
          }}>
            <CheckCircle2 style={{ width: 34, height: 34, color: '#d97706' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#d97706', margin: '0 0 0.4rem' }}>
            Express Order Confirmed!
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.25rem' }}>
            Order ID: <strong style={{ color: '#0f172a' }}>{successOrderId}</strong>
          </p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 1.35rem' }}>
            Razorpay Signature Verified • Inventory Updated
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.8rem',
              borderRadius: '0.75rem', border: 'none',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#fff', fontWeight: 800, fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(217, 119, 6, 0.35)',
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
      <div style={s.dialog} className="buynow-dialog-responsive">
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={{ padding: '0.4rem', borderRadius: '0.65rem', background: '#fef3c7', color: '#d97706', display: 'flex' }}>
              <Zap style={{ width: 18, height: 18, fill: 'currentColor' }} />
            </div>
            <div>
              <h3 style={s.title}>Express Buy Now</h3>
              <p style={s.subtitle}>Secure checkout via Razorpay</p>
            </div>
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

          {/* Product Card */}
          <div style={s.prodCard}>
            <div style={s.prodImg}>
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</h4>
              <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669', margin: '0.2rem 0' }}>₹{product.price}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b' }}>
                <span>Qty:</span>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  style={{ padding: '0.15rem 0.4rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 700 }}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Ship To Address with GPS Location Auto-Detection */}
          <LocationAddressInput
            value={shippingAddress}
            onChange={setShippingAddress}
            label="Ship To Address"
            placeholder="Type or click 'Detect My Location' to auto-fill your delivery address..."
          />

          {/* Payment Method Tabs */}
          <div style={s.sectionLabel}>
            <CreditCard style={{ width: 14, height: 14, color: '#d97706' }} />
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

              <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#d97706' }}>
                Scan & Pay ₹{grandTotal.toFixed(2)}
              </span>

              <div style={s.vpaBadge}>
                <span>VPA: <strong>{upiVpa}</strong></span>
                <button
                  onClick={handleCopyVpa}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d97706', display: 'flex', padding: 0 }}
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

          {/* Order Summary */}
          <div style={s.summaryBox}>
            <div style={s.summaryRow}>
              <span>Item Subtotal ({quantity}x)</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{itemTotal.toFixed(2)}</span>
            </div>
            <div style={s.summaryRow}>
              <span>Express Delivery</span>
              <span style={{ fontWeight: 700, color: '#059669' }}>FREE</span>
            </div>
            <div style={s.grandRow}>
              <span>Total Payable</span>
              <span style={{ color: '#059669' }}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>



          {/* Submit */}
          <button
            onClick={handlePayWithRazorpay}
            disabled={isProcessing}
            style={{
              ...s.submitBtn,
              opacity: isProcessing ? 0.6 : 1,
              cursor: isProcessing ? 'wait' : 'pointer',
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
                <span>Opening Razorpay...</span>
              </>
            ) : paymentMode === 'qr' ? (
              <>
                <QrCode style={{ width: 18, height: 18 }} />
                <span>Pay ₹{grandTotal.toFixed(2)} via UPI QR Code</span>
              </>
            ) : (
              <>
                <CreditCard style={{ width: 18, height: 18 }} />
                <span>Pay ₹{grandTotal.toFixed(2)} via Razorpay Modal</span>
              </>
            )}
          </button>

          {/* Secure Note */}
          <div style={s.secureNote}>
            <Shield style={{ width: 13, height: 13, color: '#10b981', flexShrink: 0 }} />
            <span>Encrypted by Razorpay • Works seamlessly on Mobile, Tablet & Laptop</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .buynow-dialog-responsive {
            max-width: 100% !important;
            max-height: 96vh !important;
            border-radius: 1.25rem 1.25rem 0 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BuyNowModal;

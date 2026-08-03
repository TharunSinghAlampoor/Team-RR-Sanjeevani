/**
 * Razorpay SDK Dynamic Loader
 * 
 * Loads Razorpay's checkout.js script dynamically on demand ONLY when the user
 * initiates a payment. This prevents unnecessary third-party cookies (_ga, _fbp, _hj, etc.)
 * and network requests on initial page load.
 */

let razorpayPromise = null;

export const loadRazorpayScript = () => {
  if (typeof window === 'undefined') return Promise.resolve(false);

  // If Razorpay SDK is already present on window, resolve immediately
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  // If already loading, return the existing Promise to avoid duplicate script tags
  if (razorpayPromise) {
    return razorpayPromise;
  }

  razorpayPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      razorpayPromise = null; // reset so it can be retried if failed
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return razorpayPromise;
};

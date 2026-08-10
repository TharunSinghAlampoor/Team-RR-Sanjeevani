/**
 * Utility to strictly enforce that ONLY allowed items remain in localStorage.
 * Allowed keys requested by user:
 * 1. 'token' (Auth Token)
 * 2. 'user', 'user_role' (User Details & Role)
 * 3. Razorpay Payment Details ('razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'razorpay_last_payment', or any key starting with 'razorpay')
 *
 * ALL OTHER unwanted keys in localStorage are automatically purged!
 */
export const cleanLocalStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const isAllowed =
        key === 'token' ||
        key === 'user' ||
        key === 'user_role' ||
        key.startsWith('razorpay');

      if (!isAllowed) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (e) {
    console.warn('LocalStorage pruning warning:', e);
  }
};

// Automatically run on module load
cleanLocalStorage();

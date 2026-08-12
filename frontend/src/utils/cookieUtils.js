/**
 * Cookie Utilities for Sanjeevani E-Commerce
 * 
 * Strict Whitelist Cookie Control System:
 * - Stores ONLY essential useful session cookies (auth_token, user_name, shopping_counts).
 * - Rejects non-whitelisted cookie insertion attempts to prevent browser header bloat.
 * - Automatically sweeps and purges unwanted/third-party cookies from document.cookie.
 */

// Whitelist of allowed useful application cookies
const USEFUL_COOKIES = new Set(['auth_token', 'user_name', 'shopping_counts']);

/**
 * Set a useful cookie with strict parameters and safety checks
 */
export const setCookie = (name, value, days = 7) => {
  if (typeof document === 'undefined' || !name) return;

  // Only allow whitelisted useful cookies
  if (!USEFUL_COOKIES.has(name)) {
    console.warn(`[Cookie Guard] Rejected non-whitelisted cookie setting: ${name}`);
    return;
  }

  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${d.toUTCString()}`;
  const encodedValue = encodeURIComponent(value || '');

  document.cookie = `${name}=${encodedValue}; ${expires}; path=/; SameSite=Lax`;
};

/**
 * Get a specific useful cookie value by name
 */
export const getCookie = (name) => {
  if (typeof document === 'undefined' || !name) return null;
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      } catch {
        return c.substring(nameEQ.length, c.length);
      }
    }
  }
  return null;
};

/**
 * Erase a cookie by name
 */
export const eraseCookie = (name) => {
  if (typeof document === 'undefined' || !name) return;
  _purgeAllVariants(name);
};

/**
 * Save essential useful session data to cookies (JWT Token & User Name)
 */
export const saveSessionCookies = (userName, token) => {
  if (token) setCookie('auth_token', token, 7);
  if (userName) setCookie('user_name', userName, 7);
};

/**
 * Load essential session data from cookies
 */
export const loadSessionCookies = () => {
  const token = getCookie('auth_token');
  const userName = getCookie('user_name');
  if (token || userName) {
    return { token, userName };
  }
  return null;
};

/**
 * Save lightweight shopping counts to cookies (cart count & favorites count)
 */
export const saveShoppingState = ({ cartCount = 0, favoritesCount = 0 } = {}) => {
  const payload = JSON.stringify({ c: Number(cartCount) || 0, f: Number(favoritesCount) || 0 });
  setCookie('shopping_counts', payload, 7);
};

/**
 * Load lightweight shopping counts from cookies
 */
export const loadShoppingState = () => {
  const raw = getCookie('shopping_counts');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        cartCount: Number(parsed.c) || 0,
        favoritesCount: Number(parsed.f) || 0,
      };
    } catch {
      return { cartCount: 0, favoritesCount: 0 };
    }
  }
  return { cartCount: 0, favoritesCount: 0 };
};

/**
 * Purges all cookies that are NOT in the whitelisted useful set
 */
export const purgeUnwantedCookies = () => {
  if (typeof document === 'undefined') return;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    if (name && !USEFUL_COOKIES.has(name)) {
      _purgeAllVariants(name);
    }
  }
};

/**
 * Purges ALL cookies (used on full clear / logout)
 */
export const purgeAllCookies = () => {
  if (typeof document === 'undefined') return;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    if (name) {
      _purgeAllVariants(name);
    }
  }
};

export const clearSessionCookies = () => {
  eraseCookie('auth_token');
  eraseCookie('user_name');
  eraseCookie('shopping_counts');
};

function _purgeAllVariants(name) {
  if (!name || typeof document === 'undefined') return;
  const past = 'Thu, 01 Jan 1970 00:00:00 UTC';
  const hostname = typeof window !== 'undefined' && window.location ? window.location.hostname : '';

  document.cookie = `${name}=; expires=${past}; path=/`;
  document.cookie = `${name}=; expires=${past}`;
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    document.cookie = `${name}=; expires=${past}; domain=${hostname}; path=/`;
    document.cookie = `${name}=; expires=${past}; domain=.${hostname}; path=/`;
  }
}

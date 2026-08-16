/**
 * Dynamic API Base URL Config
 * Automatically detects environment:
 * - Prioritizes VITE_API_BASE_URL / VITE_API_URL environment variables
 * - Localhost / local dev server -> http://localhost:8080/api (or dynamic host IP)
 * - Live production deployment (Vercel / custom domain) -> Live Render Backend API
 */
const ensureApiSuffix = (urlStr) => {
  if (!urlStr) return 'http://localhost:8080/api';
  let clean = urlStr.trim().replace(/\/$/, '');
  if (!clean.endsWith('/api')) {
    clean = `${clean}/api`;
  }
  return clean;
};

export const getApiBaseUrl = () => {
  const ACTIVE_LIVE_BACKEND = 'https://sanjeevani-backend.onrender.com/api';
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    const isLocalNetwork = hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.');

    if (isLocalhost) {
      return ensureApiSuffix(envUrl || 'http://localhost:8080/api');
    }

    if (isLocalNetwork && envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return ensureApiSuffix(envUrl.replace(/localhost|127\.0\.0\.1/, hostname));
    }

    // If explicit live env URL is provided (not pointing to localhost), use it
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return ensureApiSuffix(envUrl);
    }

    // Default fallback when deployed on cloud (e.g. Vercel)
    return ACTIVE_LIVE_BACKEND;
  }

  return ensureApiSuffix(envUrl || 'http://localhost:8080/api');
};

export default getApiBaseUrl;


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
  const ACTIVE_LIVE_BACKEND = 'https://54.82.202.70.nip.io/api';
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    const isLocalNetwork = hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.');
    const isVercel = hostname.includes('vercel.app');

    if (isLocalhost) {
      return ensureApiSuffix(envUrl || 'http://localhost:8080/api');
    }

    if (isLocalNetwork && envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return ensureApiSuffix(envUrl.replace(/localhost|127\.0\.0\.1/, hostname));
    }

    // On Vercel deployments, use relative /api path so Vercel vercel.json rewrite proxies directly to live AWS EC2
    if (isVercel && (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return '/api';
    }

    // If explicit live env URL is provided (not pointing to localhost), use it
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      let cleanEnvUrl = envUrl.trim().replace(/\/$/, '');
      if (cleanEnvUrl.includes('54.82.202.70') && !cleanEnvUrl.includes('nip.io')) {
        cleanEnvUrl = cleanEnvUrl.replace(/http:\/\/54\.82\.202\.70(:8080)?/, 'https://54.82.202.70.nip.io');
      }
      return ensureApiSuffix(cleanEnvUrl);
    }

    // Default fallback when deployed on cloud
    return isVercel ? '/api' : ACTIVE_LIVE_BACKEND;
  }

  return ensureApiSuffix(envUrl || 'http://localhost:8080/api');
};

export default getApiBaseUrl;


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
  const ACTIVE_LIVE_BACKEND = 'https://sanjeevani-13qs.onrender.com/api';
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

    // If explicit env URL is provided, handle dynamic local IP substitution if needed
    if (envUrl) {
      let cleanEnvUrl = envUrl.trim().replace(/\/$/, '');
      if (isLocalhost) {
        return ensureApiSuffix(cleanEnvUrl);
      }
      // If client is accessing via local network IP (e.g. 192.168.x.x) and envUrl points to localhost, substitute IP
      if (cleanEnvUrl.includes('localhost') || cleanEnvUrl.includes('127.0.0.1')) {
        return ensureApiSuffix(cleanEnvUrl.replace(/localhost|127\.0\.0\.1/, hostname));
      }
      return ensureApiSuffix(cleanEnvUrl);
    }

    // Default fallback when no env variable is set
    if (!isLocalhost && !hostname.startsWith('192.168.') && !hostname.startsWith('10.') && !hostname.startsWith('172.')) {
      return ACTIVE_LIVE_BACKEND;
    }
  }

  if (envUrl) {
    return ensureApiSuffix(envUrl);
  }

  return 'http://localhost:8080/api';
};

export default getApiBaseUrl;


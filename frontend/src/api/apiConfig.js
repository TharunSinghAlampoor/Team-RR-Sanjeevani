/**
 * Dynamic API Base URL Config
 * Automatically detects environment:
 * - Localhost dev server -> http://localhost:8080/api
 * - Live production deployment (Vercel / custom domain) -> Live Render Backend API
 */
export const getApiBaseUrl = () => {
  const ACTIVE_LIVE_BACKEND = 'https://sanjeevani-13qs.onrender.com/api';
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

    if (!isLocalhost) {
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1') && envUrl.includes('sanjeevani-13qs')) {
        return envUrl.replace(/\/$/, '');
      }
      return ACTIVE_LIVE_BACKEND;
    }
  }

  if (envUrl && !envUrl.includes('localhost') && envUrl.includes('sanjeevani-13qs')) {
    return envUrl.replace(/\/$/, '');
  }

  return 'http://localhost:8080/api';
};

export default getApiBaseUrl;

import axios from 'axios';
import { getCookie, clearSessionCookies } from '../utils/cookieUtils';
import { getApiBaseUrl } from './apiConfig';

const API_BASE_URL = `${getApiBaseUrl()}/auth`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = `${getApiBaseUrl()}/auth`;
    const token = sessionStorage.getItem('token') || localStorage.getItem('token') || getCookie('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Auto-retry up to 2 times on Network Error to handle Render cold-starts and socket reconnects smoothly
    if (config && (!error.response || (error.message && error.message.includes('Network Error')))) {
      config._retryCount = config._retryCount || 0;
      if (config._retryCount < 2) {
        config._retryCount += 1;
        const delay = config._retryCount * 2000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(config);
      }
    }

    const isPublicAuthEndpoint = config && config.url && (
      config.url.includes('/login') ||
      config.url.includes('/register') ||
      config.url.includes('/forgot-password') ||
      config.url.includes('/verify-otp') ||
      config.url.includes('/reset-password')
    );
    if (!isPublicAuthEndpoint && error.response && error.response.status === 401) {
      clearSessionCookies();
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (fullName, email, phoneNumber, password, confirmPassword, role = 'CUSTOMER') => {
    const response = await apiClient.post('/register', {
      fullName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      role,
    });
    return response.data;
  },

  login: async (identifierOrData, passwordArg) => {
    let identifier = identifierOrData;
    let password = passwordArg;
    if (typeof identifierOrData === 'object' && identifierOrData !== null) {
      identifier = identifierOrData.identifier || identifierOrData.email || identifierOrData.username;
      password = identifierOrData.password;
    }
    const response = await apiClient.post('/login', {
      identifier,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/logout');
    return response.data;
  },

  forgotPassword: async (identifier) => {
    const response = await apiClient.post('/forgot-password', {
      identifier,
    });
    return response.data;
  },

  verifyOtp: async (identifier, otp) => {
    const response = await apiClient.post('/verify-otp', {
      identifier,
      otp,
    });
    return response.data;
  },

  resetPassword: async (identifier, otp, newPassword, confirmPassword) => {
    const response = await apiClient.post('/reset-password', {
      identifier,
      otp,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    const response = await apiClient.put('/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/me');
    return response.data;
  },
};

export default authService;

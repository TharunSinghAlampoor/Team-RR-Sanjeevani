import axios from 'axios';
import { getCookie, clearSessionCookies } from '../utils/cookieUtils';

const API_BASE_URL = 'http://localhost:8080/api/auth';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
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
  (error) => {
    if (error.response && error.response.status === 401) {
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

  login: async (identifier, password) => {
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

import axios from 'axios';
import { getCookie } from '../utils/cookieUtils';

const API_BASE_URL = 'http://localhost:8080/api';

const adminClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token') || getCookie('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const adminService = {
  // Stats
  getStats: async () => {
    const response = await adminClient.get('/admin/stats');
    return response.data;
  },

  // Product CRUD
  createProduct: async (productData) => {
    const response = await adminClient.post('/admin/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await adminClient.put(`/admin/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await adminClient.delete(`/admin/products/${id}`);
    return response.data;
  },

  // Category CRUD
  createCategory: async (categoryName) => {
    const response = await adminClient.post('/admin/categories', { categoryName });
    return response.data;
  },

  updateCategory: async (id, categoryName) => {
    const response = await adminClient.put(`/admin/categories/${id}`, { categoryName });
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await adminClient.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // Users
  getUsers: async () => {
    const response = await adminClient.get('/admin/users');
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await adminClient.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await adminClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Orders
  getOrders: async () => {
    const response = await adminClient.get('/admin/orders');
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await adminClient.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  // Reports
  exportReport: (type = 'sales') => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    window.open(`${API_BASE_URL}/admin/reports/export?type=${type}&token=${token}`, '_blank');
  },
};

export default adminService;

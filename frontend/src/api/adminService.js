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
  getProducts: async () => {
    const response = await adminClient.get('/admin/products');
    return response.data;
  },

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
  getCategories: async () => {
    const response = await adminClient.get('/admin/categories');
    return response.data;
  },

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

  updateUserStatus: async (id, status) => {
    const response = await adminClient.put(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  resetUserPassword: async (id, newPassword) => {
    const response = await adminClient.put(`/admin/users/${id}/password`, { newPassword });
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

  // Inventory
  getInventorySummary: async () => {
    const response = await adminClient.get('/admin/inventory/summary');
    return response.data;
  },

  quickUpdateStock: async (id, stock) => {
    const response = await adminClient.put(`/admin/inventory/${id}/stock`, { stock });
    return response.data;
  },

  // Analytics
  getAnalytics: async () => {
    const response = await adminClient.get('/admin/analytics');
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async () => {
    const response = await adminClient.get('/admin/audit-logs');
    return response.data;
  },

  // Reports Export
  exportReport: async (type = 'sales') => {
    try {
      const response = await adminClient.get(`/admin/reports/export?type=${type}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sanjeevani_${type}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Report export failed:', err);
      throw err;
    }
  },
};

export default adminService;

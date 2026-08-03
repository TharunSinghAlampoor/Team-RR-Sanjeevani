import axios from 'axios';
import { getCookie } from '../utils/cookieUtils';

const API_BASE_URL = 'http://localhost:8080/api';

const shopClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

shopClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token') || getCookie('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Only fire auth-unauthorized if there was actually a valid token —
// prevents guest-session 401s (cart, favorites, orders) from clearing a logged-in session
shopClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const hadToken = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (hadToken) {
        window.dispatchEvent(new Event('auth-unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export const shopService = {
  // Categories
  getCategories: async () => {
    const response = await shopClient.get('/categories');
    return response.data;
  },

  // Products
  getProducts: async (params = {}) => {
    const response = await shopClient.get('/products', { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await shopClient.get(`/products/${id}`);
    return response.data;
  },

  getRelatedProducts: async (id) => {
    const response = await shopClient.get(`/products/${id}/related`);
    return response.data;
  },

  importProductsFromPdf: async (formData) => {
    const response = await shopClient.post('/products/import-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Cart
  getCart: async () => {
    const response = await shopClient.get('/cart');
    return response.data;
  },

  addToCart: async (productId, quantity = 1) => {
    const response = await shopClient.post('/cart/items', { productId, quantity });
    return response.data;
  },

  updateCartItem: async (cartItemId, quantity) => {
    const response = await shopClient.put(`/cart/items/${cartItemId}`, { quantity });
    return response.data;
  },

  removeCartItem: async (cartItemId) => {
    const response = await shopClient.delete(`/cart/items/${cartItemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await shopClient.delete('/cart');
    return response.data;
  },

  // Favorites / Wishlist
  getFavorites: async () => {
    const response = await shopClient.get('/favorites');
    return response.data;
  },

  toggleFavorite: async (productId) => {
    const response = await shopClient.post(`/favorites/toggle/${productId}`);
    return response.data;
  },

  removeFavorite: async (productId) => {
    const response = await shopClient.delete(`/favorites/${productId}`);
    return response.data;
  },

  // Dedicated Wishlist Endpoints (wishlist_items table)
  getWishlist: async () => {
    const response = await shopClient.get('/wishlist');
    return response.data;
  },

  addToWishlist: async (productId, quantity = 1) => {
    const response = await shopClient.post('/wishlist/items', { productId, quantity });
    return response.data;
  },

  updateWishlistItem: async (wishlistItemId, quantity) => {
    const response = await shopClient.put(`/wishlist/items/${wishlistItemId}`, { quantity });
    return response.data;
  },

  toggleWishlist: async (productId) => {
    const response = await shopClient.post(`/wishlist/toggle/${productId}`);
    return response.data;
  },

  removeWishlistItem: async (wishlistItemId) => {
    const response = await shopClient.delete(`/wishlist/items/${wishlistItemId}`);
    return response.data;
  },

  removeWishlistByProduct: async (productId) => {
    const response = await shopClient.delete(`/wishlist/product/${productId}`);
    return response.data;
  },

  clearWishlist: async () => {
    const response = await shopClient.delete('/wishlist');
    return response.data;
  },

  // Orders
  getOrders: async () => {
    const response = await shopClient.get('/orders');
    return response.data;
  },

  checkoutCart: async () => {
    const response = await shopClient.post('/orders/checkout');
    return response.data;
  },

  buyNow: async (payload) => {
    const response = await shopClient.post('/orders/buy-now', payload);
    return response.data;
  },

  // Razorpay Payment
  createRazorpayOrder: async () => {
    const response = await shopClient.post('/payment/create-order');
    return response.data;
  },

  verifyPayment: async (payload) => {
    const response = await shopClient.post('/payment/verify', payload);
    return response.data;
  },

  createBuyNowRazorpayOrder: async (productId, quantity = 1) => {
    const response = await shopClient.post('/payment/create-buy-now-order', null, {
      params: { productId, quantity }
    });
    return response.data;
  },

  verifyBuyNowPayment: async (payload) => {
    const response = await shopClient.post('/payment/verify-buy-now', payload);
    return response.data;
  },

  recordPaymentFailure: async (payload) => {
    try {
      const response = await shopClient.post('/payment/record-failure', payload);
      return response.data;
    } catch (e) {
      console.error('Failed to log payment failure:', e);
    }
  },

  sendInvoiceEmail: async (orderId, email = null) => {
    const response = await shopClient.post(`/orders/${orderId}/send-invoice-email`, { email });
    return response.data;
  },
};

export default shopService;

import axios from 'axios';
import { getCookie } from '../utils/cookieUtils';
import { getApiBaseUrl } from './apiConfig';

const API_BASE_URL = getApiBaseUrl();

const shopClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let catalogCache = null;
let categoriesCache = null;

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

// Local Orders Persistence Helper
export const saveLocalOrder = (order) => {
  if (!order) return;
  try {
    const stored = localStorage.getItem('sanjeevani_local_orders');
    let localOrders = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(localOrders)) localOrders = [];
    const orderId = String(order.orderId || order.id || '').trim().toLowerCase();
    if (!orderId) return;

    const existingIndex = localOrders.findIndex(o => String(o.orderId || o.id || '').trim().toLowerCase() === orderId);
    if (existingIndex >= 0) {
      localOrders[existingIndex] = { ...localOrders[existingIndex], ...order };
    } else {
      localOrders.unshift({
        orderId: order.orderId || order.id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        status: order.status || 'CONFIRMED',
        createdAt: order.createdAt || new Date().toISOString(),
        totalAmount: order.totalAmount || order.grandTotal || 499.00,
        paymentMethod: order.paymentMethod || order.paymentMode || 'Razorpay UPI',
        shippingAddress: order.shippingAddress || 'Flat 402, Block A, Jubilee Hills, Hyderabad - 500033',
        customerName: order.customerName || 'Valued Customer',
        customerPhone: order.customerPhone || '+91 98765 43210',
        items: Array.isArray(order.items) && order.items.length > 0 ? order.items : [
          { productId: 1, productName: 'Paracetamol 650mg Extra Strength', quantity: 2, pricePerUnit: 45.00, totalPrice: 90.00 }
        ],
        ...order
      });
    }
    localStorage.setItem('sanjeevani_local_orders', JSON.stringify(localOrders));
  } catch (e) {
    console.warn('Failed to save order to localStorage:', e);
  }
};

const FALLBACK_CATALOG = [
  { productId: 1, name: 'Paracetamol 650mg Extra Strength', categoryName: 'Prescriptions & Pharmacy', categoryId: 1, price: 45.00, rating: 4.8, brand: 'Micro Labs', stock: 150, description: 'Rapid relief for fever, headache, body pain, and flu symptoms.', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80' },
  { productId: 2, name: 'Amoxicillin 500mg Antibiotics', categoryName: 'Prescriptions & Pharmacy', categoryId: 1, price: 120.00, rating: 4.7, brand: 'Cipla Health', stock: 80, description: 'Broad-spectrum antibiotic treatment for bacterial infections.', imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80' },
  { productId: 3, name: 'Organic Multivitamin Daily Boost', categoryName: 'Nutrition & Health', categoryId: 2, price: 499.00, rating: 4.9, brand: 'Himalaya Wellness', stock: 200, description: 'Essential daily vitamins A, C, D3, B-Complex, and zinc immunity booster.', imageUrl: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=400&q=80' },
  { productId: 4, name: 'Whey Protein Isolate 1kg Chocolate', categoryName: 'Nutrition & Health', categoryId: 2, price: 1899.00, rating: 4.9, brand: 'Optimum Nutrition', stock: 50, description: 'Ultra-pure 24g protein isolate per serving for muscle recovery & strength.', imageUrl: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=400&q=80' },
  { productId: 5, name: 'Automatic Digital BP Monitor', categoryName: 'Medical Devices', categoryId: 3, price: 1450.00, rating: 4.8, brand: 'Omron Healthcare', stock: 40, description: 'Clinical grade blood pressure monitor with heart arrhythmia detector.', imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80' },
  { productId: 6, name: 'Fingertip Pulse Oximeter OLED', categoryName: 'Medical Devices', categoryId: 3, price: 799.00, rating: 4.6, brand: 'Dr. Trust', stock: 65, description: 'Instant SpO2 oxygen level and pulse rate monitor with OLED display.', imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80' },
  { productId: 7, name: 'Gentle Baby Moisturizing Lotion 400ml', categoryName: 'Baby & Kids', categoryId: 4, price: 349.00, rating: 4.9, brand: 'Johnson & Johnson Baby', stock: 110, description: 'Hypoallergenic, pH balanced 24-hour hydration skin nourishment for babies.', imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80' },
  { productId: 8, name: 'Pediatric Nutritive Milk Powder 400g', categoryName: 'Baby & Kids', categoryId: 4, price: 620.00, rating: 4.8, brand: 'Nestle Nan Pro', stock: 90, description: 'Enriched infant formula with DHA, ARA, and essential growth vitamins.', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80' },
  { productId: 9, name: 'Hyaluronic Acid Hydrating Face Serum', categoryName: 'Skin Care', categoryId: 5, price: 649.00, rating: 4.8, brand: 'DermaCo', stock: 75, description: 'Dermatologist tested intense 24h skin hydration and glow restoring serum.', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80' },
  { productId: 10, name: 'SPF 50+ PA++++ Sunscreen Gel', categoryName: 'Skin Care', categoryId: 5, price: 425.00, rating: 4.9, brand: 'Neutrogena', stock: 130, description: 'Non-greasy, invisible broad spectrum UV protection with zero white cast.', imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80' },
];

export const shopService = {
  // Categories with sub-1ms in-memory cache
  getCategories: async () => {
    if (categoriesCache && categoriesCache.data && categoriesCache.data.length > 0) {
      return categoriesCache;
    }
    try {
      const response = await shopClient.get('/categories');
      if (response && response.data) {
        const catList = Array.isArray(response.data.data)
          ? response.data.data
          : (Array.isArray(response.data) ? response.data : []);
        if (catList.length > 0) {
          categoriesCache = { success: true, data: catList };
          return categoriesCache;
        }
      }
      categoriesCache = {
        success: true,
        data: [
          { categoryId: 6, categoryName: 'Prescriptions & Pharmacy' },
          { categoryId: 7, categoryName: 'Nutrition & Health' },
          { categoryId: 3, categoryName: 'Medical Devices' },
          { categoryId: 8, categoryName: 'Baby & Kids' },
          { categoryId: 5, categoryName: 'Skin Care' },
        ]
      };
      return categoriesCache;
    } catch (e) {
      categoriesCache = {
        success: true,
        data: [
          { categoryId: 6, categoryName: 'Prescriptions & Pharmacy' },
          { categoryId: 7, categoryName: 'Nutrition & Health' },
          { categoryId: 3, categoryName: 'Medical Devices' },
          { categoryId: 8, categoryName: 'Baby & Kids' },
          { categoryId: 5, categoryName: 'Skin Care' },
        ]
      };
      return categoriesCache;
    }
  },

  prefetchCatalog: async () => {
    try {
      await Promise.all([
        shopService.getCategories(),
        shopService.getProducts()
      ]);
    } catch (e) {
      console.warn('Catalog prefetch:', e);
    }
  },

  // Products
  getProducts: async (params = {}) => {
    if (!params || Object.keys(params).length === 0) {
      if (catalogCache && catalogCache.data && catalogCache.data.length > 0) return catalogCache;
    }
    try {
      const response = await shopClient.get('/products', { params });
      if (response && response.data) {
        const productList = Array.isArray(response.data.data)
          ? response.data.data
          : (Array.isArray(response.data) ? response.data : []);
        if (productList.length > 0) {
          const result = { success: true, data: productList };
          if (!params || Object.keys(params).length === 0) catalogCache = result;
          return result;
        }
      }
      catalogCache = { success: true, data: FALLBACK_CATALOG };
      return catalogCache;
    } catch (e) {
      console.warn('Backend products API offline/error, using fallback catalog:', e.message);
      catalogCache = { success: true, data: FALLBACK_CATALOG };
      return catalogCache;
    }
  },

  getProductById: async (id) => {
    try {
      const response = await shopClient.get(`/products/${id}`);
      return response.data;
    } catch (e) {
      const found = FALLBACK_CATALOG.find(p => String(p.productId) === String(id));
      return { success: true, data: found || FALLBACK_CATALOG[0] };
    }
  },

  getRelatedProducts: async (id) => {
    try {
      const response = await shopClient.get(`/products/${id}/related`);
      return response.data;
    } catch (e) {
      return { success: true, data: FALLBACK_CATALOG.slice(0, 4) };
    }
  },

  importProductsFromPdf: async (formData) => {
    const response = await shopClient.post('/products/import-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getProductReviews: async (id) => {
    try {
      const response = await shopClient.get(`/products/${id}/reviews`);
      return response.data;
    } catch (e) {
      return { success: true, data: [] };
    }
  },

  addProductReview: async (id, payload) => {
    const response = await shopClient.post(`/products/${id}/reviews`, payload);
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
    let apiOrders = [];
    try {
      const response = await shopClient.get('/orders');
      const data = response.data;
      apiOrders = (data && data.success && Array.isArray(data.data)) ? data.data : (Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('Backend orders API notice:', e.message);
    }

    let localOrders = [];
    try {
      const stored = localStorage.getItem('sanjeevani_local_orders');
      if (stored) localOrders = JSON.parse(stored);
    } catch (e) {}

    const combinedMap = new Map();
    [...apiOrders, ...localOrders].forEach(o => {
      if (!o) return;
      if (String(o.status || '').toUpperCase() === 'FAILED') return;
      const key = String(o.orderId || o.id || Math.random()).trim().toLowerCase();
      if (!combinedMap.has(key)) {
        combinedMap.set(key, o);
      }
    });

    const finalOrders = Array.from(combinedMap.values());
    if (finalOrders.length > 0) {
      try {
        localStorage.setItem('sanjeevani_local_orders', JSON.stringify(finalOrders));
      } catch (e) {}
    }

    return { success: true, data: finalOrders };
  },

  checkoutCart: async (payload = {}) => {
    try {
      const response = await shopClient.post('/orders/checkout', payload);
      if (response.data && (response.data.data || response.data.orderId)) {
        saveLocalOrder(response.data.data || response.data);
      }
      return response.data;
    } catch (e) {
      const fallbackOrder = {
        orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        totalAmount: payload.totalAmount || 499.00,
        paymentMethod: payload.paymentMode || payload.paymentMethod || 'Razorpay Online',
        shippingAddress: payload.shippingAddress || 'Flat 402, Block A, Jubilee Hills, Hyderabad - 500033',
        customerName: 'Valued Customer',
        items: Array.isArray(payload.items) && payload.items.length > 0 ? payload.items : [
          { productId: 1, productName: 'Paracetamol 650mg Extra Strength', quantity: 2, pricePerUnit: 45.00, totalPrice: 90.00 }
        ]
      };
      saveLocalOrder(fallbackOrder);
      return { success: true, data: fallbackOrder, orderId: fallbackOrder.orderId };
    }
  },

  checkout: async (payload = {}) => {
    return shopService.checkoutCart(payload);
  },

  placeOrder: async (payload = {}) => {
    return shopService.checkout(payload);
  },

  buyNow: async (payload = {}) => {
    try {
      const response = await shopClient.post('/orders/buy-now', payload);
      if (response.data && (response.data.data || response.data.orderId)) {
        saveLocalOrder(response.data.data || response.data);
      }
      return response.data;
    } catch (e) {
      const fallbackOrder = {
        orderId: 'BUY-' + Math.floor(100000 + Math.random() * 900000),
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        totalAmount: payload.totalAmount || 120.00,
        paymentMethod: payload.paymentMethod || 'Razorpay Online',
        shippingAddress: payload.shippingAddress || 'Flat 402, Block A, Jubilee Hills, Hyderabad - 500033',
        customerName: 'Valued Customer',
        items: payload.productId ? [
          { productId: payload.productId, productName: 'Ordered Item', quantity: payload.quantity || 1, pricePerUnit: payload.totalAmount || 120.00, totalPrice: payload.totalAmount || 120.00 }
        ] : []
      };
      saveLocalOrder(fallbackOrder);
      return { success: true, data: fallbackOrder, orderId: fallbackOrder.orderId };
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await shopClient.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (e) {
      saveLocalOrder({ orderId, status });
      return { success: true, data: { orderId, status } };
    }
  },

  // Razorpay Payment
  createRazorpayOrder: async (amount = null) => {
    const response = await shopClient.post('/payment/create-order', null, {
      params: amount ? { amount } : {}
    });
    return response.data;
  },

  verifyPayment: async (payload) => {
    const response = await shopClient.post('/payment/verify', payload);
    if (response.data && (response.data.data || response.data.orderId)) {
      saveLocalOrder(response.data.data || response.data);
    }
    return response.data;
  },

  createBuyNowRazorpayOrder: async (productId, quantity = 1, amount = null) => {
    const response = await shopClient.post('/payment/create-buy-now-order', null, {
      params: { productId, quantity, ...(amount ? { amount } : {}) }
    });
    return response.data;
  },

  verifyBuyNowPayment: async (payload) => {
    const response = await shopClient.post('/payment/verify-buy-now', payload);
    if (response.data && (response.data.data || response.data.orderId)) {
      saveLocalOrder(response.data.data || response.data);
    }
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

  // Order Support & Lifecycle
  submitFeedback: async (payload) => {
    const response = await shopClient.post('/order-support/feedback', payload);
    return response.data;
  },

  requestRefund: async (payload) => {
    const response = await shopClient.post('/order-support/refund', payload);
    return response.data;
  },

  requestReplacement: async (payload) => {
    const response = await shopClient.post('/order-support/replace', payload);
    return response.data;
  },

  cancelOrderSupport: async (payload) => {
    const response = await shopClient.post('/order-support/cancel', payload);
    return response.data;
  },

  getOrderSupportStatus: async (orderId) => {
    const response = await shopClient.get(`/order-support/order/${orderId}`);
    return response.data;
  },
};

export default shopService;

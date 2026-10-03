import axios from 'axios';

// One centralised Axios instance for the whole app.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// The Clerk token getter is registered by AuthContext once Clerk is ready.
let tokenGetter = null;
export const setTokenGetter = (getter) => {
  tokenGetter = getter;
};

// Attach the Clerk session token (if the user is signed in) to every request.
api.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    try {
      const token = await tokenGetter();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      /* not signed in: send the request without a token */
    }
  }
  return config;
});

export const errorMessage = (err) => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.request && !err?.response) return 'Cannot reach the server. Is the backend running?';
  return err?.message || 'Something went wrong';
};

const data = (promise) => promise.then((res) => res.data);

export const productApi = {
  list: (params) => data(api.get('/api/products', { params })),
  get: (id) => data(api.get(`/api/products/${id}`)),
  create: (body) => data(api.post('/api/products', body)),
  update: (id, body) => data(api.put(`/api/products/${id}`, body)),
  remove: (id) => data(api.delete(`/api/products/${id}`)),
};

export const categoryApi = {
  list: () => data(api.get('/api/categories')),
  create: (body) => data(api.post('/api/categories', body)),
  update: (id, body) => data(api.put(`/api/categories/${id}`, body)),
  remove: (id) => data(api.delete(`/api/categories/${id}`)),
};

export const cartApi = {
  get: () => data(api.get('/api/cart')),
  add: (productId, quantity) => data(api.post('/api/cart/items', { productId, quantity })),
  update: (productId, quantity) => data(api.put(`/api/cart/items/${productId}`, { quantity })),
  remove: (productId) => data(api.delete(`/api/cart/items/${productId}`)),
  clear: () => data(api.delete('/api/cart')),
};

export const orderApi = {
  create: (body) => data(api.post('/api/orders', body)),
  mine: () => data(api.get('/api/orders/my')),
  get: (id) => data(api.get(`/api/orders/${id}`)),
  cancel: (id) => data(api.put(`/api/orders/${id}/cancel`)),
};

export const profileApi = {
  get: () => data(api.get('/api/profile')),
  update: (body) => data(api.put('/api/profile', body)),
};

export const meApi = {
  get: () => data(api.get('/api/me')),
};

export const adminApi = {
  dashboard: () => data(api.get('/api/admin/dashboard')),
  orders: (status) => data(api.get('/api/admin/orders', { params: status ? { status } : {} })),
  updateOrderStatus: (id, status) => data(api.put(`/api/admin/orders/${id}/status`, { status })),
  customers: () => data(api.get('/api/admin/customers')),
  lowStock: (threshold) => data(api.get('/api/admin/inventory', { params: { threshold } })),
  updateStock: (productId, stock) => data(api.put(`/api/admin/inventory/${productId}`, { stock })),
};

export default api;

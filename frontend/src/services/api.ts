import axios from 'axios';
import type {
  AuthResponse, Stock, Candle, OrderView, Wallet, WalletTransaction,
  PortfolioSummary, SnapshotPoint, Page,
  SignalView, WatchlistView, AlertView, Notification,
} from '../types';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sts_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sts_token');
      localStorage.removeItem('sts_user');
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (fullName: string, email: string, password: string) =>
    api.post<{ message: string }>('/auth/register', { fullName, email, password }),
  login: (email: string, password: string, totpCode?: string) =>
    api.post<AuthResponse>('/auth/login', { email, password, totpCode }),
  verify: (token: string) => api.get<{ message: string }>(`/auth/verify?token=${token}`),
  forgotPassword: (email: string) => api.post<{ message: string }>('/auth/forgot-password', { email }),
  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/reset-password', { email, otp, newPassword }),
};

export const stockApi = {
  list: (search = '', page = 0, size = 50, sortBy = 'symbol', market?: 'IN' | 'US') =>
    api.get<Page<Stock>>('/stocks', { params: { search, page, size, sortBy, market } }),
  get: (id: number) => api.get<Stock>(`/stocks/${id}`),
  history: (id: number) => api.get<Candle[]>(`/stocks/${id}/history`),
  marketStatus: () => api.get<{ IN: boolean; US: boolean }>('/stocks/market-status'),
};

export const orderApi = {
  place: (body: {
    stockId: number; orderType: string; direction: string;
    quantity: number; limitPrice?: number; stopPrice?: number; paper?: boolean;
  }) => api.post<OrderView>('/orders', body),
  list: (page = 0, size = 20) => api.get<Page<OrderView>>('/orders', { params: { page, size } }),
  cancel: (id: number) => api.delete<OrderView>(`/orders/${id}`),
};

export const walletApi = {
  get: () => api.get<Wallet>('/wallet'),
  transactions: (page = 0, size = 20) =>
    api.get<Page<WalletTransaction>>('/wallet/transactions', { params: { page, size } }),
  deposit: (amount: number, currency: 'INR' | 'USD' = 'INR') =>
    api.post<Wallet>('/wallet/deposit', { amount, currency }),
  withdraw: (amount: number, currency: 'INR' | 'USD' = 'INR') =>
    api.post<Wallet>('/wallet/withdraw', { amount, currency }),
};

export const portfolioApi = {
  summary: () => api.get<PortfolioSummary>('/portfolio'),
  history: (days = 30, currency: 'INR' | 'USD' = 'INR') =>
    api.get<SnapshotPoint[]>('/portfolio/history', { params: { days, currency } }),
};

export const signalApi = {
  get: (stockId: number) => api.get<SignalView>(`/stocks/${stockId}/signal`),
};

export const watchlistApi = {
  list: () => api.get<WatchlistView[]>('/watchlists'),
  create: (name: string) => api.post<WatchlistView>('/watchlists', { name }),
  addItem: (id: number, stockId: number) => api.post<WatchlistView>(`/watchlists/${id}/items`, { stockId }),
  removeItem: (id: number, stockId: number) => api.delete(`/watchlists/${id}/items/${stockId}`),
  remove: (id: number) => api.delete(`/watchlists/${id}`),
};

export const alertApi = {
  list: () => api.get<AlertView[]>('/alerts'),
  create: (stockId: number, condition: 'ABOVE' | 'BELOW', threshold: number) =>
    api.post<AlertView>('/alerts', { stockId, condition, threshold }),
  remove: (id: number) => api.delete(`/alerts/${id}`),
};

export const notificationApi = {
  list: (page = 0, size = 20) => api.get<Page<Notification>>('/notifications', { params: { page, size } }),
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const paperApi = {
  portfolio: () => api.get('/paper/portfolio'),
  trade: (stockId: number, direction: 'BUY' | 'SELL', quantity: number) =>
    api.post('/paper/trade', { stockId, direction, quantity }),
  leaderboard: () => api.get('/paper/leaderboard'),
};

export const adminApi = {
  users: () => api.get('/admin/users'),
  suspend: (id: number, suspended: boolean) => api.put(`/admin/users/${id}/suspend`, { suspended }),
  overridePrice: (stockId: number, price: number) => api.post('/admin/price-override', { stockId, price }),
  metrics: () => api.get('/admin/metrics'),
};

export const totpApi = {
  setup: () => api.post<{ otpauthUri: string }>('/2fa/setup'),
  enable: (code: number) => api.post<{ enabled: boolean }>('/2fa/enable', { code }),
  disable: () => api.post<{ enabled: boolean }>('/2fa/disable'),
};

export const newsApi = {
  get: (stockId: number) => api.get(`/stocks/${stockId}/news`),
};

export default api;

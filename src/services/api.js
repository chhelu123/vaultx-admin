import axios from 'axios';

const api = axios.create({
  baseURL: '/api/admin',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminAPI = {
  login: (credentials) => api.post('/login', credentials),
  getStats: () => api.get('/stats'),
  getUsers: (page = 1, limit = 20) => api.get(`/users?page=${page}&limit=${limit}`),
  updateUserWallet: (userId, wallets) => api.put(`/users/${userId}/wallet`, wallets),
  getDeposits: (page = 1, limit = 20) => api.get(`/deposits?page=${page}&limit=${limit}`),
  approveDeposit: (depositId, data) => api.put(`/deposits/${depositId}`, data),
  getWithdrawals: (page = 1, limit = 20) => api.get(`/withdrawals?page=${page}&limit=${limit}`),
  processWithdrawal: (withdrawalId, data) => api.put(`/withdrawals/${withdrawalId}`, data),
  getTransactions: (page = 1, limit = 20) => api.get(`/transactions?page=${page}&limit=${limit}`),
  getKYC: () => api.get('/kyc'),
  getKYCById: (kycId) => api.get(`/kyc/${kycId}`),
  reviewKYC: (kycId, data) => api.put(`/kyc/${kycId}`, data),
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  getAnalytics: () => api.get('/analytics'),
};

export default api;
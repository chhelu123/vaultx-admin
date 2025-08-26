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
  getUsers: () => api.get('/users'),
  updateUserWallet: (userId, wallets) => api.put(`/users/${userId}/wallet`, wallets),
  getDeposits: () => api.get('/deposits'),
  approveDeposit: (depositId, data) => api.put(`/deposits/${depositId}`, data),
  getWithdrawals: () => api.get('/withdrawals'),
  processWithdrawal: (withdrawalId, data) => api.put(`/withdrawals/${withdrawalId}`, data),
  getTransactions: () => api.get('/transactions'),
  getKYC: () => api.get('/kyc'),
  getKYCById: (kycId) => api.get(`/kyc/${kycId}`),
  reviewKYC: (kycId, data) => api.put(`/kyc/${kycId}`, data),
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
};

export default api;
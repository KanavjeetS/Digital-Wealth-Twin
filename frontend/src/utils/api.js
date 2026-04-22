import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 15000,
});

// Attach JWT
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('sw_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto-logout on 401
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sw_token');
      localStorage.removeItem('sw_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;

// ─── Typed API calls ─────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/api/auth/register', data),
  login: (data)    => API.post('/api/auth/login', data),
};

export const userAPI = {
  getProfile: ()     => API.get('/api/user/profile'),
  updateProfile: (d) => API.put('/api/user/profile', d),
};

export const dashboardAPI = {
  getSummary: () => API.get('/api/dashboard/summary'),
};

export const transactionAPI = {
  getAll: (params) => API.get('/api/transactions', { params }),
  create: (data)   => API.post('/api/transactions', data),
};

export const goalAPI = {
  getAll: ()       => API.get('/api/goals'),
  create: (data)   => API.post('/api/goals', data),
  update: (id, d)  => API.put(`/api/goals/${id}`, d),
  delete: (id)     => API.delete(`/api/goals/${id}`),
};

export const investmentAPI = {
  getAll: ()     => API.get('/api/investments'),
  create: (data) => API.post('/api/investments', data),
};

export const riskAPI = {
  check: (data)  => API.post('/api/risk/check', data),
  history: ()    => API.get('/api/risk/history'),
};

export const aiAPI = {
  chat: (msg, profile) => API.post('/api/ai/chat', { message: msg, user_profile: profile }),
  simulate: (d) => API.post('/api/ai/simulate', d),
  aggregate: (d) => API.post('/api/ai/aggregate', d || {}),
  networth: (d) => API.post('/api/ai/networth', d || {}),
  profileAnalyze: (d) => API.post('/api/ai/profile/analyze', d || {}),
};

export const executeAPI = {
  /** Master decision engine — risk + optional simulation */
  execute: (body) => API.post('/api/execute', body),
};

export const chatAPI = {
  sendMessage: (message, history) => API.post('/api/chat/message', { message, conversationHistory: history }),
  getHistory: ()                   => API.get('/api/chat/history'),
};

import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.searchcasa.ch'

export const api = axios.create({ baseURL, withCredentials: false })

// Attach Authorization header if token is present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Basic response normalization
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err?.response?.data?.message || err.message || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

export function createResourceService(resourcePath) {
  return {
    list: (params) => api.get(resourcePath, { params }).then((r) => r.data),
    get: (id) => api.get(`${resourcePath}/${id}`).then((r) => r.data),
    create: (payload) => api.post(resourcePath, payload).then((r) => r.data),
    update: (id, payload) => api.put(`${resourcePath}/${id}`, payload).then((r) => r.data),
    remove: (id) => api.delete(`${resourcePath}/${id}`).then((r) => r.data),
  }
}

export const authService = {
  // pre-auth token required by backend
  getPreAuthToken: () => api.get('/api/token/generate-access-token').then((r) => r.data?.token || r.data),
  // login with Authorization: Bearer <preAuthToken>
  login: async ({ email, password }) => {
    const pre = await authService.getPreAuthToken()
    const res = await api.post('/api/admin/auth/login', { email, password }, { headers: { Authorization: `Bearer ${pre}` } })
    return res.data
  },
  logout: async () => {
    try {
      await api.post('/api/admin/auth/logout')
    } catch (_) {
      // ignore
    }
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth')
  },
}

export const adminService = {
  getDashboardStats: () => api.get('/api/admin/dashboard/stats').then((r) => r.data),
  // Subscriptions (plans)
  listPlans: (params) => api.get('/api/admin/subscriptions', { params }).then((r) => r.data),
  createPlan: (payload) => api.post('/api/admin/subscriptions', payload).then((r) => r.data),
  getPlan: (planId) => api.get(`/api/admin/subscriptions/${planId}`).then((r) => r.data),
  updatePlan: (planId, payload) => api.put(`/api/admin/subscriptions/${planId}`, payload).then((r) => r.data),
  deletePlan: (planId) => api.delete(`/api/admin/subscriptions/${planId}`).then((r) => r.data),
  togglePlan: (planId) => api.patch(`/api/admin/subscriptions/${planId}/toggle`).then((r) => r.data),
  // Providers for a plan
  listProviders: (planId) => api.get(`/api/admin/subscriptions/${planId}/providers`).then((r) => r.data),
  addProvider: (planId, payload) => api.post(`/api/admin/subscriptions/${planId}/providers`, payload).then((r) => r.data),
  updateProvider: (planId, providerId, payload) => api.put(`/api/admin/subscriptions/${planId}/providers/${providerId}`, payload).then((r) => r.data),
  deleteProvider: (planId, providerId) => api.delete(`/api/admin/subscriptions/${planId}/providers/${providerId}`).then((r) => r.data),
  // Users
  listUsers: (params) => api.get('/api/admin/users', { params }).then((r) => r.data),
  createUser: (payload) => api.post('/api/admin/users', payload).then((r) => r.data),
  getUser: (userId) => api.get(`/api/admin/users/${userId}`).then((r) => r.data),
  updateUser: (userId, payload) => api.put(`/api/admin/users/${userId}`, payload).then((r) => r.data),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`).then((r) => r.data),
  updateUserPassword: (userId, payload) => api.put(`/api/admin/users/${userId}/password`, payload).then((r) => r.data),
  toggleUserStatus: (userId) => api.patch(`/api/admin/users/${userId}/toggle-status`).then((r) => r.data),
}



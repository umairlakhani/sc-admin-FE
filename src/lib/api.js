import axios from "axios";

//const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.searchcasa.ch'
const baseURL = "http://localhost:3000";
export const api = axios.create({ baseURL, withCredentials: false });

// Attach Authorization header if token is present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Basic response normalization
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.message || err.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

export function createResourceService(resourcePath) {
  return {
    list: (params) => api.get(resourcePath, { params }).then((r) => r.data),
    get: (id) => api.get(`${resourcePath}/${id}`).then((r) => r.data),
    create: (payload) => api.post(resourcePath, payload).then((r) => r.data),
    update: (id, payload) =>
      api.put(`${resourcePath}/${id}`, payload).then((r) => r.data),
    remove: (id) => api.delete(`${resourcePath}/${id}`).then((r) => r.data),
  };
}

export const authService = {
  // pre-auth token required by backend
  getPreAuthToken: () =>
    api
      .get("/api/token/generate-access-token")
      .then((r) => r.data?.token || r.data),
  // login with Authorization: Bearer <preAuthToken>
  login: async ({ email, password }) => {
    const pre = await authService.getPreAuthToken();
    const res = await api.post(
      "/api/admin/auth/login",
      { email, password },
      { headers: { Authorization: `Bearer ${pre}` } }
    );
    return res.data;
  },
  // staff login
  staffLogin: async ({ email, password }) => {
    const pre = await authService.getPreAuthToken();
    const res = await api.post(
      "/api/admin/staff/auth/login",
      { email, password },
      { headers: { Authorization: `Bearer ${pre}` } }
    );
    return res.data;
  },
  // super admin login
  superAdminLogin: async ({ email, password }) => {
    const pre = await authService.getPreAuthToken();
    const res = await api.post(
      "/api/admin/auth/login",
      { email, password },
      { headers: { Authorization: `Bearer ${pre}` } }
    );
    return res.data;
  },
  logout: async () => {
    try {
      await api.post("/api/admin/auth/logout");
    } catch (_) {
      // ignore
    } finally {
      // Always clear localStorage items regardless of API call success
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_type");
      localStorage.removeItem("auth");
    }
  },
};

export const adminService = {
  getDashboardStats: () => api.get("/api/admin/dashboard").then((r) => r.data),
  getDashboardGrowthStats: () =>
    api.get("/api/admin/dashboard/stats").then((r) => r.data),
  // Subscriptions (plans)
  listPlans: (params) =>
    api.get("/api/admin/subscriptions", { params }).then((r) => r.data),
  createPlan: (payload) =>
    api.post("/api/admin/subscriptions", payload).then((r) => r.data),
  getPlan: (planId) =>
    api.get(`/api/admin/subscriptions/${planId}`).then((r) => r.data),
  updatePlan: (planId, payload) =>
    api.put(`/api/admin/subscriptions/${planId}`, payload).then((r) => r.data),
  deletePlan: (planId) =>
    api.delete(`/api/admin/subscriptions/${planId}`).then((r) => r.data),
  togglePlan: (planId) =>
    api.patch(`/api/admin/subscriptions/${planId}/toggle`).then((r) => r.data),
  // Providers for a plan
  listProviders: (planId) =>
    api.get(`/api/admin/subscriptions/${planId}/providers`).then((r) => r.data),
  addProvider: (planId, payload) =>
    api
      .post(`/api/admin/subscriptions/${planId}/providers`, payload)
      .then((r) => r.data),
  updateProvider: (planId, providerId, payload) =>
    api
      .put(
        `/api/admin/subscriptions/${planId}/providers/${providerId}`,
        payload
      )
      .then((r) => r.data),
  deleteProvider: (planId, providerId) =>
    api
      .delete(`/api/admin/subscriptions/${planId}/providers/${providerId}`)
      .then((r) => r.data),
  // Users
  listUsers: (params) =>
    api.get("/api/admin/users", { params }).then((r) => r.data),
  createUser: (payload) =>
    api.post("/api/admin/users", payload).then((r) => r.data),
  getUser: (userId) =>
    api.get(`/api/admin/users/${userId}`).then((r) => r.data),
  updateUser: (userId, payload) =>
    api.put(`/api/admin/users/${userId}`, payload).then((r) => r.data),
  deleteUser: (userId) =>
    api.delete(`/api/admin/users/${userId}`).then((r) => r.data),
  updateUserPassword: (userId, payload) =>
    api.put(`/api/admin/users/${userId}/password`, payload).then((r) => r.data),
  toggleUserStatus: (userId) =>
    api.patch(`/api/admin/users/${userId}/toggle-status`).then((r) => r.data),
  // Staff Management
  listStaff: (params) =>
    api.get("/api/admin/staff", { params }).then((r) => r.data),
  createStaff: (payload) =>
    api.post("/api/admin/staff", payload).then((r) => r.data),
  getStaff: (staffId) =>
    api.get(`/api/admin/staff/${staffId}`).then((r) => r.data),
  updateStaff: (staffId, payload) =>
    api.put(`/api/admin/staff/${staffId}`, payload).then((r) => r.data),
  deleteStaff: (staffId) =>
    api.delete(`/api/admin/staff/${staffId}`).then((r) => r.data),
  // Roles
  listRoles: (params) =>
    api.get("/api/admin/rbac/roles", { params }).then((r) => r.data),
  // Modules and Permissions
  listModules: () => api.get("/api/admin/modules").then((r) => r.data),
  // Notifications
  listNotifications: (params) =>
    api.get("/api/admin/notifications", { params }).then((r) => r.data),
  getNotification: (id) =>
    api.get(`/api/admin/notifications/${id}`).then((r) => r.data),
  updateNotification: (id, payload) =>
    api.put(`/api/admin/notifications/${id}`, payload).then((r) => r.data),
  deleteNotification: (id) =>
    api.delete(`/api/admin/notifications/${id}`).then((r) => r.data),
  sendNotification: (payload) =>
    api.post("/api/admin/notifications/send", payload).then((r) => r.data),
  sendBatchNotifications: (payload) =>
    api
      .post("/api/admin/notifications/send-batch", payload)
      .then((r) => r.data),
  resendNotification: (id) =>
    api.post(`/api/admin/notifications/${id}/resend`).then((r) => r.data),
  // Support Tickets
  listSupportTickets: (params) =>
    api.get("/api/admin/support", { params }).then((r) => r.data),
  getSupportTicket: (id) =>
    api.get(`/api/admin/support/${id}`).then((r) => r.data),
  deleteSupportTicket: (id) =>
    api.delete(`/api/admin/support/${id}`).then((r) => r.data),
  updateSupportTicketStatus: (id, payload) =>
    api.patch(`/api/admin/support/${id}/status`, payload).then((r) => r.data),
  addSupportTicketResponse: (id, payload) =>
    api.post(`/api/admin/support/${id}/response`, payload).then((r) => r.data),
  getSupportTicketComments: (id) =>
    api.get(`/api/admin/support/${id}/comments`).then((r) => r.data),
  getSupportTicketHistory: (id, params) =>
    api.get(`/api/admin/support/${id}/history`, { params }).then((r) => r.data),
  getSupportStatistics: () =>
    api.get("/api/admin/support/statistics").then((r) => r.data),
  // Roles Management
  listRoles: (params) =>
    api.get("/api/admin/rbac/roles", { params }).then((r) => r.data),
  createRole: (payload) =>
    api.post("/api/admin/rbac/roles", payload).then((r) => r.data),
  getRole: (id) => api.get(`/api/admin/rbac/roles/${id}`).then((r) => r.data),
  updateRole: (id, payload) =>
    api.put(`/api/admin/rbac/roles/${id}`, payload).then((r) => r.data),
  deleteRole: (id) =>
    api.delete(`/api/admin/rbac/roles/${id}`).then((r) => r.data),
  // Permissions Management
  listPermissions: () =>
    api.get("/api/admin/rbac/permissions").then((r) => r.data),
  createPermission: (payload) =>
    api.post("/api/admin/rbac/permissions", payload).then((r) => r.data),
  // Role Permissions Management
  assignRolePermissions: (roleId, payload) =>
    api
      .put(`/api/admin/rbac/roles/${roleId}/permissions`, payload)
      .then((r) => r.data),
  // Modules Management
  listModules: () => api.get("/api/admin/modules").then((r) => r.data),
  createModule: (payload) =>
    api.post("/api/admin/modules", payload).then((r) => r.data),
  getModule: (id) => api.get(`/api/admin/modules/${id}`).then((r) => r.data),
  updateModule: (id, payload) =>
    api.put(`/api/admin/modules/${id}`, payload).then((r) => r.data),
  deleteModule: (id) =>
    api.delete(`/api/admin/modules/${id}`).then((r) => r.data),
  listModulePermissions: () =>
    api.get("/api/admin/modules/permissions").then((r) => r.data),
  // Properties Management
  listProperties: (params) =>
    api.get("/api/admin/properties", { params }).then((r) => r.data),
  getProperty: (id) =>
    api.get(`/api/admin/properties/${id}`).then((r) => r.data),
  createProperty: (payload) =>
    api.post("/api/admin/properties", payload).then((r) => r.data),
  updateProperty: (id, payload) =>
    api.put(`/api/admin/properties/${id}`, payload).then((r) => r.data),
  deleteProperty: (id) =>
    api.delete(`/api/admin/properties/${id}`).then((r) => r.data),
  togglePropertyDelete: (id) =>
    api.patch(`/api/admin/properties/${id}/toggle-delete`).then((r) => r.data),
  // Subscription Analytics
  getSubscriptionAnalytics: (params) =>
    api
      .get("/api/admin/subscription-analytics", { params })
      .then((r) => r.data),
  getSubscriptions: (params) =>
    api
      .get("/api/admin/subscription-analytics/subscriptions", { params })
      .then((r) => r.data),
  // Get plan details by ID
  getPlanDetails: (planId) =>
    api.get(`/api/admin/subscriptions/${planId}`).then((r) => r.data),
  // Get user details by ID
  getUserDetails: (userId) =>
    api.get(`/api/admin/users/${userId}`).then((r) => r.data),
  // Matching Rules Management
  listMatchingRules: (params) =>
    api.get("/api/admin/matching-rules", { params }).then((r) => r.data),
  createMatchingRule: (payload) =>
    api.post("/api/admin/matching-rules", payload).then((r) => r.data),
  getMatchingRule: (id, params) =>
    api.get(`/api/admin/matching-rules/${id}`, { params }).then((r) => r.data),
  updateMatchingRule: (id, payload) =>
    api.put(`/api/admin/matching-rules/${id}`, payload).then((r) => r.data),
  deleteMatchingRule: (id) =>
    api.delete(`/api/admin/matching-rules/${id}`).then((r) => r.data),
  // Matching Rule Options
  getRuleOptions: (ruleId, params) =>
    api
      .get(`/api/admin/matching-rules/${ruleId}/options`, { params })
      .then((r) => r.data),
  addRuleOption: (ruleId, payload) =>
    api
      .post(`/api/admin/matching-rules/${ruleId}/options`, payload)
      .then((r) => r.data),
  updateRuleOption: (optionId, payload) =>
    api
      .put(`/api/admin/matching-rules/options/${optionId}`, payload)
      .then((r) => r.data),
  deleteRuleOption: (optionId) =>
    api
      .delete(`/api/admin/matching-rules/options/${optionId}`)
      .then((r) => r.data),
  bulkUpdateRuleOptions: (ruleId, payload) =>
    api
      .put(`/api/admin/matching-rules/${ruleId}/options/bulk`, payload)
      .then((r) => r.data),
  // Stripe Invoices
  getStripeInvoices: (params) =>
    api
      .get("/api/admin/subscription-analytics/stripe/invoices", { params })
      .then((r) => r.data),
    // Payment Summary Report
    getPaymentSummary: (params) =>
      api
        .get("/api/admin/payment-summary", { params })
        .then((r) => r.data),
    // Financial Statement Report
    getFinancialStatement: (params) =>
      api
        .get("/api/admin/payment-summary/financial-statement", { params })
        .then((r) => r.data),
};

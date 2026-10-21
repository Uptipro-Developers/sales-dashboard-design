// ══════════════════════════════════════════════════════════════════════════
// API SERVICE - Complete Backend Integration
// All endpoints for Admin Dashboard
// ══════════════════════════════════════════════════════════════════════════

import axios from "axios";

const api = axios.create({
  baseURL: ((import.meta as any).env?.VITE_API_URL || "http://localhost:1000"),
  headers: { "Content-Type": "application/json" },
});

const refreshClient = axios.create({
  baseURL: ((import.meta as any).env?.VITE_API_URL || "http://localhost:1000"),
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401 (optional, as in your original)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          throw new Error("Missing refresh token");
        }
        const response = await refreshClient.post(
          "/auth/refresh",
          { refreshToken },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        const { access_token } = response.data;
        localStorage.setItem("access_token", access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("remember_me");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// AUTH
export const authApi = {
  login: async (email: string, password: string) =>
    (await api.post("/auth/login", { email, password })).data,
  register: async (data: { email: string; password: string; name: string; role: string }) =>
    (await api.post("/auth/register", data)).data,
  logout: async () => (await api.post("/auth/logout")).data,
  getProfile: async () => (await api.get("/auth/me")).data,
  changePassword: async (currentPassword: string, newPassword: string) =>
    (await api.post("/auth/change-password", { currentPassword, newPassword })).data,
  forgotPassword: async (email: string) =>
    (await api.post("/auth/forgot-password", { email })).data,
  resetPassword: async (token: string, newPassword: string) =>
    (await api.post("/auth/reset-password", { token, newPassword })).data,
};

// SIGNUP (alias for register)
export const signupApi = {
  register: async (data: any) => (await api.post("/auth/register", data)).data,
};

// DASHBOARD
export const dashboardApi = {
  getOverview: async () => (await api.get("/dashboard/overview")).data,
  getRecentTransactions: async () => (await api.get("/dashboard/recent-transactions")).data,
  // Reports endpoints (see below)
};

// COMPANIES
export const companiesApi = {
  getAll: async (filters?: any) => (await api.get("/companies", { params: filters })).data,
  getById: async (id: string) => (await api.get(`/companies/${id}`)).data,
  create: async (data: any) => (await api.post("/companies", data)).data,
  update: async (id: string, data: any) => (await api.put(`/companies/${id}`, data)).data,
  delete: async (id: string) => (await api.delete(`/companies/${id}`)).data,
  updateStats: async (id: string) => (await api.post(`/companies/${id}/stats`)).data,
};

// ASSETS
export const assetsApi = {
  getAll: async (filters?: any) => (await api.get("/assets", { params: filters })).data,
  getById: async (id: string) => (await api.get(`/assets/${id}`)).data,
  create: async (data: any) => (await api.post("/assets", data)).data,
  update: async (id: string, data: any) => (await api.put(`/assets/${id}`, data)).data,
  delete: async (id: string) => (await api.delete(`/assets/${id}`)).data,
  publish: async (id: string) => (await api.put(`/assets/${id}/publish`)).data,
  unpublish: async (id: string) => (await api.put(`/assets/${id}/unpublish`)).data,
  addImage: async (id: string, imageData: { url: string; caption?: string }) =>
    (await api.post(`/assets/${id}/images`, imageData)).data,
  deleteImage: async (assetId: string, imageId: string) =>
    (await api.delete(`/assets/${assetId}/images/${imageId}`)).data,
  addDocument: async (id: string, documentData: { url: string; name: string; type: string }) =>
    (await api.post(`/assets/${id}/documents`, documentData)).data,
  deleteDocument: async (assetId: string, documentId: string) =>
    (await api.delete(`/assets/${assetId}/documents/${documentId}`)).data,
  // Search assets by name or id (server-side filtering)
  getBySearch: async (query: { name?: string; id?: string }) =>
    (await api.get("/assets", { params: query })).data,
};

// TRANSACTIONS (Deals)
export const transactionsApi = {
  getAll: async (filters?: any) => (await api.get("/transactions", { params: filters })).data,
  getById: async (id: string) => (await api.get(`/transactions/${id}`)).data,
  create: async (data: any) => (await api.post("/transactions", data)).data,
  update: async (id: string, data: any) => (await api.put(`/transactions/${id}`, data)).data,
  getStats: async () => (await api.get("/transactions/stats")).data,
  getUnpaidCommissions: async (month?: string) =>
    (await api.get("/transactions/commissions/unpaid", { params: { month } })).data,
  getPaidCommissions: async (month?: string) =>
    (await api.get("/transactions/commissions/paid", { params: { month } })).data,
  sendCommissions: async (transactionIds: string[]) =>
    (await api.post("/transactions/commissions/send", { transactionIds })).data,
  uploadPaymentProof: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return (await api.post("/transactions/commissions/payment-proof", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })).data;
  },
};

// ============================================
// Payments API
// ============================================
export const paymentsApi = {
  getProviders: async () =>
    (await api.get('/payments/providers')).data,

  initialize: async (data: {
    provider: 'paystack' | 'flutterwave';
    email: string;
    amount: number;
    currency?: string;
    callbackUrl?: string;
    reference?: string;
    metadata?: Record<string, any>;
    title?: string;
  }) => (await api.post('/payments/initialize', data)).data,

  verify: async (provider: 'paystack' | 'flutterwave', reference: string) =>
    (await api.get('/payments/verify', {
      params: { provider, reference },
    })).data,
};

// TRANSACTION COMMISSIONS (Paid/Unpaid)
export const transactionCommissionsApi = {
  getUnpaid: async (month?: string, platform?: string) =>
    (await api.get("/transactions/commissions/unpaid", { params: { ...(month ? { month } : {}), ...(platform ? { platform } : {}) } })).data,
  getPaid: async (month?: string, platform?: string) =>
    (await api.get("/transactions/commissions/paid", { params: { ...(month ? { month } : {}), ...(platform ? { platform } : {}) } })).data,
  sendCommissions: async (transactionIds: string[]) =>
    (await api.post("/transactions/commissions/send", { transactionIds })).data,
  uploadPaymentProof: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return (await api.post("/transactions/commissions/payment-proof", formData)).data;
  },
};

// INSTALLMENTS
export const installmentsApi = {
  getAll: async (status?: string) => (await api.get("/installments", { params: { status } })).data,
  getById: async (id: string) => (await api.get(`/installments/${id}`)).data,
  getSchedule: async (id: string) => (await api.get(`/installments/${id}/schedule`)).data,
  create: async (data: any) => (await api.post("/installments", data)).data,
  recordPayment: async (planId: string, installmentId: string, data: { amount: number; paymentMethod: string }) =>
    (await api.put(`/installments/${planId}/installments/${installmentId}/pay`, data)).data,
  sendReminder: async (data: { installmentId: string; reminderDate: string; method: string }) =>
    (await api.post("/installments/reminders/send", data)).data,
  getStats: async () => (await api.get("/installments/stats")).data,
  getUpcoming: async () => (await api.get("/installments/upcoming")).data,
  getOverdue: async () => (await api.get("/installments/overdue")).data,
};

// LEADS
export const leadsApi = {
  getAll: async (filters?: any) => (await api.get("/leads", { params: filters })).data,
  getById: async (id: string) => (await api.get(`/leads/${id}`)).data,
  create: async (data: any) => (await api.post("/leads", data)).data,
  update: async (id: string, data: any) => (await api.put(`/leads/${id}`, data)).data,
  delete: async (id: string) => (await api.delete(`/leads/${id}`)).data,
  assign: async (id: string, assignedToId: string) =>
    // Backend: POST /leads/:id/assign with { assignedToId }
    (await api.post(`/leads/${id}/assign`, { assignedToId })).data,
  updateStatus: async (id: string, status: string) =>
    (await api.put(`/leads/${id}/status`, { status })).data,
};

// AGENTS
export const agentsApi = {
  getAll: async () => (await api.get("/agents")).data,
  getById: async (id: string) => (await api.get(`/agents/${id}`)).data,
  create: async (data: any) => (await api.post("/agents", data)).data,
  update: async (id: string, data: any) => (await api.put(`/agents/${id}`, data)).data,
  delete: async (id: string) => (await api.delete(`/agents/${id}`)).data,
  getPerformance: async (id: string) => (await api.get(`/agents/${id}/performance`)).data,
};

// FREELANCERS
export const freelancersApi = {
  getAll: async () => (await api.get("/freelancers")).data,
  getById: async (id: string) => (await api.get(`/freelancers/${id}`)).data,
  create: async (data: any) => (await api.post("/freelancers", data)).data,
  update: async (id: string, data: any) => (await api.put(`/freelancers/${id}`, data)).data,
  delete: async (id: string) => (await api.delete(`/freelancers/${id}`)).data,
};

// CLUSTERS
export const clustersApi = {
  getAll: async () => (await api.get("/clusters")).data,
  getById: async (id: string) => (await api.get(`/clusters/${id}`)).data,
  create: async (data: any) => (await api.post("/clusters", data)).data,
  update: async (id: string, data: any) => (await api.put(`/clusters/${id}`, data)).data,
  delete: async (id: string) => (await api.delete(`/clusters/${id}`)).data,
};

// SUPPORT
export const supportApi = {
  getFaqs: async () => (await api.get("/support/faqs")).data,
};

// USER
export const userApi = {
  getCurrent: async () => (await api.get("/users/me")).data,
  update: async (data: any) => (await api.put("/users/me", data)).data,
  // Add more user-related endpoints as needed
};

export const investorsApi = {
  getAll: async (filters?: { track?: "FOUNDRY" | "HARBOR"; search?: string }) =>
    (
      await api.get("/users", {
        params: { role: "INVESTOR", ...(filters || {}) },
      })
    ).data,
};

// TEAM
export const teamApi = {
  getById: async (id: string) => (await api.get(`/team/${id}`)).data,
};

// REPORTS (from reports.controller.ts)
export const reportsApi = {
  getSales: async (dateRange?: string, platform?: string) =>
    (await api.get("/reports/sales", { params: { ...(dateRange ? { dateRange } : {}), ...(platform ? { platform } : {}) } })).data,
  getAssets: async (dateRange?: string) =>
    (await api.get("/reports/assets", { params: dateRange ? { dateRange } : {} })).data,
  getAgents: async (dateRange?: string) =>
    (await api.get("/reports/agents", { params: dateRange ? { dateRange } : {} })).data,
  getClusters: async (dateRange?: string) =>
    (await api.get("/reports/clusters", { params: dateRange ? { dateRange } : {} })).data,
  getInvestments: async (dateRange?: string) =>
    (await api.get("/reports/investments", { params: dateRange ? { dateRange } : {} })).data,
  getCommissions: async (dateRange?: string, platform?: string) =>
    (await api.get("/reports/commissions", { params: { ...(dateRange ? { dateRange } : {}), ...(platform ? { platform } : {}) } })).data,
  getPerformance: async (dateRange?: string, platform?: string) =>
    (await api.get("/reports/performance", { params: { ...(dateRange ? { dateRange } : {}), ...(platform ? { platform } : {}) } })).data,
  exportReport: async (type: "sales" | "agents" | "clusters", dateRange?: string) =>
    (await api.get("/reports/export", {
      params: { type, ...(dateRange ? { dateRange } : {}) },
      responseType: "blob",
    })).data,
};

// NOTIFICATIONS
export const notificationsApi = {
  notifyAdmin: async (data: { title: string; message: string; type?: string }) =>
    (await api.post("/notifications/admin", data)).data,
};

/**
 * Resolves a media URL so it works regardless of where it was stored.
 * Replaces localhost origin with the configured VITE_API_URL.
 */
export const resolveMediaUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  const apiBase = (((import.meta as any).env?.VITE_API_URL) || 'http://localhost:1000').replace(/\/$/, '');
  if (url.startsWith(apiBase)) return url;
  if (url.startsWith('/')) return `${apiBase}${url}`;
  if (/^https?:\/\/localhost(:\d+)?/.test(url)) {
    return url.replace(/^https?:\/\/localhost(:\d+)?/, apiBase);
  }
  return url;
};

export default api;

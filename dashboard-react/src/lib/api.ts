import axios from './axios';

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) => axios.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    axios.post('/auth/login', data),

  logout: () => axios.post('/auth/logout'),

  getCurrentUser: () => axios.get('/auth/me'),

  updateProfile: (data: { firstName: string; lastName: string; phone?: string }) =>
    axios.patch('/auth/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    axios.post('/auth/change-password', data),

  forgotPassword: (email: string) =>
    axios.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    axios.post('/auth/reset-password', { token, password }),

  verifyEmail: (token: string) => axios.post('/auth/verify-email', { token }),
};

// Merchant API
export const merchantAPI = {
  create: (data: {
    name: string;
    subdomain: string;
    description?: string;
  }) => axios.post('/merchants', data),

  getById: (id: string) => axios.get(`/merchants/${id}`),

  update: (id: string, data: any) => axios.patch(`/merchants/${id}`, data),

  testSmtp: (id: string, data: any) => axios.post(`/merchants/${id}/test-smtp`, data),

  getStats: (id: string) => axios.get(`/merchants/${id}/stats`),

  checkSubdomain: (subdomain: string) =>
    axios.get(`/merchants/check-subdomain/${subdomain}`),

  completeOnboarding: (id: string) =>
    axios.post(`/merchants/${id}/complete-onboarding`),
};

// Product API
export const productAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    stock?: string;
    minPrice?: string;
    maxPrice?: string;
  }) => axios.get('/products', { params }),

  getById: (id: string) => axios.get(`/products/${id}`),

  create: (data: any) => axios.post('/products', data),

  update: (id: string, data: any) => axios.patch(`/products/${id}`, data),

  delete: (id: string) => axios.delete(`/products/${id}`),

  duplicate: (id: string) => axios.post(`/products/${id}/duplicate`),

  generateDescription: (data: {
    productName: string;
    category?: string;
    price?: number;
    tags?: string[];
    language?: string;
  }) => axios.post('/products/generate-description', data),

  generateDescriptionDraft: (data: {
    productName: string;
    category?: string;
    price?: number;
    tags?: string[];
    language?: string;
  }) => axios.post('/products/generate-description-draft', data),
};

// Order API
export const orderAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: string;
    maxAmount?: string;
    sortField?: string;
    sortOrder?: string;
  }) => axios.get('/orders', { params }),

  getById: (id: string) => axios.get(`/orders/${id}`),

  updateStatus: (id: string, orderStatus: string, note?: string) =>
    axios.patch(`/orders/${id}/status`, { orderStatus, note }),

  updatePayment: (id: string, paymentStatus: string, transactionId?: string) =>
    axios.patch(`/orders/${id}/payment`, { paymentStatus, transactionId }),

  cancel: (id: string, reason?: string) =>
    axios.post(`/orders/${id}/cancel`, { reason }),

  updateTracking: (id: string, trackingNumber: string, shippingProvider: string) =>
    axios.patch(`/orders/${id}/tracking`, { trackingNumber, shippingProvider }),

  create: (data: any) => axios.post('/orders', data),

  getOne: (id: string) => axios.get(`/orders/${id}`),
};

// Customer API
export const customerAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => axios.get('/customers', { params }),

  getById: (id: string) => axios.get(`/customers/${id}`),

  update: (id: string, data: any) => axios.patch(`/customers/${id}`, data),

  getOrders: (id: string) => axios.get(`/customers/${id}/orders`),
};

// Staff API
export const staffAPI = {
  getAll: () => axios.get('/staff'),

  create: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    staffRole?: string;
    staffRoleLabel?: string;
    permissions?: Record<string, boolean>;
  }) => axios.post('/staff', data),

  update: (
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      staffRole?: string;
      staffRoleLabel?: string;
      permissions?: Record<string, boolean>;
      isActive?: boolean;
    }
  ) => axios.patch(`/staff/${id}`, data),

  delete: (id: string) => axios.delete(`/staff/${id}`),

  resetPassword: (id: string, newPassword: string) =>
    axios.post(`/staff/${id}/reset-password`, { newPassword }),
};

// Notification API
export const notificationAPI = {
  getAll: () => axios.get('/notifications'),
  markRead: (id: string) => axios.patch(`/notifications/${id}/read`),
  markAllRead: () => axios.patch('/notifications/read-all'),
  delete: (id: string) => axios.delete(`/notifications/${id}`),
};

// Search API
export const searchAPI = {
  query: (q: string) => axios.get('/search', { params: { q } }),
};

// Theme API
export const themeAPI = {
  // Get current theme (returns both published and draft)
  get: () => axios.get('/theme'),

  // Save draft changes (partial update)
  saveDraft: (data: Record<string, any>) => axios.patch('/theme/draft', data),

  // Publish draft → live
  publish: () => axios.post('/theme/publish'),

  // Reset draft to match published
  resetDraft: () => axios.post('/theme/reset-draft'),

  // Apply a template preset (resets draft to template defaults)
  applyTemplate: (templateId: string) =>
    axios.post('/theme/apply-template', { templateId }),
};

// Subscription API
export const subscriptionAPI = {
  getPlans: () => axios.get('/subscriptions/plans'),
  getMy: () => axios.get('/subscriptions/my'),
  getInvoices: (params?: { page?: number; limit?: number }) =>
    axios.get('/subscriptions/invoices', { params }),
  subscribe: (planId: string, billingCycle: 'monthly' | 'yearly') =>
    axios.post('/subscriptions/subscribe', { planId, billingCycle }),
  upgrade: (planId: string, billingCycle: 'monthly' | 'yearly') =>
    axios.post('/subscriptions/upgrade', { planId, billingCycle }),
  downgrade: (planId: string) =>
    axios.post('/subscriptions/downgrade', { planId }),
  cancel: (reason?: string) =>
    axios.post('/subscriptions/cancel', { reason }),
};

// AI API
export const aiAPI = {
  generateDescription: (data: {
    productName: string;
    category?: string;
    price?: number;
    tags?: string[];
    language?: string;
  }) => axios.post('/products/generate-description', data),

  generateSEO: (data: {
    productName: string;
    description?: string;
    category?: string;
    language?: string;
  }) => axios.post('/ai/seo', data),

  getAnalyticsInsights: (data: {
    question?: string;
    language?: string;
  }) => axios.post('/ai/analytics/insights', data),

  getProductRecommendations: () =>
    axios.post('/ai/analytics/product-recommendations'),

  getCustomerInsights: () =>
    axios.post('/ai/analytics/customer-insights'),

  assistantChat: (data: {
    message: string;
    conversationHistory?: Array<{ role: string; content: string }>;
  }) => axios.post('/ai/assistant/chat', data),

  suggestActions: () =>
    axios.post('/ai/assistant/suggest-actions'),
};

// Review API
export const reviewAPI = {
  getAll: (params?: { page?: number; limit?: number; productId?: string; status?: string }) =>
    axios.get('/reviews', { params }),
  getById: (id: string) => axios.get(`/reviews/${id}`),
  create: (data: { productId: string; rating: number; comment?: string }) =>
    axios.post('/reviews', data),
  update: (id: string, data: { rating?: number; comment?: string }) =>
    axios.patch(`/reviews/${id}`, data),
  delete: (id: string) => axios.delete(`/reviews/${id}`),
  getAnalytics: () => axios.get('/reviews/analytics'),
  updateStatus: (id: string, status: string) => axios.patch(`/reviews/${id}/status`, { status }),
  respond: (id: string, response: string) => axios.post(`/reviews/${id}/respond`, { response }),
};

// Wishlist API
export const wishlistAPI = {
  getAll: () => axios.get('/wishlist'),
  add: (productId: string) => axios.post('/wishlist', { productId }),
  remove: (productId: string) => axios.delete(`/wishlist/${productId}`),
  sync: (productIds: string[]) => axios.post('/wishlist/sync', { productIds }),
  clear: () => axios.delete('/wishlist/clear'),
};

// Discount API
export const discountAPI = {
  getAll: (params?: { page?: number; limit?: number; code?: string }) =>
    axios.get('/discounts', { params }),
  getById: (id: string) => axios.get(`/discounts/${id}`),
  create: (data: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderAmount?: number;
    maxUses?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }) => axios.post('/discounts', data),
  update: (id: string, data: Partial<{
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderAmount: number;
    maxUses: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }>) => axios.patch(`/discounts/${id}`, data),
  delete: (id: string) => axios.delete(`/discounts/${id}`),
  validate: (code: string) => axios.post('/discounts/validate', { code }),
};

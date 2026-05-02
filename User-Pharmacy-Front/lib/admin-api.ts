type RequestOptions = Omit<RequestInit, 'body'> & { body?: Record<string, unknown> };

const ADMIN_API_BASE = process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ?? 'http://localhost:5000/api/admin';

const getAdminToken = () => {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem('admin_access_token') ?? undefined;
};

const adminFetch = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const token = getAdminToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${ADMIN_API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = (payload && payload.message) || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data.data as T;
};

export const adminApi = {
  getUsers: (params: { role?: string; search?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.role) query.set('role', params.role);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminFetch<any[]>(`/users${suffix}`);
  },
  updateUserStatus: (id: string, isActive: boolean) =>
    adminFetch<{ id: string; isActive: boolean }>(`/users/${id}`, { method: 'PATCH', body: { isActive } }),
  deleteUser: (id: string) => adminFetch<{ id: string; deleted: boolean }>(`/users/${id}`, { method: 'DELETE' }),

  getOrders: (params: { status?: string; pharmacyId?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.pharmacyId) query.set('pharmacyId', params.pharmacyId);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminFetch<any[]>(`/orders${suffix}`);
  },

  getPharmacies: (params: { status?: string; region?: string; rating?: string; license?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.region) query.set('region', params.region);
    if (params.rating) query.set('rating', params.rating);
    if (params.license) query.set('license', params.license);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminFetch<any[]>(`/pharmacies${suffix}`);
  },

  getDeliveries: (params: { status?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminFetch<any[]>(`/deliveries${suffix}`);
  },

  getVerifications: (params: { status?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminFetch<any[]>(`/verifications${suffix}`);
  },
  updateVerification: (id: string, action: 'approved' | 'rejected' | 'needs_docs', reason?: string) =>
    adminFetch(`/verifications/${id}/${action === 'approved' ? 'approve' : action === 'rejected' ? 'reject' : 'note'}`,
      {
        method: 'PATCH',
        body: action === 'rejected' ? { reason } : action === 'needs_docs' ? { note: reason ?? 'Additional documents required.' } : {},
      },
    ),

  getComplaints: (params: { severity?: string; status?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.severity) query.set('severity', params.severity);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminFetch<any[]>(`/complaints${suffix}`);
  },
  updateComplaint: (id: string, status: 'open' | 'resolved' | 'dismissed', resolution?: string) =>
    adminFetch(`/complaints/${id}`, { method: 'PATCH', body: { status, resolution } }),

  getAlerts: (params: { type?: string; region?: string; isActive?: boolean } = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.region) query.set('region', params.region);
    if (typeof params.isActive !== 'undefined') query.set('isActive', String(params.isActive));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminFetch<any[]>(`/alerts${suffix}`);
  },

  createAlert: (alertData: { type: string; region: string; message: string; details?: string; youtubeLink?: string }) =>
    adminFetch<any>('/alerts', { method: 'POST', body: alertData }),

  getAuditLogs: (params: { adminId?: string; action?: string; startDate?: string; endDate?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.adminId) query.set('adminId', params.adminId);
    if (params.action) query.set('action', params.action);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminFetch<any[]>(`/audit-logs${suffix}`);
  },

  getAnalytics: () => adminFetch<Record<string, unknown>>('/analytics/overview'),
  getPayments: (params: { status?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminFetch<any[]>(`/payments${suffix}`);
  },
  getStats: () => adminFetch<Record<string, unknown>>('/stats'),
  getSystemHealth: () => adminFetch<Record<string, unknown>>('/system-health'),
};

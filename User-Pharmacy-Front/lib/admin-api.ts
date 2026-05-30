import type { NotificationsListPayload } from './api';

type RequestOptions = Omit<RequestInit, 'body'> & { body?: Record<string, unknown> };

const ADMIN_API_BASE = process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ?? 'http://localhost:5000/api/admin';

/** Matches Admin-Backend disease-alerts POST validation */
export type BroadcastAlertType =
  | 'Disease Outbreak'
  | 'Medication Recall'
  | 'Emergency Health Advisory';

function formatAdminApiError(payload: Record<string, unknown>, status: number): string {
  const base =
    (typeof payload.message === 'string' && payload.message) || `Request failed: ${status}`;
  const details = payload.details;
  if (!Array.isArray(details) || details.length === 0) return base;
  const lines = details.map((d: unknown) => {
    if (d && typeof d === 'object' && 'msg' in d && typeof (d as { msg: string }).msg === 'string') {
      const path =
        'path' in d && typeof (d as { path?: string }).path === 'string'
          ? `${(d as { path: string }).path}: `
          : '';
      return path + (d as { msg: string }).msg;
    }
    return String(d);
  });
  return `${base}\n${lines.join('\n')}`;
}

const getAdminToken = () => {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem('admin_access_token') ?? undefined;
};

const adminFetch = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${ADMIN_API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(formatAdminApiError(payload, response.status));
  }

  const data = await response.json();
  return data.data as T;
};

export async function listAdminNotifications(page = 1, limit = 7): Promise<NotificationsListPayload> {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  return adminFetch<NotificationsListPayload>(`/notifications?${query.toString()}`);
}

export async function markAdminNotificationsRead(body: { ids?: string[]; all?: boolean }): Promise<void> {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  const response = await fetch(`${ADMIN_API_BASE}/notifications/read`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(formatAdminApiError(payload, response.status));
  }
}

export type VerificationsMeta = { page: number; limit: number; total: number };

/** Matches Admin-Backend User.role and PATCH /users/:id */
export type UserRoleKey = 'patient' | 'pharmacy' | 'delivery' | 'admin';

/** GET /users/:id — sanitized (no secrets) */
export type AdminUserDetail = {
  _id: string;
  username: string;
  email: string;
  phone: string;
  role: UserRoleKey;
  language: string;
  isActive: boolean;
  isLocked: boolean;
  failedLoginAttempts?: number;
  lockExpiresAt?: string | null;
  lastLoginAt?: string | null;
  mfaEnabled: boolean;
  addresses?: Array<Record<string, unknown>>;
  createdAt?: string;
  updatedAt?: string;
  profilePhotoUrl?: string;
};

function patchUserRequest(
  id: string,
  body: { isActive?: boolean; role?: UserRoleKey },
) {
  return adminFetch<{ id: string; isActive: boolean; role: string }>(`/users/${id}`, {
    method: 'PATCH',
    body,
  });
}

async function adminFetchWithMeta<T>(
  path: string,
): Promise<{ items: T[]; meta?: VerificationsMeta }> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${ADMIN_API_BASE}${path}`, {
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(formatAdminApiError(payload, response.status));
  }

  const json = (await response.json()) as {
    success?: boolean;
    data: T[];
    meta?: VerificationsMeta;
  };
  return { items: json.data, meta: json.meta };
}

export type AnalyticsOrdersSummary = {
  byStatus: Array<{ _id: string; count: number }>;
  revenueTrends: Array<{ _id: string; revenue: number }>;
  peakHours: Array<{ _id: number; count: number }>;
};

/** GET /analytics/orders/today-kpis — stats strip (Addis Ababa calendar day). */
export type OrdersTodayKpis = {
  timezone: string;
  dayStartAddis: string;
  ordersToday: number;
  revenueTodayEt: number;
  avgFulfillmentMinutes: number | null;
  stuckOrders: number;
};

export type AnalyticsUsersSummary = {
  signupsOverTime: Array<{ _id: string; count: number }>;
  roleBreakdown: Array<{ _id: string; count: number }>;
  languageBreakdown: Array<{ _id: string; count: number }>;
};

/** GET/PATCH `/platform-settings` — Admin-Backend general platform config. */
export type PlatformGeneralSettings = {
  platformName: string;
  supportEmail: string;
  commissionEtbPerDeliveredOrder: number;
  defaultDeliveryRadiusKm: number;
  maintenanceMode: boolean;
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
  getUser: (id: string) =>
    adminFetch<AdminUserDetail>(`/users/${encodeURIComponent(id)}`),
  patchUser: patchUserRequest,
  updateUserStatus: (id: string, isActive: boolean) => patchUserRequest(id, { isActive }),
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

  getPharmacies: (
    params: { status?: string; region?: string; rating?: string; license?: string; page?: number; limit?: number } = {},
  ) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.region) query.set('region', params.region);
    if (params.rating) query.set('rating', params.rating);
    if (params.license) query.set('license', params.license);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
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
    return adminFetchWithMeta(`/verifications${suffix}`);
  },

  getVerificationById: (id: string) =>
    adminFetch<{
      pharmacyId: string;
      businessName: string;
      location?: string;
      email?: string;
      phone?: string;
      ownerId: string;
      ownerName: string | null;
      license: Record<string, unknown>;
      verification: Record<string, unknown>;
    }>(`/verifications/${id}`),

  updateVerification: (id: string, action: 'approved' | 'rejected' | 'needs_docs', reason?: string) => {
    const path =
      action === 'needs_docs'
        ? `/verifications/${id}/note`
        : `/verifications/${id}/${action === 'approved' ? 'approve' : 'reject'}`;
    const method = action === 'needs_docs' ? 'POST' : 'PATCH';
    const body =
      action === 'rejected'
        ? { reason }
        : action === 'needs_docs'
          ? { note: reason ?? 'Additional documents required.' }
          : {};
    return adminFetch(path, { method, body });
  },

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

  createAlert: (alertData: {
    type: BroadcastAlertType;
    region: string;
    message: string;
    details?: string;
    youtubeLink?: string;
  }) => adminFetch<any>('/alerts', { method: 'POST', body: alertData }),

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
  getAnalyticsOrders: () => adminFetch<AnalyticsOrdersSummary>('/analytics/orders'),
  getOrdersTodayKpis: () => adminFetch<OrdersTodayKpis>('/analytics/orders/today-kpis'),
  getAnalyticsUsers: () => adminFetch<AnalyticsUsersSummary>('/analytics/users'),
  getTraffic: (range: '24h' | '7d' | '30d') =>
    adminFetch<{ metric: string; series: Array<{ label: string; count: number }> }>(
      `/analytics/traffic?range=${range}`,
    ),
  getPayments: (params: { status?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminFetch<any[]>(`/payments${suffix}`);
  },
  getStats: () => adminFetch<Record<string, unknown>>('/stats'),

  getPlatformSettings: () => adminFetch<PlatformGeneralSettings>('/platform-settings'),
  updatePlatformSettings: (body: PlatformGeneralSettings) =>
    adminFetch<PlatformGeneralSettings>('/platform-settings', {
      method: 'PATCH',
      body: { ...body },
    }),
};

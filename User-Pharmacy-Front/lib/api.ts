export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('medcare_access_token');
};

const buildUrl = (path: string, params?: Record<string, string | number | undefined>) => {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, string | number | undefined>
): Promise<ApiResponse<T>> => {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, params), {
    ...options,
    headers
  });

  const data = (await response.json()) as ApiResponse<T>;
  if (!response.ok || data.success === false) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
};

export const apiGet = async <T>(path: string, params?: Record<string, string | number | undefined>) =>
  apiRequest<T>(path, { method: 'GET' }, params);

export const apiPost = async <T>(path: string, body?: any) =>
  apiRequest<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body || {})
  });

export const apiPatch = async <T>(path: string, body?: any) =>
  apiRequest<T>(path, {
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body || {})
  });

export const apiPut = async <T>(path: string, body?: any) =>
  apiRequest<T>(path, {
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body || {})
  });

export const apiDelete = async <T>(path: string) =>
  apiRequest<T>(path, { method: 'DELETE' });

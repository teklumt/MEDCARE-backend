import { clearPrescriptionScanSessionStorage } from '@/lib/prescriptionScanSession';
import { clearMedcareAiSessionStorage } from '@/lib/medcareAiSession';

const AUTH_API_BASE = process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ?? 'http://localhost:5000/api/admin';

/** Parse JSON safely — handles plain-text rate limit / gateway responses without crashing. */
async function safeJson(response: Response): Promise<unknown> {
  if (response.status === 429) throw new Error('Too many attempts. Please wait a moment and try again.');
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    // Backend returned non-JSON (e.g. nginx error page) — surface a clean message
    throw new Error(text.trim() || `Server error (${response.status})`);
  }
}

/** Merge API `details.diagnostic` (dev email-provider errors from Admin-Backend) into user-visible message. */
function formatAdminAuthErrorMessage(data: unknown, fallback: string): string {
  const d = data as {
    message?: unknown;
    details?: { diagnostic?: unknown };
  };
  const msg = typeof d.message === 'string' ? d.message : fallback;
  const diag = typeof d.details?.diagnostic === 'string' ? d.details.diagnostic.trim() : '';
  return diag ? `${msg}\n\n${diag}` : msg;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      role: string;
      isActive: boolean;
      permissions?: string[];
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  message?: string;
}

export interface MFARequest {
  email: string;
  code: string;
  type: 'totp' | 'backup';
}

export interface RegisterPatientBody {
  username: string;
  email: string;
  password: string;
  phone: string;
  language?: 'en' | 'am';
  verificationCode: string;
}

export interface RegisterPharmacyBody {
  businessName: string;
  email: string;
  password: string;
  phone: string;
  businessLicenseNumber: string;
  issuingAuthority?: string;
  businessLicenseExpiry?: string;
  professionalLicenseExpiry?: string;
  businessRegistrationUrl?: string;
  operatingLicenseUrl?: string;
  location?: string;
  address?: string;
  language?: 'en' | 'am';
  verificationCode: string;
}

export interface RegisterDeliveryBody {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  nationalId: string;
  vehicleType: string;
  licensePlate?: string;
  pharmacyId: string;
  language?: 'en' | 'am';
  verificationCode: string;
}

export type PublicPharmacyOption = {
  _id: string;
  businessName: string;
  address?: string;
  location?: string;
  phone?: string;
};

export const authApi = {
  registerPatient: async (body: RegisterPatientBody): Promise<LoginResponse> => {
    const response = await fetch(`${AUTH_API_BASE}/auth/register/patient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await safeJson(response);
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },

  registerPharmacy: async (body: RegisterPharmacyBody): Promise<LoginResponse> => {
    const response = await fetch(`${AUTH_API_BASE}/auth/register/pharmacy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await safeJson(response);
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },

  sendPharmacySignupVerification: async (email: string): Promise<void> => {
    const response = await fetch(`${AUTH_API_BASE}/auth/register/pharmacy/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await safeJson(response);
    if (!response.ok) {
      throw new Error(formatAdminAuthErrorMessage(data, 'Could not send verification email'));
    }
  },

  sendPatientSignupVerification: async (email: string): Promise<void> => {
    const response = await fetch(`${AUTH_API_BASE}/auth/register/patient/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await safeJson(response);
    if (!response.ok) {
      throw new Error(formatAdminAuthErrorMessage(data, 'Could not send verification email'));
    }
  },

  sendDeliverySignupVerification: async (email: string): Promise<void> => {
    const response = await fetch(`${AUTH_API_BASE}/auth/register/delivery/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await safeJson(response);
    if (!response.ok) {
      throw new Error(formatAdminAuthErrorMessage(data, 'Could not send verification email'));
    }
  },

  registerDelivery: async (body: RegisterDeliveryBody): Promise<LoginResponse> => {
    const response = await fetch(`${AUTH_API_BASE}/auth/register/delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await safeJson(response);
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },

  /** Multipart upload for pharmacy license files during signup (no auth). */
  uploadPharmacyLicenseFile: async (
    file: File,
    kind: 'business' | 'professional',
  ): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);
    const response = await fetch(`${AUTH_API_BASE}/public/uploads/pharmacy-license`, {
      method: 'POST',
      body: formData,
    });
    const data = await safeJson(response);
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data.data.url as string;
  },

  fetchPublicPharmacies: async (q: string): Promise<PublicPharmacyOption[]> => {
    const url = new URL(`${AUTH_API_BASE}/public/pharmacies`);
    if (q.trim()) url.searchParams.set('q', q.trim());
    const response = await fetch(url.toString());
    const data = await safeJson(response);
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load pharmacies');
    }
    return data.data as PublicPharmacyOption[];
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('Attempting login to:', `${AUTH_API_BASE}/auth/login`);
    console.log('Credentials:', { email: credentials.email, password: '***' });
    
    try {
      const response = await fetch(`${AUTH_API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const data = await safeJson(response);
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  sendForgotPasswordCode: async (email: string): Promise<void> => {
    const response = await fetch(`${AUTH_API_BASE}/auth/forgot-password/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await safeJson(response);
    if (!response.ok) {
      throw new Error(formatAdminAuthErrorMessage(data, 'Could not send reset code'));
    }
  },

  resetPasswordWithCode: async (body: {
    email: string;
    verificationCode: string;
    newPassword: string;
  }): Promise<void> => {
    const response = await fetch(`${AUTH_API_BASE}/auth/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await safeJson(response);
    if (!response.ok) {
      throw new Error(data.message || 'Could not reset password');
    }
  },

  verifyMFA: async (mfaData: MFARequest): Promise<LoginResponse> => {
    const response = await fetch(`${AUTH_API_BASE}/auth/verify-mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mfaData),
    });

    const data = await safeJson(response);
    
    if (!response.ok) {
      throw new Error(data.message || 'MFA verification failed');
    }

    return data;
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await fetch(`${AUTH_API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await safeJson(response);
    
    if (!response.ok) {
      throw new Error(data.message || 'Token refresh failed');
    }

    return data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('admin_refresh_token');

    if (refreshToken) {
      try {
        await fetch(`${AUTH_API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }

    // Clear all auth-related data from localStorage
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('medcare_access_token');
    localStorage.removeItem('medcare_role');
    localStorage.removeItem('medcare_username');
    localStorage.removeItem('medcare_user_name');
    localStorage.removeItem('medcare_user_data');
    localStorage.removeItem('medcare_user_email');
    localStorage.removeItem('medcare_first_name');
    localStorage.removeItem('medcare_last_name');
    localStorage.removeItem('medcare_user_photo');
    clearPrescriptionScanSessionStorage();
    clearMedcareAiSessionStorage();
  },

  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('medcare_user_data');
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('admin_access_token');
    const role = localStorage.getItem('medcare_role');
    
    return !!(token && role === 'admin');
  },

  storeAuthData: (loginResponse: LoginResponse) => {
    const { user, tokens } = loginResponse.data;
    
    // Store tokens (admin_* used app-wide; medcare_* alias for legacy callers)
    localStorage.setItem('admin_access_token', tokens.accessToken);
    localStorage.setItem('admin_refresh_token', tokens.refreshToken);
    localStorage.setItem('medcare_access_token', tokens.accessToken);
    
    // Store user data in multiple formats for compatibility
    localStorage.setItem('medcare_role', user.role);
    localStorage.setItem('medcare_username', user.username);
    localStorage.setItem('medcare_user_name', user.username); // For navbar
    localStorage.setItem('medcare_user_data', JSON.stringify(user));
    
    // Store email if available
    if (user.email) {
      localStorage.setItem('medcare_user_email', user.email);
    }
    
    // Parse username to get first name (if format is firstname_lastname)
    const nameParts = user.username.split('_');
    if (nameParts.length > 0) {
      const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
      localStorage.setItem('medcare_first_name', firstName);
      
      if (nameParts.length > 1) {
        const lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
        localStorage.setItem('medcare_last_name', lastName);
      }
    }
  }
};

// Tokens are 30 days — no periodic refresh needed.
export function stopTokenRefreshTimer(): void {}
export const setupTokenRefresh = (): null => null;
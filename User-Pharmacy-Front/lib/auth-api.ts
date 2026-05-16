import { clearPrescriptionScanSessionStorage } from '@/lib/prescriptionScanSession';
import { clearMedcareAiSessionStorage } from '@/lib/medcareAiSession';

const AUTH_API_BASE = process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ?? 'http://localhost:5000/api/admin';

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
    const data = await response.json();
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
    const data = await response.json();
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
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Could not send verification email');
    }
  },

  sendPatientSignupVerification: async (email: string): Promise<void> => {
    const response = await fetch(`${AUTH_API_BASE}/auth/register/patient/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Could not send verification email');
    }
  },

  sendDeliverySignupVerification: async (email: string): Promise<void> => {
    const response = await fetch(`${AUTH_API_BASE}/auth/register/delivery/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Could not send verification email');
    }
  },

  registerDelivery: async (body: RegisterDeliveryBody): Promise<LoginResponse> => {
    const response = await fetch(`${AUTH_API_BASE}/auth/register/delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
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
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data.data.url as string;
  },

  fetchPublicPharmacies: async (q: string): Promise<PublicPharmacyOption[]> => {
    const url = new URL(`${AUTH_API_BASE}/public/pharmacies`);
    if (q.trim()) url.searchParams.set('q', q.trim());
    const response = await fetch(url.toString());
    const data = await response.json();
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

      const data = await response.json();
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

  verifyMFA: async (mfaData: MFARequest): Promise<LoginResponse> => {
    const response = await fetch(`${AUTH_API_BASE}/auth/verify-mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mfaData),
    });

    const data = await response.json();
    
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

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Token refresh failed');
    }

    return data;
  },

  logout: async (): Promise<void> => {
    stopTokenRefreshTimer();

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
    
    // Store tokens
    localStorage.setItem('admin_access_token', tokens.accessToken);
    localStorage.setItem('admin_refresh_token', tokens.refreshToken);
    
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

let tokenRefreshIntervalId: ReturnType<typeof setInterval> | null = null;

/** Clears the periodic refresh timer (e.g. on logout). Safe on server. */
export function stopTokenRefreshTimer(): void {
  if (typeof window === 'undefined') return;
  if (tokenRefreshIntervalId !== null) {
    clearInterval(tokenRefreshIntervalId);
    tokenRefreshIntervalId = null;
  }
}

/**
 * Rotate access tokens before expiry. Reads the latest refresh token from localStorage on each tick
 * so rotation from the previous refresh remains valid (backend revokes old refresh tokens).
 */
export const setupTokenRefresh = (): ReturnType<typeof setInterval> | null => {
  if (typeof window === 'undefined') return null;

  stopTokenRefreshTimer();

  if (!localStorage.getItem('admin_refresh_token')) return null;

  tokenRefreshIntervalId = setInterval(async () => {
    const rt = localStorage.getItem('admin_refresh_token');
    if (!rt) {
      stopTokenRefreshTimer();
      return;
    }
    try {
      const response = await authApi.refreshToken(rt);
      authApi.storeAuthData(response);
    } catch (error) {
      console.error('Token refresh failed:', error);
      stopTokenRefreshTimer();
      await authApi.logout();
      window.location.href = '/login';
    }
  }, 14 * 60 * 1000);

  return tokenRefreshIntervalId;
};
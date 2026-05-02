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

export const authApi = {
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

    // Clear local storage
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('medcare_role');
    localStorage.removeItem('medcare_username');
    localStorage.removeItem('medcare_user_data');
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
    
    localStorage.setItem('admin_access_token', tokens.accessToken);
    localStorage.setItem('admin_refresh_token', tokens.refreshToken);
    localStorage.setItem('medcare_role', user.role);
    localStorage.setItem('medcare_username', user.username);
    localStorage.setItem('medcare_user_data', JSON.stringify(user));
  }
};

// Auto-refresh token when it's about to expire
export const setupTokenRefresh = () => {
  if (typeof window === 'undefined') return;

  const refreshToken = localStorage.getItem('admin_refresh_token');
  if (!refreshToken) return;

  // Refresh token every 14 minutes (tokens expire in 15 minutes)
  const refreshInterval = setInterval(async () => {
    try {
      const response = await authApi.refreshToken(refreshToken);
      authApi.storeAuthData(response);
    } catch (error) {
      console.error('Token refresh failed:', error);
      authApi.logout();
      window.location.href = '/login';
      clearInterval(refreshInterval);
    }
  }, 14 * 60 * 1000); // 14 minutes

  return refreshInterval;
};
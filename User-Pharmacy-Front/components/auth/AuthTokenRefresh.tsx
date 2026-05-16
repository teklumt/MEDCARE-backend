'use client';

import { useEffect } from 'react';
import { setupTokenRefresh } from '@/lib/auth-api';

/** Starts periodic access-token refresh whenever a refresh token exists (login/signup/layout mount). */
export function AuthTokenRefresh() {
  useEffect(() => {
    setupTokenRefresh();
  }, []);
  return null;
}

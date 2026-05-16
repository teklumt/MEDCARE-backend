'use client';

import { useCallback, useEffect, useState } from 'react';
import { ADDIS_FALLBACK, type LatLng } from '@/lib/pharmacyGeo';

export type UserLocationStatus = 'loading' | 'ready' | 'denied' | 'error';

export type UserLocationState = {
  status: UserLocationStatus;
  position: LatLng;
  usingFallback: boolean;
};

const GEO_TIMEOUT_MS = 10_000;

export function useUserLocation() {
  const [state, setState] = useState<UserLocationState>({
    status: 'loading',
    position: ADDIS_FALLBACK,
    usingFallback: true
  });

  const resolveFromGeolocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setState({ status: 'error', position: ADDIS_FALLBACK, usingFallback: true });
      return;
    }

    setState((prev) => ({ ...prev, status: 'loading' }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: 'ready',
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          usingFallback: false
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setState({
          status: denied ? 'denied' : 'error',
          position: ADDIS_FALLBACK,
          usingFallback: true
        });
      },
      { enableHighAccuracy: false, timeout: GEO_TIMEOUT_MS, maximumAge: 60_000 }
    );
  }, []);

  useEffect(() => {
    resolveFromGeolocation();
  }, [resolveFromGeolocation]);

  return { ...state, retry: resolveFromGeolocation };
}

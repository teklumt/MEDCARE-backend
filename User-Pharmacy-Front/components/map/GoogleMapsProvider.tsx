'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import type { ReactNode } from 'react';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  if (!apiKey) {
    return <>{children}</>;
  }
  return <APIProvider apiKey={apiKey}>{children}</APIProvider>;
}

export function hasGoogleMapsApiKey(): boolean {
  return Boolean(apiKey);
}

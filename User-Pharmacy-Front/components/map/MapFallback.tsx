'use client';

import type { ReactNode } from 'react';
import { MapPin } from 'lucide-react';

export default function MapFallback({
  children,
  className = '',
  message = 'Maps API key not configured'
}: {
  children?: ReactNode;
  className?: string;
  message?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-gray-100 text-center p-6 min-h-[200px] ${className}`}
    >
      {children ?? (
        <>
          <MapPin className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-600">{message}</p>
          <p className="text-xs text-gray-400 mt-1">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env</p>
        </>
      )}
    </div>
  );
}

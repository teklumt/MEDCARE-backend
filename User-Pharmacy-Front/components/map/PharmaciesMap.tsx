'use client';

import { useEffect, type ReactNode } from 'react';
import { Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsProvider, hasGoogleMapsApiKey } from '@/components/map/GoogleMapsProvider';
import type { LatLng } from '@/lib/pharmacyGeo';
import { MapPin } from 'lucide-react';

export type PharmacyMapMarker = {
  id: string;
  name: string;
  position: LatLng;
};

type PharmaciesMapProps = {
  center: LatLng;
  userPosition: LatLng;
  pharmacies: PharmacyMapMarker[];
  selectedPharmacyId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
};

function MapFallback({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-gray-100 text-center p-6 min-h-[280px] ${className}`}
    >
      {children}
    </div>
  );
}

function FitBounds({
  userPosition,
  pharmacies
}: {
  userPosition: LatLng;
  pharmacies: PharmacyMapMarker[];
}) {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore
    if (!map || typeof google === 'undefined') return;

    // @ts-ignore
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(userPosition);
    pharmacies.forEach((p) => bounds.extend(p.position));

    if (pharmacies.length === 0) {
      map.setCenter(userPosition);
      map.setZoom(13);
      return;
    }

    map.fitBounds(bounds, { top: 56, right: 56, bottom: 56, left: 56 });
  }, [map, userPosition, pharmacies]);

  return null;
}

function PharmaciesMapInner({
  center,
  userPosition,
  pharmacies,
  selectedPharmacyId,
  onSelect,
  className = ''
}: PharmaciesMapProps) {
  if (!hasGoogleMapsApiKey()) {
    return (
      <MapFallback className={className}>
        <MapPin className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-600">Maps API key not configured</p>
        <p className="text-xs text-gray-400 mt-1">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env</p>
      </MapFallback>
    );
  }

  const selectedName = pharmacies.find((x) => x.id === selectedPharmacyId)?.name;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 ${className}`}
    >
      <Map
        defaultCenter={center}
        defaultZoom={13}
        gestureHandling="greedy"
        className="w-full h-full min-h-[280px]"
      >
        <FitBounds userPosition={userPosition} pharmacies={pharmacies} />
        <Marker position={userPosition} title="Your location" />
        {pharmacies.map((p) => (
          <Marker
            key={p.id}
            position={p.position}
            title={p.id === selectedPharmacyId ? `${p.name} (selected)` : p.name}
            onClick={() => onSelect?.(p.id)}
          />
        ))}
      </Map>
      {selectedName && (
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex justify-center">
          <span className="inline-block bg-white/95 backdrop-blur-sm text-xs font-bold text-brand-800 px-3 py-1.5 rounded-full shadow-sm border border-brand-100">
            {selectedName}
          </span>
        </div>
      )}
    </div>
  );
}

export default function PharmaciesMap(props: PharmaciesMapProps) {
  return (
    <GoogleMapsProvider>
      <PharmaciesMapInner {...props} />
    </GoogleMapsProvider>
  );
}

'use client';

import { useEffect } from 'react';
import { Map, Marker, Circle, useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsProvider, hasGoogleMapsApiKey } from '@/components/map/GoogleMapsProvider';
import MapFallback from '@/components/map/MapFallback';
import type { LatLng } from '@/lib/pharmacyGeo';
import { MapPin } from 'lucide-react';

export type PharmacyDeliveryCoverageMapProps = {
  center: LatLng | null;
  radiusKm: number;
  className?: string;
  onGoToLocation?: () => void;
};

function FitCircleBounds({ center, radiusKm }: { center: LatLng; radiusKm: number }) {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore
    if (!map || typeof google === 'undefined') return;

    const lat = center.lat;
    const lng = center.lng;
    const pad = 1.12;
    const dLat = (radiusKm / 111.32) * pad;
    const cosLat = Math.cos((lat * Math.PI) / 180);
    const dLng = cosLat > 0.01 ? ((radiusKm / (111.32 * cosLat)) * pad) : dLat;

    // @ts-ignore
    const bounds = new google.maps.LatLngBounds(
      { lat: lat - dLat, lng: lng - dLng },
      { lat: lat + dLat, lng: lng + dLng }
    );
    map.fitBounds(bounds, { top: 48, right: 48, bottom: 56, left: 48 });
  }, [map, center.lat, center.lng, radiusKm]);

  return null;
}

function CoverageInner({
  center,
  radiusKm,
  className = '',
  onGoToLocation
}: PharmacyDeliveryCoverageMapProps) {
  const frameHeight = 'h-[280px]';

  if (!hasGoogleMapsApiKey()) {
    return (
      <MapFallback className={`rounded-xl border border-gray-200 ${frameHeight} ${className}`} />
    );
  }

  if (!center) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center ${frameHeight} ${className}`}
      >
        <MapPin className="w-8 h-8 text-amber-600" />
        <p className="text-sm font-medium text-amber-900 max-w-sm">
          Set your pharmacy pin under Location & Hours so delivery coverage can be shown on the map.
        </p>
        {onGoToLocation && (
          <button
            type="button"
            onClick={onGoToLocation}
            className="text-sm font-bold text-brand-700 hover:text-brand-900 underline underline-offset-2"
          >
            Open Location & Hours
          </button>
        )}
      </div>
    );
  }

  const r = Number.isFinite(radiusKm) && radiusKm > 0 ? radiusKm : 1;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 ${frameHeight} ${className}`}
    >
      <Map
        defaultCenter={center}
        defaultZoom={12}
        gestureHandling="greedy"
        className="absolute inset-0 size-full"
      >
        <FitCircleBounds center={center} radiusKm={r} />
        <Marker position={center} title="Pharmacy" />
        <Circle
          center={center}
          radius={r * 1000}
          strokeColor="#0A4C36"
          strokeOpacity={0.95}
          strokeWeight={2}
          fillColor="#3B9372"
          fillOpacity={0.14}
        />
      </Map>
    </div>
  );
}

export default function PharmacyDeliveryCoverageMap(props: PharmacyDeliveryCoverageMapProps) {
  return (
    <GoogleMapsProvider>
      <CoverageInner {...props} />
    </GoogleMapsProvider>
  );
}

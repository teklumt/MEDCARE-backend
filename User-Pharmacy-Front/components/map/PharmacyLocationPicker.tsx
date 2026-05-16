'use client';

import { useCallback } from 'react';
import { Map, Marker, type MapMouseEvent } from '@vis.gl/react-google-maps';
import { GoogleMapsProvider, hasGoogleMapsApiKey } from '@/components/map/GoogleMapsProvider';
import { ADDIS_FALLBACK, type LatLng } from '@/lib/pharmacyGeo';
import { MapPin, Navigation } from 'lucide-react';

type PharmacyLocationPickerProps = {
  value: LatLng | null;
  onChange: (position: LatLng) => void;
  className?: string;
};

function PickerInner({ value, onChange, className = '' }: PharmacyLocationPickerProps) {
  const center = value ?? ADDIS_FALLBACK;

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      const latLng = e.detail.latLng;
      if (!latLng) return;
      onChange({ lat: latLng.lat, lng: latLng.lng });
    },
    [onChange]
  );

  const handleMarkerDrag = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat == null || lng == null) return;
      onChange({ lat, lng });
    },
    [onChange]
  );

  if (!hasGoogleMapsApiKey()) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-100 rounded-xl border border-gray-200 p-6 min-h-[256px] ${className}`}
      >
        <MapPin className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">Maps API key not configured</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="w-full h-64 rounded-xl border border-gray-200 overflow-hidden">
        <Map
          defaultCenter={center}
          defaultZoom={15}
          gestureHandling="greedy"
          onClick={handleMapClick}
          className="w-full h-full"
        >
          <Marker
            position={center}
            draggable
            onDragEnd={handleMarkerDrag}
            title="Pharmacy location"
          />
        </Map>
      </div>
      {value && (
        <p className="text-xs text-gray-500 mt-2 font-mono">
          {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}

export default function PharmacyLocationPicker(props: PharmacyLocationPickerProps) {
  const { onChange, ...rest } = props;

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
    );
  };

  return (
    <GoogleMapsProvider>
      <div className="space-y-2">
        <PickerInner {...rest} onChange={onChange} />
        <button
          type="button"
          onClick={useCurrentLocation}
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-900 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm"
        >
          <Navigation className="w-4 h-4" />
          Use current location
        </button>
      </div>
    </GoogleMapsProvider>
  );
}

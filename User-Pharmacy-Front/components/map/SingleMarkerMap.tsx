'use client';

import { Map, Marker } from '@vis.gl/react-google-maps';
import { GoogleMapsProvider, hasGoogleMapsApiKey } from '@/components/map/GoogleMapsProvider';
import MapFallback from '@/components/map/MapFallback';
import { ADDIS_FALLBACK, type LatLng } from '@/lib/pharmacyGeo';
import { MapPin } from 'lucide-react';

type SingleMarkerMapProps = {
  position: LatLng | null;
  title?: string;
  className?: string;
  zoom?: number;
};

function SingleMarkerMapInner({ position, title, className = '', zoom = 15 }: SingleMarkerMapProps) {
  if (!hasGoogleMapsApiKey()) {
    return <MapFallback className={className} />;
  }

  if (!position) {
    return (
      <MapFallback className={className} message="Location not available">
        <MapPin className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-600">No map pin saved for this location</p>
      </MapFallback>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      <Map
        defaultCenter={position}
        defaultZoom={zoom}
        gestureHandling="greedy"
        className="w-full h-full min-h-[200px]"
      >
        <Marker position={position} title={title ?? 'Location'} />
      </Map>
    </div>
  );
}

export default function SingleMarkerMap(props: SingleMarkerMapProps) {
  return (
    <GoogleMapsProvider>
      <SingleMarkerMapInner {...props} position={props.position} />
    </GoogleMapsProvider>
  );
}

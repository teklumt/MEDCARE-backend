'use client';

import { useEffect, useMemo } from 'react';
import { Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsProvider, hasGoogleMapsApiKey } from '@/components/map/GoogleMapsProvider';
import MapFallback from '@/components/map/MapFallback';
import { ADDIS_FALLBACK, type LatLng } from '@/lib/pharmacyGeo';
import { ROUTE_MARKER_META, routeMarkerIcon, type RouteMarkerKind } from '@/lib/mapMarkerIcons';
import { MapPin } from 'lucide-react';

export type RouteMapPoint = {
  position: LatLng;
  title: string;
  kind: RouteMarkerKind;
};

type DeliveryRouteMapProps = {
  points: RouteMapPoint[];
  className?: string;
  emptyMessage?: string;
};

function FitRouteBounds({ points }: { points: RouteMapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore
    if (!map || typeof google === 'undefined' || points.length === 0) return;

    if (points.length === 1) {
      map.setCenter(points[0].position);
      map.setZoom(15);
      return;
    }

    // @ts-ignore
      // @ts-ignore
    const bounds = new google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p.position));
    map.fitBounds(bounds, { top: 48, right: 48, bottom: 64, left: 48 });
  }, [map, points]);

  return null;
}

function RouteKindMarker({ point, zIndex }: { point: RouteMapPoint; zIndex: number }) {
  const map = useMap();
  const icon = useMemo(() => {
    if (typeof google !== 'undefined' && map) {
      return routeMarkerIcon(point.kind);
    }
    return { url: ROUTE_MARKER_META[point.kind].url };
  }, [map, point.kind]);

  return (
    <Marker
      position={point.position}
      title={point.title}
      icon={icon}
      zIndex={zIndex}
    />
  );
}

function DeliveryRouteMapInner({
  points,
  className = '',
  emptyMessage = 'No locations to display on map'
}: DeliveryRouteMapProps) {
  if (!hasGoogleMapsApiKey()) {
    return <MapFallback className={className} />;
  }

  const valid = points.filter((p) => p.position);
  if (valid.length === 0) {
    return (
      <MapFallback className={className} message={emptyMessage}>
        <MapPin className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-600">{emptyMessage}</p>
      </MapFallback>
    );
  }

  const center = valid[0]?.position ?? ADDIS_FALLBACK;
  const legendKinds = Array.from(new Set(valid.map((p) => p.kind)));

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      <Map
        defaultCenter={center}
        defaultZoom={13}
        gestureHandling="greedy"
        className="w-full h-full min-h-[200px]"
      >
        <FitRouteBounds points={valid} />
        {valid.map((p, i) => (
          <RouteKindMarker
            key={`${p.kind}-${i}`}
            point={p}
            zIndex={p.kind === 'driver' ? 3 : p.kind === 'destination' ? 2 : 1}
          />
        ))}
      </Map>
      {legendKinds.length > 0 && (
        <div
          className="absolute bottom-2 left-2 right-2 flex flex-wrap justify-center gap-2 pointer-events-none z-10"
          aria-hidden
        >
          {legendKinds.map((kind) => {
            const meta = ROUTE_MARKER_META[kind];
            return (
              <span
                key={kind}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/95 border border-gray-200 px-2.5 py-1 text-[10px] font-bold text-gray-800 shadow-sm"
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${meta.dotClass}`} />
                {meta.legendLabel}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DeliveryRouteMap(props: DeliveryRouteMapProps) {
  return (
    <GoogleMapsProvider>
      <DeliveryRouteMapInner {...props} />
    </GoogleMapsProvider>
  );
}

export function buildRoutePoints(input: {
  pharmacy?: LatLng | null;
  pharmacyName?: string;
  destination?: LatLng | null;
  destinationLabel?: string;
  driver?: LatLng | null;
  driverLabel?: string;
}): RouteMapPoint[] {
  const points: RouteMapPoint[] = [];
  if (input.pharmacy) {
    points.push({
      position: input.pharmacy,
      title: input.pharmacyName ?? 'Pharmacy',
      kind: 'pharmacy'
    });
  }
  if (input.destination) {
    points.push({
      position: input.destination,
      title: input.destinationLabel ?? 'Delivery address',
      kind: 'destination'
    });
  }
  if (input.driver) {
    points.push({
      position: input.driver,
      title: input.driverLabel ?? 'Driver',
      kind: 'driver'
    });
  }
  return points;
}

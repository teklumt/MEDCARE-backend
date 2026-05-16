export type GeoJsonPoint = { type: 'Point'; coordinates: [number, number] };

export function parseCoordinatesInput(raw: unknown): GeoJsonPoint | null {
  if (!raw || typeof raw !== 'object') return null;
  const body = raw as { type?: string; coordinates?: unknown };
  if (body.type !== 'Point' || !Array.isArray(body.coordinates) || body.coordinates.length < 2) {
    return null;
  }
  const lng = Number(body.coordinates[0]);
  const lat = Number(body.coordinates[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;
  return { type: 'Point', coordinates: [lng, lat] };
}

export function parseLatLngBody(raw: unknown): { lat: number; lng: number } | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as { lat?: unknown; lng?: unknown };
  const lat = Number(o.lat);
  const lng = Number(o.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
}

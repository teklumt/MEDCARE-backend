import type { LatLng } from '@/lib/pharmacyGeo';

export type GeoPoint = { type?: string; coordinates?: number[] };

/** Shape accepted by formatters (API payload or form merged with coordinates). */
export type DeliveryAddressDisplayInput = {
  recipientName?: string;
  phone?: string;
  street?: string;
  subCity?: string;
  city?: string;
  additionalInfo?: string;
  coordinates?: GeoPoint | null;
} | null | undefined;

/** Parse GeoJSON Point or { lat, lng } into LatLng. */
export function parseGeoPoint(raw: unknown): LatLng | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  if (o.type === 'Point' && Array.isArray(o.coordinates) && o.coordinates.length >= 2) {
    const lng = Number(o.coordinates[0]);
    const lat = Number(o.coordinates[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) {
      return { lat, lng };
    }
  }

  const lat = Number(o.lat);
  const lng = Number(o.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) {
    return { lat, lng };
  }

  return null;
}

export function parseDeliveryAddressPosition(
  deliveryAddress?: { coordinates?: GeoPoint | null | undefined } | null
): LatLng | null {
  if (!deliveryAddress?.coordinates) return null;
  return parseGeoPoint(deliveryAddress.coordinates);
}

type GeocodeAddressComponent = {
  long_name?: string;
  short_name?: string;
  types?: string[];
};

type GeocodeResult = {
  formatted_address?: string;
  address_components?: GeocodeAddressComponent[];
};

function pickComponent(
  components: GeocodeAddressComponent[],
  ...types: string[]
): string | undefined {
  const c = components.find((x) => x.types?.some((t) => types.includes(t)));
  const name = c?.long_name?.trim();
  return name || undefined;
}

/** Best-effort structured fields from Google Geocoding address_components. */
export function structuredAddressFromGeocodeComponents(
  components: GeocodeAddressComponent[]
): { street?: string; subCity?: string; city?: string } {
  const streetNum = pickComponent(components, 'street_number');
  const route = pickComponent(components, 'route');
  let street = [streetNum, route].filter(Boolean).join(' ').trim();
  if (!street) {
    street =
      pickComponent(components, 'premise', 'establishment', 'point_of_interest', 'plus_code') ?? '';
  }

  const subCity =
    pickComponent(
      components,
      'sublocality_level_1',
      'sublocality_level_2',
      'sublocality',
      'neighborhood',
      'administrative_area_level_3'
    ) ?? '';

  let city =
    pickComponent(components, 'locality', 'postal_town', 'administrative_area_level_2') ?? '';
  if (!city) {
    city = pickComponent(components, 'administrative_area_level_1') ?? '';
  }

  const out: { street?: string; subCity?: string; city?: string } = {};
  if (street) out.street = street;
  if (subCity) out.subCity = subCity;
  if (city) out.city = city;
  return out;
}

/**
 * Reverse-geocode via Google Geocoding REST API (same key as Maps JS).
 * Enable "Geocoding API" for the key in Google Cloud.
 */
export async function reverseGeocodeLatLng(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<{ street?: string; subCity?: string; city?: string } | null> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!key || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(`${lat},${lng}`)}&key=${encodeURIComponent(key)}`;

  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch {
    return null;
  }

  type GeocodeJson = { status?: string; results?: GeocodeResult[] };
  let data: GeocodeJson;
  try {
    data = (await res.json()) as GeocodeJson;
  } catch {
    return null;
  }

  if (data.status !== 'OK' || !data.results?.length) return null;

  const first = data.results[0];
  const components = first.address_components ?? [];
  const structured = structuredAddressFromGeocodeComponents(components);

  if (
    !structured.street &&
    typeof first.formatted_address === 'string' &&
    first.formatted_address.trim()
  ) {
    const head = first.formatted_address.split(',')[0]?.trim();
    if (head) structured.street = head;
  }

  if (!structured.street && !structured.subCity && !structured.city) return null;

  return structured;
}

export type FormatDeliveryAddressOptions = {
  /** Include recipient name (default true). */
  includeRecipient?: boolean;
  /** Use newlines vs middle-dot separators between text lines (pin line always appended). */
  multiline?: boolean;
};

/** Human-readable delivery lines plus map pin when coordinates exist. */
export function formatDeliveryAddressForDisplay(
  addr: DeliveryAddressDisplayInput,
  options?: FormatDeliveryAddressOptions
): string {
  const includeRecipient = options?.includeRecipient !== false;
  const multiline = options?.multiline === true;

  if (!addr) return 'Address not provided';

  const textParts: string[] = [];
  if (includeRecipient && addr.recipientName?.trim()) textParts.push(addr.recipientName.trim());

  const streetLine = [addr.street?.trim(), addr.additionalInfo?.trim()].filter(Boolean).join(', ');
  if (streetLine) textParts.push(streetLine);

  const cityLine = [addr.subCity?.trim(), addr.city?.trim()].filter(Boolean).join(', ');
  if (cityLine) textParts.push(cityLine);

  if (addr.phone?.trim()) textParts.push(addr.phone.trim());

  const pos = parseDeliveryAddressPosition(addr);
  const pinLine = pos ? `Map pin: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : null;

  const sep = multiline ? '\n' : ' · ';
  let body = textParts.join(sep);

  if (pinLine) {
    body = body ? (multiline ? `${body}\n${pinLine}` : `${body} · ${pinLine}`) : pinLine;
  }

  return body || 'Address not provided';
}

/** Short single-line label for map legends (ellipsis if very long). */
export function formatDeliveryAddressCompact(addr: DeliveryAddressDisplayInput, maxLen = 72): string {
  const line = formatDeliveryAddressForDisplay(addr, {
    includeRecipient: false,
    multiline: false
  });
  if (line === 'Address not provided') return 'Delivery';
  return line.length > maxLen ? `${line.slice(0, Math.max(0, maxLen - 1))}…` : line;
}

/** Driver pickup card: written address/area, phone, and map pin when coords exist (matches delivery-address UX). */
export type PharmacyPickupDisplayInput = {
  address?: string | null;
  location?: string | null;
  phone?: string | null;
  coordinates?: GeoPoint | null;
} | null | undefined;

export function formatPharmacyPickupForDisplay(p: PharmacyPickupDisplayInput): string {
  if (!p) return 'Pickup location not available';

  const lines: string[] = [];
  const streetLike = [p.address?.trim(), p.location?.trim()].filter(Boolean).join(' · ');
  if (streetLike) lines.push(streetLike);

  if (p.phone?.trim()) lines.push(`Phone: ${p.phone.trim()}`);

  const pos = parseGeoPoint(p.coordinates ?? null);
  if (pos) lines.push(`Map pin: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);

  if (lines.length === 0) {
    return 'Address not set — use the map above or contact the pharmacy.';
  }
  return lines.join('\n');
}

export function toGeoJsonPoint(position: LatLng): {
  type: 'Point';
  coordinates: [number, number];
} {
  return { type: 'Point', coordinates: [position.lng, position.lat] };
}

/** Inline summary with optional coordinates line (delegates to formatDeliveryAddressForDisplay). */
export function formatDeliveryAddressText(addr?: DeliveryAddressDisplayInput | null): string {
  return formatDeliveryAddressForDisplay(addr, { includeRecipient: true, multiline: false });
}

export function googleMapsDirectionsUrl(destination: LatLng, origin?: LatLng): string {
  const dest = `${destination.lat},${destination.lng}`;
  if (origin) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}

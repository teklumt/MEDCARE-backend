export const ADDIS_FALLBACK = { lat: 9.0192, lng: 38.7525 } as const;

export type LatLng = { lat: number; lng: number };

export type PharmacyCoordinates = {
  type?: string;
  coordinates?: number[];
};

export type PharmacyApiRecord = {
  _id: string;
  businessName: string;
  location?: string;
  address?: string;
  phone?: string;
  description?: string;
  openingHours?: string;
  isOpen?: boolean;
  deliveryAvailable?: boolean;
  coordinates?: PharmacyCoordinates;
  stats?: { rating?: number; reviewCount?: number };
};

export type PharmacyCardModel = {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  reviews: number;
  status: 'open' | 'closed';
  availability: 'high' | 'medium' | 'low';
  position: LatLng | null;
};

export function parsePharmacyPosition(pharmacy: PharmacyApiRecord): LatLng | null {
  const coords = pharmacy.coordinates?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
}

export function availabilityFromRating(rating: number): 'high' | 'medium' | 'low' {
  if (rating >= 4.5) return 'high';
  if (rating >= 4) return 'medium';
  return 'low';
}

export function mapPharmacyToCard(pharmacy: PharmacyApiRecord): PharmacyCardModel {
  const rating = pharmacy.stats?.rating ?? 0;
  return {
    id: String(pharmacy._id),
    name: pharmacy.businessName,
    address: pharmacy.address || pharmacy.location || 'Addis Ababa',
    distance: pharmacy.location || 'Nearby',
    rating,
    reviews: pharmacy.stats?.reviewCount ?? 0,
    status: pharmacy.isOpen ? 'open' : 'closed',
    availability: availabilityFromRating(rating),
    position: parsePharmacyPosition(pharmacy)
  };
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function enrichCardsWithDistance(
  cards: PharmacyCardModel[],
  user: LatLng
): PharmacyCardModel[] {
  return cards.map((card) => {
    if (!card.position) return card;
    const km = haversineKm(user, card.position);
    return { ...card, distance: formatDistanceKm(km) };
  });
}

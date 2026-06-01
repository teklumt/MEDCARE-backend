/**
 * Tests for pharmacy-related utility helpers.
 */

const haversineDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

type StockStatus = 'adequate' | 'low_stock' | 'out_of_stock';
const getStockBadgeColor = (status: StockStatus): string => ({
  adequate: 'green',
  low_stock: 'yellow',
  out_of_stock: 'red',
}[status]);

const formatDeliveryFee = (fee: number, isFree: boolean): string =>
  isFree ? 'Free Delivery' : `ETB ${fee.toFixed(2)}`;

const isPharmacyOpen = (openHour: number, closeHour: number, currentHour: number): boolean =>
  currentHour >= openHour && currentHour < closeHour;

const formatRating = (rating: number, count: number): string =>
  count === 0 ? 'No reviews yet' : `${rating.toFixed(1)} (${count} reviews)`;

describe('Pharmacy utilities', () => {
  describe('haversineDistance', () => {
    it('returns ~0 for same coordinates', () => {
      expect(haversineDistance(9.005, 38.763, 9.005, 38.763)).toBeCloseTo(0);
    });

    it('calculates positive distance between two points', () => {
      const dist = haversineDistance(9.005, 38.763, 9.030, 38.800);
      expect(dist).toBeGreaterThan(0);
    });

    it('distance is symmetric', () => {
      const d1 = haversineDistance(9.0, 38.7, 9.1, 38.8);
      const d2 = haversineDistance(9.1, 38.8, 9.0, 38.7);
      expect(d1).toBeCloseTo(d2, 5);
    });
  });

  describe('getStockBadgeColor', () => {
    it('returns green for adequate stock', () => {
      expect(getStockBadgeColor('adequate')).toBe('green');
    });

    it('returns yellow for low stock', () => {
      expect(getStockBadgeColor('low_stock')).toBe('yellow');
    });

    it('returns red for out of stock', () => {
      expect(getStockBadgeColor('out_of_stock')).toBe('red');
    });
  });

  describe('formatDeliveryFee', () => {
    it('shows free delivery label when fee is waived', () => {
      expect(formatDeliveryFee(0, true)).toBe('Free Delivery');
    });

    it('shows ETB amount when fee applies', () => {
      expect(formatDeliveryFee(30, false)).toBe('ETB 30.00');
    });
  });

  describe('isPharmacyOpen', () => {
    it('returns true when current hour is within operating hours', () => {
      expect(isPharmacyOpen(8, 20, 14)).toBe(true);
    });

    it('returns false before opening hour', () => {
      expect(isPharmacyOpen(8, 20, 6)).toBe(false);
    });

    it('returns false at or after closing hour', () => {
      expect(isPharmacyOpen(8, 20, 20)).toBe(false);
    });
  });

  describe('formatRating', () => {
    it('shows no reviews message when count is 0', () => {
      expect(formatRating(0, 0)).toBe('No reviews yet');
    });

    it('shows formatted rating with review count', () => {
      expect(formatRating(4.5, 23)).toBe('4.5 (23 reviews)');
    });

    it('rounds rating to one decimal place', () => {
      expect(formatRating(4.666, 10)).toBe('4.7 (10 reviews)');
    });
  });
});

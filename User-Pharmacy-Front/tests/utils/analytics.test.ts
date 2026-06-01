/**
 * Tests for pharmacy analytics dashboard data-processing utilities.
 */

interface OrderDataPoint { month: string; orders: number; revenue: number; }

const calculateTotalRevenue = (data: OrderDataPoint[]): number =>
  data.reduce((sum, d) => sum + d.revenue, 0);

const calculateTotalOrders = (data: OrderDataPoint[]): number =>
  data.reduce((sum, d) => sum + d.orders, 0);

const getTopMonth = (data: OrderDataPoint[]): OrderDataPoint | null =>
  data.length === 0 ? null : data.reduce((best, d) => d.revenue > best.revenue ? d : best);

const calculateAverageOrderValue = (data: OrderDataPoint[]): number => {
  const total = calculateTotalRevenue(data);
  const orders = calculateTotalOrders(data);
  return orders === 0 ? 0 : Math.round(total / orders);
};

interface MedStat { name: string; sold: number; }
const getTopMedications = (meds: MedStat[], limit = 5): MedStat[] =>
  [...meds].sort((a, b) => b.sold - a.sold).slice(0, limit);

const formatRevenue = (amount: number): string =>
  `ETB ${amount.toLocaleString('en-ET')}`;

const sample: OrderDataPoint[] = [
  { month: 'Jan', orders: 45, revenue: 6750 },
  { month: 'Feb', orders: 60, revenue: 9000 },
  { month: 'Mar', orders: 38, revenue: 5700 },
];

describe('Pharmacy analytics utilities', () => {
  describe('calculateTotalRevenue', () => {
    it('sums revenue across all months', () => {
      expect(calculateTotalRevenue(sample)).toBe(21450);
    });

    it('returns 0 for empty data', () => {
      expect(calculateTotalRevenue([])).toBe(0);
    });
  });

  describe('calculateTotalOrders', () => {
    it('sums orders across all months', () => {
      expect(calculateTotalOrders(sample)).toBe(143);
    });

    it('returns 0 for empty data', () => {
      expect(calculateTotalOrders([])).toBe(0);
    });
  });

  describe('getTopMonth', () => {
    it('returns the month with highest revenue', () => {
      const top = getTopMonth(sample);
      expect(top?.month).toBe('Feb');
      expect(top?.revenue).toBe(9000);
    });

    it('returns null for empty data', () => {
      expect(getTopMonth([])).toBeNull();
    });
  });

  describe('calculateAverageOrderValue', () => {
    it('calculates average correctly', () => {
      expect(calculateAverageOrderValue(sample)).toBe(Math.round(21450 / 143));
    });

    it('returns 0 when there are no orders', () => {
      expect(calculateAverageOrderValue([])).toBe(0);
    });
  });

  describe('getTopMedications', () => {
    const meds: MedStat[] = [
      { name: 'Paracetamol', sold: 120 },
      { name: 'Amoxicillin', sold: 85 },
      { name: 'Metformin', sold: 200 },
      { name: 'Ibuprofen', sold: 60 },
      { name: 'Omeprazole', sold: 45 },
      { name: 'Aspirin', sold: 30 },
    ];

    it('returns top 5 by default', () => {
      expect(getTopMedications(meds)).toHaveLength(5);
    });

    it('returns medications sorted by sales descending', () => {
      const top = getTopMedications(meds, 3);
      expect(top[0].name).toBe('Metformin');
      expect(top[1].name).toBe('Paracetamol');
    });

    it('respects custom limit', () => {
      expect(getTopMedications(meds, 2)).toHaveLength(2);
    });

    it('does not mutate the original array', () => {
      const original = [...meds];
      getTopMedications(meds);
      expect(meds).toEqual(original);
    });
  });

  describe('formatRevenue', () => {
    it('formats with ETB prefix', () => {
      expect(formatRevenue(9000).startsWith('ETB')).toBe(true);
    });

    it('formats 0 correctly', () => {
      expect(formatRevenue(0)).toContain('0');
    });
  });
});

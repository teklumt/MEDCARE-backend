/**
 * Tests for order utility/formatting helpers.
 */

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled' | 'rejected';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  dispatched: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

const getStatusLabel = (status: OrderStatus) => ORDER_STATUS_LABELS[status] ?? status;

const isOrderCancellable = (status: OrderStatus) => ['pending', 'confirmed'].includes(status);

const formatOrderTotal = (subtotal: number, deliveryFee: number, discount = 0): number =>
  Math.max(0, subtotal + deliveryFee - discount);

const ORDER_STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'dispatched', 'delivered'];
const getOrderProgress = (status: OrderStatus): number => {
  const idx = ORDER_STATUS_STEPS.indexOf(status);
  return idx === -1 ? 0 : Math.round((idx / (ORDER_STATUS_STEPS.length - 1)) * 100);
};

describe('Order utilities', () => {
  describe('getStatusLabel', () => {
    it('returns correct label for each status', () => {
      expect(getStatusLabel('pending')).toBe('Pending');
      expect(getStatusLabel('dispatched')).toBe('On the Way');
      expect(getStatusLabel('delivered')).toBe('Delivered');
    });

    it('returns all 7 defined statuses correctly', () => {
      const statuses = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];
      statuses.forEach(s => expect(getStatusLabel(s)).toBeTruthy());
    });
  });

  describe('isOrderCancellable', () => {
    it('allows cancellation for pending and confirmed orders', () => {
      expect(isOrderCancellable('pending')).toBe(true);
      expect(isOrderCancellable('confirmed')).toBe(true);
    });

    it('prevents cancellation once preparing or beyond', () => {
      expect(isOrderCancellable('preparing')).toBe(false);
      expect(isOrderCancellable('dispatched')).toBe(false);
      expect(isOrderCancellable('delivered')).toBe(false);
    });
  });

  describe('formatOrderTotal', () => {
    it('calculates total correctly', () => {
      expect(formatOrderTotal(200, 50)).toBe(250);
    });

    it('applies discount correctly', () => {
      expect(formatOrderTotal(200, 50, 30)).toBe(220);
    });

    it('never returns a negative total', () => {
      expect(formatOrderTotal(10, 0, 100)).toBe(0);
    });
  });

  describe('getOrderProgress', () => {
    it('returns 0% for pending', () => {
      expect(getOrderProgress('pending')).toBe(0);
    });

    it('returns 100% for delivered', () => {
      expect(getOrderProgress('delivered')).toBe(100);
    });

    it('returns a midpoint value for dispatched', () => {
      const progress = getOrderProgress('dispatched');
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
    });

    it('returns 0 for terminal statuses not in progress list', () => {
      expect(getOrderProgress('cancelled')).toBe(0);
    });
  });
});

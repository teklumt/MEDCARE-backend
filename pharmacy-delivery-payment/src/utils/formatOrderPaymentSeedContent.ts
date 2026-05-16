/** One-line automated intro for order-linked chats (English v1). */
export function formatOrderPaymentSeedContent(order: {
  totalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
}): string {
  const total = typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : '?';
  const method =
    order.paymentMethod === 'chapa'
      ? 'Chapa'
      : order.paymentMethod === 'cod'
        ? 'Cash on delivery'
        : String(order.paymentMethod || 'unknown');

  const ps = order.paymentStatus || '';
  let statusLabel = ps ? String(ps) : 'pending';
  if (ps === 'success' || ps === 'paid') statusLabel = 'Paid';
  else if (ps === 'cod_pending' || (typeof ps === 'string' && ps.includes('cod'))) statusLabel = 'Pending (cash on delivery)';
  else if (ps === 'pending_prescription_review') statusLabel = 'Awaiting Rx / payment steps';
  else if (ps === 'initiated' || ps === 'pending') statusLabel = 'Payment pending';

  return `Order total ETB ${total} · Payment: ${method} · Status: ${statusLabel}`;
}

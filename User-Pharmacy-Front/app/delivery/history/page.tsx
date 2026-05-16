'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import {
  getMyDeliveryHistory,
  type DeliveryHistoryOrder,
  type DeliveryHistoryPeriod,
} from '@/lib/api';

const FILTER_CHIPS: { label: string; period: DeliveryHistoryPeriod }[] = [
  { label: 'Today', period: 'today' },
  { label: 'This Week', period: 'week' },
  { label: 'This Month', period: 'month' },
];

function completionIso(o: DeliveryHistoryOrder): string {
  return (
    o.completionAt ||
    o.driverHandoffAt ||
    o.deliveredAt ||
    o.updatedAt ||
    o.createdAt ||
    ''
  );
}

function formatWhen(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function tripDuration(o: DeliveryHistoryOrder): string {
  if (!o.tripStartedAt) return '—';
  const end = o.driverHandoffAt || o.deliveredAt;
  if (!end) return '—';
  const ms = new Date(end).getTime() - new Date(o.tripStartedAt).getTime();
  if (ms < 0) return '—';
  const mins = Math.round(ms / 60000);
  return `${mins} mins`;
}

function pharmacyName(o: DeliveryHistoryOrder): string {
  const p = o.pharmacyId;
  if (p && typeof p === 'object' && 'businessName' in p && p.businessName) return String(p.businessName);
  return 'Pharmacy';
}

function areaLabel(o: DeliveryHistoryOrder): string {
  const a = o.deliveryAddress;
  return a?.subCity || a?.street || a?.city || '—';
}

function displayRef(o: DeliveryHistoryOrder): string {
  return o.ref || o.orderId || o._id;
}

export default function DeliveryHistory() {
  const [filter, setFilter] = useState<DeliveryHistoryPeriod>('today');
  const [orders, setOrders] = useState<DeliveryHistoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyDeliveryHistory({ period: filter, page: 1 });
      setOrders(res.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load history');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Delivery History</h1>

      {/* Avoid overflow-x-auto here: paired with overflow-y it clips glyph tops in WebKit.
          Chips wrap on narrow widths instead of scrolling horizontally. */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_CHIPS.map(({ label, period }) => (
          <button
            key={period}
            type="button"
            onClick={() => setFilter(period)}
            className={`inline-flex items-center justify-center shrink-0 min-h-10 min-w-fit px-4 py-2 rounded-full text-sm font-bold leading-normal whitespace-nowrap transition-colors overflow-visible ${filter === period ? 'bg-brand-900 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-12">Loading…</p>
      ) : (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No deliveries in this period.</p>
          ) : (
            orders.map((item) => {
              const isCancelled = item.status === 'cancelled';
              const isCompleted = !isCancelled && (item.driverHandoffAt || item.status === 'delivered');
              const showCodChip =
                isCompleted && item.paymentMethod === 'cod' && typeof item.deliveryFee === 'number';
              return (
                <div
                  key={item._id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-900">{displayRef(item)}</span>
                      {isCompleted && (
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                          Completed
                        </span>
                      )}
                      {isCancelled && (
                        <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                          Declined
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{formatWhen(completionIso(item))}</p>
                    <div className="text-sm text-gray-700 font-medium">
                      {pharmacyName(item)} &rarr; {areaLabel(item)}
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end">
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5" /> {tripDuration(item)}
                    </div>
                    {showCodChip && (
                      <div className="text-sm font-bold text-gray-900 mt-2 bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-200">
                        ETB {item.deliveryFee} collected
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

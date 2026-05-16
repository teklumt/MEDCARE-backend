'use client';

import { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { getMyDeliveryEarnings, type DeliveryHistoryOrder } from '@/lib/api';

function displayRef(o: DeliveryHistoryOrder): string {
  return o.ref || o.orderId || o._id;
}

function shortWhen(o: DeliveryHistoryOrder): string {
  const iso = o.completionAt || o.driverHandoffAt || o.deliveredAt || o.updatedAt || o.createdAt || '';
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  if (isToday) return 'Today';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function DeliveryEarnings() {
  const [thisWeek, setThisWeek] = useState(0);
  const [thisMonth, setThisMonth] = useState(0);
  const [allTime, setAllTime] = useState(0);
  const [recent, setRecent] = useState<DeliveryHistoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyDeliveryEarnings();
        if (cancelled) return;
        setThisWeek(data.thisWeek);
        setThisMonth(data.thisMonth);
        setAllTime(data.allTime);
        setRecent(data.recent);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load earnings');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings</h1>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {error}
        </div>
      )}

      {/* Three separate summary blocks — avoids looking like a broken tab strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="bg-brand-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl pointer-events-none" />
          <p className="text-brand-200 text-sm font-medium leading-normal mb-2 relative">This Week</p>
          <p className="text-3xl font-bold tabular-nums leading-none relative">
            {loading ? '…' : `ETB ${thisWeek}`}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium leading-normal mb-2">This Month</p>
          <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">
            {loading ? '…' : `ETB ${thisMonth}`}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium leading-normal mb-2">All Time</p>
          <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">
            {loading ? '…' : `ETB ${allTime}`}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Deliveries</h2>

      <div className="space-y-3">
        {!loading && recent.length === 0 && (
          <p className="text-gray-500 text-sm py-4 text-center">No completed deliveries yet.</p>
        )}
        {recent.map((earn) => (
          <div
            key={earn._id}
            className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{displayRef(earn)}</p>
                <p className="text-xs text-gray-500">{shortWhen(earn)}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-gray-900">+ETB {earn.deliveryFee ?? 0}</p>
              <p className="text-[10px] font-bold uppercase mt-1 text-gray-500">Delivery fee</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-800 text-center">
          Amounts are the order delivery fees from completed runs. Final payment settlements may be managed
          with your employer pharmacy.
        </p>
      </div>
    </div>
  );
}

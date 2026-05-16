'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiGet, getMyPharmacy, type MyPharmacyProfile } from '@/lib/api';
import DeliveryRouteMap, { buildRoutePoints, type RouteMapPoint } from '@/components/map/DeliveryRouteMap';
import { parsePharmacyPosition } from '@/lib/pharmacyGeo';
import { parseDeliveryAddressPosition } from '@/lib/mapGeo';
import { Loader2 } from 'lucide-react';

type RawOrder = {
  _id: string;
  ref?: string;
  status: string;
  deliveryMethod?: string;
  deliveryAddress?: {
    street?: string;
    subCity?: string;
    coordinates?: { type?: string; coordinates?: number[] };
  };
};

export default function PharmacyDeliveriesMap() {
  const [pharmacy, setPharmacy] = useState<MyPharmacyProfile | null>(null);
  const [orders, setOrders] = useState<RawOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pharm, ordRes] = await Promise.all([
          getMyPharmacy(),
          apiGet<RawOrder[]>('/pharmacy/me/orders')
        ]);
        setPharmacy(pharm);
        const active = (ordRes.data ?? []).filter(
          (o) => o.status === 'dispatched' && o.deliveryMethod === 'delivery'
        );
        setOrders(active);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const points: RouteMapPoint[] = useMemo(() => {
    const pharmacyPos = pharmacy ? parsePharmacyPosition(pharmacy) : null;
    const list: RouteMapPoint[] = [];
    if (pharmacyPos && pharmacy) {
      list.push({
        position: pharmacyPos,
        title: pharmacy.businessName ?? 'Pharmacy',
        kind: 'pharmacy'
      });
    }
    orders.forEach((o, i) => {
      const dest = parseDeliveryAddressPosition(
        o.deliveryAddress as { coordinates?: { type?: string; coordinates?: number[] } }
      );
      if (dest) {
        list.push({
          position: dest,
          title: o.ref ?? `Delivery ${i + 1}`,
          kind: 'destination'
        });
      }
    });
    return list;
  }, [pharmacy, orders]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded-2xl border border-gray-200">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <DeliveryRouteMap
      points={points}
      className="h-64 w-full rounded-2xl border border-gray-200"
      emptyMessage="No active deliveries with map pins"
    />
  );
}

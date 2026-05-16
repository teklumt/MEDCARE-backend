'use client';

import OrderRouteMapPanel from '@/components/pharmacy/OrderRouteMapPanel';
import type { DeliveryAddressPayload, MyPharmacyProfile, OrderDetail } from '@/lib/api';

function pharmacyFromOrder(order: OrderDetail): MyPharmacyProfile | null {
  const p = order.pharmacyId;
  if (!p || typeof p !== 'object') return null;
  return p as MyPharmacyProfile;
}

type PatientOrderLiveMapProps = {
  order: OrderDetail;
  className?: string;
};

export default function PatientOrderLiveMap({ order, className = 'h-56 w-full' }: PatientOrderLiveMapProps) {
  const live =
    order.deliveryMethod === 'delivery' &&
    order.status === 'dispatched' &&
    !order.driverHandoffAt;

  return (
    <OrderRouteMapPanel
      orderBackendId={order._id}
      pharmacy={pharmacyFromOrder(order)}
      deliveryAddress={order.deliveryAddress as DeliveryAddressPayload | undefined}
      pollDriver={live}
      className={className}
    />
  );
}

'use client';

import { useEffect, useState } from 'react';
import DeliveryRouteMap, { buildRoutePoints } from '@/components/map/DeliveryRouteMap';
import { parsePharmacyPosition, type LatLng } from '@/lib/pharmacyGeo';
import { parseDeliveryAddressPosition, formatDeliveryAddressCompact } from '@/lib/mapGeo';
import { getOrderTracking, type DeliveryAddressPayload, type MyPharmacyProfile } from '@/lib/api';

type OrderRouteMapPanelProps = {
  orderBackendId: string;
  pharmacy: MyPharmacyProfile | null;
  deliveryAddress?: DeliveryAddressPayload;
  pollDriver?: boolean;
  className?: string;
};

export default function OrderRouteMapPanel({
  orderBackendId,
  pharmacy,
  deliveryAddress,
  pollDriver = false,
  className = 'h-48 w-full rounded-lg'
}: OrderRouteMapPanelProps) {
  const [driverPos, setDriverPos] = useState<LatLng | null>(null);

  useEffect(() => {
    if (!pollDriver) {
      setDriverPos(null);
      return;
    }
    const tick = async () => {
      try {
        const tracking = await getOrderTracking(orderBackendId);
        if (tracking.driverLocation?.lat != null && tracking.driverLocation?.lng != null) {
          setDriverPos({
            lat: Number(tracking.driverLocation.lat),
            lng: Number(tracking.driverLocation.lng)
          });
        }
      } catch {
        /* polling optional */
      }
    };
    void tick();
    const interval = window.setInterval(() => void tick(), 15_000);
    return () => window.clearInterval(interval);
  }, [orderBackendId, pollDriver]);

  const points = buildRoutePoints({
    pharmacy: pharmacy ? parsePharmacyPosition(pharmacy) : null,
    pharmacyName: pharmacy?.businessName,
    destination: parseDeliveryAddressPosition(deliveryAddress),
    destinationLabel: deliveryAddress ? formatDeliveryAddressCompact(deliveryAddress) : 'Delivery',
    driver: driverPos,
    driverLabel: 'Driver'
  });

  return (
    <DeliveryRouteMap
      points={points}
      className={className}
      emptyMessage="Set pharmacy and delivery pins to show the route"
    />
  );
}

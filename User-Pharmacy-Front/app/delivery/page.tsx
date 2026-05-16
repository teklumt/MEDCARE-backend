'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Truck } from 'lucide-react';
import Image from 'next/image';
import {
  getMyDeliveryOrders,
  getMyDeliveryOnlineStatus,
  setMyDeliveryOnlineStatus,
  startDeliveryTrip,
  confirmDriverHandoff,
  updateDriverLocation,
  type DeliveryAssignedOrder,
  type DeliveryAssignmentPharmacy
} from '@/lib/api';
import DeliveryRouteMap, { buildRoutePoints } from '@/components/map/DeliveryRouteMap';
import {
  parseDeliveryAddressPosition,
  parseGeoPoint,
  googleMapsDirectionsUrl,
  formatDeliveryAddressForDisplay,
  formatDeliveryAddressCompact,
  formatPharmacyPickupForDisplay
} from '@/lib/mapGeo';
import { Navigation } from 'lucide-react';

function isPopulatedPharmacy(p: DeliveryAssignedOrder['pharmacyId']): p is DeliveryAssignmentPharmacy {
  return typeof p === 'object' && p !== null && 'businessName' in p;
}

export default function DeliveryHome() {
  const [isOnline, setIsOnline] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusToggling, setStatusToggling] = useState(false);
  const [agentName, setAgentName] = useState('Delivery Agent');
  const [linkedPharmacyName, setLinkedPharmacyName] = useState('Pharmacy');
  const [assignments, setAssignments] = useState<DeliveryAssignedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadAssignments = useCallback(async () => {
    try {
      setError(null);
      const data = await getMyDeliveryOrders();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (e) {
      setError((e as Error).message || 'Could not load assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedName = localStorage.getItem('medcare_user_name');
    const storedPharmacy = localStorage.getItem('medcare_delivery_pharmacy');
    if (storedName) setAgentName(storedName);
    if (storedPharmacy) setLinkedPharmacyName(storedPharmacy);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadStatus = async () => {
      setStatusLoading(true);
      try {
        const online = await getMyDeliveryOnlineStatus();
        if (!cancelled) setIsOnline(online);
      } catch {
        if (!cancelled) setIsOnline(false);
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    };
    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void loadAssignments();
    const interval = window.setInterval(() => void loadAssignments(), 25000);
    return () => window.clearInterval(interval);
  }, [loadAssignments]);

  const job = useMemo(() => {
    const sorted = [...assignments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted[0] ?? null;
  }, [assignments]);

  useEffect(() => {
    if (!job) {
      localStorage.setItem('medcare_active_delivery', 'false');
      return;
    }
    localStorage.setItem('medcare_active_delivery', job.tripStartedAt ? 'true' : 'false');
  }, [job]);

  useEffect(() => {
    if (!job?.tripStartedAt || job.driverHandoffAt) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    let lastSent = 0;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastSent < 12_000) return;
        lastSent = now;
        void updateDriverLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {});
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 20_000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [job?._id, job?.tripStartedAt, job?.driverHandoffAt]);

  const handleToggleOnline = async () => {
    if (statusLoading || statusToggling) return;
    if (job?.tripStartedAt && isOnline) {
      alert(
        'You have an active delivery. You cannot go offline until you mark it delivered or it is removed from your list.'
      );
      return;
    }
    const next = !isOnline;
    setStatusToggling(true);
    try {
      const saved = await setMyDeliveryOnlineStatus(next);
      setIsOnline(saved);
    } catch (e) {
      alert((e as Error).message || 'Could not update online status');
    } finally {
      setStatusToggling(false);
    }
  };

  const onAccept = async () => {
    if (!job || actionLoading) return;
    setActionLoading(true);
    try {
      await startDeliveryTrip(job._id);
      await loadAssignments();
    } catch (e) {
      alert((e as Error).message || 'Could not accept');
    } finally {
      setActionLoading(false);
    }
  };

  const onHandoff = async () => {
    if (!job || actionLoading) return;
    setActionLoading(true);
    try {
      await confirmDriverHandoff(job._id);
      await loadAssignments();
    } catch (e) {
      alert((e as Error).message || 'Could not record delivery');
    } finally {
      setActionLoading(false);
    }
  };

  const pharmacy = job && isPopulatedPharmacy(job.pharmacyId) ? job.pharmacyId : null;
  const pharmacyName = pharmacy?.businessName ?? linkedPharmacyName;
  const pharmacyPickupText = pharmacy ? formatPharmacyPickupForDisplay(pharmacy) : '—';
  const pharmacyPos = pharmacy?.coordinates ? parseGeoPoint(pharmacy.coordinates) : null;
  const destPos = job ? parseDeliveryAddressPosition(job.deliveryAddress) : null;
  const routePoints = buildRoutePoints({
    pharmacy: pharmacyPos,
    pharmacyName,
    destination: destPos,
    destinationLabel: job ? formatDeliveryAddressCompact(job.deliveryAddress) : 'Delivery'
  });
  const directionsUrl =
    destPos && pharmacyPos ? googleMapsDirectionsUrl(destPos, pharmacyPos) : destPos ? googleMapsDirectionsUrl(destPos) : null;

  return (
    <div className="min-h-full bg-gray-50 flex flex-col p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-200">
            <Image
              src="https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&q=80"
              alt="Profile"
              width={48}
              height={48}
              unoptimized
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">{agentName}</h1>
            <p className="text-xs text-gray-500 font-medium">{linkedPharmacyName}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-1">
              {isOnline ? 'You are Online' : 'You are Offline'}
            </h2>
            <p className="text-sm text-gray-500">
              {isOnline ? 'Available for deliveries' : 'Go online to receive assignments'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isOnline}
              disabled={statusLoading || statusToggling}
              onChange={() => void handleToggleOnline()}
            />
            <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500" />
          </label>
        </div>
      </div>

      {statusLoading ? (
        <p className="text-center text-gray-500 text-sm">Loading status…</p>
      ) : loading ? (
        <p className="text-center text-gray-500 text-sm">Loading assignments…</p>
      ) : !isOnline ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-24 h-24 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
            <Truck className="w-12 h-12" />
          </div>
          <p className="text-gray-600 font-medium">You are offline</p>
        </div>
      ) : !job ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-24 h-24 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-4">
            <Truck className="w-12 h-12" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Looking for assignments…</h2>
          <p className="text-gray-500 text-sm max-w-xs mb-6">
            When the pharmacy assigns you a delivery, it will appear here.
          </p>
          <button
            type="button"
            onClick={() => void loadAssignments()}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {routePoints.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <DeliveryRouteMap points={routePoints} className="h-48 w-full" />
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-brand-700 border-t border-gray-100"
                >
                  <Navigation className="w-4 h-4" /> Open in Google Maps
                </a>
              )}
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-brand-600 text-white px-4 py-2 text-sm font-bold">
              {job.ref || job.orderId || 'Order'}
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 tracking-wider mb-1">PICKUP</p>
                <p className="font-bold text-gray-900">{pharmacyName}</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{pharmacyPickupText}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 tracking-wider mb-1">DROP OFF</p>
                <p className="text-sm text-gray-800 whitespace-pre-line">
                  {formatDeliveryAddressForDisplay(job.deliveryAddress, { multiline: true })}
                </p>
                {job.deliveryInstructions ? (
                  <p className="text-xs text-gray-500 mt-1">{job.deliveryInstructions}</p>
                ) : null}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 tracking-wider mb-1">ITEMS</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {job.items.map((i) => (
                    <li key={`${i.medicationName}-${i.quantity}`}>
                      {i.medicationName} ×{i.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={`rounded-xl p-3 border ${
                  job.paymentMethod === 'cod' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
                }`}
              >
                <p className="text-xs font-bold text-gray-600 mb-1">PAYMENT</p>
                {job.paymentMethod === 'cod' ? (
                  <p className="text-sm font-bold text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    Collect ETB {job.totalAmount.toFixed(2)} cash on delivery
                  </p>
                ) : (
                  <p className="text-sm font-bold text-green-800 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    Paid online — no cash to collect
                  </p>
                )}
              </div>
            </div>
          </div>

          {!job.tripStartedAt ? (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => void onAccept()}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold h-14 rounded-xl text-lg shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {actionLoading ? '…' : 'Accept'}
            </button>
          ) : (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => void onHandoff()}
              className="w-full bg-brand-900 hover:bg-brand-950 disabled:bg-gray-400 text-white font-bold h-14 rounded-xl text-lg shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {actionLoading ? '…' : "I've delivered"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

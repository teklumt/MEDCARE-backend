'use client';

import { useEffect, useRef, useState } from 'react';
import PharmacyLocationPicker from '@/components/map/PharmacyLocationPicker';
import { type LatLng } from '@/lib/pharmacyGeo';
import { reverseGeocodeLatLng, toGeoJsonPoint } from '@/lib/mapGeo';
import type { DeliveryAddressPayload, UserAddress } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export type DeliveryAddressFormValue = DeliveryAddressPayload & {
  pin: LatLng | null;
};

export const emptyDeliveryAddressForm = (): DeliveryAddressFormValue => ({
  recipientName: '',
  phone: '',
  street: '',
  subCity: '',
  city: 'Addis Ababa',
  additionalInfo: '',
  pin: null
});

export function addressToFormValue(addr: UserAddress): DeliveryAddressFormValue {
  const coords = addr.coordinates?.coordinates;
  let pin: LatLng | null = null;
  if (coords && coords.length >= 2) {
    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) {
      pin = { lat, lng };
    }
  }
  return {
    recipientName: addr.recipientName ?? '',
    phone: addr.phone ?? '',
    street: addr.street ?? '',
    subCity: addr.subCity ?? '',
    city: addr.city ?? 'Addis Ababa',
    additionalInfo: addr.additionalInfo ?? '',
    pin
  };
}

export function formValueToPayload(v: DeliveryAddressFormValue): DeliveryAddressPayload | null {
  if (!v.pin) return null;
  return {
    recipientName: v.recipientName?.trim() || undefined,
    phone: v.phone?.trim() || undefined,
    street: v.street?.trim() || undefined,
    subCity: v.subCity?.trim() || undefined,
    city: v.city?.trim() || undefined,
    additionalInfo: v.additionalInfo?.trim() || undefined,
    coordinates: toGeoJsonPoint(v.pin)
  };
}

type DeliveryAddressEditorProps = {
  value: DeliveryAddressFormValue;
  onChange: (value: DeliveryAddressFormValue) => void;
  savedAddresses?: UserAddress[];
  onPickSaved?: (addr: UserAddress) => void;
  loadingAddresses?: boolean;
};

export default function DeliveryAddressEditor({
  value,
  onChange,
  savedAddresses = [],
  onPickSaved,
  loadingAddresses = false
}: DeliveryAddressEditorProps) {
  const [pin, setPin] = useState<LatLng | null>(value.pin);
  const valueRef = useRef(value);
  const pinRef = useRef(pin);
  const onChangeRef = useRef(onChange);
  const geocodeSeqRef = useRef(0);
  const [geocodeHint, setGeocodeHint] = useState<'idle' | 'loading' | 'error'>('idle');

  valueRef.current = value;
  pinRef.current = pin;
  onChangeRef.current = onChange;

  useEffect(() => {
    setPin(value.pin);
  }, [value.pin]);

  useEffect(() => {
    if (!pin) {
      setGeocodeHint('idle');
      return;
    }

    const apiKey =
      typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() : '';
    if (!apiKey) return;

    const ac = new AbortController();
    const seq = ++geocodeSeqRef.current;
    const lat = pin.lat;
    const lng = pin.lng;

    const timer = window.setTimeout(async () => {
      setGeocodeHint('loading');
      try {
        const parsed = await reverseGeocodeLatLng(lat, lng, ac.signal);
        if (ac.signal.aborted || seq !== geocodeSeqRef.current) return;
        const currentPin = pinRef.current;
        if (!currentPin || currentPin.lat !== lat || currentPin.lng !== lng) return;

        if (parsed) {
          const cur = valueRef.current;
          const next: DeliveryAddressFormValue = {
            ...cur,
            pin: currentPin,
            ...(parsed.street?.trim() ? { street: parsed.street.trim() } : {}),
            ...(parsed.subCity?.trim() ? { subCity: parsed.subCity.trim() } : {}),
            ...(parsed.city?.trim() ? { city: parsed.city.trim() } : {})
          };
          onChangeRef.current(next);
          setGeocodeHint('idle');
        } else {
          setGeocodeHint('error');
        }
      } catch {
        if (ac.signal.aborted || seq !== geocodeSeqRef.current) return;
        setGeocodeHint('error');
      }
    }, 550);

    return () => {
      window.clearTimeout(timer);
      ac.abort();
    };
  }, [pin?.lat, pin?.lng]);

  const setField = (patch: Partial<DeliveryAddressFormValue>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className="space-y-4">
      {savedAddresses.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-2">Saved addresses</label>
          <div className="flex flex-wrap gap-2">
            {loadingAddresses ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
            ) : (
              savedAddresses.map((addr) => (
                <button
                  key={addr._id ?? addr.street}
                  type="button"
                  onClick={() => onPickSaved?.(addr)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-brand-300 bg-white"
                >
                  {addr.label || addr.street || 'Address'}
                  {addr.isDefault ? ' (default)' : ''}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Recipient name</label>
          <input
            type="text"
            value={value.recipientName}
            onChange={(e) => setField({ recipientName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Phone</label>
          <input
            type="tel"
            value={value.phone}
            onChange={(e) => setField({ phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-600 mb-1">Street / landmark</label>
          <input
            type="text"
            value={value.street}
            onChange={(e) => setField({ street: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Sub-city</label>
          <input
            type="text"
            value={value.subCity}
            onChange={(e) => setField({ subCity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">City</label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => setField({ city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-2">Delivery map pin *</label>
        <PharmacyLocationPicker
          value={pin}
          onChange={(p) => {
            setPin(p);
            setField({ pin: p });
          }}
        />
        {!pin && (
          <p className="text-xs text-amber-700 mt-2">Set a pin on the map for delivery drivers.</p>
        )}
        {pin && geocodeHint === 'loading' && (
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden />
            Updating street and city from map pin…
          </p>
        )}
        {pin && geocodeHint === 'error' && (
          <p className="text-xs text-amber-700 mt-2">
            Couldn&apos;t resolve address from pin — edit street and city manually if needed.
          </p>
        )}
      </div>
    </div>
  );
}

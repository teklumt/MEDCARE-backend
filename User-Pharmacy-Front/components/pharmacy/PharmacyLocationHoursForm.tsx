'use client';

import { useCallback, useEffect, useState } from 'react';
import { Map as MapIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import PharmacyLocationPicker from '@/components/map/PharmacyLocationPicker';
import { getMyPharmacy, updateMyPharmacy } from '@/lib/api';
import { parsePharmacyPosition, type LatLng } from '@/lib/pharmacyGeo';
import {
  WEEKDAY_KEYS,
  WEEKDAY_LABELS,
  defaultWeeklyHours,
  parseOpeningHours,
  serializeOpeningHours,
  type WeeklyHours,
  type WeekdayKey
} from '@/lib/pharmacyHours';

type PharmacyLocationHoursFormProps = {
  showHeader?: boolean;
  onSaved?: () => void;
};

export default function PharmacyLocationHoursForm({
  showHeader = true,
  onSaved
}: PharmacyLocationHoursFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [pin, setPin] = useState<LatLng | null>(null);
  const [landmark, setLandmark] = useState('');
  const [area, setArea] = useState('');
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>(defaultWeeklyHours());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pharmacy = await getMyPharmacy();
      setLandmark(pharmacy.address ?? '');
      setArea(pharmacy.location ?? '');
      setPin(parsePharmacyPosition(pharmacy));
      const { weekly } = parseOpeningHours(pharmacy.openingHours);
      setWeeklyHours(weekly);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pharmacy');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateDay = (day: WeekdayKey, patch: Partial<WeeklyHours[WeekdayKey]>) => {
    setWeeklyHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...patch }
    }));
  };

  const handleSave = async () => {
    if (!pin) {
      setError('Please set your pharmacy location on the map.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateMyPharmacy({
        address: landmark.trim() || undefined,
        location: area.trim() || undefined,
        openingHours: serializeOpeningHours(weeklyHours),
        coordinates: {
          type: 'Point',
          coordinates: [pin.lng, pin.lat]
        }
      });
      setSuccess(true);
      onSaved?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">Location & Hours</h2>
          <p className="text-gray-500 text-sm mt-1">
            Set your exact location and operating hours. Patients use this for the map and deliveries.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-brand-600" />
          Map pin (required)
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Drag the pin or click the map. Coordinates are used for patient search and deliveries.
        </p>
        <PharmacyLocationPicker value={pin} onChange={setPin} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Street / landmark</label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. Near Bole Medhanealem Church, behind Dashen Bank"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Area / sub-city</label>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Bole, Addis Ababa"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">
          Weekly operating hours
        </h3>
        <div className="space-y-3">
          {WEEKDAY_KEYS.map((day) => {
            const d = weeklyHours[day];
            return (
              <div
                key={day}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <div className="w-28 font-bold text-gray-700 text-sm">{WEEKDAY_LABELS[day]}</div>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={d.open}
                      onChange={(e) => updateDay(day, { open: e.target.checked })}
                      className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Open</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={d.allDay}
                      disabled={!d.open}
                      onChange={(e) => updateDay(day, { allDay: e.target.checked })}
                      className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 disabled:opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-700">24 hours</span>
                  </label>
                </div>
                {d.open && !d.allDay && (
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <input
                      type="time"
                      value={d.openTime}
                      onChange={(e) => updateDay(day, { openTime: e.target.value })}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
                    />
                    <span className="text-gray-400">–</span>
                    <input
                      type="time"
                      value={d.closeTime}
                      onChange={(e) => updateDay(day, { closeTime: e.target.value })}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
        {success && (
          <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Saved
          </span>
        )}
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save location details
        </button>
      </div>
    </div>
  );
}

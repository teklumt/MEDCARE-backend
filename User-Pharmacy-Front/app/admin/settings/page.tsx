'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, type PlatformGeneralSettings } from '@/lib/admin-api';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [platformName, setPlatformName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [commissionEtbPerDeliveredOrder, setCommissionEtbPerDeliveredOrder] = useState(5);
  const [defaultDeliveryRadiusKm, setDefaultDeliveryRadiusKm] = useState(10);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const applySettings = useCallback((s: PlatformGeneralSettings) => {
    setPlatformName(s.platformName);
    setSupportEmail(s.supportEmail);
    setCommissionEtbPerDeliveredOrder(s.commissionEtbPerDeliveredOrder);
    setDefaultDeliveryRadiusKm(s.defaultDeliveryRadiusKm);
    setMaintenanceMode(s.maintenanceMode);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi
      .getPlatformSettings()
      .then((data) => {
        if (!cancelled) applySettings(data);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Could not load settings.';
        if (!cancelled) {
          setError(
            msg.includes('401') || msg.toLowerCase().includes('authorization')
              ? `${msg} Sign in as an administrator if settings fail to load.`
              : msg,
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applySettings]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const payload: PlatformGeneralSettings = {
        platformName: platformName.trim(),
        supportEmail: supportEmail.trim(),
        commissionEtbPerDeliveredOrder,
        defaultDeliveryRadiusKm,
        maintenanceMode,
      };
      const updated = await adminApi.updatePlatformSettings(payload);
      applySettings(updated);
      setSaveMessage('Settings saved.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">System Settings</h1>
        <p className="text-gray-500 text-sm">Configure general platform parameters.</p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {saveMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {saveMessage}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-brand-950 mb-4">General Platform Settings</h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700" htmlFor="platform-name">
                    Platform Name
                  </label>
                  <input
                    id="platform-name"
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700" htmlFor="support-email">
                    Support Email
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700" htmlFor="commission-etb">
                    Commission (ETB) per delivered order
                  </label>
                  <input
                    id="commission-etb"
                    type="number"
                    min={0}
                    max={1000}
                    step={1}
                    value={commissionEtbPerDeliveredOrder}
                    onChange={(e) => setCommissionEtbPerDeliveredOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                  <p className="text-xs text-gray-500">
                    Flat platform fee accrued once per order when it is marked delivered (default 5 ETB).
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700" htmlFor="delivery-radius">
                    Default Delivery Radius (km)
                  </label>
                  <input
                    id="delivery-radius"
                    type="number"
                    min={0.1}
                    max={500}
                    step={0.1}
                    value={defaultDeliveryRadiusKm}
                    onChange={(e) => setDefaultDeliveryRadiusKm(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-bold text-brand-950 mb-3">Maintenance Mode</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-5 h-5 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">Enable Maintenance Mode</span>
                    <span className="text-xs text-gray-500">
                      Only administrators will be able to access the platform.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="bg-brand-900 hover:bg-brand-800 disabled:opacity-60 disabled:pointer-events-none text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

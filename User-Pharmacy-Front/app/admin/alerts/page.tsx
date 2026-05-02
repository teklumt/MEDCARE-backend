'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ShieldAlert, Activity, Bell } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';

const ALERTS = [
  { id: 1, type: 'System', message: 'No alerts yet.', time: 'just now', severity: 'Low' },
];

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState(ALERTS);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await adminApi.getAlerts();
        const mapped = data.map((alert: any) => {
          const severity = alert.type?.includes('Emergency') ? 'High' : alert.type?.includes('Recall') ? 'Medium' : 'Low';
          return {
            id: alert._id,
            type: alert.type,
            message: alert.message,
            time: alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '-',
            severity,
          };
        });
        if (mapped.length) setAlerts(mapped);
      } catch (error) {
        console.error('Failed to load alerts', error);
      }
    };

    loadAlerts();
  }, []);

  const summary = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 } as Record<string, number>;
    alerts.forEach((alert) => {
      counts[alert.severity] = (counts[alert.severity] ?? 0) + 1;
    });
    return counts;
  }, [alerts]);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">System Alerts</h1>
        <p className="text-gray-500 text-sm">Monitor critical system events, security warnings, and operational anomalies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 ${
              alert.severity === 'High' ? 'border-red-200' : 
              alert.severity === 'Medium' ? 'border-amber-200' : 'border-gray-200'
            }`}>
              <div className={`p-3 rounded-xl shrink-0 ${
                alert.severity === 'High' ? 'bg-red-50 text-red-600' : 
                alert.severity === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
              }`}>
                 {alert.type === 'Security' ? <ShieldAlert className="w-6 h-6" /> :
                  alert.type === 'System' ? <Activity className="w-6 h-6" /> :
                 <Bell className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-brand-950">{alert.type} Alert</h3>
                  <span className="text-xs text-gray-500">{alert.time}</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{alert.message}</p>
                <div className="flex items-center gap-2">
                  <button className="text-xs font-bold text-white bg-brand-900 hover:bg-brand-800 px-4 py-1.5 rounded-lg transition-colors">
                    Acknowledge
                  </button>
                  <button className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-1.5 rounded-lg transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alert Settings / Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-brand-950 mb-4">Alert Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> High Severity</span>
                <span className="font-bold text-brand-950">{summary.High}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Medium Severity</span>
                <span className="font-bold text-brand-950">{summary.Medium}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Low Severity</span>
                <span className="font-bold text-brand-950">{summary.Low}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-brand-950 mb-4">Notification Channels</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500" />
                <span className="text-sm text-gray-700">Email Alerts (admin@medcare.com)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500" />
                <span className="text-sm text-gray-700">SMS Alerts (Critical Only)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500" />
                <span className="text-sm text-gray-700">Slack Integration</span>
              </label>
            </div>
            <button className="w-full mt-6 text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 py-2.5 rounded-xl transition-colors">
              Manage Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

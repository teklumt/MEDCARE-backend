'use client';

import { AlertTriangle, ShieldAlert, Activity, Bell } from 'lucide-react';

const ALERTS = [
  { id: 1, type: 'Security', message: 'Multiple failed login attempts from IP 192.168.1.45', time: '10 mins ago', severity: 'High' },
  { id: 2, type: 'System', message: 'Payment gateway API latency > 2000ms', time: '1 hour ago', severity: 'Medium' },
  { id: 3, type: 'Operational', message: 'Unusually high order volume detected in Bole area', time: '2 hours ago', severity: 'Low' },
  { id: 4, type: 'Compliance', message: '3 pharmacies have licenses expiring in 7 days', time: '1 day ago', severity: 'High' },
];

export default function AdminAlertsPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">System Alerts</h1>
        <p className="text-gray-500 text-sm">Monitor critical system events, security warnings, and operational anomalies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          {ALERTS.map((alert) => (
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
                <span className="font-bold text-brand-950">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Medium Severity</span>
                <span className="font-bold text-brand-950">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Low Severity</span>
                <span className="font-bold text-brand-950">1</span>
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

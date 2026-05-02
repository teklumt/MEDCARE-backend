'use client';

import { useState } from 'react';
import { Settings, Shield, Globe, CreditCard, Bell, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const TABS = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'localization', label: 'Localization', icon: Globe },
    { id: 'payments', label: 'Payment Gateways', icon: CreditCard },
    { id: 'notifications', label: 'System Notifications', icon: Bell },
    { id: 'database', label: 'Database & Backups', icon: Database },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">System Settings</h1>
        <p className="text-gray-500 text-sm">Configure global platform parameters and integrations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors text-left ${
                  isActive ? 'bg-brand-50 text-brand-900' : 'text-gray-600 hover:bg-white hover:text-brand-900'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${isActive ? 'text-brand-700' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-brand-950 mb-4">General Platform Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Platform Name</label>
                  <input type="text" defaultValue="MedCare Platform" className="w-full px-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Support Email</label>
                  <input type="email" defaultValue="support@medcare.com" className="w-full px-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Platform Commission Rate (%)</label>
                  <input type="number" defaultValue="5" className="w-full px-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Default Delivery Radius (km)</label>
                  <input type="number" defaultValue="10" className="w-full px-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-bold text-brand-950 mb-3">Maintenance Mode</h3>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-5 h-5 text-brand-600 rounded border-gray-300 focus:ring-brand-500" />
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">Enable Maintenance Mode</span>
                    <span className="text-xs text-gray-500">Only administrators will be able to access the platform.</span>
                  </div>
                </label>
              </div>

              <div className="pt-4">
                <button className="bg-brand-900 hover:bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-brand-950 mb-4">{TABS.find(t => t.id === activeTab)?.label}</h2>
              <p className="text-gray-500">Configuration options for this section will appear here.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

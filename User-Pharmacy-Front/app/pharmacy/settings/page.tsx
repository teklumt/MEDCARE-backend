"use client";

import { useState } from "react";
import {
  Store,
  MapPin,
  ShieldCheck,
  Truck,
  Bell,
  Shield,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile State
  const [profile, setProfile] = useState({
    nameEn: "Selam Pharmacy",
    nameAm: "ሰላም ፋርማሲ",
    description:
      "Providing quality healthcare and medications to the community.",
    phone: "+251 911 234 567",
    email: "contact@selampharmacy.com",
  });

  const [formValues, setFormValues] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const TABS = [
    { id: "profile", label: "Pharmacy Profile", icon: Store },
    { id: "location", label: "Location & Hours", icon: MapPin },
    { id: "license", label: "License & Verification", icon: ShieldCheck },
    { id: "delivery", label: "Delivery Settings", icon: Truck },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  const handleSaveProfile = () => {
    setIsSaving(true);
    // Simulate API call to save settings
    setTimeout(() => {
      setProfile(formValues);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 relative">
      <div>
        <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">
          Settings
        </h1>
        <p className="text-gray-500 font-medium">
          Manage your pharmacy account and operational preferences.
        </p>
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
                  isActive
                    ? "bg-brand-50 text-brand-900"
                    : "text-gray-600 hover:bg-white hover:text-brand-900"
                }`}
              >
                <tab.icon
                  className={`w-5 h-5 ${isActive ? "text-brand-700" : "text-gray-400"}`}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-brand-950 mb-4">
                Pharmacy Profile
              </h2>

              <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                <div className="w-24 h-24 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-700 font-serif font-bold text-3xl">
                  {profile.nameEn.charAt(0).toUpperCase()}
                </div>
                <div>
                  <button className="bg-white border border-gray-200 hover:bg-gray-50 text-brand-950 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm mb-2">
                    Upload New Logo
                  </button>
                  <p className="text-xs text-gray-500">
                    JPG, GIF or PNG. Max size of 800K
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Pharmacy Name (English)
                  </label>
                  <input
                    type="text"
                    value={formValues.nameEn}
                    onChange={(e) =>
                      setFormValues({ ...formValues, nameEn: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Pharmacy Name (Amharic)
                  </label>
                  <input
                    type="text"
                    value={formValues.nameAm}
                    onChange={(e) =>
                      setFormValues({ ...formValues, nameAm: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formValues.description}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formValues.phone}
                    onChange={(e) =>
                      setFormValues({ ...formValues, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formValues.email}
                    onChange={(e) =>
                      setFormValues({ ...formValues, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-gray-100 mt-6 md:mt-8 pt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-brand-900 hover:bg-brand-800 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center min-w-[140px]"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Save Changes"
                  )}
                </button>

                {saveSuccess && (
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Changes saved
                  </span>
                )}
              </div>
            </div>
          )}

          {activeTab === "location" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-brand-950 mb-4">
                Location & Hours
              </h2>
              <p className="text-gray-500">
                Location settings will appear here.
              </p>
            </div>
          )}

          {activeTab === "license" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-brand-950 mb-4">
                License & Verification
              </h2>
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-emerald-800">
                    Verified Pharmacy
                  </h3>
                  <p className="text-sm text-emerald-700 mt-1">
                    Your license is valid until Dec 31, 2026.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "delivery" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-brand-950 mb-4">
                Delivery Settings
              </h2>
              <p className="text-gray-500">
                Delivery configuration will appear here.
              </p>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-brand-950 mb-4">
                Notification Preferences
              </h2>
              <p className="text-gray-500">
                Notification settings will appear here.
              </p>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-brand-950 mb-4">
                Security
              </h2>
              <p className="text-gray-500">
                Security settings will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

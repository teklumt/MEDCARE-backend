'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Search, Star, ShieldAlert, Store, Edit, Trash2, Globe, ChevronDown } from 'lucide-react';

const TRANSLATIONS = {
  en: {
    pharmacyManagement: 'Pharmacy Management',
    pharmacyManagementSub: 'Monitor pharmacy performance, status, and compliance.',
    all: 'All',
    verified: 'Verified',
    pendingVerification: 'Pending Verification',
    suspended: 'Suspended',
    licenseExpired: 'License Expired',
    pharmacy: 'Pharmacy',
    location: 'Location',
    status: 'Status',
    rating: 'Rating',
    ordersTotalActive: 'Orders (Total/Active)',
    actions: 'Actions',
    viewDetails: 'View Details'
  },
  am: {
    pharmacyManagement: 'የፋርማሲ አስተዳደር',
    pharmacyManagementSub: 'የፋርማሲ አፈጻጸምን፣ ሁኔታን እና የታዛዥነት ደረጃን ይቆጣጠሩ።',
    all: 'ሁሉም',
    verified: 'የተረጋገጠ',
    pendingVerification: 'ማረጋገጫ በመጠባበቅ ላይ',
    suspended: 'ታግዷል',
    licenseExpired: 'ፈቃድ ጊዜው አልፏል',
    pharmacy: 'ፋርማሲ',
    location: 'አድራሻ',
    status: 'ሁኔታ',
    rating: 'ደረጃ',
    ordersTotalActive: 'ትዕዛዞች (አጠቃላይ/ንቁ)',
    actions: 'ድርጊቶች',
    viewDetails: 'ዝርዝሮችን ይመልከቱ'
  }
};

const INITIAL_PHARMACIES = [
  { id: 'PH-101', name: 'Selam Pharmacy', location: 'Bole, Addis Ababa', status: 'Verified', rating: 4.8, orders: 1240, activeOrders: 12, joinDate: '2023-11-05' },
  { id: 'PH-102', name: 'Kidus Pharmacy', location: 'Piasa, Addis Ababa', status: 'Pending Verification', rating: 0, orders: 0, activeOrders: 0, joinDate: '2024-04-10' },
  { id: 'PH-103', name: 'Tenna Pharmacy', location: 'Mekanisa, Addis Ababa', status: 'Suspended', rating: 2.1, orders: 450, activeOrders: 0, joinDate: '2023-12-15' },
];

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState(INITIAL_PHARMACIES);
  const { language, setLanguage } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  
  
  const toggleLanguage = (lang: 'en' | 'am') => {
    setLanguage(lang);
        setIsLangDropdownOpen(false);
  };

  const t = TRANSLATIONS[language];

  const tabs = [
    { key: 'All', label: t.all },
    { key: 'Verified', label: t.verified },
    { key: 'Pending Verification', label: t.pendingVerification },
    { key: 'Suspended', label: t.suspended },
    { key: 'License Expired', label: t.licenseExpired }
  ];

  const translateStatus = (status: string) => {
    switch(status) {
      case 'Verified': return t.verified;
      case 'Pending Verification': return t.pendingVerification;
      case 'Suspended': return t.suspended;
      case 'License Expired': return t.licenseExpired;
      default: return status;
    }
  };

  const handleEditPharmacy = (id: string, currentName: string) => {
    const newName = prompt(`Edit name for pharmacy ${id}`, currentName);
    if (newName && newName.trim().length > 0) {
      setPharmacies(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
    }
  };

  const handleDeletePharmacy = (id: string) => {
    if (window.confirm("Are you sure you want to delete this pharmacy?")) {
      setPharmacies(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Verified' ? 'Suspended' : 'Verified';
    setPharmacies(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
  };

  const filteredPharmacies = activeTab === 'All' 
    ? pharmacies 
    : pharmacies.filter((p) => p.status === activeTab);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">{t.pharmacyManagement}</h1>
          <p className="text-gray-500 text-sm">{t.pharmacyManagementSub}</p>
        </div>
        <div className="flex items-center">
          <div className="relative z-50">
            <button 
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-bold text-brand-950">{language === 'en' ? 'EN' : 'አማ'}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <button 
                  onClick={() => toggleLanguage('en')}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition-colors ${language === 'en' ? 'text-brand-600 bg-brand-50/50' : 'text-gray-700'}`}
                >
                  English
                </button>
                <button 
                  onClick={() => toggleLanguage('am')}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition-colors ${language === 'am' ? 'text-brand-600 bg-brand-50/50' : 'text-gray-700'}`}
                >
                  አማርኛ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200">
        {tabs.map((tab, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key ? 'border-brand-600 text-brand-900' : 'border-transparent text-gray-500 hover:text-brand-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pharmacies Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-medium">{t.pharmacy}</th>
                <th className="p-4 font-medium">{t.location}</th>
                <th className="p-4 font-medium">{t.status}</th>
                <th className="p-4 font-medium">{t.rating}</th>
                <th className="p-4 font-medium">{t.ordersTotalActive}</th>
                <th className="p-4 font-medium text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPharmacies.map((pharmacy) => (
                <tr key={pharmacy.id} className="hover:bg-accent-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-brand-950 text-sm">{pharmacy.name}</p>
                        <p className="text-xs text-gray-500">{pharmacy.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{pharmacy.location}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      pharmacy.status === 'Verified' ? 'bg-emerald-50 text-emerald-700' :
                      pharmacy.status === 'Suspended' ? 'bg-red-50 text-red-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {translateStatus(pharmacy.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    {pharmacy.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className={`w-4 h-4 ${pharmacy.rating < 3 ? 'text-red-500' : 'text-amber-400'} fill-current`} />
                        <span className="text-sm font-bold text-gray-700">{pharmacy.rating}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className="font-bold text-brand-950">{pharmacy.orders}</span> / {pharmacy.activeOrders}
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleToggleStatus(pharmacy.id, pharmacy.status)}
                      className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      Toggle Status
                    </button>
                    <button className="text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                      {t.viewDetails}
                    </button>
                    <button 
                      onClick={() => handleEditPharmacy(pharmacy.id, pharmacy.name)}
                      title="Edit Pharmacy Name"
                      className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePharmacy(pharmacy.id)}
                      title="Delete Pharmacy"
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPharmacies.length === 0 && (
                <tr>
                   <td colSpan={6} className="p-8 text-center text-gray-500 bg-white">
                      No pharmacies found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
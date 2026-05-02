'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { MapPin, AlertCircle, Globe, ChevronDown } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';

const TRANSLATIONS = {
  en: {
    platformDeliveries: 'Platform Deliveries',
    platformDeliveriesSub: 'Monitor all active deliveries across the platform.',
    liveMap: 'Platform-Wide Live Map',
    trackingAgents: 'Tracking 142 active agents across Addis Ababa',
    delayedDeliveries: 'Delayed Deliveries',
    delayedBy: 'Delayed by',
    mins: 'mins',
    performanceByPharmacy: 'Performance by Pharmacy',
    active: 'active',
    onTime: 'on-time',
    good: 'Good',
    warning: 'Warning'
  },
  am: {
    platformDeliveries: 'የመድረክ አቅርቦቶች',
    platformDeliveriesSub: 'በመድረኩ ላይ ያሉ ንቁ አቅርቦቶችን ይቆጣጠሩ።',
    liveMap: 'የመድረክ ሰፊ የቀጥታ ካርታ',
    trackingAgents: 'በአዲስ አበባ 142 ንቁ አከፋፋዮችን በመከታተል ላይ',
    delayedDeliveries: 'የዘገዩ አቅርቦቶች',
    delayedBy: 'የዘገየው በ',
    mins: 'ደቂቃዎች',
    performanceByPharmacy: 'የአፈጻጸም ደረጃ በፋርማሲ',
    active: 'ንቁ',
    onTime: 'በሰዓቱ',
    good: 'ጥሩ',
    warning: 'ማስጠንቀቂያ'
  }
};

export default function AdminDeliveriesPage() {
  const { language, setLanguage } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [activeAssignments, setActiveAssignments] = useState(0);
  
  
  const toggleLanguage = (lang: 'en' | 'am') => {
    setLanguage(lang);
        setIsLangDropdownOpen(false);
  };

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const loadDeliveries = async () => {
      try {
        const data = await adminApi.getDeliveries({ status: 'in_progress' });
        setActiveAssignments(data.length);
      } catch (error) {
        console.error('Failed to load deliveries', error);
      }
    };

    loadDeliveries();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">{t.platformDeliveries}</h1>
          <p className="text-gray-500 text-sm">{t.platformDeliveriesSub}</p>
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

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 bg-gray-200 rounded-2xl border border-gray-300 relative overflow-hidden flex items-center justify-center min-h-[300px]">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
          <div className="text-center relative z-10 bg-white/90 p-6 rounded-2xl shadow-sm backdrop-blur-sm">
            <MapPin className="w-8 h-8 text-brand-600 mx-auto mb-2" />
            <p className="font-bold text-brand-950">{t.liveMap}</p>
            <p className="text-sm text-gray-500">
              {t.trackingAgents.replace('142', String(activeAssignments || 0))}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0 overflow-y-auto">
          
          {/* Alerts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-red-50">
              <h3 className="font-bold text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {t.delayedDeliveries}
              </h3>
            </div>
            <div className="divide-y divide-gray-100 p-2">
              <div className="p-3 hover:bg-accent-50 rounded-xl">
                <p className="font-bold text-sm text-brand-950">ORD-20841</p>
                <p className="text-xs text-gray-600 mb-1">Kidus Pharmacy → Kazanchis</p>
                <p className="text-xs font-bold text-red-600">{t.delayedBy} 45 {t.mins}</p>
              </div>
            </div>
          </div>

          {/* Performance by Pharmacy */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-1">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-brand-950">{t.performanceByPharmacy}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="p-4 flex justify-between items-center hover:bg-accent-50">
                <div>
                  <p className="font-bold text-sm text-brand-950">Selam Pharmacy</p>
                  <p className="text-xs text-gray-500">42 {t.active} • 98% {t.onTime}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{t.good}</span>
              </div>
              <div className="p-4 flex justify-between items-center hover:bg-accent-50">
                <div>
                  <p className="font-bold text-sm text-brand-950">Kidus Pharmacy</p>
                  <p className="text-xs text-gray-500">12 {t.active} • 75% {t.onTime}</p>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">{t.warning}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
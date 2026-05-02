'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, TrendingUp, Users, ShoppingBag, Activity, Globe, ChevronDown } from 'lucide-react';

const TRANSLATIONS = {
  en: {
    platformAnalytics: 'Platform Analytics',
    platformAnalyticsSub: 'Comprehensive overview of platform growth, revenue, and usage.',
    last6Months: 'Last 6 Months',
    thisYear: 'This Year',
    allTime: 'All Time',
    exportReport: 'Export Report',
    totalPlatformRevenue: 'Total Platform Revenue',
    activePatients: 'Active Patients',
    totalOrders: 'Total Orders',
    platformUptime: 'Platform Uptime',
    revenueGrowth: 'Revenue Growth',
    userAcquisition: 'User Acquisition',
    etb: 'ETB'
  },
  am: {
    platformAnalytics: 'የመድረክ ትንታኔዎች',
    platformAnalyticsSub: 'የመድረክ እድገት፣ ገቢ እና አጠቃቀም አጠቃላይ እይታ።',
    last6Months: 'ያለፉት 6 ወራት',
    thisYear: 'በዚህ ዓመት',
    allTime: 'በማንኛውም ጊዜ',
    exportReport: 'ሪፖርት አውጣ',
    totalPlatformRevenue: 'አጠቃላይ የመድረክ ገቢ',
    activePatients: 'ንቁ ታካሚዎች',
    totalOrders: 'አጠቃላይ ትዕዛዞች',
    platformUptime: 'የመድረክ አየር ጊዜ',
    revenueGrowth: 'የገቢ እድገት',
    userAcquisition: 'የተጠቃሚ ግዢ',
    etb: 'ብር'
  }
};

const REVENUE_DATA = [
  { name: 'Jan', revenue: 40000 },
  { name: 'Feb', revenue: 30000 },
  { name: 'Mar', revenue: 50000 },
  { name: 'Apr', revenue: 45000 },
  { name: 'May', revenue: 60000 },
  { name: 'Jun', revenue: 75000 },
];

const USER_GROWTH = [
  { name: 'Jan', patients: 1200, pharmacies: 45 },
  { name: 'Feb', patients: 1900, pharmacies: 52 },
  { name: 'Mar', patients: 2400, pharmacies: 61 },
  { name: 'Apr', patients: 3100, pharmacies: 70 },
  { name: 'May', patients: 4200, pharmacies: 85 },
  { name: 'Jun', patients: 5500, pharmacies: 102 },
];

export default function AdminAnalyticsPage() {
  const { language, setLanguage } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  
  
  const toggleLanguage = (lang: 'en' | 'am') => {
    setLanguage(lang);
        setIsLangDropdownOpen(false);
  };

  const t = TRANSLATIONS[language];

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">{t.platformAnalytics}</h1>
          <p className="text-gray-500 text-sm">{t.platformAnalyticsSub}</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white border border-gray-200 text-brand-950 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 shadow-sm">
            <option>{t.last6Months}</option>
            <option>{t.thisYear}</option>
            <option>{t.allTime}</option>
          </select>
          <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-brand-950 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm text-sm">
            <Download className="w-4 h-4" />
            {t.exportReport}
          </button>
          <div className="relative z-50">
            <button 
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 bg-white px-3 py-2.5 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors ml-2"
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              +24%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.totalPlatformRevenue}</h3>
          <p className="text-3xl font-bold text-brand-950">12.4M <span className="text-lg text-gray-500 font-normal">{t.etb}</span></p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              +12%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.activePatients}</h3>
          <p className="text-3xl font-bold text-brand-950">5,500</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              +18%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.totalOrders}</h3>
          <p className="text-3xl font-bold text-brand-950">142.5k</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.platformUptime}</h3>
          <p className="text-3xl font-bold text-brand-950">99.99%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-brand-950 mb-6">{t.revenueGrowth}</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="#047857" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-brand-950 mb-6">{t.userAcquisition}</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={USER_GROWTH} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line yAxisId="left" type="monotone" dataKey="patients" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }} />
                <Line yAxisId="right" type="monotone" dataKey="pharmacies" stroke="#d97706" strokeWidth={3} dot={{ r: 4, fill: '#d97706', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { DollarSign, ShoppingCart, Star, TrendingUp, TrendingDown, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useState, useEffect, useMemo } from 'react';
import ViewReviewsModal from '@/components/pharmacy/ViewReviewsModal';
import {
  getMyPharmacy,
  getMyPharmacyReviews,
  type MyPharmacyProfile,
  type PharmacyReviewItem
} from '@/lib/api';

const REVENUE_DATA = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 18 },
  { name: 'Wed', revenue: 5000, orders: 35 },
  { name: 'Thu', revenue: 2780, orders: 15 },
  { name: 'Fri', revenue: 6890, orders: 45 },
  { name: 'Sat', revenue: 8390, orders: 60 },
  { name: 'Sun', revenue: 7490, orders: 50 },
];

const REVENUE_DATA_AM = [
  { name: 'ሰኞ', revenue: 4000, orders: 24 },
  { name: 'ማክሰ', revenue: 3000, orders: 18 },
  { name: 'ረቡዕ', revenue: 5000, orders: 35 },
  { name: 'ሐሙስ', revenue: 2780, orders: 15 },
  { name: 'አርብ', revenue: 6890, orders: 45 },
  { name: 'ቅዳሜ', revenue: 8390, orders: 60 },
  { name: 'እሁድ', revenue: 7490, orders: 50 },
];

const TOP_MEDS = [
  { name: 'Paracetamol 500mg', nameAm: 'ፓራሲታሞል 500mg', sold: 342, revenue: 15390, stock: 120, trend: 'up' },
  { name: 'Amoxicillin 500mg', nameAm: 'አሞክሲሲሊን 500mg', sold: 215, revenue: 25800, stock: 45, trend: 'up' },
  { name: 'Ibuprofen 400mg', nameAm: 'አይቡፕሮፌን 400mg', sold: 180, revenue: 8100, stock: 200, trend: 'down' },
  { name: 'Vitamin C 1000mg', nameAm: 'ቫይታሚን ሲ 1000mg', sold: 150, revenue: 45000, stock: 85, trend: 'up' },
];

const TRANSLATIONS = {
  en: {
    analytics: 'Analytics & Reports',
    analyticsSubtitle: 'Insights into your pharmacy\'s performance.',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    last3m: 'Last 3 Months',
    totRev: 'Total Revenue',
    totOrd: 'Total Orders',
    custRating: 'Customer Rating',
    revTrend: 'Revenue & Orders Trend',
    reviewSumm: 'Review Summary',
    viewAllRev: 'View All Reviews',
    topMed: 'Top Selling Medications',
    thMed: 'Medication',
    thSold: 'Units Sold',
    thRev: 'Revenue (ETB)',
    thStock: 'Current Stock',
    thTrend: 'Trend',
    up: 'Up',
    down: 'Down'
  },
  am: {
    analytics: 'ትንታኔዎች እና ሪፖርቶች',
    analyticsSubtitle: 'ስለ ፋርማሲዎ አፈፃፀም ግንዛቤዎች።',
    thisWeek: 'ይህ ሳምንት',
    thisMonth: 'ይህ ወር',
    last3m: 'ያለፉት 3 ወራት',
    totRev: 'አጠቃላይ ገቢ',
    totOrd: 'አጠቃላይ ትዕዛዞች',
    custRating: 'የደንበኛ ደረጃ',
    revTrend: 'የገቢ እና ትዕዛዞች አዝማሚያ',
    reviewSumm: 'የግምገማ ማጠቃለያ',
    viewAllRev: 'ሁሉንም ግምገማዎች ይመልከቱ',
    topMed: 'በብዛት የተሸጡ መድሃኒቶች',
    thMed: 'መድሃኒት',
    thSold: 'የተሸጡ ክፍሎች',
    thRev: 'ገቢ (ብር)',
    thStock: 'የአሁኑ ክምችት',
    thTrend: 'አዝማሚያ',
    up: 'ወደ ላይ',
    down: 'ወደ ታች'
  }
};

export default function AnalyticsPage() {
  const { language } = useLanguage();
const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [profile, setProfile] = useState<MyPharmacyProfile | null>(null);
  const [reviewsList, setReviewsList] = useState<PharmacyReviewItem[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setInsightsLoading(true);
      try {
        const [prof, revs] = await Promise.all([
          getMyPharmacy(),
          getMyPharmacyReviews().catch(() => [] as PharmacyReviewItem[])
        ]);
        if (!cancelled) {
          setProfile(prof);
          setReviewsList(revs);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
          setReviewsList([]);
        }
      } finally {
        if (!cancelled) setInsightsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const reviewCount = profile?.stats?.reviewCount ?? reviewsList.length;
  const avgRating =
    profile?.stats?.rating != null && profile.stats.rating > 0
      ? profile.stats.rating
      : reviewsList.length > 0
        ? reviewsList.reduce((s, r) => s + Number(r.rating), 0) / reviewsList.length
        : 0;
  const ratingDisplay = avgRating > 0 ? avgRating.toFixed(1) : '—';

  const starPercents = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of reviewsList) {
      const k = Math.min(5, Math.max(1, Math.round(Number(r.rating))));
      counts[k - 1]++;
    }
    const total = counts.reduce((a, b) => a + b, 0);
    if (!total) return [0, 0, 0, 0, 0];
    return counts.map((c) => Math.round((c / total) * 100));
  }, [reviewsList]);
const t = TRANSLATIONS[language];
  const chartData = language === 'am' ? REVENUE_DATA_AM : REVENUE_DATA;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">{t.analytics}</h1>
          <p className="text-gray-500 font-medium">{t.analyticsSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white border border-gray-200 text-brand-950 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 shadow-sm hidden sm:block">
            <option>{t.thisWeek}</option>
            <option>{t.thisMonth}</option>
            <option>{t.last3m}</option>
          </select>

          {/* Compact Language Selector */}
</div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" /> +15%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.totRev}</h3>
          <p className="text-3xl font-bold text-brand-950">124.5{language === 'am' ? 'ሺ' : 'k'} <span className="text-lg text-gray-500 font-normal">{language === 'am' ? 'ብር' : 'ETB'}</span></p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" /> +8%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.totOrd}</h3>
          <p className="text-3xl font-bold text-brand-950">842</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.custRating}</h3>
          <p className="text-3xl font-bold text-brand-950">
            {insightsLoading ? (
              <span className="inline-block h-9 w-16 bg-gray-100 animate-pulse rounded-md align-middle" />
            ) : (
              <>
                {ratingDisplay}{' '}
                <span className="text-lg text-gray-500 font-normal">/ 5</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-brand-950 mb-6">{t.revTrend}</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" name={language === 'am' ? 'ገቢ' : 'Revenue'} stroke="#047857" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Reviews Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-brand-950 mb-6">{t.reviewSumm}</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl font-bold text-brand-950">
              {insightsLoading ? (
                <span className="inline-block h-14 w-20 bg-gray-100 animate-pulse rounded-lg" />
              ) : (
                ratingDisplay
              )}
            </div>
            <div>
              <div className="flex text-amber-400 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${s <= Math.round(avgRating) && avgRating > 0 ? 'fill-current' : 'text-gray-200 fill-transparent'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {insightsLoading ? (
                  <span className="inline-block h-4 w-40 bg-gray-100 animate-pulse rounded" />
                ) : language === 'am' ? (
                  `በ ${reviewCount} ግምገማዎች ላይ የተመሰረተ`
                ) : (
                  `Based on ${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`
                )}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-gray-600 font-medium">{star}</span>
                <Star className="w-3 h-3 text-amber-400 fill-current" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all min-w-0"
                    style={{
                      width: `${insightsLoading ? 0 : starPercents[star - 1]}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setIsReviewsOpen(true)}
            className="w-full mt-6 text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 py-2.5 rounded-xl transition-colors"
          >
            {t.viewAllRev}
          </button>
        </div>

        {/* Top Medications */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-950">{t.topMed}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">{t.thMed}</th>
                  <th className="p-4 font-medium">{t.thSold}</th>
                  <th className="p-4 font-medium">{t.thRev}</th>
                  <th className="p-4 font-medium">{t.thStock}</th>
                  <th className="p-4 font-medium text-right">{t.thTrend}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {TOP_MEDS.map((med, idx) => (
                  <tr key={idx} className="hover:bg-accent-50/50">
                    <td className="p-4 font-bold text-brand-950 text-sm">{language === 'am' ? med.nameAm : med.name}</td>
                    <td className="p-4 text-sm text-gray-600">{med.sold}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">{med.revenue.toLocaleString()}</td>
                    <td className="p-4 text-sm text-gray-600">{med.stock}</td>
                    <td className="p-4 text-right">
                      {med.trend === 'up' ? (
                        <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold"><TrendingUp className="w-3 h-3 mr-1" /> {t.up}</span>
                      ) : (
                        <span className="inline-flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-bold"><TrendingDown className="w-3 h-3 mr-1" /> {t.down}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ViewReviewsModal isOpen={isReviewsOpen} onClose={() => setIsReviewsOpen(false)} />
    </div>
  );
}
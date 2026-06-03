'use client';

import { DollarSign, ShoppingCart, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect, useMemo } from 'react';
import ViewReviewsModal from '@/components/pharmacy/ViewReviewsModal';
import {
  getMyPharmacy,
  getMyPharmacyReviews,
  getPharmacyAnalytics,
  type MyPharmacyProfile,
  type PharmacyReviewItem,
  type PharmacyAnalytics,
} from '@/lib/api';

const TRANSLATIONS = {
  en: {
    analytics: 'Analytics & Reports',
    analyticsSubtitle: "Insights into your pharmacy's performance.",
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    last3m: 'Last 3 Months',
    totRev: 'Total Revenue',
    totOrd: 'Total Orders',
    custRating: 'Customer Rating',
    revTrend: 'Revenue Trend',
    reviewSumm: 'Review Summary',
    viewAllRev: 'View All Reviews',
    topMed: 'Top Selling Medications',
    thMed: 'Medication',
    thSold: 'Units Sold',
    thRev: 'Revenue (ETB)',
    thStock: 'Current Stock',
    thTrend: 'Trend',
    up: 'Up',
    down: 'Down',
    noData: 'No data for this period.',
    vsPrev: 'vs prev period',
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
    revTrend: 'የገቢ አዝማሚያ',
    reviewSumm: 'የግምገማ ማጠቃለያ',
    viewAllRev: 'ሁሉንም ግምገማዎች ይመልከቱ',
    topMed: 'በብዛት የተሸጡ መድሃኒቶች',
    thMed: 'መድሃኒት',
    thSold: 'የተሸጡ ክፍሎች',
    thRev: 'ገቢ (ብር)',
    thStock: 'የአሁኑ ክምችት',
    thTrend: 'አዝማሚያ',
    up: 'ወደ ላይ',
    down: 'ወደ ታች',
    noData: 'ለዚህ ጊዜ ምንም ውሂብ የለም።',
    vsPrev: 'ከቀዳሚ ጊዜ ጋር',
  },
};

function formatRevenue(amount: number, language: string): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}${language === 'am' ? 'ሚ' : 'M'}`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}${language === 'am' ? 'ሺ' : 'k'}`;
  return amount.toFixed(0);
}

function trendPct(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((current - prev) / prev) * 100);
}

type Period = '7d' | '30d' | '90d';

export default function AnalyticsPage() {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language as 'en' | 'am'] || TRANSLATIONS['en'];

  const [period, setPeriod] = useState<Period>('30d');
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  const [profile, setProfile] = useState<MyPharmacyProfile | null>(null);
  const [reviewsList, setReviewsList] = useState<PharmacyReviewItem[]>([]);
  const [analytics, setAnalytics] = useState<PharmacyAnalytics | null>(null);

  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Load reviews + profile once
  useEffect(() => {
    let cancelled = false;
    setReviewsLoading(true);
    Promise.all([
      getMyPharmacy(),
      getMyPharmacyReviews().catch(() => [] as PharmacyReviewItem[]),
    ])
      .then(([prof, revs]) => {
        if (!cancelled) {
          setProfile(prof);
          setReviewsList(revs);
        }
      })
      .catch(() => {
        if (!cancelled) { setProfile(null); setReviewsList([]); }
      })
      .finally(() => { if (!cancelled) setReviewsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Load analytics whenever period changes
  useEffect(() => {
    let cancelled = false;
    setAnalyticsLoading(true);
    getPharmacyAnalytics(period)
      .then((data) => { if (!cancelled) setAnalytics(data); })
      .catch(() => { if (!cancelled) setAnalytics(null); })
      .finally(() => { if (!cancelled) setAnalyticsLoading(false); });
    return () => { cancelled = true; };
  }, [period]);

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

  const revTrend = analytics ? trendPct(analytics.revenue, analytics.prevRevenue) : null;
  const ordTrend = analytics ? trendPct(analytics.orderCount, analytics.prevOrderCount) : null;

  // Simple chart: show current vs prev period as two bars
  const chartData = analytics
    ? [
        {
          name: language === 'am' ? 'ቀዳሚ ጊዜ' : 'Prev period',
          revenue: analytics.prevRevenue,
          orders: analytics.prevOrderCount,
        },
        {
          name: language === 'am' ? 'አሁን' : 'Current',
          revenue: analytics.revenue,
          orders: analytics.orderCount,
        },
      ]
    : [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">{t.analytics}</h1>
          <p className="text-gray-500 font-medium">{t.analyticsSubtitle}</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="bg-white border border-gray-200 text-brand-950 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
        >
          <option value="7d">{t.thisWeek}</option>
          <option value="30d">{t.thisMonth}</option>
          <option value="90d">{t.last3m}</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            {!analyticsLoading && revTrend !== null && (
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${revTrend >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                {revTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {revTrend >= 0 ? '+' : ''}{revTrend}%
              </span>
            )}
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.totRev}</h3>
          <p className="text-3xl font-bold text-brand-950">
            {analyticsLoading ? (
              <span className="inline-block h-9 w-28 bg-gray-100 animate-pulse rounded-md align-middle" />
            ) : (
              <>
                {formatRevenue(analytics?.revenue ?? 0, language)}{' '}
                <span className="text-lg text-gray-500 font-normal">{language === 'am' ? 'ብር' : 'ETB'}</span>
              </>
            )}
          </p>
          {!analyticsLoading && <p className="text-xs text-gray-400 mt-1">{t.vsPrev}</p>}
        </div>

        {/* Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
              <ShoppingCart className="w-5 h-5" />
            </div>
            {!analyticsLoading && ordTrend !== null && (
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${ordTrend >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                {ordTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {ordTrend >= 0 ? '+' : ''}{ordTrend}%
              </span>
            )}
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.totOrd}</h3>
          <p className="text-3xl font-bold text-brand-950">
            {analyticsLoading ? (
              <span className="inline-block h-9 w-20 bg-gray-100 animate-pulse rounded-md align-middle" />
            ) : (
              analytics?.orderCount ?? 0
            )}
          </p>
          {!analyticsLoading && <p className="text-xs text-gray-400 mt-1">{t.vsPrev}</p>}
        </div>

        {/* Customer Rating */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.custRating}</h3>
          <p className="text-3xl font-bold text-brand-950">
            {reviewsLoading ? (
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
            {analyticsLoading ? (
              <div className="h-full w-full bg-gray-50 animate-pulse rounded-xl" />
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">{t.noData}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#047857" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="revenue" name={language === 'am' ? 'ገቢ' : 'Revenue'} stroke="#047857" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Customer Reviews Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-brand-950 mb-6">{t.reviewSumm}</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl font-bold text-brand-950">
              {reviewsLoading ? (
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
                {reviewsLoading ? (
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
                    style={{ width: `${reviewsLoading ? 0 : starPercents[star - 1]}%` }}
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
      </div>

      <ViewReviewsModal isOpen={isReviewsOpen} onClose={() => setIsReviewsOpen(false)} />
    </div>
  );
}

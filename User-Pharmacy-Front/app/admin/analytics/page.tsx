'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Download, TrendingUp, Users, ShoppingBag, Store, Globe, ChevronDown, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';

const TRANSLATIONS = {
  en: {
    platformAnalytics: 'Platform Analytics',
    platformAnalyticsSub: 'Comprehensive overview of platform growth, revenue, and usage.',
    rangeLast24h: 'Last 24 hours',
    rangeLast7d: 'Last 7 days',
    rangeLast30d: 'Last 30 days',
    exportReport: 'Export Report',
    totalPlatformRevenue: 'Total received from pharmacies',
    totalUsers: 'Total users',
    totalOrders: 'Total Orders',
    pharmaciesAndDrivers: 'Pharmacies & drivers',
    pharmacies: 'Pharmacies',
    drivers: 'Drivers',
    revenueGrowth: 'Revenue growth (by month)',
    userAcquisition: 'User sign-ups (by month)',
    orderActivity: 'Order activity',
    etb: 'ETB',
    signups: 'Sign-ups',
    orders: 'Orders',
    noChartData: 'No data to display yet.',
    loadError: 'Could not load analytics. Try again later.',
    loading: 'Loading analytics…',
  },
  am: {
    platformAnalytics: 'የመድረክ ትንታኔዎች',
    platformAnalyticsSub: 'የመድረክ እድገት፣ ገቢ እና አጠቃቀም አጠቃላይ እይታ።',
    rangeLast24h: 'ያለፉት 24 ሰዓት',
    rangeLast7d: 'ያለፉት 7 ቀናት',
    rangeLast30d: 'ያለፉት 30 ቀናት',
    exportReport: 'ሪፖርት አውጣ',
    totalPlatformRevenue: 'ከፋርማሲዎች የተከፈለ ኮሚሽን (ጠቅላላ ብር)',
    totalUsers: 'ጠቅላላ ተጠቃሚዎች',
    totalOrders: 'አጠቃላይ ትዕዛዞች',
    pharmaciesAndDrivers: 'ፋርማሲዎች እና አሽከርካሪዎች',
    pharmacies: 'ፋርማሲዎች',
    drivers: 'የማድረስ ሠራተኞች',
    revenueGrowth: 'የገቢ እድገት (በወር)',
    userAcquisition: 'የተጠቃሚ ምዝገባ (በወር)',
    orderActivity: 'የትዕዛዝ እንቅስቃሴ',
    etb: 'ብር',
    signups: 'ምዝገባዎች',
    orders: 'ትዕዛዞች',
    noChartData: 'እስካሁን የሚታይ ውሂብ የለም።',
    loadError: 'ትንታኔ ማምጣት አልተቻለም። ቆይተው ይሞክሩ።',
    loading: 'ትንታኔ በመጫን ላይ…',
  },
};

function formatYmLabel(ym: string, locale: 'en' | 'am'): string {
  const parts = ym.split('-').map(Number);
  const y = parts[0];
  const m = parts[1];
  if (!y || !m) return ym;
  const loc = locale === 'am' ? 'am-ET' : 'en-GB';
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(loc, { month: 'short', year: 'numeric' });
}

export default function AdminAnalyticsPage() {
  const { language } = useLanguage();
const [trafficRange, setTrafficRange] = useState<'24h' | '7d' | '30d'>('30d');
  const [loading, setLoading] = useState(true);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState({
    totalCommissionFromPharmaciesEt: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalPharmacies: 0,
    totalDrivers: 0,
  });

  const [revenueSeries, setRevenueSeries] = useState<Array<{ name: string; revenue: number }>>([]);
  const [signupsSeries, setSignupsSeries] = useState<Array<{ name: string; signups: number }>>([]);
  const [trafficSeries, setTrafficSeries] = useState<Array<{ name: string; orders: number }>>([]);

  const t = TRANSLATIONS[language];
const rangeLabel = useMemo(() => {
    switch (trafficRange) {
      case '24h':
        return t.rangeLast24h;
      case '7d':
        return t.rangeLast7d;
      default:
        return t.rangeLast30d;
    }
  }, [trafficRange, t]);

  useEffect(() => {
    let cancelled = false;

    const loadMain = async () => {
      setLoading(true);
      setError(null);
      try {
        const [overview, ordersAgg, usersAgg] = await Promise.all([
          adminApi.getAnalytics(),
          adminApi.getAnalyticsOrders(),
          adminApi.getAnalyticsUsers(),
        ]);
        if (cancelled) return;

        const overviewRec = overview as Record<string, unknown>;
        const commissionEt = Number(overviewRec.totalCommissionReceivedEt ?? 0);

        setMetrics({
          totalCommissionFromPharmaciesEt: Number.isFinite(commissionEt) ? commissionEt : 0,
          totalUsers: Number(overviewRec.totalUsers ?? 0),
          totalOrders: Number(overviewRec.totalOrders ?? 0),
          totalPharmacies: Number(overviewRec.totalPharmacies ?? 0),
          totalDrivers: Number(overviewRec.totalDrivers ?? 0),
        });

        const rev = (ordersAgg.revenueTrends ?? []).map((row) => ({
          name: formatYmLabel(row._id, language),
          revenue: Number(row.revenue ?? 0),
        }));
        setRevenueSeries(rev);

        const sig = (usersAgg.signupsOverTime ?? []).map((row) => ({
          name: formatYmLabel(row._id, language),
          signups: Number(row.count ?? 0),
        }));
        setSignupsSeries(sig);
      } catch (e) {
        if (!cancelled) setError((e as Error).message || t.loadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMain();
    return () => {
      cancelled = true;
    };
  }, [language]);

  useEffect(() => {
    let cancelled = false;

    const loadTraffic = async () => {
      setTrafficLoading(true);
      try {
        const traffic = await adminApi.getTraffic(trafficRange);
        if (cancelled) return;
        setTrafficSeries(
          (traffic.series ?? []).map((s) => ({
            name: s.label,
            orders: s.count,
          })),
        );
      } catch {
        if (!cancelled) setTrafficSeries([]);
      } finally {
        if (!cancelled) setTrafficLoading(false);
      }
    };

    loadTraffic();
    return () => {
      cancelled = true;
    };
  }, [trafficRange]);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">{t.platformAnalytics}</h1>
          <p className="text-gray-500 text-sm">{t.platformAnalyticsSub}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={trafficRange}
            onChange={(e) => setTrafficRange(e.target.value as '24h' | '7d' | '30d')}
            className="bg-white border border-gray-200 text-brand-950 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            aria-label="Order activity range"
          >
            <option value="24h">{t.rangeLast24h}</option>
            <option value="7d">{t.rangeLast7d}</option>
            <option value="30d">{t.rangeLast30d}</option>
          </select>
          <button
            type="button"
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-brand-950 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm text-sm opacity-60 cursor-not-allowed"
            disabled
            title="Export is not available yet"
          >
            <Download className="w-4 h-4" />
            {t.exportReport}
          </button>
</div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          <span>{t.loading}</span>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{t.totalPlatformRevenue}</h3>
              <p className="text-3xl font-bold text-brand-950">
                {metrics.totalCommissionFromPharmaciesEt.toLocaleString()} <span className="text-lg text-gray-500 font-normal">{t.etb}</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{t.totalUsers}</h3>
              <p className="text-3xl font-bold text-brand-950">{metrics.totalUsers.toLocaleString()}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{t.totalOrders}</h3>
              <p className="text-3xl font-bold text-brand-950">{metrics.totalOrders.toLocaleString()}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Store className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{t.pharmaciesAndDrivers}</h3>
              <p className="text-xl font-bold text-brand-950">
                {metrics.totalPharmacies.toLocaleString()} <span className="text-sm font-normal text-gray-500">{t.pharmacies}</span>
              </p>
              <p className="text-xl font-bold text-brand-950 mt-2">
                {metrics.totalDrivers.toLocaleString()} <span className="text-sm font-normal text-gray-500">{t.drivers}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-brand-950 mb-6">{t.revenueGrowth}</h2>
              <div className="h-72 w-full min-h-[288px]">
                {revenueSeries.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">{t.noChartData}</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueSeries} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `${Number(value) >= 1000 ? `${value / 1000}k` : value}`}
                      />
                      <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Bar dataKey="revenue" fill="#047857" radius={[4, 4, 0, 0]} name={t.etb} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-brand-950 mb-6">{t.userAcquisition}</h2>
              <div className="h-72 w-full min-h-[288px]">
                {signupsSeries.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">{t.noChartData}</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={signupsSeries} margin={{ top: 5, right: 12, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="signups"
                        name={t.signups}
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <h2 className="text-lg font-bold text-brand-950">{t.orderActivity}</h2>
              <span className="text-xs font-medium text-gray-500">{rangeLabel}</span>
            </div>
            <div className="h-80 w-full min-h-[320px]">
              {trafficLoading ? (
                <div className="h-full flex items-center justify-center gap-2 text-gray-600">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                </div>
              ) : trafficSeries.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">{t.noChartData}</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trafficSeries} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      interval="preserveStartEnd"
                      angle={trafficRange === '24h' ? -35 : 0}
                      textAnchor={trafficRange === '24h' ? 'end' : 'middle'}
                      height={trafficRange === '24h' ? 56 : 32}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="orders" fill="#0d9488" radius={[4, 4, 0, 0]} name={t.orders} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

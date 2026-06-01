'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRouter } from 'next/navigation';
import { apiGet, getPharmacyCommissionSummary, initiateCommissionChapaPayment } from '@/lib/api';
import type { PharmacyCommissionSummary } from '@/lib/api';
import { 
  TrendingUp, AlertTriangle, 
  Package, ShoppingCart, DollarSign, Clock, CheckCircle2,
  ShieldCheck, FileText, Calendar, Globe, ChevronDown, Wallet, X
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const PERFORMANCE_DATA = [
  { name: 'Mon', nameAm: 'ሰኞ', completed: 45, pending: 12 },
  { name: 'Tue', nameAm: 'ማክሰ', completed: 52, pending: 8 },
  { name: 'Wed', nameAm: 'ረቡዕ', completed: 38, pending: 15 },
  { name: 'Thu', nameAm: 'ሐሙስ', completed: 65, pending: 5 },
  { name: 'Fri', nameAm: 'አርብ', completed: 48, pending: 18 },
  { name: 'Sat', nameAm: 'ቅዳሜ', completed: 70, pending: 22 },
  { name: 'Sun', nameAm: 'እሁድ', completed: 61, pending: 10 },
];

const ACTIVE_ORDERS: Array<{ id: string; patient: string; items: string; status: string; time: string }> = [];

const INVENTORY_ALERTS: Array<{ item: string; status: string; count: number }> = [];

const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard',
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    todayIs: 'Today is',
    ordersToday: 'Orders Today',
    pendingOrders: 'Pending Orders',
    urgentItems: 'urgent items',
    lowStock: 'Low Stock Items',
    requiresRestocking: 'Requires restocking',
    revenueToday: 'Revenue (Today)',
    activeOrders: 'Active Orders',
    viewAll: 'View All',
    orderId: 'Order ID',
    patient: 'Patient',
    status: 'Status',
    time: 'Time',
    action: 'Action',
    statusNew: 'New',
    statusPreparing: 'Preparing',
    statusReady: 'Ready',
    actionReject: 'Reject',
    actionAccept: 'Accept',
    actionMarkReady: 'Mark Ready',
    actionAssignDelivery: 'Assign Delivery',
    performanceOverview: 'Performance Overview',
    dayActivityTrend: '7-day activity trend',
    completed: 'Completed',
    pending: 'Pending',
    inventoryAlerts: 'Inventory Alerts',
    fullInventory: 'Full Inventory',
    outOfStock: 'Out of stock',
    unitsLeft: 'units left',
    reorder: 'Reorder',
    addNewStock: 'Add New Stock',
    verifiedPharmacy: 'Verified Pharmacy',
    activeStatus: 'Active Status',
    licenseNumber: 'Business License Number',
    licenseValidity: 'Business License Validity',
    profLicenseValidity: 'Professional License Validity',
    expires: 'Expires',
    outstandingCommission: 'Outstanding commission',
    accruedThisMonth: 'Accrued this month (ETB)',
    payCommission: 'Pay with Chapa',
    commissionCaughtUp: 'No commission balance due.',
    commissionFailed: 'Could not start payment. Try again.',
    commissionPayTitle: 'Pay commission',
    commissionPaySubtitle: 'Enter how much you want to pay in ETB (not more than your balance).',
    commissionPayAmountLabel: 'Amount (ETB)',
    commissionPayFull: 'Use full balance',
    commissionPayBalance: 'Outstanding balance',
    commissionPayCancel: 'Cancel',
    commissionPaySubmit: 'Continue to Chapa',
    commissionAmountInvalid: 'Enter a valid amount greater than 0 and not more than what you owe.',
  },
  am: {
    dashboard: 'ዳሽቦርድ',
    greetingMorning: 'እንደምን አደሩ',
    greetingAfternoon: 'እንደምን ዋሉ',
    greetingEvening: 'እንደምን አመሹ',
    todayIs: 'ዛሬ',
    ordersToday: 'የዛሬ ትዕዛዞች',
    pendingOrders: 'በመጠባበቅ ላይ ያሉ ትዕዛዞች',
    urgentItems: 'አስቸኳይ ነገሮች',
    lowStock: 'አነስተኛ ክምችት ያላቸው እቃዎች',
    requiresRestocking: 'ክምችት መሙላት ይፈልጋል',
    revenueToday: 'ገቢ (የዛሬ)',
    activeOrders: 'ንቁ ትዕዛዞች',
    viewAll: 'ሁሉንም ይመልከቱ',
    orderId: 'የትዕዛዝ መለያ',
    patient: 'ታካሚ',
    status: 'ሁኔታ',
    time: 'ሰዓት',
    action: 'እርምጃ',
    statusNew: 'አዲስ',
    statusPreparing: 'በመዘጋጀት ላይ',
    statusReady: 'ዝግጁ',
    actionReject: 'ውድቅ አድርግ',
    actionAccept: 'ተቀበል',
    actionMarkReady: 'ዝግጁ አድርግ',
    actionAssignDelivery: 'አድራሽ መድብ',
    performanceOverview: 'የስራ አፈጻጸም አጠቃላይ እይታ',
    dayActivityTrend: 'የ7 ቀን እንቅስቃሴ አዝማሚያ',
    completed: 'የተጠናቀቀ',
    pending: 'በመጠባበቅ ላይ',
    inventoryAlerts: 'የክምችት ማሳወቂያዎች',
    fullInventory: 'ሙሉ ክምችት',
    outOfStock: 'ክምችት አልቋል',
    unitsLeft: 'እቃዎች ቀርተዋል',
    reorder: 'እንደገና እዘዝ',
    addNewStock: 'አዲስ ክምችት ጨምር',
    verifiedPharmacy: 'የተረጋገጠ ፋርማሲ',
    activeStatus: 'ንቁ ሁኔታ',
    licenseNumber: 'የንግድ ፈቃድ ቁጥር',
    licenseValidity: 'የንግድ ፈቃድ ማብቂያ ቀን',
    profLicenseValidity: 'የሙያ ፈቃድ ማብቂያ ቀን',
    expires: '',
    outstandingCommission: 'የቀረ ኮሚሽን',
    accruedThisMonth: 'በዚህ ወር የተሰበሰበ (ብር)',
    payCommission: 'በ Chapa ይክፈሉ',
    commissionCaughtUp: 'የኮሚሽን ቀሪ ሂሳብ የለም።',
    commissionFailed: 'ክፍያ ማስጀመር አልተሳካም።',
    commissionPayTitle: 'ኮሚሽን ይክፈሉ',
    commissionPaySubtitle: 'መክፈል የሚፈልጉትን መጠን በ ብር ይግለጹ።',
    commissionPayAmountLabel: 'መጠን (ብር)',
    commissionPayFull: 'ሙሉ ቀሪ ሂሳብ ለመምረጥ',
    commissionPayBalance: 'የተቀረ ቀሪ ሂሳብ',
    commissionPayCancel: 'ይቅር',
    commissionPaySubmit: 'ወደ Chapa',
    commissionAmountInvalid: 'ከ 0 አነስተኛ ያለፈ እና ከመከተብ የማያልፍ ትክክለኛ መጠን ያስገቡ።',
  }
};

export default function PharmacyDashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
const [mounted, setMounted] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState({ number: 'EFDA-LIC-2024-8891', expiry: 'Dec 31, 2026', profExpiry: 'Jun 30, 2025' });
  const [orders, setOrders] = useState(ACTIVE_ORDERS);
  const [alerts, setAlerts] = useState(INVENTORY_ALERTS);
  const [metrics, setMetrics] = useState({ ordersToday: 0, pendingOrders: 0, revenue: 0 });
  const [commission, setCommission] = useState<PharmacyCommissionSummary | null>(null);
  const [commissionPaying, setCommissionPaying] = useState(false);
  const [commissionPayModalOpen, setCommissionPayModalOpen] = useState(false);
  const [commissionPayAmountInput, setCommissionPayAmountInput] = useState('');
  const [commissionPayError, setCommissionPayError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profileRes, alertsRes, analyticsRes, ordersRes] = await Promise.all([
          apiGet<any>('/pharmacy/me'),
          apiGet<any>('/pharmacy/me/inventory/alerts'),
          apiGet<any>('/pharmacy/me/analytics', { period: '30d' }),
          apiGet<any[]>('/pharmacy/me/orders')
        ]);

        const profile = profileRes.data;
        if (profile?.license) {
          setLicenseInfo({
            number: profile.license.businessLicenseNumber || 'EFDA-LIC-2024-8891',
            expiry: profile.license.businessLicenseExpiry
              ? new Date(profile.license.businessLicenseExpiry).toLocaleDateString()
              : 'Dec 31, 2026',
            profExpiry: profile.license.professionalLicenseExpiry
              ? new Date(profile.license.professionalLicenseExpiry).toLocaleDateString()
              : 'Jun 30, 2025'
          });
        }

        const alertsData = alertsRes.data || {};
        setAlerts([
          { item: 'Low stock', status: 'low_stock', count: alertsData.lowStockCount || 0 },
          { item: 'Out of stock', status: 'out_of_stock', count: alertsData.outOfStockCount || 0 }
        ]);

        const statusMap: Record<string, string> = {
          pending: 'new',
          confirmed: 'new',
          preparing: 'preparing',
          ready: 'ready',
          dispatched: 'ready',
          delivered: 'ready'
        };

        const ordersData = (ordersRes.data || []).map((order: any) => ({
          id: order.ref || order._id,
          patient: order.deliveryAddress?.recipientName || 'Patient',
          items: (order.items || []).map((item: any) => item.medicationName).join(', '),
          status: statusMap[order.status] || 'new',
          time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ''
        }));
        setOrders(ordersData.slice(0, 4));

        const pendingCount = (ordersRes.data || []).filter((order: any) =>
          ['pending', 'confirmed', 'preparing'].includes(order.status)
        ).length;

        setMetrics({
          ordersToday: analyticsRes.data?.orderCount || ordersRes.data?.length || 0,
          pendingOrders: pendingCount,
          revenue: analyticsRes.data?.revenue || 0
        });

        try {
          const summary = await getPharmacyCommissionSummary();
          setCommission(summary);
        } catch {
          setCommission({ outstandingDebtEtb: 0, accruedThisMonthEtb: 0 });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setMounted(true);
      }
    };

    loadDashboard();
  }, []);
const t = TRANSLATIONS[language];

  // Derived state that only runs on client to avoid hydration mismatch
  const now = new Date();
  const dateStr = mounted ? now.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '';
  const hour = now.getHours();
  let greeting = '';
  if (mounted) {
    if (hour < 12) greeting = language === 'am' ? TRANSLATIONS.am.greetingMorning : TRANSLATIONS.en.greetingMorning;
    else if (hour < 18) greeting = language === 'am' ? TRANSLATIONS.am.greetingAfternoon : TRANSLATIONS.en.greetingAfternoon;
    else greeting = language === 'am' ? TRANSLATIONS.am.greetingEvening : TRANSLATIONS.en.greetingEvening;
  }

  const performanceData = PERFORMANCE_DATA.map(d => ({
    name: language === 'am' ? d.nameAm : d.name,
    completed: d.completed,
    pending: d.pending
  }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">{t.dashboard}</h1>
          <p className="text-gray-500 font-medium">
            {greeting}. {t.todayIs} {dateStr}.
          </p>
        </div>
        
        {/* Language Dropdown Section */}
</div>

      {/* Platform commission (flat ETB / Chapa) */}
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-950">{t.outstandingCommission}</h2>
            <p className="text-3xl font-bold text-amber-900 mt-1">
              {commission != null ? commission.outstandingDebtEtb.toFixed(2) : '—'}{' '}
              <span className="text-base font-semibold text-gray-600">ETB</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {t.accruedThisMonth}:{' '}
              <span className="font-semibold">
                {commission != null ? commission.accruedThisMonthEtb.toFixed(2) : '—'}
              </span>
            </p>
            {commission != null && commission.outstandingDebtEtb <= 0 && (
              <p className="text-sm text-emerald-700 font-medium mt-2">{t.commissionCaughtUp}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          disabled={commissionPaying || !commission || commission.outstandingDebtEtb <= 0}
          onClick={() => {
            if (!commission || commission.outstandingDebtEtb <= 0) return;
            setCommissionPayAmountInput(commission.outstandingDebtEtb.toFixed(2));
            setCommissionPayError(null);
            setCommissionPayModalOpen(true);
          }}
          className="shrink-0 bg-brand-900 hover:bg-brand-800 disabled:opacity-50 disabled:pointer-events-none text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-colors"
        >
          {commissionPaying ? '…' : t.payCommission}
        </button>
      </div>

      {commissionPayModalOpen && commission && commission.outstandingDebtEtb > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="commission-pay-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCommissionPayModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-6 space-y-4"
            onMouseDown={(ev) => ev.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 id="commission-pay-title" className="text-lg font-bold text-brand-950">
                  {t.commissionPayTitle}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{t.commissionPaySubtitle}</p>
                <p className="text-xs text-amber-800 font-medium mt-2">
                  {t.commissionPayBalance}:{' '}
                  <span className="font-bold">{commission.outstandingDebtEtb.toFixed(2)} ETB</span>
                </p>
              </div>
              <button
                type="button"
                aria-label={t.commissionPayCancel}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 shrink-0"
                onClick={() => setCommissionPayModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700" htmlFor="commission-pay-amount">
                {t.commissionPayAmountLabel}
              </label>
              <input
                id="commission-pay-amount"
                type="number"
                min={0.01}
                step={0.01}
                max={commission.outstandingDebtEtb}
                inputMode="decimal"
                autoFocus
                value={commissionPayAmountInput}
                onChange={(e) => {
                  setCommissionPayAmountInput(e.target.value);
                  setCommissionPayError(null);
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono tabular-nums"
              />
              <button
                type="button"
                className="text-xs font-bold text-brand-700 hover:text-brand-900"
                onClick={() => {
                  setCommissionPayAmountInput(commission.outstandingDebtEtb.toFixed(2));
                  setCommissionPayError(null);
                }}
              >
                {t.commissionPayFull}
              </button>
            </div>

            {commissionPayError && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {commissionPayError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="flex-1 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 text-gray-800"
                onClick={() => setCommissionPayModalOpen(false)}
              >
                {t.commissionPayCancel}
              </button>
              <button
                type="button"
                disabled={commissionPaying}
                className="flex-1 py-3 rounded-xl font-bold bg-brand-900 hover:bg-brand-800 disabled:opacity-50 text-white shadow-sm"
                onClick={async () => {
                  const maxDebt = commission.outstandingDebtEtb;
                  const parsed = Number(String(commissionPayAmountInput).replace(',', '.'));
                  if (!Number.isFinite(parsed) || parsed <= 0) {
                    setCommissionPayError(t.commissionAmountInvalid);
                    return;
                  }
                  const rounded = Math.round(parsed * 100) / 100;
                  if (rounded > maxDebt + 0.005) {
                    setCommissionPayError(t.commissionAmountInvalid);
                    return;
                  }

                  const toPay = Math.min(rounded, maxDebt);

                  setCommissionPaying(true);
                  setCommissionPayError(null);
                  try {
                    const { checkoutUrl } = await initiateCommissionChapaPayment({ amount: toPay });
                    if (checkoutUrl) window.location.href = checkoutUrl;
                    else throw new Error('no checkout');
                  } catch (e) {
                    console.error(e);
                    setCommissionPaying(false);
                    alert(t.commissionFailed);
                  }
                }}
              >
                {commissionPaying ? '…' : t.commissionPaySubmit}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Orders Today */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.ordersToday}</h3>
          <p className="text-3xl font-bold text-brand-950">{metrics.ordersToday}</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.pendingOrders}</h3>
          <p className="text-3xl font-bold text-brand-950">{metrics.pendingOrders}</p>
          <p className="text-xs text-amber-600 font-medium mt-2">{metrics.pendingOrders} {t.urgentItems}</p>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.lowStock}</h3>
          <p className="text-3xl font-bold text-brand-950">{alerts.reduce((sum, alert) => sum + alert.count, 0)}</p>
          <p className="text-xs text-red-600 font-medium mt-2">{t.requiresRestocking}</p>
        </div>

        {/* Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" /> +8%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.revenueToday}</h3>
          <p className="text-3xl font-bold text-brand-950">{(metrics.revenue / 1000).toFixed(1)}{language === 'am' ? 'ሺ' : 'k'} <span className="text-lg text-gray-500 font-normal">{language === 'am' ? 'ብር' : 'ETB'}</span></p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column (Orders & Chart) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Orders Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-950">{t.activeOrders}</h2>
              <button 
                onClick={() => router.push('/pharmacy/orders')}
                className="text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors"
              >
                {t.viewAll}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-accent-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">{t.orderId}</th>
                    <th className="p-4 font-medium">{t.patient}</th>
                    <th className="p-4 font-medium">{t.status}</th>
                    <th className="p-4 font-medium">{t.time}</th>
                    <th className="p-4 font-medium text-right">{t.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-accent-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-brand-950 text-sm">{order.id}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{order.items}</p>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-700">{order.patient}</td>
                      <td className="p-4">
                        {order.status === 'new' && <span className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-md text-xs font-bold">{t.statusNew}</span>}
                        {order.status === 'preparing' && <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold">{t.statusPreparing}</span>}
                        {order.status === 'ready' && <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold">{t.statusReady}</span>}
                      </td>
                      <td className="p-4 text-sm text-gray-500">{order.time}</td>
                      <td className="p-4 text-right">
                        {order.status === 'new' && (
                          <div className="flex justify-end gap-2">
                            <button className="text-xs font-bold text-white bg-brand-900 hover:bg-brand-800 px-3 py-1.5 rounded-lg transition-colors shadow-sm">{t.actionAccept}</button>
                          </div>
                        )}
                        {order.status === 'preparing' && (
                          <button className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">{t.actionMarkReady}</button>
                        )}
                        {order.status === 'ready' && (
                          <button className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors">{t.actionAssignDelivery}</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-brand-950">{t.performanceOverview}</h2>
                <p className="text-sm text-gray-500">{t.dayActivityTrend}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-brand-700"></div>
                  <span className="text-gray-600 font-medium">{t.completed}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <span className="text-gray-600 font-medium">{t.pending}</span>
                </div>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }}
                  />
                  <Line type="monotone" dataKey="completed" name={language === 'am' ? t.completed : 'Completed'} stroke="#047857" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="pending" name={language === 'am' ? t.pending : 'Pending'} stroke="#fbbf24" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Side Column (Alerts & Verification) */}
        <div className="space-y-8">
          
          {/* Inventory Alerts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-950">{t.inventoryAlerts}</h2>
            </div>
            <div className="p-2">
              {alerts.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-accent-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      alert.status === 'out_of_stock' ? 'bg-red-50 text-red-600' :
                      alert.status === 'low_stock' ? 'bg-amber-50 text-amber-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-950 text-sm">{alert.item}</p>
                      <p className={`text-xs font-medium ${
                        alert.status === 'out_of_stock' ? 'text-red-600' :
                        alert.status === 'low_stock' ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>
                        {alert.status === 'out_of_stock' ? t.outOfStock : `${alert.count} ${t.unitsLeft}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Info */}
          <div className="bg-brand-900 rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-brand-500/30 blur-2xl"></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg">{t.verifiedPharmacy}</h3>
                <p className="text-brand-100 text-sm font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t.activeStatus}
                </p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-brand-100 text-xs font-medium mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> {t.licenseNumber}
                </p>
                <p className="font-mono font-bold text-sm tracking-wider">{licenseInfo.number}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-brand-100 text-xs font-medium mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {t.licenseValidity}
                </p>
                <p className="font-bold text-sm">{language === 'en' ? `${t.expires} ${licenseInfo.expiry}` : licenseInfo.expiry}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-brand-100 text-xs font-medium mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {t.profLicenseValidity}
                </p>
                <p className="font-bold text-sm">{language === 'en' ? `${t.expires} ${licenseInfo.profExpiry}` : licenseInfo.profExpiry}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

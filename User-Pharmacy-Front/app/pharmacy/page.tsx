'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRouter } from 'next/navigation';
import { 
  Plus, TrendingUp, TrendingDown, AlertTriangle, 
  Package, ShoppingCart, DollarSign, Clock, CheckCircle2,
  ShieldCheck, FileText, Calendar, Globe, ChevronDown
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

const ACTIVE_ORDERS = [
  { id: 'ORD-8821', patient: 'Abebe Kebede', items: 'Amoxicillin 500mg, Paracetamol', status: 'new', time: '10 mins ago' },
  { id: 'ORD-8820', patient: 'Sara Mohammed', items: 'Ibuprofen 400mg', status: 'preparing', time: '25 mins ago' },
  { id: 'ORD-8819', patient: 'Dawit Tadesse', items: 'Vitamin C, Zinc', status: 'ready', time: '45 mins ago' },
  { id: 'ORD-8818', patient: 'Helen Girma', items: 'Omeprazole 20mg', status: 'new', time: '1 hour ago' },
];

const INVENTORY_ALERTS = [
  { item: 'Azithromycin 250mg', status: 'out_of_stock', count: 0 },
  { item: 'Cough Syrup (Adult)', status: 'low_stock', count: 12 },
  { item: 'Digital Thermometer', status: 'low_stock', count: 5 },
  { item: 'Face Masks (Box of 50)', status: 'adequate', count: 45 },
];

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
    expires: 'Expires'
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
    expires: ''
  }
};

export default function PharmacyDashboardPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState({ number: 'EFDA-LIC-2024-8891', expiry: 'Dec 31, 2026', profExpiry: 'Jun 30, 2025' });

  useEffect(() => {
            
    // Check local storage for dynamic license
    const storedLicense = localStorage.getItem('medcare_pharmacy_license');
    const storedExpiry = localStorage.getItem('medcare_pharmacy_expiry_date');
    if (storedLicense || storedExpiry) {
      setLicenseInfo({
        number: storedLicense || 'EFDA-LIC-2024-8891',
        expiry: storedExpiry || 'Dec 31, 2026',
        profExpiry: 'Jun 30, 2025'
      });
    }

    setMounted(true);
  }, []);

  const toggleLanguage = (lang: 'en' | 'am') => {
    setLanguage(lang);
        setIsLangDropdownOpen(false);
  };

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
          <p className="text-3xl font-bold text-brand-950">142</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.pendingOrders}</h3>
          <p className="text-3xl font-bold text-brand-950">24</p>
          <p className="text-xs text-amber-600 font-medium mt-2">5 {t.urgentItems}</p>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.lowStock}</h3>
          <p className="text-3xl font-bold text-brand-950">18</p>
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
          <p className="text-3xl font-bold text-brand-950">12.4{language === 'am' ? 'ሺ' : 'k'} <span className="text-lg text-gray-500 font-normal">{language === 'am' ? 'ብር' : 'ETB'}</span></p>
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
                  {ACTIVE_ORDERS.map((order) => (
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
              {INVENTORY_ALERTS.map((alert, idx) => (
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

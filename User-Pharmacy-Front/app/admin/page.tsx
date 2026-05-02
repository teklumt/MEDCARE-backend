'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  Users, Store, ShoppingCart, FileCheck, AlertOctagon, 
  Activity, CheckCircle2, XCircle, Clock, Search, 
  ChevronRight, ShieldAlert, Server, Database, Globe,
  Eye, Download, AlertTriangle, ChevronDown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { adminApi } from '@/lib/admin-api';
import { authApi } from '@/lib/auth-api';

const TRANSLATIONS = {
  en: {
    systemOverview: 'System Overview',
    systemSubtitle: 'Monitor platform activity and manage operations.',
    totalUsers: 'Total Users',
    activePharmacies: 'Active Pharmacies',
    ordersToday: 'Orders Today',
    pendingVerifs: 'Pending Verifications',
    activeComplaints: 'Active Complaints',
    systemUptime: 'System Uptime',
    platformTraffic: 'Platform Traffic',
    activeUsers24h: 'Active users over the last 24 hours',
    last24Hours: 'Last 24 Hours',
    last7Days: 'Last 7 Days',
    last30Days: 'Last 30 Days',
    verificationQueue: 'Verification Queue',
    viewAll: 'View All',
    submitted: 'Submitted',
    docsComplete: 'Docs Complete',
    review: 'Review',
    broadcastAlert: 'Broadcast Public Health Alert',
    broadcastSubtitle: 'Send immediate push notifications and dashboard banners to users in affected regions.',
    alertType: 'Alert Type',
    targetRegion: 'Target Region',
    messageContent: 'Message Content',
    detailsOptional: 'Details (Optional)',
    youtubeLink: 'YouTube Link (Optional)',
    broadcastBtn: 'Broadcast Alert Now',
    broadcasting: 'Broadcasting...',
    recentComplaints: 'Recent Complaints',
    resolve: 'Resolve',
    systemAuditLogs: 'System Audit Logs',
    outbreak: 'Disease Outbreak (e.g., Malaria, Cholera)',
    recall: 'Medication Recall',
    advisory: 'Emergency Health Advisory',
    allRegions: 'All Regions (National)',
    addisAbaba: 'Addis Ababa',
    amhara: 'Amhara Region',
    oromia: 'Oromia Region',
    systemHealth: 'System Health',
    auditLogs: 'Audit Logs',
    viewAllComplaints: 'View All Complaints'
  },
  am: {
    systemOverview: 'የስርዓት አጠቃላይ እይታ',
    systemSubtitle: 'የፕላትፎርም እንቅስቃሴን ይቆጣጠሩ እና ስራዎችን ያስተዳድሩ።',
    totalUsers: 'ጠቅላላ ተጠቃሚዎች',
    activePharmacies: 'ንቁ ፋርማሲዎች',
    ordersToday: 'የዛሬ ትዕዛዞች',
    pendingVerifs: 'በመጠባበቅ ላይ ያሉ ማረጋገጫዎች',
    activeComplaints: 'ንቁ ቅሬታዎች',
    systemUptime: 'የስርዓት ጊዜ',
    platformTraffic: 'ትራፊክ መቆጣጠሪያ',
    activeUsers24h: 'ባለፉት 24 ሰዓታት ንቁ ተጠቃሚዎች',
    last24Hours: 'ባለፉት 24 ሰዓታት',
    last7Days: 'ባለፉት 7 ቀናት',
    last30Days: 'ባለፉት 30 ቀናት',
    verificationQueue: 'የማረጋገጫ ወረፋ',
    viewAll: 'ሁሉንም ይመልከቱ',
    submitted: 'የገባበት ጊዜ',
    docsComplete: 'ሰነዶች ተሟልተዋል',
    review: 'ገምግም',
    broadcastAlert: 'የህዝብ ጤና አደጋ ማሳወቂያ ያስተላልፉ',
    broadcastSubtitle: 'ለተጎዱ ክልሎች ፈጣን ማሳወቂያ ይላኩ',
    alertType: 'የአደጋ አይነት',
    targetRegion: 'የታለመበት ክልል',
    messageContent: 'የመልእክት ይዘት',
    detailsOptional: 'ዝርዝሮች (አማራጭ)',
    youtubeLink: 'የዩቲዩብ ሊንክ (አማራጭ)',
    broadcastBtn: 'ማሳወቂያ ያስተላልፉ',
    broadcasting: 'እያስተላለፈ ነው...',
    recentComplaints: 'የቅርብ ጊዜ ቅሬታዎች',
    resolve: 'ፍታ',
    systemAuditLogs: 'የስርዓት ክትትል ታሪክ',
    outbreak: 'የበሽታ መከሰት (ለምሳሌ ወባ፣ አተት)',
    recall: 'መድሃኒት መቀልበስ',
    advisory: 'የአደጋ ጊዜ ጤና ምክር',
    allRegions: 'ሁሉም ክልሎች (አገር አቀፍ)',
    addisAbaba: 'አዲስ አበባ',
    amhara: 'አማራ ክልል',
    oromia: 'ኦሮሚያ ክልል',
    systemHealth: 'የስርዓት ጤና',
    auditLogs: 'ክትትል ታሪክ',
    viewAllComplaints: 'ሁሉንም ቅሬታዎች ይመልከቱ'
  }
};

const TRAFFIC_DATA = [
  { time: '00:00', users: 1200 },
  { time: '04:00', users: 800 },
  { time: '08:00', users: 3500 },
  { time: '12:00', users: 5200 },
  { time: '16:00', users: 4800 },
  { time: '20:00', users: 6100 },
  { time: '24:00', users: 2400 },
];

const INITIAL_VERIFICATIONS = [
  { id: 'V-1042', name: 'Addis Hope Pharmacy', location: 'Bole, Addis Ababa', time: '2 hours ago', status: 'pending' },
  { id: 'V-1043', name: 'HealthFirst Clinic', location: 'Hawassa', time: '5 hours ago', status: 'reviewing' },
  { id: 'V-1044', name: 'Nile Care Pharmacy', location: 'Bahir Dar', time: '1 day ago', status: 'pending' },
];

const INITIAL_COMPLAINTS = [
  { id: 'C-892', target: 'Kenema Pharmacy #4', issue: 'Late delivery', reporter: 'Abebe K.', severity: 'medium', time: '1 hr ago' },
  { id: 'C-893', target: 'Dr. Sarah Jenkins', issue: 'Unprofessional behavior', reporter: 'Anonymous', severity: 'high', time: '3 hrs ago' },
  { id: 'C-894', target: 'System', issue: 'Payment gateway error', reporter: 'Dawit T.', severity: 'high', time: '5 hrs ago' },
];

const AUDIT_LOGS = [
  { id: 1, admin: 'SuperAdmin', action: 'Approved license for Kenema Pharmacy', time: '10:42 AM' },
  { id: 2, admin: 'System', action: 'Automated database backup completed', time: '03:00 AM' },
  { id: 3, admin: 'Admin_Sarah', action: 'Suspended user account U-9921', time: 'Yesterday, 4:15 PM' },
];

export default function AdminDashboardPage() {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);
  const { language, setLanguage } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  
  const [verifications, setVerifications] = useState(INITIAL_VERIFICATIONS);
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load dashboard data from backend
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch analytics data
        const analytics = await adminApi.getAnalytics();
        
        // Fetch recent data
        const [users, pharmacies, orders, pendingVerifications, activeComplaints] = await Promise.all([
          adminApi.getUsers({ limit: 5 }),
          adminApi.getPharmacies({ limit: 5 }),
          adminApi.getOrders({ limit: 5 }),
          adminApi.getVerifications({ status: 'pending', limit: 10 }),
          adminApi.getComplaints({ status: 'open', limit: 5 })
        ]);

        setDashboardData({
          analytics,
          users,
          pharmacies,
          orders,
          totalUsers: users.length,
          activePharmacies: pharmacies.filter((p: any) => p.isActive).length,
          ordersToday: orders.filter((o: any) => {
            const today = new Date().toDateString();
            return new Date(o.createdAt).toDateString() === today;
          }).length
        });

        // Update verifications with real data
        if (pendingVerifications.length > 0) {
          setVerifications(pendingVerifications.map((v: any) => ({
            id: v._id,
            name: v.businessName,
            location: v.location,
            time: new Date(v.createdAt).toLocaleString(),
            status: v.verification?.status || 'pending'
          })));
        }

        // Update complaints with real data
        if (activeComplaints.length > 0) {
          setComplaints(activeComplaints.map((c: any) => ({
            id: c._id,
            target: c.targetName || 'System',
            issue: c.subject,
            reporter: c.reporterName || 'Anonymous',
            severity: c.severity || 'medium',
            time: new Date(c.createdAt).toLocaleString()
          })));
        }

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Keep using mock data if API fails
      } finally {
        setLoading(false);
      }
    };

    // Only load data if user is authenticated
    if (authApi.isAuthenticated()) {
      loadDashboardData();
    }
  }, []);
  
  
  const toggleLanguage = (lang: 'en' | 'am') => {
    setLanguage(lang);
        setIsLangDropdownOpen(false);
  };

  const t = TRANSLATIONS[language];

  // Broadcast Alert State
  const [alertType, setAlertType] = useState('Disease Outbreak (e.g., Malaria, Cholera)');
  const [alertRegion, setAlertRegion] = useState('All Regions (National)');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertDetails, setAlertDetails] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [hasBroadcasted, setHasBroadcasted] = useState(false);

  const handleReviewClick = (pharmacy: any) => {
    setSelectedPharmacy(pharmacy);
    setShowVerificationModal(true);
  };

  const handleBroadcastAlert = async () => {
    if (!alertMessage.trim()) return;
    
    setIsBroadcasting(true);
    
    try {
      await adminApi.createAlert({
        type: alertType,
        region: alertRegion,
        message: alertMessage,
        details: alertDetails,
        youtubeLink: youtubeLink
      });

      // Also store locally for immediate UI feedback
      localStorage.setItem('medcare_broadcast_alert', JSON.stringify({
        type: alertType,
        region: alertRegion,
        message: alertMessage,
        details: alertDetails,
        youtubeLink: youtubeLink,
        timestamp: Date.now(),
        active: true
      }));

      setHasBroadcasted(true);
      setAlertMessage('');
      setAlertDetails('');
      setYoutubeLink('');
      
      setTimeout(() => {
        setHasBroadcasted(false);
      }, 3000);

    } catch (error) {
      console.error('Failed to broadcast alert:', error);
      alert('Failed to broadcast alert. Please try again.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleReviewAction = (action: string) => {
    if (selectedPharmacy) {
      setVerifications(prev => prev.filter(v => v.id !== selectedPharmacy.id));
      setShowVerificationModal(false);
      alert(`License application was ${action} for ${selectedPharmacy.name}`);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">{t.systemOverview}</h1>
          <p className="text-gray-500 text-sm">{t.systemSubtitle}</p>
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

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : (
          <>
            <MetricCard 
              title={t.totalUsers} 
              value={dashboardData?.totalUsers?.toLocaleString() || "124.5k"} 
              icon={Users} 
              trend="+12%" 
              color="blue" 
            />
            <MetricCard 
              title={t.activePharmacies} 
              value={dashboardData?.activePharmacies?.toString() || "842"} 
              icon={Store} 
              trend="+5%" 
              color="emerald" 
            />
            <MetricCard 
              title={t.ordersToday} 
              value={dashboardData?.ordersToday?.toLocaleString() || "12,405"} 
              icon={ShoppingCart} 
              trend="+18%" 
              color="brand" 
            />
            <MetricCard 
              title={t.pendingVerifs} 
              value={verifications.length.toString()} 
              icon={FileCheck} 
              color="amber" 
            />
            <MetricCard 
              title={t.activeComplaints} 
              value={complaints.length.toString()} 
              icon={AlertOctagon} 
              color="red" 
            />
            <MetricCard 
              title={t.systemUptime} 
              value="99.99%" 
              icon={Activity} 
              color="purple" 
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Traffic Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-brand-950">{t.platformTraffic}</h2>
                <p className="text-sm text-gray-500">{t.activeUsers24h}</p>
              </div>
              <select className="bg-accent-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2">
                <option>{t.last24Hours}</option>
                <option>{t.last7Days}</option>
                <option>{t.last30Days}</option>
              </select>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TRAFFIC_DATA} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#047857" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#047857" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* License Verification Queue */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-brand-950">{t.verificationQueue}</h2>
              </div>
              <button className="text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors">
                {t.viewAll} (24)
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {verifications.map((item) => (
                <div key={item.id} className="p-5 flex items-center justify-between hover:bg-accent-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-950 text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-500 mb-1">{item.location} • {t.submitted} {item.time}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          {item.status}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {t.docsComplete}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleReviewClick(item)}
                    className="text-sm font-bold text-white bg-brand-900 hover:bg-brand-800 px-4 py-2 rounded-lg transition-colors shadow-sm shrink-0"
                  >
                    {t.review}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Disease Alert Control (Quick Form) */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 shadow-sm p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <ShieldAlert className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-bold text-red-900">{t.broadcastAlert}</h2>
            </div>
            <p className="text-sm text-red-700 mb-6 relative z-10">{t.broadcastSubtitle}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative z-10">
              <div>
                <label className="block text-xs font-bold text-red-900 mb-1.5 uppercase tracking-wider">{t.alertType}</label>
                <select 
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full bg-white border border-red-200 rounded-lg p-2.5 text-sm focus:ring-red-500 focus:border-red-500"
                >
                  <option>{t.outbreak}</option>
                  <option>{t.recall}</option>
                  <option>{t.advisory}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-red-900 mb-1.5 uppercase tracking-wider">{t.targetRegion}</label>
                <select 
                  value={alertRegion}
                  onChange={(e) => setAlertRegion(e.target.value)}
                  className="w-full bg-white border border-red-200 rounded-lg p-2.5 text-sm focus:ring-red-500 focus:border-red-500"
                >
                  <option>{t.allRegions}</option>
                  <option>{t.addisAbaba}</option>
                  <option>{t.amhara}</option>
                  <option>{t.oromia}</option>
                </select>
              </div>
            </div>
            <div className="mb-4 relative z-10">
              <label className="block text-xs font-bold text-red-900 mb-1.5 uppercase tracking-wider">{t.messageContent}</label>
              <textarea 
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                rows={2} 
                className="w-full bg-white border border-red-200 rounded-lg p-3 text-sm focus:ring-red-500 focus:border-red-500 resize-none mb-3"
                placeholder="Enter the alert message to be broadcasted..."
              ></textarea>

              <label className="block text-xs font-bold text-red-900 mb-1.5 uppercase tracking-wider">{t.detailsOptional}</label>
              <textarea 
                value={alertDetails}
                onChange={(e) => setAlertDetails(e.target.value)}
                rows={3} 
                className="w-full bg-white border border-red-200 rounded-lg p-3 text-sm focus:ring-red-500 focus:border-red-500 resize-none mb-3"
                placeholder="Enter detailed information about the alert..."
              ></textarea>

              <label className="block text-xs font-bold text-red-900 mb-1.5 uppercase tracking-wider">{t.youtubeLink}</label>
              <input 
                type="url"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                className="w-full bg-white border border-red-200 rounded-lg p-3 text-sm focus:ring-red-500 focus:border-red-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="flex justify-end relative z-10">
              <button 
                onClick={handleBroadcastAlert}
                disabled={!alertMessage.trim() || isBroadcasting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                {isBroadcasting ? t.broadcasting : t.broadcastBtn}
              </button>
            </div>

            {hasBroadcasted && (
               <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                     <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-900 mb-1">Alert Broadcasted!</h3>
                  <p className="text-sm text-emerald-700">The health advisory is now live.</p>
               </div>
            )}
          </div>

        </div>

        {/* Right Column (Sidebars) */}
        <div className="space-y-8">
          
          {/* System Health */}
          <div className="bg-brand-900 rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-brand-500/20 blur-3xl"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-lg font-bold">{t.systemHealth}</h2>
              <button 
                onClick={() => alert("Downloading System Health Report... ")}
                className="text-brand-200 hover:text-white transition-colors"
                title="Download Report"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              <HealthMetric label="API Response Time" value="45ms" status="good" icon={Server} />
              <HealthMetric label="Database Load" value="24%" status="good" icon={Database} />
              <HealthMetric label="CDN Status" value="Operational" status="good" icon={Globe} />
              <HealthMetric label="Error Rate (5xx)" value="0.01%" status="warning" icon={AlertTriangle} />
            </div>
          </div>

          {/* Complaint Queue */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-brand-950">{t.recentComplaints}</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="p-4 hover:bg-accent-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-gray-500">{complaint.id}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      complaint.severity === 'high' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {complaint.severity}
                    </span>
                  </div>
                  <p className="font-bold text-brand-950 text-sm mb-1">{complaint.target}</p>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">{complaint.issue}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>By: {complaint.reporter}</span>
                    <span>{complaint.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 bg-accent-50">
              <button 
                onClick={() => window.location.href = '/admin/complaints'}
                className="w-full text-sm font-bold text-gray-600 hover:text-brand-900 transition-colors py-1"
              >
                {t.viewAllComplaints}
              </button>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-950">{t.auditLogs}</h2>
            </div>
            <div className="p-2">
              {AUDIT_LOGS.map((log) => (
                <div key={log.id} className="p-3 flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-gray-700"><span className="font-bold text-brand-950">{log.admin}</span> {log.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Review Panel Modal (Simplified for demo) */}
      {showVerificationModal && selectedPharmacy && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">License Verification</h2>
                <p className="text-sm text-slate-500">{selectedPharmacy.id}</p>
              </div>
              <button onClick={() => setShowVerificationModal(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Pharmacy Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Business Name</p>
                    <p className="font-bold text-slate-900">{selectedPharmacy.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Location</p>
                    <p className="font-bold text-slate-900">{selectedPharmacy.location}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Document Checklist</h3>
                <div className="space-y-3">
                  <DocumentItem name="Business Registration Certificate" status="verified" />
                  <DocumentItem name="Pharmacy Operating License" status="pending_review" />
                  <DocumentItem name="Facility Inspection Report" status="verified" />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => handleReviewAction('Rejected')}
                className="px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                Reject License
              </button>
              <button 
                onClick={() => handleReviewAction('Marked as needs more docs')}
                className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Request More Docs
              </button>
              <button 
                onClick={() => handleReviewAction('Approved')}
                className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
              >
                Approve License
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    brand: 'bg-brand-50 text-brand-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }[color as string] || 'bg-gray-50 text-gray-600';

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-brand-950">{value}</p>
    </div>
  );
}

function HealthMetric({ label, value, status, icon: Icon }: any) {
  return (
    <div className="flex items-center justify-between bg-brand-800/50 p-3 rounded-xl border border-brand-700/50">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${status === 'good' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-brand-100">{label}</span>
      </div>
      <span className="font-mono font-bold text-sm text-white">{value}</span>
    </div>
  );
}

function DocumentItem({ name, status }: any) {
  return (
    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
          <FileCheck className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-slate-700">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1">
          <Eye className="w-4 h-4" /> View
        </button>
        {status === 'verified' ? (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        ) : (
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </span>
        )}
      </div>
    </div>
  );
}

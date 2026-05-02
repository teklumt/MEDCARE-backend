'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { FileCheck, AlertTriangle, CheckCircle2, XCircle, Globe, ChevronDown } from 'lucide-react';

const TRANSLATIONS = {
  en: {
    licenseVerif: 'License Verification',
    licenseVerifSub: 'Review and approve pharmacy license applications.',
    allApplications: 'All Applications',
    pendingApps: 'Pending Applications',
    approvedThisMonth: 'Approved This Month',
    rejectedThisMonth: 'Rejected This Month',
    expiringLessThan60: 'Expiring < 60 Days',
    pendingQueueTitle: 'Applications Queue',
    urgent: 'Urgent > 48h',
    submitted: 'Submitted',
    documents: 'Documents',
    reviewApp: 'Review Application',
    viewDetails: 'View Details'
  },
  am: {
    licenseVerif: 'የፈቃድ ማረጋገጫ',
    licenseVerifSub: 'የፋርማሲ ፈቃድ ማመልከቻዎችን ይገምግሙ እና ያጽድቁ።',
    allApplications: 'ሁሉም ማመልከቻዎች',
    pendingApps: 'በመጠባበቅ ላይ ያሉ ማመልከቻዎች',
    approvedThisMonth: 'በዚህ ወር የጸደቁ',
    rejectedThisMonth: 'በዚህ ወር ውድቅ የተደረጉ',
    expiringLessThan60: 'ከ 60 ቀናት በታች ጊዜ ያለቀባቸው',
    pendingQueueTitle: 'የማመልከቻዎች ወረፋ',
    urgent: 'አስቸኳይ > 48 ሰዓት',
    submitted: 'የገባበት ጊዜ',
    documents: 'ሰነዶች',
    reviewApp: 'ማመልከቻውን ይገምግሙ',
    viewDetails: 'ዝርዝሮችን ይመልከቱ'
  }
};

const INITIAL_VERIFICATIONS = [
  { id: 'VER-992', name: 'Kidus Pharmacy', location: 'Piasa, Addis Ababa', time: '2 hours ago', status: 'Pending Review', docs: 2, urgent: true, email: 'kidus@example.com', phone: '+251 911 234 567', owner: 'Kidus Tadesse', regNo: 'REG-10293' },
  { id: 'VER-993', name: 'Amanuel Pharmacy', location: 'Bole, Addis Ababa', time: '1 day ago', status: 'Pending Review', docs: 1, urgent: false, email: 'amanuel@example.com', phone: '+251 922 345 678', owner: 'Amanuel Kebede', regNo: 'REG-29384' },
  { id: 'VER-994', name: 'Tena Pharmacy', location: 'Mekanisa, Addis Ababa', time: '2 weeks ago', status: 'Approved', docs: 2, urgent: false, email: 'tena@example.com', phone: '+251 933 456 789', owner: 'Tena Mengistu', regNo: 'REG-38475' },
  { id: 'VER-995', name: 'Health First', location: 'Ayat, Addis Ababa', time: '3 weeks ago', status: 'Rejected', docs: 2, urgent: false, email: 'hf@example.com', phone: '+251 944 567 890', owner: 'Health First LLC', regNo: 'REG-47586' },
  { id: 'VER-996', name: 'Addis Pharmacy', location: 'Kazanchis, Addis Ababa', time: '11 months ago', status: 'Expiring', docs: 2, urgent: true, email: 'addis@example.com', phone: '+251 955 678 901', owner: 'Addis Alemayehu', regNo: 'REG-58697' },
];

export default function AdminVerificationPage() {
  const [verifications, setVerifications] = useState(INITIAL_VERIFICATIONS);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const { language, setLanguage } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'Pending Review' | 'Approved' | 'Rejected' | 'Expiring'>('all');
  
  useEffect(() => {
        // Fixed eslint warning by directly using state but we can just use setLanguage without issue in this specific nextjs setup via localstorage check
    // However, to keep it clean we omit setstate out of effect loop dependencies if possible.
      }, []);

  const toggleLanguage = (lang: 'en' | 'am') => {
    setLanguage(lang);
        setIsLangDropdownOpen(false);
  };

  const t = TRANSLATIONS[language];

  // Dynamic counts
  const pendingCount = verifications.filter(v => v.status === 'Pending Review').length;
  const approvedCount = verifications.filter(v => v.status === 'Approved').length;
  const rejectedCount = verifications.filter(v => v.status === 'Rejected').length;
  const expiringCount = verifications.filter(v => v.status === 'Expiring').length;

  const filteredVerifications = activeFilter === 'all' 
    ? verifications 
    : verifications.filter(v => v.status === activeFilter);

  const toggleFilter = (filter: 'Pending Review' | 'Approved' | 'Rejected' | 'Expiring') => {
    if (activeFilter === filter) setActiveFilter('all');
    else setActiveFilter(filter);
  };

  const handleReviewApp = (id: string) => {
    const app = verifications.find(v => v.id === id);
    if(app) {
      setSelectedApp(app);
    }
  };

  const handleApproveReject = (id: string, action: 'approve' | 'reject') => {
    setVerifications(prev => prev.map(v => 
      v.id === id ? { ...v, status: action === 'approve' ? 'Approved' : 'Rejected' } : v
    ));
    setSelectedApp(null);
    alert(`Application ${action}d successfully.`);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">{t.licenseVerif}</h1>
          <p className="text-gray-500 text-sm">{t.licenseVerifSub}</p>
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

      {/* Summary Cards Row - Clickable for Filtering */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => toggleFilter('Pending Review')}
          className={`cursor-pointer p-5 rounded-2xl shadow-sm transition-all duration-200 ${
            activeFilter === 'Pending Review' ? 'bg-brand-50 border-2 border-brand-500 ring-2 ring-brand-100' : 'bg-white border border-gray-200 hover:border-brand-300'
          }`}
        >
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.pendingApps}</h3>
          <p className="text-3xl font-bold text-brand-950 flex items-center gap-2">
            {pendingCount} {pendingCount > 0 && <span className="w-3 h-3 rounded-full bg-red-500"></span>}
          </p>
        </div>
        
        <div 
          onClick={() => toggleFilter('Approved')}
          className={`cursor-pointer p-5 rounded-2xl shadow-sm transition-all duration-200 ${
            activeFilter === 'Approved' ? 'bg-emerald-50 border-2 border-emerald-500 ring-2 ring-emerald-100' : 'bg-white border border-gray-200 hover:border-emerald-300'
          }`}
        >
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.approvedThisMonth}</h3>
          <p className="text-3xl font-bold text-brand-950">{approvedCount}</p>
        </div>
        
        <div 
          onClick={() => toggleFilter('Rejected')}
          className={`cursor-pointer p-5 rounded-2xl shadow-sm transition-all duration-200 ${
            activeFilter === 'Rejected' ? 'bg-red-50 border-2 border-red-500 ring-2 ring-red-100' : 'bg-white border border-gray-200 hover:border-red-300'
          }`}
        >
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.rejectedThisMonth}</h3>
          <p className="text-3xl font-bold text-brand-950">{rejectedCount}</p>
        </div>
        
        <div 
          onClick={() => toggleFilter('Expiring')}
          className={`cursor-pointer p-5 rounded-2xl shadow-sm transition-all duration-200 ${
            activeFilter === 'Expiring' ? 'bg-amber-50 border-2 border-amber-500 ring-2 ring-amber-100' : 'bg-white border border-gray-200 hover:border-amber-300'
          }`}
        >
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.expiringLessThan60}</h3>
          <p className="text-3xl font-bold text-amber-600">{expiringCount}</p>
        </div>
      </div>

      {/* Pending Queue / Filtered List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-950">
            {activeFilter === 'all' ? t.allApplications : 
             activeFilter === 'Pending Review' ? t.pendingApps : 
             activeFilter === 'Approved' ? t.approvedThisMonth : 
             activeFilter === 'Rejected' ? t.rejectedThisMonth : 
             t.expiringLessThan60} 
            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-sm">{filteredVerifications.length}</span>
          </h2>
          {activeFilter !== 'all' && (
            <button 
              onClick={() => setActiveFilter('all')}
              className="text-sm font-bold text-brand-600 hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>
        
        {filteredVerifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <FileCheck className="w-12 h-12 text-gray-300 mb-3" />
            <p>No applications match this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredVerifications.map((item) => (
              <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-accent-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-brand-950">{item.name}</h3>
                    {item.urgent && <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{t.urgent}</span>}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'Pending Review' ? 'bg-amber-50 text-amber-700' :
                      item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                      item.status === 'Rejected' ? 'bg-red-50 text-red-700' :
                      'bg-orange-50 text-orange-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.location} • {t.submitted} {item.time}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.docs >= 2 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
                      {item.docs}/2 {t.documents}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleReviewApp(item.id)}
                    className="text-sm font-bold text-white bg-brand-900 hover:bg-brand-800 px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    {item.status === 'Pending Review' ? t.reviewApp : t.viewDetails}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-brand-950">
                {selectedApp.status === 'Pending Review' ? `Review Application: ${selectedApp.name}` : `Pharmacy Details: ${selectedApp.name}`}
              </h2>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Pharmacy Details</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-accent-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500">Pharmacy Name</p>
                      <p className="font-medium text-brand-950">{selectedApp.name}</p>
                    </div>
                    <div className="bg-accent-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium text-brand-950">{selectedApp.location}</p>
                    </div>
                    <div className="bg-accent-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500">Owner Name</p>
                      <p className="font-medium text-brand-950">{selectedApp.owner}</p>
                    </div>
                    <div className="bg-accent-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500">Registration Number</p>
                      <p className="font-medium text-brand-950">{selectedApp.regNo}</p>
                    </div>
                 </div>
              </div>

              <div>
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-accent-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="font-medium text-brand-950">{selectedApp.email}</p>
                    </div>
                    <div className="bg-accent-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="font-medium text-brand-950">{selectedApp.phone}</p>
                    </div>
                 </div>
              </div>

              <div>
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Submitted Documents ({selectedApp.docs}/2)</h3>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-emerald-200 bg-emerald-50 rounded-xl">
                       <div className="flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-emerald-600" />
                          <span className="font-medium text-emerald-900 text-sm">Business License.pdf</span>
                       </div>
                       <button className="text-emerald-700 text-xs font-bold hover:underline">View</button>
                    </div>
                    {selectedApp.docs >= 2 ? (
                      <div className="flex items-center justify-between p-3 border border-emerald-200 bg-emerald-50 rounded-xl">
                        <div className="flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-emerald-600" />
                            <span className="font-medium text-emerald-900 text-sm">Professional License.pdf</span>
                        </div>
                        <button className="text-emerald-700 text-xs font-bold hover:underline">View</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 border border-amber-200 bg-amber-50 rounded-xl">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            <span className="font-medium text-amber-900 text-sm">Professional License Missing</span>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
              
              {selectedApp.status !== 'Pending Review' && (
                <div>
                   <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Current Status</h3>
                   <div className={`p-4 rounded-xl border ${
                      selectedApp.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                      selectedApp.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-800' :
                      'bg-orange-50 border-orange-200 text-orange-800'
                   }`}>
                     <p className="font-bold">{selectedApp.status}</p>
                     <p className="text-sm opacity-80 mt-1">This application was previously reviewed.</p>
                   </div>
                </div>
              )}
            </div>

            {selectedApp.status === 'Pending Review' ? (
              <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
                <button 
                  onClick={() => handleApproveReject(selectedApp.id, 'reject')}
                  className="px-5 py-2.5 rounded-xl border border-red-200 text-red-700 font-bold hover:bg-red-50 transition-colors"
                >
                  Reject Application
                </button>
                <button 
                  onClick={() => handleApproveReject(selectedApp.id, 'approve')}
                  disabled={selectedApp.docs < 2}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approve Pharmacy
                </button>
              </div>
            ) : (
              <div className="p-6 border-t border-gray-100 flex items-center justify-end bg-gray-50/50 rounded-b-2xl">
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="px-5 py-2.5 rounded-xl bg-brand-900 text-white font-bold hover:bg-brand-800 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

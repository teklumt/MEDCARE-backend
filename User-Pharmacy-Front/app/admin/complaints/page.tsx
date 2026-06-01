'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Search, AlertTriangle, MessageSquare, Filter, CheckCircle2, Globe, ChevronDown, X } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { motion, AnimatePresence } from 'motion/react';

const TRANSLATIONS = {
  en: {
    complaintsTitle: 'Complaints & Disputes',
    complaintsSub: 'Manage and resolve issues reported by patients and pharmacies.',
    openComplaints: 'Open Complaints',
    inProgress: 'In Progress',
    resolvedThisWeek: 'Resolved (This Week)',
    searchPlaceholder: 'Search complaints by ID, user, or subject...',
    allStatuses: 'All Statuses',
    open: 'Open',
    resolved: 'Resolved',
    dismissed: 'Dismissed',
    complaintId: 'Complaint ID',
    reporter: 'Reporter',
    subjectTarget: 'Subject / Target',
    priority: 'Priority',
    status: 'Status',
    date: 'Date',
    actions: 'Actions',
    review: 'Review',
    noComplaintsFound: 'No complaints found matching your filters.',
    complaintDetails: 'Complaint Details',
    description: 'Description',
    markInProgress: 'Mark In Progress',
    markResolved: 'Mark Resolved',
    markDismiss: 'Dismiss',
    close: 'Close',
  },
  am: {
    complaintsTitle: 'ቅሬታዎች እና ክርክሮች',
    complaintsSub: 'በታካሚዎችና ፋርማሲዎች ሪፖርት የተደረጉ ጉዳዮችን ያስተዳድሩ እና ይፍቱ።',
    openComplaints: 'ክፍት ቅሬታዎች',
    inProgress: 'በሂደት ላይ',
    resolvedThisWeek: 'የተፈቱ (በዚህ ሳምንት)',
    searchPlaceholder: 'ቅሬታዎችን በመታወቂያ፣ ተጠቃሚ፣ ወይም ርዕስ ይፈልጉ...',
    allStatuses: 'ሁሉም ሁኔታዎች',
    open: 'ክፍት',
    resolved: 'የተፈታ',
    dismissed: 'የተሰረዘ',
    complaintId: 'የቅሬታ መታወቂያ',
    reporter: 'አቅራቢ',
    subjectTarget: 'ርዕስ / ዒላማ',
    priority: 'ቅድሚያ',
    status: 'ሁኔታ',
    date: 'ቀን',
    actions: 'ድርጊቶች',
    review: 'ገምግም',
    noComplaintsFound: 'ምንም ቅሬታዎች አልተገኙም።',
    complaintDetails: 'የቅሬታ ዝርዝሮች',
    description: 'መግለጫ',
    markInProgress: 'በሂደት ላይ ምልክት ያድርጉ',
    markResolved: 'የተፈታ ምልክት ያድርጉ',
    markDismiss: 'ያስወግዱ',
    close: 'ዝጋ',
  }
};

const INITIAL_COMPLAINTS: Array<{
  id: string;
  mongoId?: string;
  user: string;
  type: string;
  target: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  date: string;
}> = [
  { id: 'CMP-001', user: 'Abebe K.', type: 'Patient', target: 'Selam Pharmacy', subject: 'Late Delivery', description: 'Sample row (offline demo).', status: 'Open', priority: 'High', date: '2 hours ago' },
  { id: 'CMP-002', user: 'Kidus Pharmacy', type: 'Pharmacy', target: 'System', subject: 'Payment not received', description: 'Sample row (offline demo).', status: 'Open', priority: 'Medium', date: '1 day ago' },
  { id: 'CMP-003', user: 'Sara M.', type: 'Patient', target: 'Delivery topic (text)', subject: 'Rude behavior report', description: 'Sample resolved row.', status: 'Resolved', priority: 'Low', date: '3 days ago' },
];

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

  const { language } = useLanguage();
const t = TRANSLATIONS[language];

  const filteredComplaints = complaints.filter((complaint) => {
    const query = searchTerm.toLowerCase();
    const searchMatch = !query || 
      complaint.id.toLowerCase().includes(query) ||
      complaint.user.toLowerCase().includes(query) ||
      complaint.subject.toLowerCase().includes(query);

    const isStatusAll = statusFilter === 'All Statuses' || statusFilter === t.allStatuses;
    const statusMatch =
      isStatusAll ||
      complaint.status === statusFilter ||
      (language === 'am' && statusFilter === t.open && complaint.status === 'Open') ||
      (language === 'am' && statusFilter === t.resolved && complaint.status === 'Resolved') ||
      (language === 'am' && statusFilter === t.dismissed && complaint.status === 'Dismissed');

    return searchMatch && statusMatch;
  });

  const translateStatus = (status: string) => {
    switch (status) {
      case 'Open':
        return t.open;
      case 'Resolved':
        return t.resolved;
      case 'Dismissed':
        return t.dismissed;
      default:
        return status;
    }
  };

  const handleReviewComplaint = (id: string, currentStatus: string) => {
    const complaintToReview = complaints.find(c => c.id === id);
    if (complaintToReview) {
      setSelectedComplaint(complaintToReview);
    }
  };

  const updateComplaintStatus = async (displayId: string, newStatus: string) => {
    const statusMap: Record<string, 'open' | 'resolved' | 'dismissed'> = {
      Open: 'open',
      Resolved: 'resolved',
      Dismissed: 'dismissed',
    };

    const apiStatus = statusMap[newStatus] ?? 'open';
    const row = complaints.find((c) => c.id === displayId);

    const applyLocal = () => {
      setComplaints((prev) => prev.map((c) => (c.id === displayId ? { ...c, status: newStatus } : c)));
      setSelectedComplaint((prev: any) => (prev && prev.id === displayId ? { ...prev, status: newStatus } : prev));
    };

    // Demo rows (INITIAL_COMPLAINTS) have no mongoId — nothing in DB for CMP-001; skip API to avoid 404 noise.
    if (!row?.mongoId) {
      applyLocal();
      return;
    }

    try {
      await adminApi.updateComplaint(row.mongoId, apiStatus);
      applyLocal();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const data = await adminApi.getComplaints();
        const mapped = data.map((complaint: any) => {
          const rr = complaint.reporterRole as string | undefined;
          const reporterType =
            rr === 'pharmacy' ? 'Pharmacy' : rr === 'patient' ? 'Patient' : 'Unknown';

          let displayStatus: string;
          if (complaint.status === 'resolved') displayStatus = 'Resolved';
          else if (complaint.status === 'dismissed') displayStatus = 'Dismissed';
          else displayStatus = 'Open';

          return {
            mongoId: String(complaint._id),
            id: complaint.ref || String(complaint._id),
            user: complaint.reporterName ?? 'Unknown',
            type: reporterType,
            target: complaint.targetName || complaint.targetType,
            subject: complaint.issue,
            description: complaint.details || '-',
            status: displayStatus,
            priority: complaint.severity === 'high' ? 'High' : complaint.severity === 'medium' ? 'Medium' : 'Low',
            date: complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : '-',
          };
        });
        setComplaints(mapped.length ? mapped : []);
      } catch (error) {
        console.error('Failed to load complaints', error);
      }
    };

    loadComplaints();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">{t.complaintsTitle}</h1>
          <p className="text-gray-500 text-sm">{t.complaintsSub}</p>
        </div>
</div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.openComplaints}</h3>
          <p className="text-3xl font-bold text-brand-950 flex items-center gap-2">
            {complaints.filter(c => c.status === 'Open').length} <AlertTriangle className="w-5 h-5 text-amber-500" />
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.dismissed}</h3>
          <p className="text-3xl font-bold text-brand-950">{complaints.filter((c) => c.status === 'Dismissed').length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">{t.resolvedThisWeek}</h3>
          <p className="text-3xl font-bold text-brand-950 flex items-center gap-2">
            {complaints.filter(c => c.status === 'Resolved').length} <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </p>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-accent-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div className="flex gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 text-brand-950 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All Statuses">{t.allStatuses}</option>
              <option value="Open">{t.open}</option>
              <option value="Resolved">{t.resolved}</option>
              <option value="Dismissed">{t.dismissed}</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-medium">{t.complaintId}</th>
                <th className="p-4 font-medium">{t.reporter}</th>
                <th className="p-4 font-medium">{t.subjectTarget}</th>
                <th className="p-4 font-medium">{t.priority}</th>
                <th className="p-4 font-medium">{t.status}</th>
                <th className="p-4 font-medium">{t.date}</th>
                <th className="p-4 font-medium text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-accent-50/50 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-brand-950 text-sm">{complaint.id}</span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-gray-900">{complaint.user}</p>
                    <p className="text-xs text-gray-500">{complaint.type}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-900">{complaint.subject}</p>
                    <p className="text-xs text-gray-500">Target: {complaint.target}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      complaint.priority === 'High' ? 'bg-red-50 text-red-700' :
                      complaint.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      complaint.status === 'Open' ? 'bg-blue-50 text-blue-700' :
                      complaint.status === 'Dismissed' ? 'bg-gray-100 text-gray-600' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {translateStatus(complaint.status)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{complaint.date}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleReviewComplaint(complaint.id, complaint.status)}
                      className="text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {t.review}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredComplaints.length === 0 && (
                <tr>
                   <td colSpan={7} className="p-8 text-center text-gray-500 bg-white">
                      {t.noComplaintsFound}
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Review Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-gray-900">{t.complaintDetails}</h2>
                  <p className="text-sm text-gray-500">ID: {selectedComplaint.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t.reporter}</p>
                  <p className="font-bold text-gray-900">{selectedComplaint.user}</p>
                  <p className="text-xs text-gray-500">{selectedComplaint.type}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t.subjectTarget}</p>
                  <p className="font-medium text-gray-900">{selectedComplaint.target}</p>
                  <p className="text-sm text-gray-600 truncate">{selectedComplaint.subject}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t.priority}</p>
                  <span className={`px-2.5 py-1 inline-block rounded-md text-xs font-bold uppercase tracking-wider ${selectedComplaint.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100' : selectedComplaint.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>{selectedComplaint.priority}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t.status}</p>
                  <span className={`px-2.5 py-1 inline-block rounded-md text-xs font-bold uppercase tracking-wider ${
                      selectedComplaint.status === 'Open'
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : selectedComplaint.status === 'Dismissed'
                          ? 'bg-gray-100 text-gray-700 border border-gray-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}
                  >
                    {translateStatus(selectedComplaint.status)}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm font-bold text-gray-900 mb-2">{t.description}</p>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedComplaint.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="px-6 py-3 rounded-xl font-bold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors sm:w-auto w-full order-last sm:order-first"
                >
                  {t.close}
                </button>
                <div className="flex-1 flex flex-col sm:flex-row justify-end gap-3">
                  {selectedComplaint.status === 'Open' && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateComplaintStatus(selectedComplaint.id, 'Dismissed')}
                        className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors border border-gray-200 sm:w-auto w-full"
                      >
                        {t.markDismiss}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateComplaintStatus(selectedComplaint.id, 'Resolved')}
                        className="px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors sm:w-auto w-full"
                      >
                        {t.markResolved}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

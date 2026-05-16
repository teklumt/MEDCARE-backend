'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Send, CheckCircle2, AlertTriangle, FileText, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getMyComplaints, submitComplaint, type ComplaintRecord } from '@/lib/api';

function formatComplaintHistoryDate(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

function historyStatusBadge(
  status: ComplaintRecord['status'],
  t: (key: string) => string,
): { label: string; accent: string; icon: typeof CheckCircle2 | typeof AlertTriangle } {
  if (status === 'resolved')
    return { label: t('complaints.status.resolved'), accent: 'bg-emerald-50 text-emerald-600 border border-emerald-100', icon: CheckCircle2 };
  if (status === 'dismissed')
    return { label: 'Dismissed', accent: 'bg-gray-50 text-gray-600 border border-gray-200', icon: AlertTriangle };
  return { label: t('complaints.status.inProgress'), accent: 'bg-amber-50 text-amber-600 border border-amber-100', icon: AlertTriangle };
}

export default function PharmacySupportPage() {
  const { t, language, setLanguage } = useLanguage();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState<ComplaintRecord[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const toggleLanguage = (lang: 'en' | 'am') => {
    setLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  const loadHistory = useCallback(async () => {
    setHistoryError(null);
    setHistoryLoading(true);
    try {
      const rows = await getMyComplaints();
      setHistory(rows);
    } catch {
      setHistoryError('Could not load your complaints. Try again later.');
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const trimmedTarget = target.trim();
      await submitComplaint({
        issue: subject.trim(),
        details: description.trim(),
        severity: 'low',
        targetType: trimmedTarget ? 'pharmacy' : 'system',
        targetName: trimmedTarget || undefined,
      });
      setIsSubmitted(true);
      setSubject('');
      setDescription('');
      setTarget('');
      await loadHistory();
      setTimeout(() => setIsSubmitted(false), 2800);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const historyRows = useMemo(() => [...history].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  }), [history]);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">{t('complaints.title')}</h1>
          <p className="text-gray-500 text-sm">{t('complaints.subtitle')}</p>
        </div>
        <div className="flex items-center">
          <div className="relative z-50">
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-gray-900">{language === 'en' ? 'EN' : 'አማ'}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <button
                  type="button"
                  onClick={() => toggleLanguage('en')}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-emerald-50 transition-colors ${language === 'en' ? 'text-emerald-600 bg-emerald-50/50' : 'text-gray-700'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => toggleLanguage('am')}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-emerald-50 transition-colors ${language === 'am' ? 'text-emerald-600 bg-emerald-50/50' : 'text-gray-700'}`}
                >
                  አማርኛ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 relative overflow-hidden">
            <AnimatePresence>
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">{t('complaints.success')}</h2>
                  <p className="text-gray-500 max-w-sm text-sm">Thank you—we will review your report.</p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-600" /> {t('complaints.new')}
            </h2>

            {submitError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  {t('complaints.subject')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  disabled={submitting}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm font-medium disabled:opacity-60"
                  placeholder="E.g. Platform payout or patient issue"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  {t('complaints.target')} <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={target}
                  disabled={submitting}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm font-medium disabled:opacity-60"
                  placeholder="Another pharmacy or vendor name—leave blank for platform/system"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  {t('complaints.description')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  disabled={submitting}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm resize-none font-medium disabled:opacity-60"
                  placeholder="Please provide details about your issue..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
                >
                  <Send className="w-5 h-5" /> {submitting ? '…' : t('complaints.submit')}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> {t('complaints.history')}
            </h3>

            {historyLoading && <p className="text-sm text-gray-500">Loading…</p>}
            {historyError && <p className="text-sm text-red-600">{historyError}</p>}
            {!historyLoading && !historyError && historyRows.length === 0 && (
              <p className="text-sm text-gray-500">{t('complaints.empty')}</p>
            )}

            <div className="space-y-4">
              {historyRows.map((item) => {
                const badge = historyStatusBadge(item.status, t);
                const BadgeIcon = badge.icon;
                return (
                  <div key={item._id} className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow group bg-gray-50 hover:bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-400">{item.ref ?? item._id.slice(-8).toUpperCase()}</span>
                      <span className={`px-2 py-1 flex items-center gap-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${badge.accent}`}>
                        <BadgeIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-gray-900 mb-1 leading-snug group-hover:text-emerald-700 transition-colors">{item.issue}</p>
                    <p className="text-xs text-gray-500 font-medium">{formatComplaintHistoryDate(item.createdAt)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

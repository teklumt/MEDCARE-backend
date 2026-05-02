'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Send, CheckCircle2, AlertTriangle, FileText, Globe, ChevronDown } from 'lucide-react';
import DashboardNavbar from '@/components/DashboardNavbar';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function SupportPage() {
  const { t, language, setLanguage } = useLanguage();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const toggleLanguage = (lang: 'en' | 'am') => {
    setLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  const [history] = useState([
    { id: 'CMP-042', subject: 'Late Medication Delivery', status: 'Resolved', date: 'Oct 12, 2023' },
    { id: 'CMP-089', subject: 'System Error on Checkout', status: 'In Progress', date: '2 days ago' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && description) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setSubject('');
        setDescription('');
        setTarget('');
      }, 3000);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
      <DashboardNavbar />
      
      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="flex justify-between items-end mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-950 mb-2">{t('complaints.title')}</h1>
            <p className="text-gray-500 font-medium">{t('complaints.subtitle')}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-brand-100 relative overflow-hidden">
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
                    <h2 className="text-2xl font-serif font-bold text-brand-950 mb-2">{t('complaints.success')}</h2>
                    <p className="text-gray-500 max-w-sm">{t('complaints.empty')}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-brand-600" /> {t('complaints.new')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    {t('complaints.subject')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all text-sm font-medium"
                    placeholder="E.g. Delivery agent issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    {t('complaints.target')} <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <input 
                    type="text" 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all text-sm font-medium"
                    placeholder="E.g. Selam Pharmacy Bole"
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
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all text-sm resize-none font-medium"
                    placeholder="Please provide details about your issue..."
                  ></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    className="bg-brand-900 hover:bg-brand-800 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Send className="w-5 h-5" /> {t('complaints.submit')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* History Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-brand-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" /> {t('complaints.history')}
              </h3>
              
              <div className="space-y-4">
                {history.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer bg-gray-50 hover:bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-400">{item.id}</span>
                      <span className={`px-2 py-1 flex items-center gap-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                        item.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {item.status === 'Resolved' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'In Progress' && <AlertTriangle className="w-3 h-3" />}
                        {item.status === 'Resolved' ? t('complaints.status.resolved') : t('complaints.status.inProgress')}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-gray-900 mb-1 leading-snug group-hover:text-brand-700 transition-colors">{item.subject}</p>
                    <p className="text-xs text-gray-500 font-medium">{item.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

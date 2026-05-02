'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Send, CheckCircle2, AlertTriangle, FileText, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PharmacySupportPage() {
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
    { id: 'CMP-091', subject: 'Payment Delay from Platform', status: 'In Progress', date: 'Oct 15, 2023' },
    { id: 'CMP-102', subject: 'Delivery Agent No-show', status: 'Resolved', date: 'Oct 18, 2023' }
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
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">{t('complaints.title')}</h1>
          <p className="text-gray-500 text-sm">{t('complaints.subtitle')}</p>
        </div>
        <div className="flex items-center">
          <div className="relative z-50">
            <button 
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
                  onClick={() => toggleLanguage('en')}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-emerald-50 transition-colors ${language === 'en' ? 'text-emerald-600 bg-emerald-50/50' : 'text-gray-700'}`}
                >
                  English
                </button>
                <button 
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
        {/* Form Column */}
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
                  <p className="text-gray-500 max-w-sm">{t('complaints.empty')}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-600" /> {t('complaints.new')}
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm font-medium"
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm font-medium"
                  placeholder="E.g. System or Delivery Company"
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm resize-none font-medium"
                  placeholder="Please provide details about your issue..."
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
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
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> {t('complaints.history')}
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
                  <p className="font-bold text-sm text-gray-900 mb-1 leading-snug group-hover:text-emerald-700 transition-colors">{item.subject}</p>
                  <p className="text-xs text-gray-500 font-medium">{item.date}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

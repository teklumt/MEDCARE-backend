'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Info, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface AlertProps {
  disease: string;
  region: string;
  message: string;
  details?: string;
  youtubeLink?: string;
}

export default function DismissibleAlert({ disease, region, message, details, youtubeLink }: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const { t } = useLanguage();

  const handleDismiss = () => {
    setIsVisible(false);
    const storedAlert = localStorage.getItem('medcare_broadcast_alert');
    if (storedAlert) {
      try {
        const parsed = JSON.parse(storedAlert);
        parsed.active = false;
        localStorage.setItem('medcare_broadcast_alert', JSON.stringify(parsed));
      } catch (e) {}
    }
  };

  if (!isVisible) return null;

  const hasExtendedInfo = !!(details?.trim() || youtubeLink?.trim());

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        className="bg-red-50 border border-red-100 rounded-3xl p-4 md:p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm relative overflow-hidden mb-6"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
        <div className="flex gap-4 items-start pl-2 w-full md:w-auto flex-1">
          <div className="w-12 h-12 bg-white text-red-600 rounded-2xl shadow-sm border border-red-100 flex items-center justify-center flex-shrink-0 mt-1 md:mt-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-heading font-bold text-red-900 text-lg">
                {disease}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-red-200 text-red-800 text-xs font-bold uppercase tracking-wider">
                {region}
              </span>
            </div>
            <p className="text-red-800 text-sm md:text-base leading-relaxed max-w-3xl">
              {message}
            </p>

            <AnimatePresence>
              {showDetails && hasExtendedInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t border-red-200">
                    {details && (
                      <p className="text-red-800 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                        {details}
                      </p>
                    )}
                    {youtubeLink && (
                      <a 
                        href={youtubeLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-red-700 bg-red-100/50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors border border-red-200/50"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Watch Broadcast Video
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto pl-16 md:pl-0 self-start md:self-center shrink-0">
          {hasExtendedInfo && (
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 md:flex-none bg-white text-red-700 hover:bg-red-50 border border-red-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Info className="w-4 h-4" /> {showDetails ? 'Hide Details' : t('alert.details')}
            </button>
          )}
          <button 
            onClick={handleDismiss}
            className="p-2.5 text-red-400 hover:text-red-700 hover:bg-red-100 rounded-xl transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

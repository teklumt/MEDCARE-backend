'use client';

import { motion } from 'motion/react';
import { Bot, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AIAssistantCard() {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gradient-to-br from-brand-900 to-brand-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-brand-900/20"
    >
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 rounded-full bg-brand-400/20 blur-xl"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl">{t('aiCard.title')}</h3>
            <p className="text-brand-200 text-sm font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {t('aiCard.poweredBy')}
            </p>
          </div>
        </div>

        <p className="text-brand-50 leading-relaxed mb-8">
          {t('aiCard.desc')}
        </p>

        <div className="space-y-3 mb-8">
          <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between group">
            {t('aiCard.prompt1')}
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>
          <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between group">
            {t('aiCard.prompt2')}
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>
        </div>

        <Link href="/dashboard/health-assistant" className="block w-full bg-white text-brand-900 hover:bg-brand-50 py-3.5 rounded-xl font-bold text-center transition-colors shadow-sm">
          {t('aiCard.start')}
        </Link>
      </div>
    </motion.div>
  );
}

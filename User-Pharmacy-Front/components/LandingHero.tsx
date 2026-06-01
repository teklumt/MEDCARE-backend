'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown, Download, Share } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useInstallPrompt } from '@/lib/hooks/useInstallPrompt';

export default function LandingHero() {
  const { t } = useLanguage();
  const { canInstall, isIOS, install } = useInstallPrompt();

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-32 overflow-hidden bg-accent-50">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-100/50 blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent-200/30 blur-3xl opacity-60"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-brand-950 tracking-tight leading-[1.1] mb-8"
          dangerouslySetInnerHTML={{ __html: t('hero.title') }}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/signup"
            className="w-full sm:w-auto bg-brand-900 hover:bg-brand-800 text-white px-8 py-4 rounded-full font-medium text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            {t('hero.getStarted')}
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto bg-white hover:bg-gray-50 text-brand-900 border border-brand-200 px-8 py-4 rounded-full font-medium text-lg transition-all shadow-sm"
          >
            {t('hero.learnMore')}
          </a>

          {/* Install App — mobile only, visible when browser deems app installable */}
          <AnimatePresence>
            {canInstall && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="w-full sm:hidden"
              >
                {isIOS ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-5 py-4 shadow-sm">
                    <Share className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>
                      Tap <strong>Share</strong> then <strong>&ldquo;Add to Home Screen&rdquo;</strong>
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={install}
                    className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white px-8 py-4 rounded-full font-medium text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Download className="w-5 h-5" />
                    Install App
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bouncing Arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.a
          href="#story"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white/50 backdrop-blur-sm border border-brand-100 text-brand-700 hover:bg-white hover:text-brand-900 transition-colors"
        >
          <ArrowDown className="w-6 h-6" />
        </motion.a>
      </motion.div>
    </section>
  );
}

'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LandingFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-900 rounded-full flex items-center justify-center">
            <span className="text-white font-serif font-bold text-sm">M</span>
          </div>
          <span className="font-heading font-bold text-lg text-brand-900 tracking-tight">
            MED-CARE Ethiopia
          </span>
        </div>
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} MED-CARE Ethiopia. {t('footer.rights')}
        </p>
        <div className="flex gap-6 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-brand-900 transition-colors">
            {t('footer.privacy')}
          </a>
          <a href="#" className="hover:text-brand-900 transition-colors">
            {t('footer.terms')}
          </a>
          <a href="#" className="hover:text-brand-900 transition-colors">
            {t('footer.contact')}
          </a>
        </div>
      </div>
    </footer>
  );
}

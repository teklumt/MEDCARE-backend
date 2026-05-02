'use client';

import Navbar from '@/components/Navbar';
import LandingHero from '@/components/LandingHero';
import FeatureStory from '@/components/FeatureStory';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <main className="min-h-screen flex flex-col bg-accent-50">
      <Navbar />
      <div className="flex-1">
        <LandingHero />
        <FeatureStory />
        
        {/* Call to Action Section */}
        <section className="py-32 bg-brand-950 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl md:text-6xl font-serif mb-8 leading-tight" dangerouslySetInnerHTML={{ __html: t('cta.title') }}>
            </h2>
            <p className="text-xl text-brand-200 mb-12 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer */}
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
            <a href="#" className="hover:text-brand-900 transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-brand-900 transition-colors">{t('footer.terms')}</a>
            <a href="#" className="hover:text-brand-900 transition-colors">{t('footer.contact')}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}


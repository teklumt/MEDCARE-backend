'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LandingHero from '@/components/LandingHero';
import FeatureStory from '@/components/FeatureStory';
import PharmacyPartnerSection from '@/components/PharmacyPartnerSection';
import LandingFooter from '@/components/LandingFooter';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  useEffect(() => {
    const scrollIfHash = () => {
      if (typeof window === 'undefined') return;
      if (window.location.hash !== '#for-pharmacies') return;
      document.getElementById('for-pharmacies')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    scrollIfHash();
    window.addEventListener('hashchange', scrollIfHash);
    return () => window.removeEventListener('hashchange', scrollIfHash);
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-accent-50">
      <Navbar />
      <div className="flex-1">
        <LandingHero />
        <FeatureStory />

        <PharmacyPartnerSection />

        {/* Call to Action Section */}
        <section className="py-32 bg-brand-950 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className="text-5xl md:text-6xl font-serif mb-8 leading-tight"
              dangerouslySetInnerHTML={{ __html: t('cta.title') }}
            ></h2>
            <p className="text-xl text-brand-200 mb-12 max-w-2xl mx-auto">{t('cta.subtitle')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4"></div>
          </div>
        </section>
      </div>

      <LandingFooter />
    </main>
  );
}


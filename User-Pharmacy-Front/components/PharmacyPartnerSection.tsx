'use client';

import Link from 'next/link';
import { ClipboardList, PackageSearch, Truck, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const BULLET_KEYS = [
  'landing.pharmacies.orders',
  'landing.pharmacies.inventory',
  'landing.pharmacies.delivery',
  'landing.pharmacies.messages',
] as const;

const ICONS = [ClipboardList, PackageSearch, Truck, MessageSquare];

export default function PharmacyPartnerSection() {
  const { t } = useLanguage();

  return (
    <section
      id="for-pharmacies"
      className="bg-white py-24 border-t border-gray-100 scroll-mt-24"
      aria-labelledby="for-pharmacies-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto md:mx-0 md:max-w-4xl">
          <h2
            id="for-pharmacies-heading"
            className="text-4xl md:text-5xl font-serif font-bold text-brand-950 mb-6 text-center md:text-left leading-tight"
          >
            {t('landing.pharmacies.title')}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-12 text-center md:text-left">
            {t('landing.pharmacies.intro')}
          </p>
          <ul className="space-y-8 mb-12">
            {BULLET_KEYS.map((key, i) => {
              const Icon = ICONS[i];
              return (
                <li key={key} className="flex gap-5 items-start">
                  <span className="mt-0.5 shrink-0 w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shadow-sm border border-brand-50">
                    <Icon className="w-7 h-7" aria-hidden />
                  </span>
                  <span className="text-lg text-gray-600 leading-relaxed pt-2">{t(key)}</span>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/signup"
              className="inline-flex justify-center items-center bg-brand-900 hover:bg-brand-800 text-white px-8 py-4 rounded-full font-medium text-lg transition-colors shadow-sm hover:shadow-md"
            >
              {t('landing.pharmacies.cta')}
            </Link>
            <Link
              href="/login"
              className="inline-flex justify-center items-center bg-white border border-brand-200 text-brand-900 hover:bg-brand-50 px-8 py-4 rounded-full font-medium text-lg transition-colors shadow-sm"
            >
              {t('landing.pharmacies.login')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

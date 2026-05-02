'use client';

import { motion } from 'motion/react';
import { MapPin, Star, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type PharmacyCard = {
  id: string;
  name: string;
  distance: string;
  rating: number;
  reviews: number;
  status: 'open' | 'closed';
  availability: 'high' | 'medium' | 'low';
};

const pharmacies: PharmacyCard[] = [];

export default function NearbyPharmacies() {
  const { t } = useLanguage();
  const [nearby, setNearby] = useState<PharmacyCard[]>(pharmacies);

  useEffect(() => {
    const loadPharmacies = async () => {
      try {
        const response = await apiGet<any[]>('/pharmacies');
        const mapped = (response.data || []).map((pharmacy: any) => {
          const rating = pharmacy.stats?.rating || 0;
          const availability = (rating >= 4.5 ? 'high' : rating >= 4 ? 'medium' : 'low') as 'high' | 'medium' | 'low';

          return {
            id: pharmacy._id,
            name: pharmacy.businessName,
            distance: pharmacy.location || 'Nearby',
            rating,
            reviews: pharmacy.stats?.reviewCount || 0,
            status: (pharmacy.isOpen ? 'open' : 'closed') as 'open' | 'closed',
            availability
          };
        });
        setNearby(mapped);
      } catch (error) {
        console.error(error);
      }
    };

    loadPharmacies();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-brand-100 p-6 md:p-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-serif font-bold text-brand-950 mb-1">{t('nearby.title')}</h2>
          <p className="text-sm text-gray-500 font-medium">{t('nearby.subtitle')}</p>
        </div>
        <Link href="/dashboard/pharmacies" className="text-sm font-bold text-brand-700 hover:text-brand-800 transition-colors flex items-center">
          {t('nearby.viewMap')} <ChevronRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>

      <div className="space-y-4">
        {nearby.map((pharmacy, index) => (
          <motion.div
            key={pharmacy.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all gap-4 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                <MapPin className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{pharmacy.name}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {pharmacy.distance}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3 h-3 fill-current" /> {pharmacy.rating} ({pharmacy.reviews})
                  </span>
                  <span className={`flex items-center gap-1 ${pharmacy.status === 'open' ? 'text-emerald-600' : 'text-red-500'}`}>
                    <Clock className="w-3 h-3" /> {pharmacy.status === 'open' ? t('nearby.openNow') : t('nearby.closed')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pl-16 sm:pl-0">
              <div className="flex items-center gap-1.5">
                {pharmacy.availability === 'high' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {pharmacy.availability === 'medium' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                {pharmacy.availability === 'low' && <XCircle className="w-4 h-4 text-red-500" />}
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  pharmacy.availability === 'high' ? 'text-emerald-700' : 
                  pharmacy.availability === 'medium' ? 'text-amber-700' : 'text-red-700'
                }`}>
                  {pharmacy.availability === 'high' ? t('nearby.stockHigh') : 
                   pharmacy.availability === 'medium' ? t('nearby.stockMedium') : t('nearby.stockLow')}
                </span>
              </div>
              <button className="text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors">
                {t('nearby.order')}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

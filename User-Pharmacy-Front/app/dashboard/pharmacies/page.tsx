'use client';

import DashboardNavbar from '@/components/DashboardNavbar';
import DashboardSearch from '@/components/dashboard/DashboardSearch';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Phone, Activity, ChevronRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Mock Data
const nearbyPharmacies = [
  { id: 'p1', name: 'Kenema Pharmacy #4', address: 'Bole Road, near Dembel', service: '24/7 Pharmacy', rating: 4.8, phone: '+251 11 551 1211', image: 'https://picsum.photos/seed/kenema/400/300', status: 'open', availability: 'high', distance: '0.8 km' },
  { id: 'p2', name: 'Lion International Pharmacy', address: 'Africa Avenue', service: 'Retail Pharmacy', rating: 4.5, phone: '+251 11 275 0122', image: 'https://picsum.photos/seed/lion/400/300', status: 'open', availability: 'medium', distance: '1.2 km' },
  { id: 'p3', name: 'Addis Health Pharmacy', address: 'Megenagna', service: 'Retail Pharmacy', rating: 4.2, phone: '+251 11 629 5421', image: 'https://picsum.photos/seed/addis/400/300', status: 'closed', availability: 'low', distance: '2.5 km' },
  { id: 'p4', name: 'Cure Well Pharmacy', address: 'Piassa', service: 'Retail Pharmacy', rating: 4.6, phone: '+251 11 667 2384', image: 'https://picsum.photos/seed/cure/400/300', status: 'open', availability: 'high', distance: '3.1 km' },
];

function PharmacyCard({ pharmacy }: { pharmacy: any }) {
  const { t } = useLanguage();

  return (
    <Link href={`/dashboard/pharmacies/${pharmacy.id}`} className="min-w-[300px] sm:min-w-[340px] snap-start group">
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-300 h-full flex flex-col">
        <div className="relative h-44 w-full overflow-hidden bg-gray-100">
          <Image 
            src={pharmacy.image} 
            alt={pharmacy.name} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span className="text-xs font-bold text-gray-900">{pharmacy.rating}</span>
          </div>
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${pharmacy.status === 'open' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">{pharmacy.status === 'open' ? t('nearby.openNow') : t('nearby.closed')}</span>
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-wider">
              {pharmacy.service}
            </span>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">
              {pharmacy.distance}
            </span>
          </div>
          
          <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-brand-700 transition-colors line-clamp-1">
            {pharmacy.name}
          </h3>
          
          <div className="space-y-2 mt-auto mb-4">
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{pharmacy.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{pharmacy.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {pharmacy.availability === 'high' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              {pharmacy.availability === 'medium' && <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />}
              {pharmacy.availability === 'low' && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
              <span className={`font-bold uppercase tracking-wider text-[10px] ${
                pharmacy.availability === 'high' ? 'text-emerald-700' : 
                pharmacy.availability === 'medium' ? 'text-amber-700' : 'text-red-700'
              }`}>
                {t('findPharmacies.stockAvailability').replace('{availability}', 
                  pharmacy.availability === 'high' ? t('nearby.stockHigh') : 
                  pharmacy.availability === 'medium' ? t('nearby.stockMedium') : t('nearby.stockLow')
                )}
              </span>
            </div>
          </div>

          <button className="w-full bg-brand-900 hover:bg-brand-800 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm mt-auto">
            {t('findPharmacies.orderMedication')}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function PharmaciesPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
      <DashboardNavbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-serif text-brand-950 mb-2">{t('findPharmacies.title')}</h1>
          <p className="text-gray-500 font-medium">{t('findPharmacies.subtitle')}</p>
        </div>
        
        <div className="mb-12">
          <DashboardSearch hideImageSearch={true} />
        </div>

        {/* Nearby Pharmacies Section */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900">{t('nearby.title')}</h2>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-700 hover:border-brand-200 transition-colors">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-700 hover:border-brand-200 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 sm:gap-6 snap-x snap-mandatory scrollbar-hide">
            {nearbyPharmacies.map((pharmacy, index) => (
              <motion.div 
                key={pharmacy.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <PharmacyCard pharmacy={pharmacy} />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

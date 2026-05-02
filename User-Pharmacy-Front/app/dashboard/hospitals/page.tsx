'use client';

import DashboardNavbar from '@/components/DashboardNavbar';
import DashboardSearch from '@/components/dashboard/DashboardSearch';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Phone, Activity, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Mock Data
const getHospitalsNearYou = (t: (key: string) => string) => [
  { id: 'h1', name: t('hospital.h1.name'), address: t('hospital.h1.address'), service: t('hospital.service.general'), rating: 4.2, phone: '+251 11 551 1211', image: 'https://picsum.photos/seed/blacklion/400/300' },
  { id: 'h2', name: t('hospital.h2.name'), address: t('hospital.h2.address'), service: t('hospital.service.general'), rating: 4.5, phone: '+251 11 275 0122', image: 'https://picsum.photos/seed/stpaul/400/300' },
  { id: 'h3', name: t('hospital.h3.name'), address: t('hospital.h3.address'), service: t('hospital.service.general'), rating: 4.8, phone: '+251 11 629 5421', image: 'https://picsum.photos/seed/mcm/400/300' },
  { id: 'h4', name: t('hospital.h4.name'), address: t('hospital.h4.address'), service: t('hospital.service.private'), rating: 4.7, phone: '+251 11 667 2384', image: 'https://picsum.photos/seed/nordic/400/300' },
];

function HospitalCard({ hospital }: { hospital: any }) {
  return (
    <Link href={`/dashboard/hospitals/${hospital.id}`} className="min-w-[280px] sm:min-w-[320px] snap-start group">
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-300 h-full flex flex-col">
        <div className="relative h-40 w-full overflow-hidden bg-gray-100">
          <Image 
            src={hospital.image} 
            alt={hospital.name} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span className="text-xs font-bold text-gray-900">{hospital.rating}</span>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-wider">
              {hospital.service}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-brand-700 transition-colors line-clamp-1">
            {hospital.name}
          </h3>
          <div className="space-y-2 mt-auto">
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{hospital.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{hospital.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HospitalsPage() {
  const { t } = useLanguage();

  const specialties = [
    {
      title: t('hospitals.pediatrics'),
      hospitals: [
        { id: 'p1', name: t('hospital.p1.name'), address: t('hospital.p1.address'), service: t('hospital.service.pediatrics'), rating: 4.6, phone: '+251 11 646 0000', image: 'https://picsum.photos/seed/ped1/400/300' },
        { id: 'p2', name: t('hospital.p2.name'), address: t('hospital.p2.address'), service: t('hospital.service.pediatrics'), rating: 4.1, phone: '+251 11 155 3222', image: 'https://picsum.photos/seed/ped2/400/300' },
        { id: 'p3', name: t('hospital.p3.name'), address: t('hospital.p3.address'), service: t('hospital.service.pediatrics'), rating: 4.0, phone: '+251 11 551 5888', image: 'https://picsum.photos/seed/ped3/400/300' },
      ]
    },
    {
      title: t('hospitals.cardiac'),
      hospitals: [
        { id: 'c1', name: t('hospital.c1.name'), address: t('hospital.c1.address'), service: t('hospital.service.cardiac'), rating: 4.9, phone: '+251 11 553 7474', image: 'https://picsum.photos/seed/cardiac1/400/300' },
        { id: 'c2', name: t('hospital.c2.name'), address: t('hospital.c2.address'), service: t('hospital.service.cardiac'), rating: 4.4, phone: '+251 11 552 5444', image: 'https://picsum.photos/seed/cardiac2/400/300' },
      ]
    },
    {
      title: t('hospitals.oncology'),
      hospitals: [
        { id: 'o1', name: t('hospital.o1.name'), address: t('hospital.o1.address'), service: t('hospital.service.oncology'), rating: 4.3, phone: '+251 11 551 1211', image: 'https://picsum.photos/seed/onc1/400/300' },
        { id: 'o2', name: t('hospital.o2.name'), address: t('hospital.o2.address'), service: t('hospital.service.oncology'), rating: 4.7, phone: '+251 11 661 0000', image: 'https://picsum.photos/seed/onc2/400/300' },
      ]
    }
  ];

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
      <DashboardNavbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-serif text-brand-950 mb-2">{t('hospitals.title')}</h1>
          <p className="text-gray-500 font-medium">{t('hospitals.subtitle')}</p>
        </div>
        
        <div className="mb-12">
          <DashboardSearch hideImageSearch={true} />
        </div>

        {/* Hospitals Near You Section */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900">{t('hospitals.nearYou')}</h2>
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
            {getHospitalsNearYou(t).map((hospital, index) => (
              <motion.div 
                key={hospital.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <HospitalCard hospital={hospital} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Specialties Sections */}
        {specialties.map((specialty, sectionIndex) => (
          <section key={specialty.title} className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900">{specialty.title}</h2>
            </div>
            
            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 sm:gap-6 snap-x snap-mandatory scrollbar-hide">
              {specialty.hospitals.map((hospital, index) => (
                <motion.div 
                  key={hospital.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <HospitalCard hospital={hospital} />
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

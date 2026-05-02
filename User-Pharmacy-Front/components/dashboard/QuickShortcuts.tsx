'use client';

import { motion } from 'motion/react';
import { Pill, Map, Stethoscope, Activity, MessageSquare, Star, Truck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function QuickShortcuts() {
  const { t } = useLanguage();

  const shortcuts = [
    {
      id: 'meds',
      title: t('quick.findMedication'),
      icon: Pill,
      color: 'bg-blue-50 text-blue-700',
      href: '/dashboard/search',
    },
    {
      id: 'pharmacies',
      title: t('quick.nearbyPharmacies'),
      icon: Map,
      color: 'bg-emerald-50 text-emerald-700',
      href: '/dashboard/pharmacies',
    },
    {
      id: 'hospitals',
      title: t('quick.findHospitals'),
      icon: Activity,
      color: 'bg-rose-50 text-rose-700',
      href: '/dashboard/hospitals',
    },
    {
      id: 'ai',
      title: t('quick.aiAssistant'),
      icon: Stethoscope,
      color: 'bg-purple-50 text-purple-700',
      href: '/dashboard/health-assistant',
    },
    {
      id: 'orders',
      title: t('quick.trackDelivery'),
      icon: Truck,
      color: 'bg-orange-50 text-orange-700',
      href: '/dashboard/orders',
    },
    {
      id: 'chat',
      title: t('quick.pharmacistChat'),
      icon: MessageSquare,
      color: 'bg-indigo-50 text-indigo-700',
      href: '/dashboard/messages',
    },
    {
      id: 'support',
      title: t('quick.complaints'),
      icon: Star,
      color: 'bg-amber-50 text-amber-700',
      href: '/dashboard/support',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {shortcuts.map((shortcut, index) => (
        <motion.div
          key={shortcut.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <Link href={shortcut.href} className="block h-full">
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-300 flex flex-col h-full group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${shortcut.color} transition-transform group-hover:scale-110`}>
                <shortcut.icon className="w-6 h-6" />
              </div>
              <h3 className="text-gray-900 font-bold text-sm md:text-base leading-tight mb-1 group-hover:text-brand-700 transition-colors">
                {shortcut.title}
              </h3>
              <div className="mt-auto pt-4 flex items-center text-xs font-bold text-gray-400 group-hover:text-brand-600 transition-colors uppercase tracking-wider">
                <span>{t('quick.access')}</span>
                <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

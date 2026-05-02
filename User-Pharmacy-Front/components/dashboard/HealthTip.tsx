'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sun, CloudRain, Thermometer, Droplets } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function HealthTip() {
  const { t } = useLanguage();
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      id: 1,
      title: t('healthTip.tip1.title'),
      message: t('healthTip.tip1.message'),
      icon: Droplets,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 2,
      title: t('healthTip.tip2.title'),
      message: t('healthTip.tip2.message'),
      icon: Sun,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      id: 3,
      title: t('healthTip.tip3.title'),
      message: t('healthTip.tip3.message'),
      icon: Thermometer,
      color: 'bg-rose-50 text-rose-600',
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [tips.length]);

  const tip = tips[currentTip];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl shadow-sm border border-brand-100 p-6 md:p-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -z-10 opacity-50"></div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tip.color}`}>
          <tip.icon className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-gray-900 text-lg">{t('healthTip.title')}</h3>
      </div>
      
      <motion.div
        key={tip.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <h4 className="font-bold text-brand-900 mb-2">{tip.title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          {tip.message}
        </p>
      </motion.div>

      <div className="flex gap-1.5 mt-6">
        {tips.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentTip(idx)}
            className={`h-1.5 rounded-full transition-all ${idx === currentTip ? 'w-6 bg-brand-600' : 'w-2 bg-gray-200 hover:bg-gray-300'}`}
            aria-label={`Go to tip ${idx + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

'use client';

import { motion } from 'motion/react';
import { Pill, Camera, MapPin, Stethoscope, Truck, ShieldCheck, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function FeatureStory() {
  const { t } = useLanguage();

  const features = [
    {
      id: 'search',
      title: t('story.search.title'),
      subtitle: t('story.search.subtitle'),
      description: t('story.search.desc'),
      icon: <MapPin className="w-8 h-8 text-brand-600" />,
      image: '/map.png',
      reverse: false,
    },
    {
      id: 'ocr',
      title: t('story.ocr.title'),
      subtitle: t('story.ocr.subtitle'),
      description: t('story.ocr.desc'),
      icon: <Camera className="w-8 h-8 text-brand-600" />,
      image: '/prescription.jpg',
      reverse: true,
    },
    {
      id: 'delivery',
      title: t('story.delivery.title'),
      subtitle: t('story.delivery.subtitle'),
      description: t('story.delivery.desc'),
      icon: <Truck className="w-8 h-8 text-brand-600" />,
      image: '/delivery.jpg',
      reverse: false,
    },
    {
      id: 'ai',
      title: t('story.ai.title'),
      subtitle: t('story.ai.subtitle'),
      description: t('story.ai.desc'),
      icon: <Stethoscope className="w-8 h-8 text-brand-600" />,
      image: '/AIchat.webp',
      reverse: true,
    },
    {
      id: 'pharmacist',
      title: t('story.pharmacist.title'),
      subtitle: t('story.pharmacist.subtitle'),
      description: t('story.pharmacist.desc'),
      icon: <MessageSquare className="w-8 h-8 text-brand-600" />,
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      reverse: false,
    }
  ];

  return (
    <section id="story" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-serif text-brand-950 mb-6"
          >
            {t('story.header.title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600"
          >
            {t('story.header.subtitle')}
          </motion.p>
        </div>

        {/* Features List */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <div key={feature.id} className={`flex flex-col ${feature.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}>
              
              {/* Text Content */}
              <motion.div 
                initial={{ opacity: 0, x: feature.reverse ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 space-y-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-8">
                  {feature.icon}
                </div>
                <h4 className="text-brand-600 font-semibold tracking-wide uppercase text-sm">
                  {feature.subtitle}
                </h4>
                <h3 className="text-4xl md:text-5xl font-serif text-brand-950 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>

              {/* Visual/Image Placeholder */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="flex-1 w-full"
              >
                <div className="aspect-square md:aspect-[4/3] rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-brand-900/5 border border-brand-50">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle gradient overlay to ensure the image blends nicely */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/10 to-transparent mix-blend-multiply"></div>
                </div>
              </motion.div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

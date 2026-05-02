'use client';

import { motion } from 'motion/react';
import { Stethoscope, Pill, Map, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    title: 'AI Symptom Checker',
    description: 'Describe how you feel and get instant triage advice and recommendations.',
    icon: <Stethoscope className="w-6 h-6" />,
    color: 'bg-blue-50 text-blue-700',
    hoverColor: 'hover:bg-blue-100',
    link: '/health-assistant',
    colSpan: 'md:col-span-2 lg:col-span-2',
  },
  {
    title: 'Track Orders',
    description: 'View real-time status of your medication deliveries.',
    icon: <Activity className="w-6 h-6" />,
    color: 'bg-orange-50 text-orange-700',
    hoverColor: 'hover:bg-orange-100',
    link: '/orders',
    colSpan: 'md:col-span-1 lg:col-span-1',
  },
  {
    title: 'Pharmacy Map',
    description: 'Find nearby verified pharmacies and their operating hours.',
    icon: <Map className="w-6 h-6" />,
    color: 'bg-emerald-50 text-emerald-700',
    hoverColor: 'hover:bg-emerald-100',
    link: '/pharmacies',
    colSpan: 'md:col-span-1 lg:col-span-1',
  },
  {
    title: 'Medication Guide',
    description: 'Learn about dosages, side effects, and interactions.',
    icon: <Pill className="w-6 h-6" />,
    color: 'bg-purple-50 text-purple-700',
    hoverColor: 'hover:bg-purple-100',
    link: '/medications',
    colSpan: 'md:col-span-2 lg:col-span-2',
  },
];

export default function QuickActions() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">Quick Access</h2>
            <p className="text-gray-600">Everything you need to manage your healthcare.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`group ${action.colSpan}`}
            >
              <Link href={action.link} className="block h-full">
                <div className="h-full p-6 md:p-8 rounded-3xl border border-gray-100 bg-white hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 flex flex-col">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${action.color} ${action.hoverColor} transition-colors`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-2 group-hover:text-brand-700 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 mb-6 flex-grow">
                    {action.description}
                  </p>
                  <div className="flex items-center text-sm font-medium text-brand-700 mt-auto">
                    <span>Get started</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

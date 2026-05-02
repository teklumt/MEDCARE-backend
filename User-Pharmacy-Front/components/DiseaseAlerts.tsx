'use client';

import { motion } from 'motion/react';
import { AlertTriangle, ChevronRight, Info } from 'lucide-react';

const alerts = [
  {
    id: 1,
    disease: 'Malaria Outbreak',
    region: 'Amhara Region (Bahir Dar)',
    severity: 'high',
    date: 'Updated 2 hours ago',
    message: 'Increased cases reported. Ensure use of mosquito nets and seek immediate testing if fever develops.',
  },
];

export default function DiseaseAlerts() {
  if (alerts.length === 0) return null;

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-100 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
        >
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 md:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-heading font-bold text-red-900 text-lg">
                  {alerts[0].disease}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-red-200 text-red-800 text-xs font-semibold uppercase tracking-wider">
                  Active Alert
                </span>
              </div>
              <p className="text-red-800 font-medium text-sm mb-1">
                {alerts[0].region} • {alerts[0].date}
              </p>
              <p className="text-red-700 text-sm">
                {alerts[0].message}
              </p>
            </div>
          </div>
          <button className="flex-shrink-0 w-full md:w-auto bg-white text-red-700 hover:bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Info className="w-4 h-4" /> View Details
          </button>
        </motion.div>
      </div>
    </section>
  );
}

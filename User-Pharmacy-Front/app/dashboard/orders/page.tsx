'use client';

import DashboardNavbar from '@/components/DashboardNavbar';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Package, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Mock data for orders list
const getMockOrders = (t: (key: string) => string) => [
  {
    id: 'ORD-84729',
    date: t('orders.date.1'),
    pharmacy: t('orders.pharmacy.1'),
    total: 350.00,
    status: 'active',
    items: 2,
    itemNames: [`${t('findMeds.gen.amoxicillin')} (${t('findMeds.med.amoxil')})`, `${t('findMeds.gen.acetaminophen')} (${t('findMeds.med.tylenol')})`],
  },
  {
    id: 'ORD-73618',
    date: t('orders.date.2'),
    pharmacy: t('orders.pharmacy.2'),
    total: 120.00,
    status: 'delivered',
    items: 1,
    itemNames: [`${t('findMeds.gen.ibuprofen')} (${t('findMeds.med.advil')})`],
  },
  {
    id: 'ORD-62507',
    date: t('orders.date.3'),
    pharmacy: t('orders.pharmacy.3'),
    total: 450.00,
    status: 'delivered',
    items: 3,
    itemNames: [`${t('findMeds.gen.lisinopril')} (${t('findMeds.med.prinivil')})`, `${t('findMeds.gen.atorvastatin')} (${t('findMeds.med.lipitor')})`, `${t('findMeds.gen.naproxen')} (${t('findMeds.med.aleve')})`],
  }
];

export default function OrdersPage() {
  const { t } = useLanguage();
  const mockOrders = getMockOrders(t);

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
      <DashboardNavbar />
      
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-brand-950 mb-2">{t('orders.title')}</h1>
          <p className="text-gray-500 font-medium">{t('orders.subtitle')}</p>
        </div>

        <div className="space-y-4">
          {mockOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link 
                href={`/dashboard/orders/${order.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-brand-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      order.status === 'active' ? 'bg-brand-50 text-brand-600' : 'bg-gray-50 text-gray-500'
                    }`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{order.id}</h3>
                      <p className="text-sm text-gray-500 mb-0.5">{order.date}</p>
                      <p className="text-sm font-medium text-gray-700">{order.itemNames.join(', ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">ETB {order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{order.items} {order.items === 1 ? t('orders.item') : t('orders.items')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    {order.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                        <Clock className="w-4 h-4" /> {t('orders.inProgress')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" /> {t('tracking.delivered')}
                      </span>
                    )}
                    <span className="text-sm text-gray-500 ml-2 hidden sm:inline-block">
                      {t('orders.from')} {order.pharmacy}
                    </span>
                  </div>
                  <div className="flex items-center text-brand-700 font-medium text-sm group-hover:text-brand-900 transition-colors">
                    {t('orders.viewDetails')} <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

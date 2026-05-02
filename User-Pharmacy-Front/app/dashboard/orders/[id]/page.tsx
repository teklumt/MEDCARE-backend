'use client';

import { useState, useEffect, use } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  Home, 
  MessageSquare, 
  Phone, 
  ChevronLeft, 
  MapPin, 
  Receipt,
  Map as MapIcon
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useLanguage();
  const { id } = use(params);
  const [currentStage, setCurrentStage] = useState(0);
  const [remainingTime, setRemainingTime] = useState(45); // minutes
  const [baseTime, setBaseTime] = useState<number | null>(null);

  const STAGES = [
    { id: 'received', title: 'Order Received', description: 'We have received your order.', icon: Receipt },
    { id: 'confirmed', title: 'Pharmacy Confirmed', description: 'Med-Care Central Pharmacy has confirmed your order.', icon: CheckCircle2 },
    { id: 'preparing', title: 'Preparing Order', description: 'Your items are being packed securely.', icon: Package },
    { id: 'delivery', title: 'Out for Delivery', description: 'Driver is on the way to your location.', icon: Truck },
    { id: 'delivered', title: 'Delivered', description: 'Order has been delivered successfully.', icon: Home },
  ];

  useEffect(() => {
    setBaseTime(Date.now());
  }, []);

  // Simulate dynamic progression of the order status
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
      
      setRemainingTime((prev) => {
        if (prev > 0) return prev - Math.floor(Math.random() * 5 + 5);
        return 0;
      });
    }, 8000); // Advance stage every 8 seconds for demonstration

    return () => clearInterval(timer);
  }, []);

  const isDelivered = currentStage === STAGES.length - 1;

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
      <DashboardNavbar />
      
      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link href="/dashboard/orders" className="inline-flex items-center text-brand-700 font-medium hover:text-brand-900 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> {t('tracking.backToOrders')}
          </Link>
          <div className="flex gap-3">
            <Link href="/dashboard/search" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
              {t('tracking.returnHome')}
            </Link>
          </div>
        </div>

        {/* Success Banner */}
        {currentStage === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-8 flex items-start gap-3"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-emerald-900 text-lg">{t('tracking.successTitle')}</h2>
              <p className="text-emerald-700 text-sm">{t('tracking.successDesc')}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Tracking & Timeline */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Estimate Card */}
            <div className="bg-brand-900 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="relative z-10">
                <h2 className="text-brand-200 font-medium mb-1">{t('tracking.orderNum').replace('{id}', id)}</h2>
                <div className="flex items-end gap-4 mb-6">
                  {isDelivered ? (
                    <div>
                      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">{t('tracking.delivered')}</h1>
                      <p className="text-brand-100 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> {t('tracking.arrivedSafely')}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">
                          {remainingTime > 0 ? t('tracking.min').replace('{time}', remainingTime.toString()) : t('tracking.arrivingSoon')}
                        </h1>
                        <p className="text-brand-100 flex items-center gap-2">
                          <Clock className="w-5 h-5" /> {t('tracking.estimatedArrival')}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-brand-950/50 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    className="h-full bg-brand-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-sm text-brand-200 text-right">
                  {t('tracking.stepsCompleted').replace('{current}', (currentStage + 1).toString()).replace('{total}', STAGES.length.toString())}
                </p>
              </div>
            </div>

            {/* Live Tracking Map Placeholder (Shows when out for delivery) */}
            {currentStage === 3 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-brand-600" /> {t('tracking.liveTracking')}
                  </h3>
                  <span className="text-xs font-bold bg-brand-100 text-brand-700 px-2 py-1 rounded-full animate-pulse">
                    {t('tracking.live')}
                  </span>
                </div>
                <div className="h-48 bg-gray-200 relative w-full">
                  {/* Placeholder for actual Google Map */}
                  <Image 
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" 
                    alt="Map Tracking" 
                    fill 
                    className="object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg font-bold text-brand-900 flex items-center gap-2">
                      <Truck className="w-5 h-5" /> {t('tracking.driverAway')}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Status Timeline */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <h3 className="font-serif font-bold text-xl text-gray-900 mb-8">{t('tracking.orderStatus')}</h3>
              
              <div className="relative border-l-2 border-gray-100 ml-5 space-y-8">
                {STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentStage;
                  const isActive = idx === currentStage;
                  const isPending = idx > currentStage;
                  
                  return (
                    <div key={stage.id} className="relative pl-8">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center transition-colors duration-500 ${
                        isCompleted ? 'bg-brand-500' : isActive ? 'bg-brand-100' : 'bg-gray-100'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-brand-600 animate-pulse' : 'bg-gray-300'}`} />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className={`transition-opacity duration-500 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <stage.icon className={`w-5 h-5 ${isCompleted || isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                          <h4 className={`font-bold text-lg ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                            {stage.title}
                          </h4>
                        </div>
                        <p className="text-gray-500 text-sm">{stage.description}</p>
                        
                        {/* Show timestamp for completed stages (mocked) */}
                        {isCompleted && baseTime && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(baseTime - (STAGES.length - idx) * 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Details & Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Pharmacy Contact Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Med-Care Central</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Bole, Addis Ababa
                </p>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-100 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-100 transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-serif font-bold text-xl text-gray-900 mb-6">{t('tracking.orderDetails')}</h3>
              
              <div className="space-y-4 mb-6">
                {/* Mock Items */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-xs shrink-0">
                      1x
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Tylenol Extra Strength</p>
                      <p className="text-xs text-gray-500">Acetaminophen 500mg</p>
                    </div>
                  </div>
                  <span className="font-medium text-gray-900 text-sm">ETB 150.00</span>
                </div>
                
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-xs shrink-0">
                      2x
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Amoxil</p>
                      <p className="text-xs text-gray-500">Amoxicillin 500mg</p>
                    </div>
                  </div>
                  <span className="font-medium text-gray-900 text-sm">ETB 200.00</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>{t('cart.subtotal').replace('{count}', '3')}</span>
                  <span>ETB 350.00</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{t('cart.deliveryFee')}</span>
                  <span>ETB 50.00</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-gray-900">{t('tracking.totalPaid')}</span>
                  <span className="font-bold text-brand-900 text-xl">ETB 400.00</span>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-gray-500">{t('cart.deliveryMethod')}</span>
                  <span className="font-bold text-gray-900">{t('cart.delivery')}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500">{t('tracking.payment')}</span>
                  <span className="font-bold text-gray-900">Telebirr</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

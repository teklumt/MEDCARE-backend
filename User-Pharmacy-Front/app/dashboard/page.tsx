'use client';

import { useState, useEffect } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import OfflineBanner from '@/components/dashboard/OfflineBanner';
import Greeting from '@/components/dashboard/Greeting';
import DismissibleAlert from '@/components/dashboard/DismissibleAlert';
import DashboardSearch from '@/components/dashboard/DashboardSearch';
import QuickShortcuts from '@/components/dashboard/QuickShortcuts';
import NearbyPharmacies from '@/components/dashboard/NearbyPharmacies';
import HealthTip from '@/components/dashboard/HealthTip';
import AIAssistantCard from '@/components/dashboard/AIAssistantCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [broadcastAlert, setBroadcastAlert] = useState<{type: string, region: string, message: string, details?: string, youtubeLink?: string} | null>(null);

  useEffect(() => {
    // Check for broadcasted alert
    const storedAlert = localStorage.getItem('medcare_broadcast_alert');
    if (storedAlert) {
      try {
        const parsed = JSON.parse(storedAlert);
        if (parsed && parsed.active) {
           setBroadcastAlert(parsed);
        }
      } catch (e) {
        console.error("Failed to parse alert", e);
      }
    }
  }, []);
  
  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
      <DashboardNavbar />
      <OfflineBanner />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <Greeting />
        
        {/* Conditional Disease Alert */}
        {broadcastAlert && (
          <DismissibleAlert 
            disease={broadcastAlert.type} 
            region={broadcastAlert.region} 
            message={broadcastAlert.message} 
            details={broadcastAlert.details}
            youtubeLink={broadcastAlert.youtubeLink}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <DashboardSearch />
            
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">{t('dashboard.quickAccess')}</h2>
              <QuickShortcuts />
            </div>
            
            <NearbyPharmacies />
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6 lg:space-y-8">
            <AIAssistantCard />
            <HealthTip />
            
            {/* Recent Orders Mini-Widget */}
            <div className="bg-white rounded-3xl shadow-sm border border-brand-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">{t('dashboard.activeOrder')}</h3>
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">{t('dashboard.track')}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t('dashboard.order.pharmacy')}</p>
                  <p className="text-xs text-gray-500 font-medium">{t('dashboard.outForDelivery')} • {t('dashboard.order.est')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

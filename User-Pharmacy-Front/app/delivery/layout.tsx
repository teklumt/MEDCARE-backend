'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Clock, Wallet, User as UserIcon, Truck, MessageSquare } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

const NAV_ITEMS = [
  { id: 'Home', href: '/delivery', icon: Truck },
  { id: 'History', href: '/delivery/history', icon: Clock },
  { id: 'Earnings', href: '/delivery/earnings', icon: Wallet },
  { id: 'Messages', href: '/delivery/messages', icon: MessageSquare },
  { id: 'Profile', href: '/delivery/profile', icon: UserIcon },
];

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('medcare_role');
    if (role !== 'delivery') {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) return null;

  return (
    <div className="h-[100dvh] overflow-hidden bg-gray-50 flex flex-col pb-20 sm:pb-0 sm:pt-0 sm:flex-row">
      {/* Side Navigation for Desktop/Tablet */}
      <nav className="hidden sm:flex flex-col w-64 bg-white border-r border-gray-200 shrink-0 overflow-visible">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between h-16 shrink-0 gap-2 overflow-visible relative z-30">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-brand-900 rounded-full flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-brand-900 tracking-tight truncate">
              MED-CARE
            </span>
          </div>
          <NotificationBell api="med" portal="delivery" panelAlign="start" />
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.id} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-brand-50 text-brand-700 font-bold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-700' : 'text-gray-400'}`} />
                {item.id}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="sm:hidden shrink-0 flex justify-end px-4 py-2 border-b border-gray-100 bg-white overflow-visible relative z-30">
          <NotificationBell api="med" portal="delivery" panelAlign="end" />
        </div>
        <div className="flex-1 min-h-0">{children}</div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 px-2 safe-area-pb">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.id} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-brand-600' : 'text-gray-500'}`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-bold">{item.id}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

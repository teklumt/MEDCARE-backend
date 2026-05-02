'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Wallet, ArrowDownCircle, CheckCircle } from 'lucide-react';

const MOCK_EARNINGS = [
  { date: 'Today', orderId: 'ORD-20847', fee: 50, status: 'pending' },
  { date: 'Today', orderId: 'ORD-20811', fee: 40, status: 'pending' },
  { date: 'Yesterday', orderId: 'ORD-20780', fee: 55, status: 'paid' },
  { date: 'Oct 12', orderId: 'ORD-20701', fee: 45, status: 'paid' },
];

export default function DeliveryEarnings() {
  const { language } = useLanguage();

  const totalWeek = 140;
  const totalMonth = 850;
  const totalAllTime = 3450;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings</h1>

      <div className="bg-brand-900 rounded-2xl p-6 text-white mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <p className="text-brand-200 text-sm font-medium mb-1">This Week</p>
        <div className="text-4xl font-bold mb-6">ETB {totalWeek}</div>
        
        <div className="grid grid-cols-2 gap-4 border-t border-brand-800 pt-4">
          <div>
            <p className="text-brand-200 text-xs mb-1">This Month</p>
            <p className="font-bold">ETB {totalMonth}</p>
          </div>
          <div>
            <p className="text-brand-200 text-xs mb-1">All Time</p>
            <p className="font-bold">ETB {totalAllTime}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Deliveries</h2>
      
      <div className="space-y-3">
        {MOCK_EARNINGS.map((earn, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{earn.orderId}</p>
                <p className="text-xs text-gray-500">{earn.date}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-gray-900">+ETB {earn.fee}</p>
              <p className={`text-[10px] font-bold uppercase mt-1 ${earn.status === 'paid' ? 'text-green-600' : 'text-amber-500'}`}>
                {earn.status}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-800 text-center">
          Note: Final payment settlements are managed directly between you and your employer pharmacy.
        </p>
      </div>
    </div>
  );
}

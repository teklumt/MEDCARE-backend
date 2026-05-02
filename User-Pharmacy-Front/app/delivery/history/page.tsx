'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const MOCK_HISTORY = [
  { id: 'ORD-20847', date: 'Today, 2:30 PM', area: 'Gerji', pharmacy: 'Kenema Pharmacy #4', duration: '38 mins', status: 'completed', amount: 850 },
  { id: 'ORD-20811', date: 'Today, 10:15 AM', area: 'Bole', pharmacy: 'Kenema Pharmacy #4', duration: '45 mins', status: 'completed', amount: null },
  { id: 'ORD-20790', date: 'Yesterday, 4:00 PM', area: 'Megenagna', pharmacy: 'Lion International', duration: '-', status: 'declined', amount: null },
];

export default function DeliveryHistory() {
  const { language } = useLanguage();
  const [filter, setFilter] = useState('Today');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Delivery History</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['Today', 'This Week', 'This Month'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-brand-900 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {MOCK_HISTORY.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-gray-900">{item.id}</span>
                {item.status === 'completed' && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Completed</span>}
                {item.status === 'declined' && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Declined</span>}
              </div>
              <p className="text-sm text-gray-500 mb-1">{item.date}</p>
              <div className="text-sm text-gray-700 font-medium">{item.pharmacy} &rarr; {item.area}</div>
            </div>
            
            <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end">
              <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5" /> {item.duration}
              </div>
              {item.status === 'completed' && item.amount !== null && (
                <div className="text-sm font-bold text-gray-900 mt-2 bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-200">
                  ETB {item.amount} collected
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

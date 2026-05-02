'use client';

import { motion } from 'motion/react';
import { Package, Clock, CheckCircle2, Truck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const orders = [
  {
    id: 'ORD-8492',
    pharmacy: 'Kenema Pharmacy #4',
    items: ['Amoxicillin 500mg', 'Paracetamol 500mg'],
    status: 'out_for_delivery',
    date: 'Today, 10:30 AM',
    estimatedDelivery: '11:45 AM',
  },
  {
    id: 'ORD-8491',
    pharmacy: 'Lion Pharmacy',
    items: ['Lisinopril 10mg'],
    status: 'delivered',
    date: 'Yesterday',
    estimatedDelivery: null,
  }
];

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'preparing':
      return <Clock className="w-5 h-5 text-orange-500" />;
    case 'out_for_delivery':
      return <Truck className="w-5 h-5 text-blue-500" />;
    case 'delivered':
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    default:
      return <Package className="w-5 h-5 text-gray-500" />;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'preparing':
      return <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold">Preparing</span>;
    case 'out_for_delivery':
      return <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold animate-pulse">Out for Delivery</span>;
    case 'delivered':
      return <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">Delivered</span>;
    default:
      return <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-700 text-xs font-semibold">Pending</span>;
  }
};

export default function RecentOrders() {
  return (
    <section className="py-12 bg-accent-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">Recent Orders</h2>
            <p className="text-gray-600">Track your medication deliveries.</p>
          </div>
          <Link href="/orders" className="hidden md:flex items-center text-brand-700 font-medium hover:text-brand-800 transition-colors">
            View all <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                    <StatusIcon status={order.status} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{order.id}</p>
                    <h3 className="font-heading font-bold text-gray-900">{order.pharmacy}</h3>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 text-sm">
                  {order.items.join(', ')}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                    {order.status === 'out_for_delivery' ? 'Est. Arrival' : 'Date'}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.status === 'out_for_delivery' ? order.estimatedDelivery : order.date}
                  </p>
                </div>
                <button className="text-brand-700 text-sm font-medium hover:text-brand-800 transition-colors">
                  {order.status === 'delivered' ? 'Order Again' : 'Track Order'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 text-center md:hidden">
          <Link href="/orders" className="inline-flex items-center text-brand-700 font-medium hover:text-brand-800 transition-colors">
            View all orders <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

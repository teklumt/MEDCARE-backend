'use client';

import { useEffect, useState } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Package, ChevronRight, Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { apiGet } from '@/lib/api';

interface Order {
  _id: string;
  ref?: string;
  createdAt: string;
  pharmacyId: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  prescriptionVerified?: boolean;
  prescriptionUploadId?: string | null;
  deliveryAgentId?: string | null;
  driverHandoffAt?: string | null;
  deliveryMethod?: string;
  items: Array<{
    medicationName: string;
    quantity: number;
  }>;
}

export default function OrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await apiGet<Order[]>('/orders');
        setOrders(response.data || []);
      } catch (err: any) {
        console.error('Failed to load orders:', err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const getStatusBadge = (order: Order) => {
    const { status, paymentStatus, deliveryMethod, deliveryAgentId, driverHandoffAt } = order;

    if (
      order.paymentStatus === 'pending_prescription_review' &&
      order.prescriptionVerified !== true &&
      order.status !== 'cancelled' &&
      order.status !== 'rejected'
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-800 bg-violet-100 px-2.5 py-1 rounded-lg">
          <Clock className="w-4 h-4" /> Awaiting prescription review
        </span>
      );
    }

    const needsConfirm =
      status === 'dispatched' &&
      deliveryMethod === 'delivery' &&
      deliveryAgentId &&
      driverHandoffAt;

    if (needsConfirm) {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-800 bg-brand-100 px-2.5 py-1 rounded-lg">
          <Clock className="w-4 h-4" /> Confirm receipt
        </span>
      );
    }

    if (status === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
          <CheckCircle2 className="w-4 h-4" /> Delivered
        </span>
      );
    }
    
    if (status === 'cancelled' || status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
          <AlertCircle className="w-4 h-4" /> {status === 'cancelled' ? 'Cancelled' : 'Rejected'}
        </span>
      );
    }

    if (paymentStatus === 'failed') {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
          <AlertCircle className="w-4 h-4" /> Payment Failed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
        <Clock className="w-4 h-4" /> {t('orders.inProgress')}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
      <DashboardNavbar />
      
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-brand-950 mb-2">{t('orders.title')}</h1>
          <p className="text-gray-500 font-medium">{t('orders.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-brand-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-900 mb-2">Failed to Load Orders</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-brand-300" />
            </div>
            <h2 className="text-2xl font-serif text-brand-950 mb-2">No Orders Yet</h2>
            <p className="text-gray-500 mb-8">You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <Link 
              href="/dashboard/search"
              className="inline-flex bg-brand-900 hover:bg-brand-800 text-white px-8 py-3 rounded-xl font-bold transition-colors"
            >
              Browse Medications
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link 
                  href={`/dashboard/orders/${order._id}`}
                  className="block bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-brand-200 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 
                        order.status === 'cancelled' || order.status === 'rejected' ? 'bg-red-50 text-red-600' :
                        'bg-brand-50 text-brand-600'
                      }`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{order.ref || order._id.slice(-8).toUpperCase()}</h3>
                        <p className="text-sm text-gray-500 mb-0.5">{formatDate(order.createdAt)}</p>
                        <p className="text-sm font-medium text-gray-700">
                          {order.items.map(item => `${item.medicationName} (${item.quantity}x)`).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">ETB {order.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{order.items.length} {order.items.length === 1 ? t('orders.item') : t('orders.items')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order)}
                      {order.paymentStatus === 'success' && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-medium">
                          Paid
                        </span>
                      )}
                      {order.paymentStatus === 'cod_pending' && (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded font-medium">
                          COD
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-brand-700 font-medium text-sm group-hover:text-brand-900 transition-colors">
                      {t('orders.viewDetails')} <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

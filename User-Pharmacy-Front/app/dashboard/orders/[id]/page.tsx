'use client';

import { useState, useEffect, use, useMemo, useCallback } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import { motion } from 'motion/react';
import Link from 'next/link';
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
  Map as MapIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getOrderById, confirmOrderReceipt, completeOrderPayment, type OrderDetail } from '@/lib/api';
import PatientOrderLiveMap from '@/components/dashboard/PatientOrderLiveMap';

const BASE_STAGES = [
  {
    id: 'received',
    title: 'Order Received',
    description: 'We have received your order.',
    icon: Receipt
  },
  {
    id: 'confirmed',
    title: 'Pharmacy Confirmed',
    description: 'Your pharmacy has confirmed your order.',
    icon: CheckCircle2
  },
  {
    id: 'preparing',
    title: 'Preparing Order',
    description: 'Your items are being packed securely.',
    icon: Package
  },
  {
    id: 'delivery',
    title: 'Out for Delivery',
    description: 'Driver is on the way to your location.',
    icon: Truck
  },
  {
    id: 'delivered',
    title: 'Delivered',
    description: 'Order has been delivered successfully.',
    icon: Home
  }
];

function deriveTracking(order: OrderDetail): {
  currentStage: number;
  needsPatientConfirm: boolean;
  isDelivered: boolean;
  isTerminal: boolean;
} {
  const st = order.status;
  const isTerminal = st === 'cancelled' || st === 'rejected';

  if (st === 'delivered') {
    return { currentStage: 4, needsPatientConfirm: false, isDelivered: true, isTerminal };
  }

  const handoff = Boolean(order.driverHandoffAt && order.deliveryMethod === 'delivery' && order.deliveryAgentId);

  if (st === 'dispatched' && handoff) {
    return { currentStage: 4, needsPatientConfirm: true, isDelivered: false, isTerminal };
  }

  switch (st) {
    case 'pending':
      return { currentStage: 0, needsPatientConfirm: false, isDelivered: false, isTerminal };
    case 'confirmed':
      return { currentStage: 1, needsPatientConfirm: false, isDelivered: false, isTerminal };
    case 'preparing':
      return { currentStage: 2, needsPatientConfirm: false, isDelivered: false, isTerminal };
    case 'ready':
      return { currentStage: 2, needsPatientConfirm: false, isDelivered: false, isTerminal };
    case 'dispatched':
      return { currentStage: 3, needsPatientConfirm: false, isDelivered: false, isTerminal };
    default:
      return { currentStage: 0, needsPatientConfirm: false, isDelivered: false, isTerminal };
  }
}

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useLanguage();
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  const reload = useCallback(async () => {
    try {
      setLoadError(null);
      const data = await getOrderById(id);
      setOrder(data);
    } catch (e) {
      setLoadError((e as Error).message || 'Could not load order');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const pollMs = useMemo(() => {
    if (!order) return 20000;
    if (
      order.paymentStatus === 'pending_prescription_review' &&
      order.status !== 'cancelled' &&
      order.status !== 'rejected'
    ) {
      return 5000;
    }
    return 20000;
  }, [order]);

  useEffect(() => {
    void reload();
    const iv = window.setInterval(() => void reload(), pollMs);
    return () => window.clearInterval(iv);
  }, [reload, pollMs]);

  const { currentStage, needsPatientConfirm, isDelivered, isTerminal } = useMemo(() => {
    if (!order) {
      return { currentStage: 0, needsPatientConfirm: false, isDelivered: false, isTerminal: false };
    }
    return deriveTracking(order);
  }, [order]);

  const stages = useMemo(() => {
    const copy = BASE_STAGES.map((s, i) => ({ ...s }));
    if (needsPatientConfirm) {
      copy[4] = {
        ...copy[4],
        title: 'Dropped off — confirm receipt',
        description:
          'Your driver marked the order as delivered. Please confirm when you have your medications.'
      };
    }
    return copy;
  }, [needsPatientConfirm]);

  const showLiveMapPlaceholder =
    order?.deliveryMethod === 'delivery' && order.status === 'dispatched' && !order.driverHandoffAt;

  const onConfirmReceipt = async () => {
    if (!order || confirmLoading) return;
    setConfirmLoading(true);
    try {
      const updated = await confirmOrderReceipt(order._id);
      setOrder(updated);
    } catch (e) {
      alert((e as Error).message || 'Could not confirm');
    } finally {
      setConfirmLoading(false);
    }
  };

  const onPayAfterVerification = async () => {
    if (!order || payLoading) return;
    setPayLoading(true);
    try {
      const result = await completeOrderPayment(order._id);
      if (order.paymentMethod === 'chapa' && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      await reload();
    } catch (e) {
      alert((e as Error).message || 'Could not start payment');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
        <DashboardNavbar />
        <div className="flex flex-col items-center justify-center flex-1 py-24 gap-4">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
          <p className="text-gray-600">{t('orders.loadingDetail') ?? 'Loading order…'}</p>
        </div>
      </main>
    );
  }

  if (loadError || !order) {
    return (
      <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
        <DashboardNavbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 font-medium mb-4">{loadError || 'Order not found'}</p>
          <Link href="/dashboard/orders" className="text-brand-700 font-bold hover:underline">
            {t('tracking.backToOrders')}
          </Link>
        </div>
      </main>
    );
  }

  const displayRef = order.ref || order.orderId || order._id.slice(-8).toUpperCase();
  const subtotalDisplay = order.subtotal ?? order.items.reduce((s, i) => s + (i.subtotal ?? 0), 0);
  const deliveryFeeDisplay = order.deliveryFee ?? 0;
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

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

        {currentStage === 0 && order.status === 'pending' && (
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

        {order.paymentStatus === 'pending_prescription_review' &&
          order.prescriptionVerified !== true &&
          !isTerminal && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 flex gap-3">
            <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Awaiting prescription review</p>
              <p className="text-sm text-amber-800 mt-1">
                Your order is waiting for the pharmacy to verify your uploaded prescription. This page refreshes automatically.
                You can complete payment here once verification is done.
              </p>
            </div>
          </div>
        )}

        {order.prescriptionVerified &&
          order.paymentStatus === 'pending_prescription_review' &&
          !isTerminal && (
          <div className="mb-8 rounded-2xl border border-brand-200 bg-brand-50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-bold text-brand-900">Prescription accepted</p>
              <p className="text-sm text-brand-800 mt-1">
                Complete payment to confirm your order{order.paymentMethod === 'cod' ? ' (cash on delivery).' : '.'}
              </p>
            </div>
            <button
              type="button"
              disabled={payLoading}
              onClick={() => void onPayAfterVerification()}
              className="shrink-0 px-6 py-3 rounded-xl bg-brand-900 text-white font-bold hover:bg-brand-800 disabled:bg-gray-400 transition-colors"
            >
              {payLoading ? 'Starting…' : 'Pay now'}
            </button>
          </div>
        )}

        {needsPatientConfirm && (
          <div className="mb-8 rounded-2xl border border-brand-200 bg-brand-50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-bold text-brand-900">Confirm receipt</p>
              <p className="text-sm text-brand-800 mt-1">
                Tap below after you physically receive your order from the driver.
              </p>
            </div>
            <button
              type="button"
              disabled={confirmLoading}
              onClick={() => void onConfirmReceipt()}
              className="shrink-0 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 disabled:bg-gray-400 transition-colors"
            >
              {confirmLoading ? '…' : 'I received my order'}
            </button>
          </div>
        )}

        {isTerminal && (
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 text-gray-800">
            <p className="font-bold">This order is {order.status}.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-brand-900 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3" />

              <div className="relative z-10">
                <h2 className="text-brand-200 font-medium mb-1">
                  {t('tracking.orderNum').replace('{id}', displayRef)}
                </h2>
                <div className="flex items-end gap-4 mb-6">
                  {isDelivered ? (
                    <div>
                      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">{t('tracking.delivered')}</h1>
                      <p className="text-brand-100 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> {t('tracking.arrivedSafely')}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                        {needsPatientConfirm ? 'Confirm your delivery' : t('tracking.arrivingSoon')}
                      </h1>
                      <p className="text-brand-100 flex items-center gap-2">
                        <Clock className="w-5 h-5" /> {t('tracking.estimatedArrival')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="h-2 bg-brand-950/50 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className="h-full bg-brand-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(Math.min(currentStage, stages.length - 1) / (stages.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-sm text-brand-200 text-right">
                  Step {isDelivered ? stages.length : Math.min(currentStage + 1, stages.length)} of {stages.length}
                </p>
              </div>
            </div>

            {showLiveMapPlaceholder && (
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
                {order && <PatientOrderLiveMap order={order} className="h-56 w-full" />}
                </motion.div>
            )}

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <h3 className="font-serif font-bold text-xl text-gray-900 mb-8">{t('tracking.orderStatus')}</h3>

              <div className="relative border-l-2 border-gray-100 ml-5 space-y-8">
                {stages.map((stage, idx) => {
                  const completed = isDelivered || idx < currentStage;
                  const active = !completed && idx === currentStage;
                  const pending = !completed && idx > currentStage;

                  return (
                    <div key={stage.id} className="relative pl-8">
                      <div
                        className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center transition-colors duration-500 ${
                          completed ? 'bg-brand-500' : active ? 'bg-brand-100' : 'bg-gray-100'
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-brand-600 animate-pulse' : 'bg-gray-300'}`}
                          />
                        )}
                      </div>

                      <div className={`transition-opacity duration-500 ${pending ? 'opacity-50' : 'opacity-100'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <stage.icon className={`w-5 h-5 ${completed || active ? 'text-brand-600' : 'text-gray-400'}`} />
                          <h4 className={`font-bold text-lg ${completed || active ? 'text-gray-900' : 'text-gray-500'}`}>
                            {stage.title}
                          </h4>
                        </div>
                        <p className="text-gray-500 text-sm">{stage.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Your pharmacy</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Order placed through Med-Care
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-100 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button type="button" className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-100 transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-serif font-bold text-xl text-gray-900 mb-6">{t('tracking.orderDetails')}</h3>

              <div className="space-y-4 mb-6">
                {order.items.map((item, ix) => (
                  <div key={`${item.medicationName}-${ix}`} className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-xs shrink-0">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.medicationName}</p>
                      </div>
                    </div>
                    <span className="font-medium text-gray-900 text-sm">
                      ETB {(item.subtotal ?? (item.unitPrice ?? 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>{t('cart.subtotal').replace('{count}', String(itemCount))}</span>
                  <span>ETB {subtotalDisplay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{t('cart.deliveryFee')}</span>
                  <span>ETB {deliveryFeeDisplay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-gray-900">{t('tracking.totalPaid')}</span>
                  <span className="font-bold text-brand-900 text-xl">ETB {order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-gray-500">{t('cart.deliveryMethod')}</span>
                  <span className="font-bold text-gray-900">
                    {order.deliveryMethod === 'delivery' ? t('cart.delivery') : t('cart.pickup')}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500">{t('tracking.payment')}</span>
                  <span className="font-bold text-gray-900">{order.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

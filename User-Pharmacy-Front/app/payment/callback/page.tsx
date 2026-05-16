'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed' | 'verifying'>('processing');
  const [message, setMessage] = useState('Processing your payment...');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const orderIdParam = searchParams.get('order_id');
    const chapaStatus = searchParams.get('status');

    if (!orderIdParam) {
      setStatus('failed');
      setMessage('Invalid payment callback. No order ID found.');
      setTimeout(() => router.push('/dashboard'), 3000);
      return;
    }

    setOrderId(orderIdParam);

    // If Chapa returned a failed status immediately
    if (chapaStatus === 'failed' || chapaStatus === 'cancelled') {
      setStatus('failed');
      setMessage('Payment was cancelled or failed.');
      return;
    }

    // Verify payment status
    const verifyPayment = async (retryCount = 0) => {
      try {
        setStatus('verifying');
        setMessage('Verifying your payment with the pharmacy...');

        // Wait a bit for webhook to process (production webhook); localhost callbacks never arrive from Chapa.
        if (retryCount === 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        type OrderPeek = {
          paymentStatus?: string;
          paymentMethod?: string;
          paymentId?: string;
        };

        let response = await apiGet<OrderPeek>(`/orders/${orderIdParam}`);
        let order = response.data;

        // Ask backend to verify with Chapa API once per attempt cycle (fixes stuck "initiated" when webhook URL is unreachable).
        const paymentId =
          order?.paymentId != null ? String(order.paymentId) : '';
        if (
          retryCount <= 2 &&
          order?.paymentMethod === 'chapa' &&
          paymentId &&
          order.paymentStatus !== 'success' &&
          order.paymentStatus !== 'failed'
        ) {
          try {
            await apiGet(`/payments/${paymentId}/verify`);
            response = await apiGet<OrderPeek>(`/orders/${orderIdParam}`);
            order = response.data;
          } catch (verifyErr) {
            console.warn('payments/:id/verify failed:', verifyErr);
          }
        }

        console.log('Order status:', order?.paymentStatus);

        if (order?.paymentStatus === 'success') {
          setStatus('success');
          setMessage('Payment successful! Redirecting to your order...');
          setTimeout(() => {
            router.push(`/dashboard/orders/${orderIdParam}`);
          }, 2000);
        } else if (order?.paymentStatus === 'failed') {
          setStatus('failed');
          setMessage('Payment verification failed. Please contact support.');
        } else if (retryCount < 5) {
          // Still processing, retry after delay
          setTimeout(() => verifyPayment(retryCount + 1), 2000);
        } else {
          // Max retries reached
          setStatus('failed');
          setMessage('Payment verification timed out. Please check your order status.');
          setTimeout(() => {
            router.push(`/dashboard/orders/${orderIdParam}`);
          }, 3000);
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        if (retryCount < 3) {
          setTimeout(() => verifyPayment(retryCount + 1), 2000);
        } else {
          setStatus('failed');
          setMessage('Failed to verify payment. Please check your orders page.');
          setTimeout(() => router.push('/dashboard/orders'), 3000);
        }
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border border-gray-100">
        {status === 'processing' && (
          <>
            <div className="w-20 h-20 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">{message}</p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left">
              <p className="text-sm text-emerald-800">
                <strong>Order ID:</strong> {orderId}
              </p>
              <p className="text-sm text-emerald-700 mt-2">
                Your order has been confirmed and the pharmacy will start preparing it shortly.
              </p>
            </div>
          </>
        )}
        
        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => router.push('/dashboard/cart')}
                className="flex-1 bg-brand-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-800 transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => router.push('/dashboard/orders')}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                View Orders
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiGet, type PharmacyCommissionSummary } from '@/lib/api';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

function CommissionCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed' | 'verifying'>('processing');
  const [message, setMessage] = useState('Processing commission payment...');

  useEffect(() => {
    const paymentId = searchParams.get('commission_payment_id');
    const chapaStatus = searchParams.get('status');

    if (!paymentId) {
      setStatus('failed');
      setMessage('Invalid callback: missing commission_payment_id.');
      setTimeout(() => router.push('/pharmacy'), 3000);
      return;
    }

    if (chapaStatus === 'failed' || chapaStatus === 'cancelled') {
      setStatus('failed');
      setMessage('Payment was cancelled or failed.');
      return;
    }

    const run = async (retryCount = 0) => {
      try {
        setStatus('verifying');
        setMessage('Verifying payment with MedCare…');

        if (retryCount === 0) {
          await new Promise((r) => setTimeout(r, 2000));
        }

        await apiGet(`/commission/${paymentId}/verify`);

        const payRes = await apiGet<{ status?: string }>(`/commission/${paymentId}`);
        const st = payRes.data?.status;
        if (st === 'success') {
          setStatus('success');
          setMessage('Payment recorded successfully. Redirecting…');
          setTimeout(() => router.push('/pharmacy'), 2000);
          return;
        }

        if (st === 'failed') {
          setStatus('failed');
          setMessage('Payment verification failed.');
          return;
        }

        type Summary = PharmacyCommissionSummary;
        const summaryRes = await apiGet<Summary>('/commission/summary');
        const summary = summaryRes.data;
        if (summary && summary.outstandingDebtEtb <= 0) {
          setStatus('success');
          setMessage('Commission payment confirmed. Redirecting…');
          setTimeout(() => router.push('/pharmacy'), 2000);
          return;
        }

        if (retryCount < 5) setTimeout(() => void run(retryCount + 1), 2000);
        else {
          setStatus('failed');
          setMessage('Verification timed out. Check commission balance on your dashboard.');
          setTimeout(() => router.push('/pharmacy'), 4000);
        }
      } catch {
        if (retryCount < 5) setTimeout(() => void run(retryCount + 1), 2000);
        else {
          setStatus('failed');
          setMessage('Could not verify payment.');
          setTimeout(() => router.push('/pharmacy'), 4000);
        }
      }
    };

    void run();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border border-gray-100">
        {status === 'processing' && (
          <>
            <div className="w-20 h-20 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Processing</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Verifying</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Success</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Payment issue</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              type="button"
              onClick={() => router.push('/pharmacy')}
              className="w-full bg-brand-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-800 transition-colors"
            >
              Back to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PharmacyCommissionCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 p-4">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CommissionCallbackContent />
    </Suspense>
  );
}

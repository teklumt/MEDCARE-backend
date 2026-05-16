'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Construction, ArrowLeft } from 'lucide-react';

function ComingSoonContent() {
  const searchParams = useSearchParams();
  const feature = searchParams.get('feature')?.trim() || 'This page';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 md:p-8 max-w-lg mx-auto text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-6">
        <Construction className="w-9 h-9 text-amber-700" aria-hidden />
      </div>
      <h1 className="text-2xl font-serif font-bold text-brand-950 mb-2">Coming soon</h1>
      <p className="text-gray-600 mb-1">
        <span className="font-semibold text-brand-900">{feature}</span> is not available yet.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        We&apos;re still building this part of the admin portal. Check back in a later release.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-900 text-white font-bold text-sm hover:bg-brand-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to overview
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-brand-950 font-bold text-sm hover:bg-accent-50 transition-colors"
        >
          Back to orders
        </Link>
      </div>
    </div>
  );
}

export default function AdminComingSoonPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-gray-500 text-sm">Loading…</div>
      }
    >
      <ComingSoonContent />
    </Suspense>
  );
}

'use client';

import Link from 'next/link';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getMyPharmacy,
  getPharmacyById,
  getPharmacyInventory,
  getPharmacyReviews,
  type PharmacyListItem,
  type PharmacyMedicationItem,
  type PharmacyReviewItem,
} from '@/lib/api';
import { PharmacyReadOnlyStorefrontView } from '@/components/pharmacy/PharmacyReadOnlyStorefrontView';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/**
 * Pharmacy portal — read-only “patient storefront” preview inside the pharmacy shell
 * (same idea as `/admin/pharmacies/[id]`, scoped to the logged-in pharmacy).
 */
export default function PharmacyPortalStorefrontPreviewPage() {
  const { language } = useLanguage();
  const [pharmacyDocId, setPharmacyDocId] = useState<string | null>(null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [pharmacy, setPharmacy] = useState<PharmacyListItem | null>(null);
  const [medications, setMedications] = useState<PharmacyMedicationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reviewRows, setReviewRows] = useState<PharmacyReviewItem[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getMyPharmacy()
      .then((me) => {
        const id = me?._id;
        if (typeof id !== 'string' || !id) throw new Error('Pharmacy id missing');
        if (!cancelled) {
          setPharmacyDocId(id);
          setBootstrapError(null);
        }
      })
      .catch((e) => {
        if (!cancelled)
          setBootstrapError(e instanceof Error ? e.message : 'Could not load your pharmacy profile');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pharmacyDocId) return;
    let cancelled = false;
    const load = async () => {
      setError(null);
      try {
        const pharm = await getPharmacyById(pharmacyDocId);
        let inv: PharmacyMedicationItem[] = [];
        try {
          inv = await getPharmacyInventory(pharmacyDocId);
        } catch {
          inv = [];
        }

        let rows: PharmacyReviewItem[] = [];
        let totalReviewCount = 0;
        if (!cancelled) {
          setReviewsError(null);
          try {
            const revPack = await getPharmacyReviews(pharmacyDocId, { page: 1 });
            if (!cancelled) {
              rows = revPack.items;
              totalReviewCount = Number(revPack.pagination?.total) || rows.length;
            }
          } catch (e) {
            if (!cancelled)
              setReviewsError(e instanceof Error ? e.message : 'Could not load reviews');
            rows = [];
            totalReviewCount = 0;
          }
        }

        if (!cancelled) {
          setPharmacy(pharm);
          setMedications(inv);
          setReviewRows(rows);
          setReviewsTotal(totalReviewCount);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Pharmacy not found');
          setPharmacy(null);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [pharmacyDocId]);

  const showSpinner =
    bootstrapError === null &&
    (pharmacyDocId === null || (pharmacy === null && error === null));
  const t =
    language === 'am'
      ? {
          back: 'ወደ ቅንብሮች',
          loading: 'በመጫን ላይ…',
        }
      : {
          back: 'Back to Settings',
          loading: 'Loading…',
        };

  if (bootstrapError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" aria-hidden />
        <p className="mb-6 font-medium text-gray-700">{bootstrapError}</p>
        <Link href="/pharmacy/profile" className="font-bold text-brand-700 hover:underline">
          {t.back}
        </Link>
      </div>
    );
  }

  if (showSpinner) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600" aria-hidden />
        <p className="text-sm font-medium text-gray-600">{t.loading}</p>
      </div>
    );
  }

  if (error || !pharmacy) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" aria-hidden />
        <p className="mb-6 font-medium text-gray-700">{error ?? 'Could not load storefront preview'}</p>
        <Link href="/pharmacy/profile" className="font-bold text-brand-700 hover:underline">
          {t.back}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-accent-50/50">
      <div className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">
        <Link
          href="/pharmacy/profile"
          className="mb-6 inline-flex items-center text-sm font-bold text-brand-700 transition-colors hover:text-brand-900"
        >
          <ChevronLeft className="mr-1 h-4 w-4 shrink-0" aria-hidden /> {t.back}
        </Link>

        <PharmacyReadOnlyStorefrontView
          pharmacy={pharmacy}
          medications={medications}
          reviewRows={reviewRows}
          reviewsTotal={reviewsTotal}
          reviewsError={reviewsError}
          tone="pharmacy_portal_preview"
        />
      </div>
    </div>
  );
}

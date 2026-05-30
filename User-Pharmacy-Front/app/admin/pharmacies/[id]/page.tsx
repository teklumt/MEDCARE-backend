'use client';

import Link from 'next/link';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import {
  getPharmacyById,
  getPharmacyInventory,
  getPharmacyReviews,
  type PharmacyListItem,
  type PharmacyMedicationItem,
  type PharmacyReviewItem,
} from '@/lib/api';
import { PharmacyReadOnlyStorefrontView } from '@/components/pharmacy/PharmacyReadOnlyStorefrontView';

/**
 * Read-only pharmacy detail for admins — mirrors patient `/dashboard/pharmacies/[id]`
 * layout and data, without cart or review submission (admin shell only).
 */
export default function AdminPharmacyPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pharmacy, setPharmacy] = useState<PharmacyListItem | null>(null);
  const [medications, setMedications] = useState<PharmacyMedicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewRows, setReviewRows] = useState<PharmacyReviewItem[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const pharm = await getPharmacyById(id);
        let inv: PharmacyMedicationItem[] = [];
        try {
          inv = await getPharmacyInventory(id);
        } catch {
          inv = [];
        }

        let rows: PharmacyReviewItem[] = [];
        let totalReviewCount = 0;
        if (!cancelled) {
          setReviewsError(null);
          try {
            const revPack = await getPharmacyReviews(id, { page: 1 });
            if (!cancelled) {
              rows = revPack.items;
              totalReviewCount = Number(revPack.pagination?.total) || rows.length;
            }
          } catch (e) {
            if (!cancelled) {
              setReviewsError(e instanceof Error ? e.message : 'Could not load reviews');
            }
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
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600" aria-hidden />
      </div>
    );
  }

  if (error || !pharmacy) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" aria-hidden />
        <p className="mb-2 font-medium text-gray-700">{error ?? 'Pharmacy not found'}</p>
        <Link href="/admin/pharmacies" className="font-bold text-brand-700 hover:underline">
          Back to pharmacies
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full p-6 md:p-8">
      <Link
        href="/admin/pharmacies"
        className="mb-6 inline-flex items-center font-medium text-brand-700 transition-colors hover:text-brand-900"
      >
        <ChevronLeft className="mr-1 h-4 w-4" aria-hidden /> Back to Pharmacies
      </Link>

      <PharmacyReadOnlyStorefrontView
        pharmacy={pharmacy}
        medications={medications}
        reviewRows={reviewRows}
        reviewsTotal={reviewsTotal}
        reviewsError={reviewsError}
        tone="admin"
      />
    </div>
  );
}

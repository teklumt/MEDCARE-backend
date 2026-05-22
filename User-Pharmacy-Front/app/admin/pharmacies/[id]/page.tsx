'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  MapPin,
  Phone,
  Activity,
  ChevronLeft,
  Clock,
  ShieldCheck,
  Navigation,
  CheckCircle2,
  XCircle,
  Pill,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { use, useEffect, useState } from 'react';
import { formatOpeningHoursForDisplay } from '@/lib/pharmacyHours';
import {
  getPharmacyById,
  getPharmacyInventory,
  getPharmacyReviews,
  type PharmacyListItem,
  type PharmacyMedicationItem,
  type PharmacyReviewItem
} from '@/lib/api';
import { availabilityFromRating, parsePharmacyPosition } from '@/lib/pharmacyGeo';
import SingleMarkerMap from '@/components/map/SingleMarkerMap';
import MapFallback from '@/components/map/MapFallback';
import { googleMapsDirectionsUrl } from '@/lib/mapGeo';

function RatingStarsRow({ rating }: { rating: number }) {
  const rounded = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)));
  return (
    <span className="flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 shrink-0 ${
            s <= rounded ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-gray-200'
          }`}
        />
      ))}
    </span>
  );
}

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

  const rating = pharmacy.stats?.rating ?? 0;
  const reviews = pharmacy.stats?.reviewCount ?? 0;
  const availability = availabilityFromRating(rating);
  const status = pharmacy.isOpen ? 'open' : 'closed';
  const address = pharmacy.address || pharmacy.location || 'Addis Ababa';
  const hours = formatOpeningHoursForDisplay(pharmacy.openingHours) || 'See pharmacy for hours';
  const imageSeed = encodeURIComponent(pharmacy.businessName);
  const image = `https://picsum.photos/seed/${imageSeed}/800/600`;

  const pharmacyPosition = parsePharmacyPosition(pharmacy);
  const mapDestinationQuery = encodeURIComponent(`${pharmacy.businessName} ${address}`);
  const directionsUrl = pharmacyPosition
    ? googleMapsDirectionsUrl(pharmacyPosition)
    : `https://www.google.com/maps/dir/?api=1&destination=${mapDestinationQuery}`;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <Link
        href="/admin/pharmacies"
        className="mb-6 inline-flex items-center font-medium text-brand-700 transition-colors hover:text-brand-900"
      >
        <ChevronLeft className="mr-1 h-4 w-4" aria-hidden /> Back to Pharmacies
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 lg:col-span-7"
        >
          <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-brand-100 shadow-sm sm:h-80">
            <Image
              src={image}
              alt={pharmacy.businessName}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
              <Star className="h-4 w-4 fill-current text-amber-500" />
              <span className="text-sm font-bold text-gray-900">{rating}</span>
              <span className="text-xs font-medium text-gray-500">({reviews})</span>
            </div>
            <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
              <span
                className={`h-2.5 w-2.5 rounded-full ${status === 'open' ? 'bg-emerald-500' : 'bg-red-500'}`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
                {status === 'open' ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-800">
                {pharmacy.deliveryAvailable ? 'Delivery available' : 'Retail Pharmacy'}
              </span>
              <span className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                <ShieldCheck className="h-4 w-4" /> Verified Pharmacy
              </span>
            </div>
            <h1 className="mb-4 font-serif text-4xl leading-tight text-brand-950 md:text-5xl">
              {pharmacy.businessName}
            </h1>
            {pharmacy.description && (
              <p className="mb-6 text-lg leading-relaxed text-gray-600">{pharmacy.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-50">
                <MapPin className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Address</p>
                <p className="text-sm font-medium text-gray-900">{address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-50">
                <Phone className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Contact</p>
                <p className="text-sm font-medium text-gray-900">{pharmacy.phone || '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-50">
                <Clock className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Hours</p>
                <p className="text-sm font-medium text-gray-900">{hours}</p>
                <p
                  className={`mt-1 text-xs font-bold ${status === 'open' ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  {status === 'open' ? 'Open Now' : 'Currently Closed'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                  availability === 'high'
                    ? 'bg-emerald-50 text-emerald-600'
                    : availability === 'medium'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-red-50 text-red-600'
                }`}
              >
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Stock Level</p>
                <div className="mt-1 flex items-center gap-1.5">
                  {availability === 'high' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {availability === 'medium' && <CheckCircle2 className="h-4 w-4 text-amber-500" />}
                  {availability === 'low' && <XCircle className="h-4 w-4 text-red-500" />}
                  <span
                    className={`text-sm font-bold capitalize ${
                      availability === 'high'
                        ? 'text-emerald-700'
                        : availability === 'medium'
                          ? 'text-amber-700'
                          : 'text-red-700'
                    }`}
                  >
                    {availability} Availability
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6 lg:col-span-5"
        >
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="relative h-[400px] w-full bg-gray-100">
              {pharmacyPosition ? (
                <SingleMarkerMap
                  position={pharmacyPosition}
                  title={pharmacy.businessName}
                  className="h-full w-full rounded-none"
                />
              ) : (
                <MapFallback className="h-full w-full rounded-none">
                  <>
                    <MapPin className="mb-2 h-8 w-8 text-gray-400" aria-hidden />
                    <p className="text-sm font-semibold text-gray-800">Map pin not set</p>
                    <p className="mt-2 max-w-sm text-xs leading-relaxed text-gray-600">
                      GPS coordinates are missing—address-search maps showed unrelated{' '}
                      <span className="font-medium text-gray-800">Google</span> listings and ratings that don’t match{' '}
                      <span className="font-medium text-gray-800">MedCare stats</span>. Use{' '}
                      <span className="font-medium text-gray-800">Get directions</span> for this pharmacy’s address.
                    </p>
                  </>
                </MapFallback>
              )}
            </div>

            <div className="p-6">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-900 py-4 text-lg font-bold text-white shadow-sm transition-colors hover:bg-brand-800 hover:shadow-md"
              >
                <Navigation className="h-5 w-5" /> Get Directions
              </a>
              <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-600">
                Reviews and orders are handled on the patient app. This preview is read-only for admins.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

        <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25 }}
        className="mt-10 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"
      >
        <h2 className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xl font-bold text-brand-950">
          <span className="inline-flex items-center gap-2">
            <Star className="h-5 w-5 fill-current text-amber-500" aria-hidden /> Recent reviews
          </span>
          {reviewsError === null ? (
            <span className="text-sm font-normal text-gray-500">({reviewsTotal} total)</span>
          ) : null}
        </h2>

        {reviewsError ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Reviews could not be loaded: {reviewsError}. Check that the pharmacy API is reachable and the ID is valid.
          </div>
        ) : null}

        {!reviewsError && reviewRows.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        ) : reviewsError === null ? (
          <ul className="space-y-5 divide-y divide-gray-100">
            {reviewRows.map((r, idx) => (
              <li
                key={r._id ? String(r._id) : `${r.createdAt}-${r.patientId}-${idx}`}
                className="pt-5 first:pt-0"
              >
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="font-bold text-gray-900">{r.patientName || 'Patient'}</span>
                  <RatingStarsRow rating={r.rating} />
                  <span className="text-sm font-bold text-amber-700">{Number(r.rating) || 0}/5</span>
                  {r.createdAt ? (
                    <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
                {r.comment ? (
                  <p className="text-sm leading-relaxed text-gray-700">{r.comment}</p>
                ) : (
                  <p className="text-sm italic text-gray-400">No comment</p>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 border-t border-brand-100 pt-8"
      >
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-brand-950">
          <Pill className="h-6 w-6 text-brand-600" /> Medications in Stock
        </h2>

        {medications.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No medications listed for this pharmacy yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {medications.map((med) => {
              const inStock = (med.stockQuantity ?? 1) > 0;
              const medImage = med.imageUrl || `https://picsum.photos/seed/${String(med._id)}/400/300`;
              return (
                <div
                  key={med._id}
                  className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex flex-col gap-4">
                    <div className="relative h-40 w-full flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      <Image
                        src={medImage}
                        alt={med.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold leading-tight text-gray-900">{med.name}</h3>
                      {med.genericName && (
                        <p className="mb-2 text-sm italic text-gray-500">{med.genericName}</p>
                      )}
                      {med.category && (
                        <p className="inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-brand-600">
                          {med.category}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto space-y-3 border-t border-gray-50 pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {Number(med.price).toFixed(2)} ETB
                      </span>
                      {inStock ? (
                        <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> In Stock
                        </span>
                      ) : (
                        <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-600">
                          Out of stock
                        </span>
                      )}
                    </div>
                    <p className="text-center text-xs font-medium text-gray-500">
                      Preview only — not sold from Admin
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

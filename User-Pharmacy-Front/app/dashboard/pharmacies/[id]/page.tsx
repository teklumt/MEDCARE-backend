'use client';

import DashboardNavbar from '@/components/DashboardNavbar';
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
  ShoppingCart,
  Pill,
  MessageSquare,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { use, useCallback, useEffect, useState } from 'react';
import { formatOpeningHoursForDisplay } from '@/lib/pharmacyHours';
import { useCart } from '@/lib/CartContext';
import WriteReviewModal from '@/components/dashboard/WriteReviewModal';
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
import { googleMapsDirectionsUrl } from '@/lib/mapGeo';

export default function PharmacyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToCart } = useCart();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [pharmacy, setPharmacy] = useState<PharmacyListItem | null>(null);
  const [medications, setMedications] = useState<PharmacyMedicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewRows, setReviewRows] = useState<PharmacyReviewItem[]>([]);
  const [canReviewAsPatient, setCanReviewAsPatient] = useState(false);

  useEffect(() => {
    setCanReviewAsPatient(
      typeof window !== 'undefined' && localStorage.getItem('medcare_role') === 'patient'
    );
  }, []);

  const refreshAfterReview = useCallback(async () => {
    const [pharm, revPack] = await Promise.all([
      getPharmacyById(id),
      getPharmacyReviews(id, { page: 1 }).catch(() => ({
        items: [] as PharmacyReviewItem[],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      })),
    ]);
    setPharmacy(pharm);
    setReviewRows(revPack.items);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const emptyReviews = {
          items: [] as PharmacyReviewItem[],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        };
        const [pharm, inv, revPack] = await Promise.all([
          getPharmacyById(id),
          getPharmacyInventory(id).catch(() => [] as PharmacyMedicationItem[]),
          getPharmacyReviews(id, { page: 1 }).catch(() => emptyReviews),
        ]);
        if (!cancelled) {
          setPharmacy(pharm);
          setMedications(inv);
          setReviewRows(revPack.items);
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
      <main className="min-h-screen flex flex-col bg-accent-50">
        <DashboardNavbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        </div>
      </main>
    );
  }

  if (error || !pharmacy) {
    return (
      <main className="min-h-screen flex flex-col bg-accent-50 pb-20">
        <DashboardNavbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-6">{error ?? 'Pharmacy not found'}</p>
          <Link
            href="/dashboard/pharmacies"
            className="text-brand-700 font-bold hover:underline"
          >
            Back to pharmacies
          </Link>
        </div>
      </main>
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
  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapQuery = encodeURIComponent(`${pharmacy.businessName} ${address}`);
  const mapUrl = mapKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapKey}&q=${mapQuery}`
    : '';
  const directionsUrl = pharmacyPosition
    ? googleMapsDirectionsUrl(pharmacyPosition)
    : `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

  const handleAddToCart = (med: PharmacyMedicationItem) => {
    addToCart({
      id: String(med._id),
      name: med.name,
      price: med.price,
      quantity: 1,
      requiresPrescription: Boolean(med.requiresPrescription),
      pharmacyId: id,
      pharmacyName: pharmacy.businessName,
      image: med.imageUrl || `https://picsum.photos/seed/${med._id}/400/300`
    });
  };

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
      <DashboardNavbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <Link
          href="/dashboard/pharmacies"
          className="inline-flex items-center text-brand-700 font-medium hover:text-brand-900 transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Pharmacies
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden shadow-sm border border-brand-100">
              <Image
                src={image}
                alt={pharmacy.businessName}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span className="text-sm font-bold text-gray-900">{rating}</span>
                <span className="text-xs text-gray-500 font-medium">({reviews})</span>
              </div>
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${status === 'open' ? 'bg-emerald-500' : 'bg-red-500'}`}
                />
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {status === 'open' ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider">
                  {pharmacy.deliveryAvailable ? 'Delivery available' : 'Retail Pharmacy'}
                </span>
                <span className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                  <ShieldCheck className="w-4 h-4" /> Verified Pharmacy
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-brand-950 mb-4 leading-tight">
                {pharmacy.businessName}
              </h1>
              {pharmacy.description && (
                <p className="text-gray-600 text-lg leading-relaxed mb-6">{pharmacy.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
                  <p className="text-sm font-medium text-gray-900">{address}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
                  <p className="text-sm font-medium text-gray-900">{pharmacy.phone || '—'}</p>
                  {pharmacy.phone && (
                    <a
                      href={`tel:${pharmacy.phone}`}
                      className="text-xs text-brand-600 font-bold mt-1 hover:underline"
                    >
                      Call Now
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hours</p>
                  <p className="text-sm font-medium text-gray-900">{hours}</p>
                  <p
                    className={`text-xs font-bold mt-1 ${status === 'open' ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {status === 'open' ? 'Open Now' : 'Currently Closed'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    availability === 'high'
                      ? 'bg-emerald-50 text-emerald-600'
                      : availability === 'medium'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-red-50 text-red-600'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stock Level</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {availability === 'high' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {availability === 'medium' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                    {availability === 'low' && <XCircle className="w-4 h-4 text-red-500" />}
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
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-[400px] w-full bg-gray-100 relative">
                {pharmacyPosition ? (
                  <SingleMarkerMap
                    position={pharmacyPosition}
                    title={pharmacy.businessName}
                    className="h-full w-full rounded-none"
                  />
                ) : mapUrl ? (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={mapUrl}
                    title={`Map showing location of ${pharmacy.businessName}`}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-gray-500">
                    Map location not available
                  </div>
                )}
              </div>

              <div className="p-6">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-brand-900 hover:bg-brand-800 text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md mb-3"
                >
                  <Navigation className="w-5 h-5" /> Get Directions
                </a>
                {canReviewAsPatient ? (
                  <button
                    type="button"
                    onClick={() => setIsReviewOpen(true)}
                    className="w-full bg-white border-2 border-brand-100 hover:border-brand-200 text-brand-900 py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageSquare className="w-5 h-5" /> Write a Review
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="w-full bg-accent-50 border-2 border-dashed border-brand-200 text-brand-800 py-4 rounded-2xl font-bold text-base transition-colors flex items-center justify-center gap-2 text-center px-3"
                  >
                    Sign in as a patient to review this pharmacy
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="mt-10 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8"
        >
          <h2 className="text-xl font-bold text-brand-950 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-current" /> Recent reviews
          </h2>
          {reviewRows.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet. Be the first to share your experience.</p>
          ) : (
            <ul className="space-y-5 divide-y divide-gray-100">
              {reviewRows.map((r) => (
                <li key={r._id} className="pt-5 first:pt-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">{r.patientName || 'Patient'}</span>
                    <span className="text-amber-600 font-bold text-sm flex items-center gap-0.5">
                      <Star className="w-4 h-4 fill-current" /> {r.rating}/5
                    </span>
                    {r.createdAt && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {r.comment ? (
                    <p className="text-gray-700 text-sm leading-relaxed">{r.comment}</p>
                  ) : (
                    <p className="text-gray-400 text-sm italic">No comment</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        <WriteReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          pharmacyId={id}
          pharmacyName={pharmacy.businessName}
          onSubmitted={refreshAfterReview}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 pt-8 border-t border-brand-100"
        >
          <h2 className="text-2xl font-bold text-brand-950 mb-6 flex items-center gap-2">
            <Pill className="w-6 h-6 text-brand-600" /> Medications in Stock
          </h2>

          {medications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No medications listed for this pharmacy yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {medications.map((med) => {
                const inStock = (med.stockQuantity ?? 1) > 0;
                const medImage =
                  med.imageUrl || `https://picsum.photos/seed/${String(med._id)}/400/300`;
                return (
                  <div
                    key={med._id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col gap-4 mb-4">
                      <div className="relative w-full h-40 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={medImage}
                          alt={med.name}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 leading-tight text-lg">{med.name}</h3>
                        {med.genericName && (
                          <p className="text-sm text-gray-500 italic mb-2">{med.genericName}</p>
                        )}
                        {med.category && (
                          <p className="text-xs font-bold text-brand-600 bg-brand-50 inline-block px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {med.category}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto space-y-3 pt-4 border-t border-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900 text-lg">
                          {Number(med.price).toFixed(2)} ETB
                        </span>
                        {inStock ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> In Stock
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                            Out of stock
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={!inStock}
                        onClick={() => handleAddToCart(med)}
                        className="w-full bg-white hover:bg-brand-50 border border-brand-200 text-brand-700 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

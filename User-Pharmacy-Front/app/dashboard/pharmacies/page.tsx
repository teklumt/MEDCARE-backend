'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import DashboardSearch from '@/components/dashboard/DashboardSearch';
import PharmacyListCard from '@/components/dashboard/PharmacyListCard';
import PharmaciesMap, { type PharmacyMapMarker } from '@/components/map/PharmaciesMap';
import { motion } from 'motion/react';
import { AlertCircle, Loader2, MapPin, Navigation } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { listPharmacies } from '@/lib/api';
import {
  enrichCardsWithDistance,
  mapPharmacyToCard,
  type PharmacyCardModel
} from '@/lib/pharmacyGeo';
import { useUserLocation } from '@/lib/useUserLocation';

export default function PharmaciesPage() {
  const { t } = useLanguage();
  const { status: geoStatus, position, usingFallback, retry } = useUserLocation();
  const [pharmacies, setPharmacies] = useState<PharmacyCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadPharmacies = useCallback(async () => {
    if (geoStatus === 'loading') return;
    setLoading(true);
    setError(null);
    try {
      const rows = await listPharmacies({
        lat: position.lat,
        lng: position.lng
      });
      let cards = rows.map((p) => mapPharmacyToCard(p));
      if (!usingFallback) {
        cards = enrichCardsWithDistance(cards, position);
      }
      setPharmacies(cards);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pharmacies');
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  }, [geoStatus, position, usingFallback]);

  useEffect(() => {
    void loadPharmacies();
  }, [loadPharmacies]);

  const mapMarkers: PharmacyMapMarker[] = useMemo(
    () =>
      pharmacies
        .filter((p): p is PharmacyCardModel & { position: NonNullable<PharmacyCardModel['position']> } =>
          Boolean(p.position)
        )
        .map((p) => ({
          id: p.id,
          name: p.name,
          position: p.position
        })),
    [pharmacies]
  );

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
      <DashboardNavbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-brand-950 mb-2">
            {t('findPharmacies.title')}
          </h1>
          <p className="text-gray-500 font-medium">{t('findPharmacies.subtitle')}</p>
        </div>

        <div className="mb-8">
          <DashboardSearch hideImageSearch={true} />
        </div>

        {(usingFallback || geoStatus === 'denied') && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="flex-1">
              {geoStatus === 'denied'
                ? 'Location access denied. Showing pharmacies near Addis Ababa.'
                : 'Using default map center (Addis Ababa).'}
            </span>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-1.5 font-bold text-brand-700 hover:text-brand-900"
            >
              <Navigation className="w-4 h-4" />
              Use my location
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <section className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl font-serif font-bold text-gray-900">{t('nearby.title')}</h2>
            <p className="text-sm text-gray-500 font-medium hidden sm:block">
              {mapMarkers.length} on map · {pharmacies.length} total
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-7 lg:sticky lg:top-24 lg:self-start">
              {geoStatus === 'loading' || loading ? (
                <div className="min-h-[280px] lg:min-h-[480px] rounded-2xl border border-gray-200 bg-gray-100 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                </div>
              ) : (
                <PharmaciesMap
                  className="min-h-[280px] lg:min-h-[480px] h-[50vh] lg:h-[480px]"
                  center={position}
                  userPosition={position}
                  pharmacies={mapMarkers}
                  selectedPharmacyId={selectedId}
                  onSelect={setSelectedId}
                />
              )}
            </div>

            <div className="lg:col-span-5 space-y-3 max-h-none lg:max-h-[480px] lg:overflow-y-auto lg:pr-1">
              {loading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
                </div>
              ) : pharmacies.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No pharmacies found.</p>
              ) : (
                pharmacies.map((pharmacy, index) => (
                  <motion.div
                    key={pharmacy.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                  >
                    <PharmacyListCard
                      pharmacy={pharmacy}
                      variant="row"
                      selected={selectedId === pharmacy.id}
                      onSelect={() => setSelectedId(pharmacy.id)}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

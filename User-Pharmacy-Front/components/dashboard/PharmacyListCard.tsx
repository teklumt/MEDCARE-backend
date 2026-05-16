'use client';

import Link from 'next/link';
import {
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { PharmacyCardModel } from '@/lib/pharmacyGeo';

type PharmacyListCardProps = {
  pharmacy: PharmacyCardModel;
  selected?: boolean;
  onSelect?: () => void;
  variant?: 'card' | 'row';
};

export default function PharmacyListCard({
  pharmacy,
  selected = false,
  onSelect,
  variant = 'card'
}: PharmacyListCardProps) {
  const { t } = useLanguage();

  const availabilityLabel =
    pharmacy.availability === 'high'
      ? t('nearby.stockHigh')
      : pharmacy.availability === 'medium'
        ? t('nearby.stockMedium')
        : t('nearby.stockLow');

  if (variant === 'row') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.();
          }
        }}
        className={`w-full text-left p-4 rounded-2xl border transition-all ${
          selected
            ? 'border-brand-400 bg-brand-50/80 shadow-sm'
            : 'border-gray-100 bg-white hover:border-brand-200 hover:bg-brand-50/30'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 truncate">{pharmacy.name}</h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              {pharmacy.address}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-medium">
              <span className="text-amber-600 flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-current" />
                {pharmacy.rating}
              </span>
              <span className={pharmacy.status === 'open' ? 'text-emerald-600' : 'text-red-500'}>
                {pharmacy.status === 'open' ? t('nearby.openNow') : t('nearby.closed')}
              </span>
              <span className="text-brand-600 font-bold">{pharmacy.distance}</span>
            </div>
          </div>
          <Link
            href={`/dashboard/pharmacies/${pharmacy.id}`}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 p-2 text-brand-700 hover:bg-brand-100 rounded-xl"
            aria-label="View pharmacy"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
        selected
          ? 'border-brand-400 bg-brand-50/80'
          : 'border-gray-100 bg-white hover:border-brand-200 hover:bg-brand-50/30'
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.();
          }
        }}
        className="flex items-start gap-4 flex-1 min-w-0 cursor-pointer"
      >
        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
          <MapPin className="w-5 h-5 text-brand-600" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 mb-1">{pharmacy.name}</h3>
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1 truncate max-w-[200px]">
              <MapPin className="w-3 h-3" /> {pharmacy.distance}
            </span>
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="w-3 h-3 fill-current" /> {pharmacy.rating} ({pharmacy.reviews})
            </span>
            <span
              className={`flex items-center gap-1 ${pharmacy.status === 'open' ? 'text-emerald-600' : 'text-red-500'}`}
            >
              <Clock className="w-3 h-3" />
              {pharmacy.status === 'open' ? t('nearby.openNow') : t('nearby.closed')}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 truncate">{pharmacy.address}</p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pl-0 sm:pl-0">
        <div className="flex items-center gap-1.5">
          {pharmacy.availability === 'high' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {pharmacy.availability === 'medium' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
          {pharmacy.availability === 'low' && <XCircle className="w-4 h-4 text-red-500" />}
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              pharmacy.availability === 'high'
                ? 'text-emerald-700'
                : pharmacy.availability === 'medium'
                  ? 'text-amber-700'
                  : 'text-red-700'
            }`}
          >
            {availabilityLabel}
          </span>
        </div>
        <Link
          href={`/dashboard/pharmacies/${pharmacy.id}`}
          className="text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors"
        >
          {t('nearby.order')}
        </Link>
      </div>
    </div>
  );
}

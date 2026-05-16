'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Camera,
  ArrowRight,
  History,
  Sparkles,
  Pill,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { scanPrescription } from '@/lib/api';
import {
  readPrescriptionScanSessionPayload,
  writePrescriptionScanSessionPayload,
} from '@/lib/prescriptionScanSession';

const MAX_SCAN_BYTES = 10 * 1024 * 1024;

type StoredRxScan = { medicines: string[]; invalidRx: boolean };

function normalizeMedicineNames(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of raw) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    const k = trimmed.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(trimmed);
  }
  return out;
}

export type DashboardSearchProps = {
  hideImageSearch?: boolean;
  /** Sync input from URL (`q`) when it changes */
  initialQuery?: string;
  /** Default: navigate to `/dashboard/search`; inline updates URL via parent callback */
  mode?: 'navigate' | 'inline';
  /** Required when mode is `inline`; receives trimmed query (empty clears browse mode) */
  onQuerySubmit?: (q: string) => void;
};

export default function DashboardSearch({
  hideImageSearch = false,
  initialQuery = '',
  mode = 'navigate',
  onQuerySubmit,
}: DashboardSearchProps) {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<'text' | 'image'>('text');
  const [query, setQuery] = useState(initialQuery);
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<string[]>([]);
  const [prescriptionScanInvalid, setPrescriptionScanInvalid] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = readPrescriptionScanSessionPayload();
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<StoredRxScan>;
      if (Array.isArray(parsed.medicines)) {
        setPrescriptionMedicines(normalizeMedicineNames(parsed.medicines));
        setPrescriptionScanInvalid(parsed.invalidRx === true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const recentSearches = [t('search.recent.1'), t('search.recent.2'), t('search.recent.3')];
  const suggestions = [t('search.suggest.1'), t('search.suggest.2'), t('search.suggest.3')];

  const submitQuery = (raw: string) => {
    const trimmed = raw.trim();
    if (mode === 'inline' && onQuerySubmit) {
      onQuerySubmit(trimmed);
      return;
    }
    router.push(trimmed ? `/dashboard/search?q=${encodeURIComponent(trimmed)}` : '/dashboard/search');
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery(query);
  };

  const handlePrescriptionFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setScanError(null);

      if (file.size > MAX_SCAN_BYTES) {
        setScanError(t('search.scanTooLarge'));
        return;
      }

      setScanning(true);
      try {
        const data = await scanPrescription(file);
        const meds = normalizeMedicineNames(data.medicines);
        const invalidRx = data.parsed_prescription?.is_valid_prescription === false;
        if (typeof window !== 'undefined') {
          writePrescriptionScanSessionPayload(JSON.stringify({ medicines: meds, invalidRx }));
        }
        setPrescriptionMedicines(meds);
        setPrescriptionScanInvalid(invalidRx);
        setSearchMode('text');
      } catch (err) {
        setScanError(err instanceof Error ? err.message : t('search.scanFailed'));
      } finally {
        setScanning(false);
      }
    },
    [t],
  );

  const openFilePicker = () => {
    if (scanning) return;
    document.getElementById('camera-search-upload')?.click();
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-brand-100 overflow-hidden">
      {/* Search Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          type="button"
          onClick={() => setSearchMode('text')}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${searchMode === 'text' ? 'text-brand-900 border-b-2 border-brand-600 bg-brand-50/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
        >
          <Search className="w-4 h-4" /> {t('search.text')}
        </button>
        {!hideImageSearch && (
          <button
            type="button"
            onClick={() => setSearchMode('image')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${searchMode === 'image' ? 'text-brand-900 border-b-2 border-brand-600 bg-brand-50/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <Camera className="w-4 h-4" /> {t('search.prescription')}
          </button>
        )}
      </div>

      {/* Search Content */}
      <div className="p-6 md:p-8">
        {searchMode === 'text' && (
          <div className="space-y-6">
            <form onSubmit={handleTextSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block w-full pl-12 pr-16 py-4 bg-gray-50 border-transparent rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none font-medium text-lg"
                placeholder={t('search.placeholder')}
                aria-label={t('search.placeholder')}
              />
              <button
                type="submit"
                className="absolute inset-y-2 right-2 bg-brand-900 hover:bg-brand-800 text-white px-4 rounded-xl font-bold transition-colors flex items-center justify-center"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* Suggestions & History */}
            {!query && (
              <div className="space-y-4 pt-2">
                {prescriptionScanInvalid && prescriptionMedicines.length > 0 && (
                  <p
                    role="alert"
                    className="text-sm font-medium text-amber-900 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3"
                  >
                    {t('search.scanInvalidRx')}
                  </p>
                )}
                <div
                  className={`grid grid-cols-1 gap-6 ${prescriptionMedicines.length > 0 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <History className="w-3.5 h-3.5" /> {t('search.recent')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => submitQuery(item)}
                          className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-xl border border-gray-100 transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" /> {t('search.suggested')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => submitQuery(item)}
                          className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-800 text-sm font-medium rounded-xl border border-brand-100 transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  {prescriptionMedicines.length > 0 && (
                    <div className="md:col-span-1">
                      <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Pill className="w-3.5 h-3.5" /> {t('search.fromPrescription')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {prescriptionMedicines.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => submitQuery(item)}
                            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-sm font-medium rounded-xl border border-emerald-100 transition-colors"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {searchMode === 'image' && (
          <div className="space-y-4">
            {scanError && (
              <p role="alert" className="text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {scanError}
              </p>
            )}
            <div
              className={`border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-3xl p-8 text-center transition-colors group ${scanning ? 'opacity-75 cursor-wait pointer-events-none' : 'cursor-pointer hover:bg-brand-50'}`}
              onClick={openFilePicker}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openFilePicker();
              }}
              role="button"
              tabIndex={0}
              aria-busy={scanning}
            >
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-brand-100 group-hover:scale-105 transition-transform">
                {scanning ? (
                  <Loader2 className="w-9 h-9 text-brand-600 animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-brand-600" />
                )}
              </div>
              <p className="text-gray-900 font-bold text-xl mb-2">
                {scanning ? t('search.scanningPrescription') : t('search.uploadPrescription')}
              </p>
              {!scanning && (
                <>
                  <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto font-medium leading-relaxed">
                    {t('search.uploadDesc')}
                  </p>
                  <button
                    type="button"
                    className="bg-white border border-gray-200 text-gray-800 hover:border-brand-300 hover:text-brand-900 py-3 px-8 rounded-xl font-bold transition-all shadow-sm"
                  >
                    {t('search.chooseFile')}
                  </button>
                </>
              )}
              <input
                id="camera-search-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf,.pdf,.jpg,.jpeg,.png"
                className="hidden"
                disabled={scanning}
                onChange={handlePrescriptionFile}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

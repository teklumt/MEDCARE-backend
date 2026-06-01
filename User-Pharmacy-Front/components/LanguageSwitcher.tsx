'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type LanguageSwitcherProps = {
  className?: string;
};

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const select = (lang: 'en' | 'am') => {
    setLanguage(lang);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
        aria-label={open ? 'Close language menu' : 'Change language'}
        aria-expanded={open}
      >
        <Globe className="w-4 h-4 text-brand-600" />
        <span className="text-sm font-bold text-brand-950">{language === 'en' ? 'EN' : 'አማ'}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <button
            type="button"
            onClick={() => select('en')}
            className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition-colors ${
              language === 'en' ? 'text-brand-600 bg-brand-50/50' : 'text-gray-700'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => select('am')}
            className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition-colors ${
              language === 'am' ? 'text-brand-600 bg-brand-50/50' : 'text-gray-700'
            }`}
          >
            አማርኛ
          </button>
        </div>
      )}
    </div>
  );
}

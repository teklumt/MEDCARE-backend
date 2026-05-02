'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Mic, Camera, ArrowRight, History, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function DashboardSearch({ hideImageSearch = false }: { hideImageSearch?: boolean }) {
  const [searchMode, setSearchMode] = useState<'text' | 'voice' | 'image'>('text');
  const [query, setQuery] = useState('');
  const { t } = useLanguage();

  const recentSearches = [t('search.recent.1'), t('search.recent.2'), t('search.recent.3')];
  const suggestions = [t('search.suggest.1'), t('search.suggest.2'), t('search.suggest.3')];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-brand-100 overflow-hidden">
      {/* Search Tabs */}
      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => setSearchMode('text')}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${searchMode === 'text' ? 'text-brand-900 border-b-2 border-brand-600 bg-brand-50/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
        >
          <Search className="w-4 h-4" /> {t('search.text')}
        </button>
        <button 
          onClick={() => setSearchMode('voice')}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${searchMode === 'voice' ? 'text-brand-900 border-b-2 border-brand-600 bg-brand-50/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
        >
          <Mic className="w-4 h-4" /> {t('search.voice')}
        </button>
        {!hideImageSearch && (
          <button 
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
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block w-full pl-12 pr-16 py-4 bg-gray-50 border-transparent rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none font-medium text-lg" 
                placeholder={t('search.placeholder')} 
              />
              <button className="absolute inset-y-2 right-2 bg-brand-900 hover:bg-brand-800 text-white px-4 rounded-xl font-bold transition-colors flex items-center justify-center">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Suggestions & History */}
            {!query && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <History className="w-3.5 h-3.5" /> {t('search.recent')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(item => (
                      <button key={item} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-xl border border-gray-100 transition-colors">
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
                    {suggestions.map(item => (
                      <button key={item} className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-800 text-sm font-medium rounded-xl border border-brand-100 transition-colors">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {searchMode === 'voice' && (
          <div className="flex flex-col items-center justify-center py-6">
            <button className="w-24 h-24 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center hover:bg-brand-200 transition-colors mb-6 relative group shadow-inner">
              <div className="absolute inset-0 bg-brand-300 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
              <Mic className="w-10 h-10 relative z-10" />
            </button>
            <p className="text-gray-900 font-bold text-xl mb-2">{t('search.tapToSpeak')}</p>
            <p className="text-gray-500 text-sm font-medium">{t('search.supportsLanguages')}</p>
          </div>
        )}

        {searchMode === 'image' && (
          <div 
            className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-3xl p-8 text-center hover:bg-brand-50 transition-colors cursor-pointer group"
            onClick={() => document.getElementById('camera-search-upload')?.click()}
          >
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-brand-100 group-hover:scale-105 transition-transform">
              <Camera className="w-8 h-8 text-brand-600" />
            </div>
            <p className="text-gray-900 font-bold text-xl mb-2">{t('search.uploadPrescription')}</p>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto font-medium leading-relaxed">
              {t('search.uploadDesc')}
            </p>
            <button className="bg-white border border-gray-200 text-gray-800 hover:border-brand-300 hover:text-brand-900 py-3 px-8 rounded-xl font-bold transition-all shadow-sm">
              {t('search.chooseFile')}
            </button>
            <input 
              id="camera-search-upload"
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  // Handle file
                  console.log(e.target.files[0]);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

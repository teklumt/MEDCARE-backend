'use client';

import { useState } from 'react';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const scrollToPharmaciesSection = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (pathname === '/') {
      document.getElementById('for-pharmacies')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.assign('/#for-pharmacies');
    }
  };

  const toggleLanguage = (lang: 'en' | 'am') => {
    setLanguage(lang);
    setIsLangMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-accent-50/80 backdrop-blur-md border-b border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-900 rounded-full flex items-center justify-center">
                <span className="text-white font-serif font-bold text-xl">M</span>
              </div>
              <span className="font-heading font-bold text-2xl text-brand-900 tracking-tight hidden sm:block">
                MED-CARE
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#how-it-works" className="text-gray-600 hover:text-brand-900 font-medium transition-colors">
              {t('nav.howItWorks')}
            </Link>
            <Link href="#features" className="text-gray-600 hover:text-brand-900 font-medium transition-colors">
              {t('nav.features')}
            </Link>
            <a
              href="/#for-pharmacies"
              onClick={scrollToPharmaciesSection}
              className="text-gray-600 hover:text-brand-900 font-medium transition-colors cursor-pointer"
            >
              {t('nav.forPharmacies')}
            </a>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative z-50">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4 text-brand-600" />
                <span className="text-sm font-bold text-brand-950">{language === 'en' ? 'EN' : 'አማ'}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <button 
                    onClick={() => toggleLanguage('en')}
                    className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition-colors ${language === 'en' ? 'text-brand-600 bg-brand-50/50' : 'text-gray-700'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => toggleLanguage('am')}
                    className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition-colors ${language === 'am' ? 'text-brand-600 bg-brand-50/50' : 'text-gray-700'}`}
                  >
                    አማርኛ
                  </button>
                </div>
              )}
            </div>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <Link href="/login" className="text-brand-900 font-medium hover:text-brand-700 transition-colors px-2">
              {t('nav.login')}
            </Link>
            <Link href="/signup" className="bg-brand-900 hover:bg-brand-800 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow-md">
              {t('nav.signup')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-brand-900 p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              <Link href="#how-it-works" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-brand-50 rounded-lg">
                {t('nav.howItWorks')}
              </Link>
              <Link href="#features" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-brand-50 rounded-lg">
                {t('nav.features')}
              </Link>
              <a
                href="/#for-pharmacies"
                onClick={scrollToPharmaciesSection}
                className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-brand-50 rounded-lg cursor-pointer"
              >
                {t('nav.forPharmacies')}
              </a>
              <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-3 px-3">
                <div className="flex gap-2 mb-2">
                  <button 
                    onClick={() => toggleLanguage('en')}
                    className={`flex-1 py-2 text-sm rounded-lg border ${language === 'en' ? 'bg-brand-50 border-brand-200 text-brand-900 font-bold' : 'border-gray-200 text-gray-600'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => toggleLanguage('am')}
                    className={`flex-1 py-2 text-sm rounded-lg border ${language === 'am' ? 'bg-brand-50 border-brand-200 text-brand-900 font-bold' : 'border-gray-200 text-gray-600'}`}
                  >
                    አማርኛ
                  </button>
                </div>
                <Link href="/login" className="block w-full text-center text-brand-900 font-medium py-2 border border-brand-200 rounded-xl">
                  {t('nav.login')}
                </Link>
                <Link href="/signup" className="block w-full text-center bg-brand-900 text-white font-medium py-2 rounded-xl">
                  {t('nav.signup')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

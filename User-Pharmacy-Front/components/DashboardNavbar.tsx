'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Home, Search, Package, MessageSquare, User, ShoppingCart, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import NotificationBell from '@/components/NotificationBell';

export default function DashboardNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [userName, setUserName] = useState('Guest User');
  const [userInitial, setUserInitial] = useState('G');

  const navItems = [
    { name: t('dashnav.home'), href: '/dashboard', icon: Home },
    { name: t('dashnav.search'), href: '/dashboard/search', icon: Search },
    { name: t('dashnav.cart'), href: '/dashboard/cart', icon: ShoppingCart },
    { name: t('dashnav.orders'), href: '/dashboard/orders', icon: Package },
    { name: t('dashnav.chat'), href: '/dashboard/messages', icon: MessageSquare },
    { name: t('dashnav.support'), href: '/dashboard/support', icon: HelpCircle },
  ];

  useEffect(() => {
    const role = localStorage.getItem('medcare_role');
    if (role === 'pharmacy') {
      router.push('/pharmacy');
    }
    
    const updateHeaderName = () => {
      const fName = localStorage.getItem('medcare_first_name');
      const uName = localStorage.getItem('medcare_user_name');
      
      const displayName = fName && fName.trim() !== '' ? fName.trim() : (uName || 'Guest User');
      
      setUserName(displayName);
      setUserInitial(displayName.charAt(0).toUpperCase());
    };
    
    updateHeaderName();
    
    window.addEventListener('medcare_profile_updated', updateHeaderName);
    
    return () => {
      window.removeEventListener('medcare_profile_updated', updateHeaderName);
    };
  }, [router]);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-accent-50/90 backdrop-blur-md border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-900 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-serif font-bold text-xl">M</span>
                </div>
                <span className="font-heading font-bold text-2xl text-brand-900 tracking-tight hidden sm:block">
                  MED-CARE
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 relative ${
                      isActive 
                        ? 'bg-brand-100 text-brand-900' 
                        : 'text-gray-600 hover:bg-brand-50 hover:text-brand-900'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-brand-700' : ''}`} />
                    {item.name}
                    {item.name === 'Cart' && itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                    language === 'en' ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('am')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                    language === 'am' ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  አማ
                </button>
              </div>
              <NotificationBell api="med" portal="patient" />
              <div className="h-8 w-px bg-gray-200 mx-1"></div>
              <Link href="/dashboard/profile" className="flex items-center gap-3 hover:bg-brand-50 p-1.5 pr-4 rounded-full transition-colors border border-transparent hover:border-brand-100">
                <div className="w-9 h-9 rounded-full bg-brand-200 flex items-center justify-center text-brand-800 font-bold font-heading">
                  {userInitial}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 leading-none">{userName}</span>
                  <span className="text-xs text-gray-500 font-medium">{t('dashnav.location')}</span>
                </div>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-3">
              <NotificationBell api="med" portal="patient" className="p-0" />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-brand-900 p-2 bg-white rounded-full shadow-sm border border-gray-100"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between px-4 py-3.5 text-base font-medium rounded-xl transition-colors ${
                        isActive 
                          ? 'bg-brand-50 text-brand-900' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-700' : 'text-gray-400'}`} />
                        {item.name}
                      </div>
                      {item.name === 'Cart' && itemCount > 0 && (
                        <span className="bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <div className="px-4 py-2 mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('dashnav.language')}</span>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                          language === 'en' ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLanguage('am')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                          language === 'am' ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        አማ
                      </button>
                    </div>
                  </div>
                  <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="w-10 h-10 rounded-full bg-brand-200 flex items-center justify-center text-brand-800 font-bold font-heading">
                      {userInitial}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-gray-900">{userName}</span>
                      <span className="text-sm text-gray-500">{t('dashnav.viewProfile')}</span>
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Mobile Bottom Navigation (App-like feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50 px-6 py-3 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 relative ${isActive ? 'text-brand-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className="relative">
                <item.icon className={`w-6 h-6 ${isActive ? 'fill-brand-50' : ''}`} />
                {item.name === 'Cart' && itemCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Package, ShoppingCart, Truck, 
  MessageSquare, BarChart2, Settings, LogOut, ShieldCheck, HelpCircle 
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { clearPrescriptionScanSessionStorage } from '@/lib/prescriptionScanSession';

const NAV_ITEMS = [
  { id: 'Dashboard', href: '/pharmacy', icon: LayoutDashboard },
  { id: 'Inventory', href: '/pharmacy/inventory', icon: Package },
  { id: 'Orders', href: '/pharmacy/orders', icon: ShoppingCart, badge: 5 },
  { id: 'Deliveries', href: '/pharmacy/deliveries', icon: Truck },
  { id: 'Messages', href: '/pharmacy/messages', icon: MessageSquare, badge: 2 },
  { id: 'Analytics', href: '/pharmacy/analytics', icon: BarChart2 },
  { id: 'Support', href: '/pharmacy/support', icon: HelpCircle },
  { id: 'Settings', href: '/pharmacy/profile', icon: Settings },
];

const NAV_TRANSLATIONS: Record<string, { en: string; am: string }> = {
  Dashboard: { en: 'Dashboard', am: 'ዳሽቦርድ' },
  Inventory: { en: 'Inventory', am: 'ክምችት' },
  Orders: { en: 'Orders', am: 'ትዕዛዞች' },
  Deliveries: { en: 'Deliveries', am: 'ማድረስ' },
  Messages: { en: 'Messages', am: 'መልዕክቶች' },
  Analytics: { en: 'Analytics', am: 'ትንታኔዎች' },
  Support: { en: 'Support', am: 'ድጋፍ' },
  Settings: { en: 'Settings', am: 'ቅንብሮች' },
};

const EXTRA_TRANSLATIONS = {
  en: {
    mainBranch: 'Main Branch',
    verifiedPartner: 'Verified Partner',
    adminUser: 'Admin User',
    manager: 'Manager',
    logout: 'Log out'
  },
  am: {
    mainBranch: 'ዋና ቅርንጫፍ',
    verifiedPartner: 'የተረጋገጠ አጋር',
    adminUser: 'አስተዳዳሪ',
    manager: 'ስራ አስኪያጅ',
    logout: 'ውጣ'
  }
};

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pharmacyName, setPharmacyName] = useState('Pharmacy');
  const [pharmacyAvatar, setPharmacyAvatar] = useState<string | null>(null);

  const tExtra = EXTRA_TRANSLATIONS[language as keyof typeof EXTRA_TRANSLATIONS] || EXTRA_TRANSLATIONS.en;

  useEffect(() => {
    const role = localStorage.getItem('medcare_role');
    if (role !== 'pharmacy') {
      router.push('/signup');
    } else {
      setIsAuthorized(true);
      const storedName = localStorage.getItem('medcare_user_name') || localStorage.getItem('medcare_username');
      if (storedName) setPharmacyName(storedName);
      
      const loadAuth = () => {
        const storedName = localStorage.getItem('medcare_user_name') || localStorage.getItem('medcare_username');
        if (storedName) setPharmacyName(storedName);
      };

      const loadAvatar = () => {
        const photo = localStorage.getItem('medcare_pharmacy_avatar');
        setPharmacyAvatar(photo);
      };
      
      loadAuth();
      loadAvatar();
      
      const handleAvatarChange = () => {
        loadAvatar();
      };
      
      const handleAuthChange = () => {
        loadAuth();
      };
      
      window.addEventListener('avatar-changed', handleAvatarChange);
      window.addEventListener('auth-changed', handleAuthChange);
      return () => {
        window.removeEventListener('avatar-changed', handleAvatarChange);
        window.removeEventListener('auth-changed', handleAuthChange);
      };
    }
  }, [router]);

  const handleLogout = () => {
    clearPrescriptionScanSessionStorage();
    localStorage.removeItem('medcare_role');
    localStorage.removeItem('medcare_username');
    router.push('/');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-50">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-accent-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-brand-100 flex flex-col shrink-0">
        {/* Profile Section */}
        <div 
          className="p-6 border-b border-brand-50 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => router.push('/pharmacy/profile')}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-brand-900 rounded-full overflow-hidden flex items-center justify-center shrink-0">
              {pharmacyAvatar ? (
                <img src={pharmacyAvatar} alt="Pharmacy Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-serif font-bold">{pharmacyName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-brand-950 truncate">{pharmacyName}</h2>
              <p className="text-xs text-gray-500 truncate">{tExtra.mainBranch}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            {tExtra.verifiedPartner}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const itemLabel = NAV_TRANSLATIONS[item.id]?.[language as keyof typeof NAV_TRANSLATIONS[typeof item.id]] || item.id;
            return (
              <Link 
                key={item.id} 
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-brand-50 text-brand-900 font-bold' 
                    : 'text-gray-600 hover:bg-accent-50 hover:text-brand-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-700' : 'text-gray-400'}`} />
                  {itemLabel}
                </div>
                {item.badge && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-brand-200 text-brand-800' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-brand-50 bg-accent-50/50">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-brand-950 truncate">{tExtra.adminUser}</p>
              <p className="text-xs text-gray-500 truncate">{tExtra.manager}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title={tExtra.logout}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-accent-50/30">
        {children}
      </main>
    </div>
  );
}

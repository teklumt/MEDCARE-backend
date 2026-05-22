'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, Store, FileCheck, ShoppingCart, 
  AlertOctagon, BarChart2, Settings, 
  Bell, LogOut, ShieldCheck
} from 'lucide-react';
import { authApi } from '@/lib/auth-api';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Pharmacies', href: '/admin/pharmacies', icon: Store },
  { label: 'License Verification', href: '/admin/verification', icon: FileCheck, badge: 3 },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Complaints', href: '/admin/complaints', icon: AlertOctagon, badge: 5 },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { label: 'System Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    // Check if user is authenticated with backend
    if (!authApi.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = authApi.getCurrentUser();
    if (userData) {
      // Allow admin, pharmacy, and delivery roles to access admin panel
      if (['admin', 'pharmacy', 'delivery'].includes(userData.role)) {
        setAdminName(userData.username || userData.email.split('@')[0]);
        setIsAuthorized(true);
      } else {
        // Regular patients should go to user dashboard
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    await authApi.logout();
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
    <div className="flex h-screen bg-accent-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-brand-100 flex flex-col shrink-0">
        {/* Logo Section */}
        <div className="p-6 border-b border-brand-50">
          <Link href="/admin" className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-brand-900 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-serif font-bold text-sm">M</span>
            </div>
            <span className="font-serif font-bold text-xl text-brand-950 tracking-tight">
              MED-CARE
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 px-2 py-1 rounded-md w-fit border border-brand-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Portal
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
            return (
              <Link 
                key={item.label} 
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-brand-50 text-brand-900 font-bold' 
                    : 'hover:bg-accent-50 hover:text-brand-900 text-gray-600 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-700' : 'text-gray-400'}`} />
                  {item.label}
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
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold shrink-0">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-brand-950 truncate">{adminName}</p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {authApi.getCurrentUser()?.role || 'User'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              title="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Bar */}
        <header className="bg-white border-b border-brand-100 h-16 flex items-center justify-between px-6 shrink-0 z-10">
          {/* Top Bar Left Spacer */}
          <div className="flex-1 max-w-xl">
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-700">System Operational</span>
            </div>
            
            <div className="h-6 w-px bg-gray-200"></div>
            
            <button className="relative p-2 text-gray-400 hover:text-brand-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-accent-50/30">
          {children}
        </main>
      </div>
    </div>
  );
}

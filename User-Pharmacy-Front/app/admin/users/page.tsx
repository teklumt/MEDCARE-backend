'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Search, ShieldAlert, Edit, Trash2, Globe, ChevronDown } from 'lucide-react';
import { adminApi, type UserRoleKey } from '@/lib/admin-api';

const ROLE_KEYS: UserRoleKey[] = ['patient', 'pharmacy', 'delivery', 'admin'];

function parseRoleInput(raw: string): UserRoleKey | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (s === 'patient' || s === 'pat') return 'patient';
  if (s === 'pharmacy' || s === 'provider') return 'pharmacy';
  if (s === 'delivery' || s === 'driver') return 'delivery';
  if (s === 'admin' || s === 'administrator') return 'admin';
  return null;
}

const TRANSLATIONS = {
  en: {
    userManagement: 'User Management',
    userManagementSub: 'Manage patient accounts, handle suspensions, and review deletion requests.',
    searchPlaceholder: 'Search users by name, email, phone, or ID...',
    allRoles: 'All Roles',
    patient: 'Patient',
    provider: 'Provider',
    delivery: 'Delivery',
    adminRole: 'Admin',
    allStatuses: 'All Statuses',
    active: 'Active',
    suspended: 'Suspended',
    pendingDeletion: 'Pending Deletion',
    userDetails: 'User Details',
    contact: 'Contact',
    role: 'Role',
    status: 'Status',
    joinDate: 'Join Date',
    actions: 'Actions',
    viewProfile: 'View Profile',
    warnings: 'Warnings',
    noUsersFound: 'No users found matching your filters.'
  },
  am: {
    userManagement: 'የተጠቃሚ አስተዳደር',
    userManagementSub: 'የታካሚ አካውንቶችን ያስተዳድሩ፣ እገዳዎችን ይያዙ እና ይሰረዙ ጥያቄዎችን ይገምግሙ።',
    searchPlaceholder: 'ተጠቃሚዎችን በስም፣ በኢሜል፣ በስልክ፣ ወይም በመታወቂያ ይፈልጉ...',
    allRoles: 'ሁሉም ሚናዎች',
    patient: 'ታካሚ',
    provider: 'አቅራቢ',
    delivery: 'ማድረስ',
    adminRole: 'አስተዳዳር',
    allStatuses: 'ሁሉም ሁኔታዎች',
    active: 'ንቁ',
    suspended: 'ታግዷል',
    pendingDeletion: 'መሰረዝ በመጠባበቅ ላይ',
    userDetails: 'የተጠቃሚ መረጃ',
    contact: 'አድራሻ',
    role: 'ሚና',
    status: 'ሁኔታ',
    joinDate: 'የተመዘገቡበት ቀን',
    actions: 'ድርጊቶች',
    viewProfile: 'መገለጫ ይመልከቱ',
    warnings: 'ማስጠንቀቂያዎች',
    noUsersFound: 'ምንም ተጠቃሚዎች አልተገኙም።'
  }
};

const INITIAL_USERS = [
  { id: 'USR-1029', name: 'Abebe Kebede', phone: '+251 911 234 567', email: 'abebe@example.com', roleKey: 'patient' as UserRoleKey, status: 'Active', joinDate: '2024-01-15', warnings: 0 },
  { id: 'USR-1030', name: 'Sara Mohammed', phone: '+251 922 345 678', email: 'sara@example.com', roleKey: 'patient' as UserRoleKey, status: 'Suspended', joinDate: '2024-02-20', warnings: 2 },
  { id: 'USR-1031', name: 'Dawit Tadesse', phone: '+251 933 456 789', email: 'dawit@example.com', roleKey: 'patient' as UserRoleKey, status: 'Pending Deletion', joinDate: '2024-03-10', warnings: 0 },
];

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRoleKey>('all');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [users, setUsers] = useState(INITIAL_USERS);
  
  const { language, setLanguage } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  
  
  const toggleLanguage = (lang: 'en' | 'am') => {
    setLanguage(lang);
        setIsLangDropdownOpen(false);
  };

  const t = TRANSLATIONS[language];

  const filteredUsers = users.filter((user) => {
    const query = searchTerm.toLowerCase();
    const searchMatch = !query || 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query);

    const isRoleAll = roleFilter === 'all';
    const roleMatch = isRoleAll || user.roleKey === roleFilter;

    const isStatusAll = statusFilter === 'All Statuses' || statusFilter === t.allStatuses;
    const statusMatch = isStatusAll || user.status === statusFilter || (language === 'am' && statusFilter === t.active && user.status === 'Active') || (language === 'am' && statusFilter === t.suspended && user.status === 'Suspended') || (language === 'am' && statusFilter === t.pendingDeletion && user.status === 'Pending Deletion');

    return searchMatch && roleMatch && statusMatch;
  });

  const translateStatus = (status: string) => {
    switch(status) {
      case 'Active': return t.active;
      case 'Suspended': return t.suspended;
      case 'Pending Deletion': return t.pendingDeletion;
      default: return status;
    }
  };

  const translateRole = (roleKey: UserRoleKey) => {
    switch (roleKey) {
      case 'patient':
        return t.patient;
      case 'pharmacy':
        return t.provider;
      case 'delivery':
        return t.delivery;
      case 'admin':
        return t.adminRole;
      default:
        return roleKey;
    }
  };

  const handleEditUser = async (id: string, currentRoleKey: UserRoleKey) => {
    const raw = window.prompt(
      `Edit role for ${id}\nAllowed: patient, pharmacy (or provider), delivery (or driver), admin — case insensitive`,
      currentRoleKey,
    );
    if (raw === null) return;
    const roleKey = parseRoleInput(raw);
    if (!roleKey) {
      alert('Invalid role. Use patient, pharmacy, delivery, or admin (synonyms: provider, driver).');
      return;
    }
    try {
      await adminApi.patchUser(id, { role: roleKey });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, roleKey } : u)));
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminApi.deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (error) {
        alert((error as Error).message);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await adminApi.updateUserStatus(id, nextStatus === 'Active');
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    } catch (error) {
      alert((error as Error).message);
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await adminApi.getUsers();
        const mapped = data.map((user: any) => {
          const rk = user.role as string;
          const roleKey: UserRoleKey = ROLE_KEYS.includes(rk as UserRoleKey)
            ? (rk as UserRoleKey)
            : 'patient';
          return {
            id: user._id,
            name: user.username,
            phone: user.phone,
            email: user.email,
            roleKey,
            status: user.isActive ? 'Active' : 'Suspended',
            joinDate: user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : '-',
            warnings: 0,
          };
        });
        setUsers(mapped);
      } catch (error) {
        console.error('Failed to load users', error);
      }
    };

    loadUsers();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">{t.userManagement}</h1>
          <p className="text-gray-500 text-sm">{t.userManagementSub}</p>
        </div>
        
        <div className="flex items-center">
          <div className="relative z-50">
            <button 
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-bold text-brand-950">{language === 'en' ? 'EN' : 'አማ'}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isLangDropdownOpen && (
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
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={roleFilter}
            onChange={(e) => {
              const v = e.target.value;
              setRoleFilter(v === 'all' ? 'all' : (v as UserRoleKey));
            }}
            className="bg-accent-50 border border-gray-200 text-brand-950 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">{t.allRoles}</option>
            <option value="patient">{t.patient}</option>
            <option value="pharmacy">{t.provider}</option>
            <option value="delivery">{t.delivery}</option>
            <option value="admin">{t.adminRole}</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-accent-50 border border-gray-200 text-brand-950 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All Statuses">{t.allStatuses}</option>
            <option value="Active">{t.active}</option>
            <option value="Suspended">{t.suspended}</option>
            <option value="Pending Deletion">{t.pendingDeletion}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-medium">{t.userDetails}</th>
                <th className="p-4 font-medium">{t.contact}</th>
                <th className="p-4 font-medium">{t.role}</th>
                <th className="p-4 font-medium">{t.status}</th>
                <th className="p-4 font-medium">{t.joinDate}</th>
                <th className="p-4 font-medium text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-accent-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-brand-950 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.id}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-700">{user.phone}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{translateRole(user.roleKey)}</td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        user.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                        user.status === 'Suspended' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {translateStatus(user.status)}
                      </span>
                      {user.warnings > 0 && (
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> {user.warnings} {t.warnings}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{user.joinDate}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleToggleStatus(user.id, user.status)}
                         className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded-lg transition-colors"
                       >
                         Toggle Status
                       </button>
                      <button className="text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                        {t.viewProfile}
                      </button>
                      <button 
                        onClick={() => handleEditUser(user.id, user.roleKey)}
                        title="Edit User Role"
                        className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                   <td colSpan={6} className="p-8 text-center text-gray-500 bg-white">
                      {t.noUsersFound}
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ChevronLeft,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  ShieldOff,
  User as UserIcon,
  Calendar,
  Languages
} from 'lucide-react';
import { adminApi, type AdminUserDetail, type UserRoleKey } from '@/lib/admin-api';

function formatDt(v?: string | null): string {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
}

export default function AdminUserProfilePage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : '';

  const [profile, setProfile] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id.trim()) {
      setError('Invalid user id.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminApi.getUser(id);
        if (!cancelled) setProfile(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load user');
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-12">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600" aria-hidden />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" aria-hidden />
        <p className="font-medium text-gray-800">{error ?? 'User not found'}</p>
        <Link href="/admin/users" className="mt-4 inline-block font-bold text-brand-700 hover:underline">
          Back to users
        </Link>
      </div>
    );
  }

  const roleLabel: Record<UserRoleKey, string> = {
    patient: 'Patient',
    pharmacy: 'Pharmacy',
    delivery: 'Delivery',
    admin: 'Admin'
  };

  const addresses = Array.isArray(profile.addresses) ? profile.addresses : [];

  return (
    <div className="mx-auto max-w-4xl w-full space-y-6 p-6 md:p-8">
      <Link
        href="/admin/users"
        className="mb-2 inline-flex items-center font-medium text-brand-700 transition-colors hover:text-brand-900"
      >
        <ChevronLeft className="mr-1 h-4 w-4" aria-hidden /> Back to Users
      </Link>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-br from-brand-50/80 to-white p-6 sm:flex-row sm:items-center">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
            {profile.profilePhotoUrl ? (
              <Image
                src={profile.profilePhotoUrl}
                alt=""
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-brand-700">
                <UserIcon className="h-10 w-10" aria-hidden />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-2xl font-bold text-brand-950">{profile.username}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-brand-900">
                {roleLabel[profile.role]}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  profile.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {profile.isActive ? 'Active' : 'Suspended'}
              </span>
              {profile.isLocked ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                  Locked
                </span>
              ) : null}
              {profile.mfaEnabled ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-800">
                  MFA on
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600">
                  MFA off
                </span>
              )}
            </div>
            <p className="mt-3 font-mono text-xs text-gray-500">ID: {String(profile._id)}</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100 md:grid md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="space-y-4 p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Contact</h2>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-400">Email</p>
                <a href={`mailto:${profile.email}`} className="break-all font-medium text-gray-900 hover:text-brand-700">
                  {profile.email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <div>
                <p className="text-xs font-bold text-gray-400">Phone</p>
                <a href={`tel:${profile.phone}`} className="font-medium text-gray-900 hover:text-brand-700">
                  {profile.phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Languages className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <div>
                <p className="text-xs font-bold text-gray-400">Language</p>
                <p className="font-medium text-gray-900">{profile.language || '—'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Security & audit</h2>
            <div className="flex items-start gap-3">
              {profile.isLocked ? (
                <ShieldOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
              ) : (
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              )}
              <div>
                <p className="text-xs font-bold text-gray-400">Account lock</p>
                <p className="font-medium text-gray-900">{profile.isLocked ? 'Locked' : 'Not locked'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <div>
                <p className="text-xs font-bold text-gray-400">Failed login attempts</p>
                <p className="font-medium text-gray-900">{profile.failedLoginAttempts ?? 0}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <div>
                <p className="text-xs font-bold text-gray-400">Last login</p>
                <p className="font-medium text-gray-900">{formatDt(profile.lastLoginAt)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <div>
                <p className="text-xs font-bold text-gray-400">Lock expires</p>
                <p className="font-medium text-gray-900">{formatDt(profile.lockExpiresAt)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <div className="text-sm">
                <p className="text-xs font-bold text-gray-400">Created</p>
                <p className="font-medium text-gray-900">{formatDt(profile.createdAt)}</p>
                <p className="mt-2 text-xs font-bold text-gray-400">Updated</p>
                <p className="font-medium text-gray-900">{formatDt(profile.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-950">
          <MapPin className="h-5 w-5 text-brand-600" aria-hidden /> Saved addresses
        </h2>
        {addresses.length === 0 ? (
          <p className="text-sm text-gray-500">No addresses on file.</p>
        ) : (
          <ul className="space-y-4">
            {addresses.map((addr, idx) => {
              const street = typeof addr.street === 'string' ? addr.street : '';
              const city = typeof addr.city === 'string' ? addr.city : '';
              const subCity = typeof addr.subCity === 'string' ? addr.subCity : '';
              const label = typeof addr.label === 'string' ? addr.label : `Address ${idx + 1}`;
              const recipient = typeof addr.recipientName === 'string' ? addr.recipientName : '';
              const addrPhone = typeof addr.phone === 'string' ? addr.phone : '';
              const isDefault = Boolean(addr.isDefault);
              return (
                <li key={typeof addr._id === 'string' ? addr._id : idx} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-gray-900">{label}</span>
                    {isDefault ? (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-900">
                        Default
                      </span>
                    ) : null}
                  </div>
                  {recipient ? (
                    <p className="mt-1 font-medium text-gray-800">{recipient}</p>
                  ) : null}
                  {(street || subCity || city) && (
                    <p className="mt-1 text-gray-700">
                      {[street, subCity, city].filter(Boolean).join(', ') || '—'}
                    </p>
                  )}
                  {addrPhone ? <p className="mt-1 text-gray-600">{addrPhone}</p> : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        Read-only overview. Manage role and suspension from Users list actions.
      </p>
    </div>
  );
}

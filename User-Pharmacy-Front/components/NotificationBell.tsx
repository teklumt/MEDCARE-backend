'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Loader2 } from 'lucide-react';
import {
  listMedNotifications,
  markAllMedNotificationsRead,
  markMedNotificationsRead,
  type StoredNotification,
} from '@/lib/api';
import { listAdminNotifications, markAdminNotificationsRead } from '@/lib/admin-api';

export type NotificationBellApi = 'med' | 'admin';
export type NotificationBellPortal = 'patient' | 'pharmacy' | 'delivery';

/** `end` = panel grows left (navbar right). `start` = panel grows right (narrow left sidebar). */
export type NotificationPanelAlign = 'end' | 'start';

type Props = {
  api: NotificationBellApi;
  portal?: NotificationBellPortal;
  className?: string;
  panelAlign?: NotificationPanelAlign;
};

const BODY_PREVIEW_LEN = 90;

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

function resolveHref(
  n: StoredNotification,
  api: NotificationBellApi,
  portal: NotificationBellPortal = 'patient'
): string | null {
  if (n.entityType === 'order') {
    if (api === 'admin') return '/admin/orders';
    if (portal === 'pharmacy') return '/pharmacy/orders';
    if (portal === 'delivery') return '/delivery';
    return '/dashboard/orders';
  }
  if (n.entityType === 'complaint') {
    if (api === 'admin') return '/admin/complaints';
    if (portal === 'pharmacy') return '/pharmacy/support';
    return '/dashboard/support';
  }
  return null;
}

function NotificationBody({ body }: { body: string }) {
  const [expanded, setExpanded] = useState(false);
  const trimmed = body.trim();
  const needsToggle = trimmed.length > BODY_PREVIEW_LEN;
  const preview =
    needsToggle && !expanded
      ? `${trimmed.slice(0, BODY_PREVIEW_LEN).trimEnd()}…`
      : trimmed;

  return (
    <div className="mt-1">
      <p className="text-xs text-gray-600 leading-relaxed break-words">{preview}</p>
      {needsToggle && (
        <button
          type="button"
          className="text-xs font-semibold text-brand-700 hover:text-brand-900 mt-1"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {expanded ? 'Less' : 'More'}
        </button>
      )}
    </div>
  );
}

function NotificationRow({
  n,
  href,
  unread,
  onMarkRead,
}: {
  n: StoredNotification;
  href: string | null;
  unread: boolean;
  onMarkRead: (n: StoredNotification) => void;
}) {
  const rowClass = `block w-full text-left px-4 py-3 hover:bg-brand-50/60 ${unread ? 'bg-brand-50/40' : ''}`;
  const content = (
    <>
      <p className={`text-sm font-semibold leading-snug break-words ${unread ? 'text-brand-950' : 'text-gray-700'}`}>
        {n.title}
      </p>
      <NotificationBody body={n.body} />
      <p className="text-[10px] text-gray-400 mt-1.5">{formatWhen(n.createdAt)}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={rowClass} onClick={() => onMarkRead(n)}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={rowClass} onClick={() => onMarkRead(n)}>
      {content}
    </button>
  );
}

export default function NotificationBell({
  api,
  portal = 'patient',
  className = '',
  panelAlign = 'end',
}: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<StoredNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadMoreBusy, setLoadMoreBusy] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (typeof window === 'undefined') return;
      try {
        if (pageNum === 1 && !append) setLoading(true);
        if (append) setLoadMoreBusy(true);

        const data =
          api === 'admin'
            ? await listAdminNotifications(pageNum, 7)
            : await listMedNotifications(pageNum, 7);

        setUnreadCount(data.unreadCount);
        setHasMore(data.hasMore);
        setPage(data.page);

        setItems((prev) => {
          if (append) {
            const seen = new Set(prev.map((x) => x._id));
            const next = [...prev];
            for (const row of data.notifications) {
              if (!seen.has(row._id)) {
                seen.add(row._id);
                next.push(row);
              }
            }
            return next;
          }
          return data.notifications;
        });
      } catch {
        if (!append && pageNum === 1) {
          setItems([]);
          setUnreadCount(0);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
        setLoadMoreBusy(false);
      }
    },
    [api]
  );

  useEffect(() => {
    fetchPage(1, false).catch(() => {});
    const iv = window.setInterval(() => {
      void fetchPage(1, false);
    }, 60_000);
    return () => clearInterval(iv);
  }, [fetchPage]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const onToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) void fetchPage(1, false);
  };

  const onLoadMore = () => {
    if (!hasMore || loadMoreBusy) return;
    void fetchPage(page + 1, true);
  };

  const onMarkAll = async () => {
    try {
      if (api === 'admin') await markAdminNotificationsRead({ all: true });
      else await markAllMedNotificationsRead();
      setUnreadCount(0);
      setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    } catch {
      /* ignore */
    }
  };

  const onRowClick = (n: StoredNotification) => {
    if (n.readAt) return;
    void (async () => {
      try {
        if (api === 'admin') await markAdminNotificationsRead({ ids: [n._id] });
        else await markMedNotificationsRead([n._id]);
        setUnreadCount((c) => Math.max(0, c - 1));
        setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, readAt: new Date().toISOString() } : x)));
      } catch {
        /* ignore */
      }
    })();
  };

  const panelId = useMemo(() => 'notification-panel', []);

  const panelPositionClass =
    panelAlign === 'start'
      ? 'left-0 right-auto'
      : 'right-0 left-auto';

  return (
    <div ref={wrapRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="p-2.5 text-gray-600 hover:text-brand-900 hover:bg-brand-50 rounded-full transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {open && (
        <div
          id={panelId}
          className={`absolute ${panelPositionClass} mt-2 z-[200] w-[min(calc(100vw-1.5rem),20rem)] sm:w-80 rounded-xl border border-brand-100 bg-white shadow-xl overflow-hidden`}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-accent-50/80 gap-2">
            <span className="text-xs font-bold text-brand-900 uppercase tracking-wide shrink-0">
              Notifications
            </span>
            <button
              type="button"
              onClick={() => void onMarkAll()}
              className="text-xs font-semibold text-brand-700 hover:text-brand-900 shrink-0"
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto overscroll-contain">
            {loading && items.length === 0 ? (
              <div className="flex justify-center py-8 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-gray-500 px-4 py-6 text-center">No notifications yet.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {items.map((n) => (
                  <li key={n._id}>
                    <NotificationRow
                      n={n}
                      href={resolveHref(n, api, portal)}
                      unread={!n.readAt}
                      onMarkRead={onRowClick}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {hasMore && (
            <div className="border-t border-gray-100 p-2">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loadMoreBusy}
                className="w-full py-2 text-xs font-bold text-brand-800 hover:bg-brand-50 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadMoreBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

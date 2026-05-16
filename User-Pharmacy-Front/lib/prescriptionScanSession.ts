/**
 * OCR "From prescription" chip list in sessionStorage.
 * Scoped per user id when present; cleared on logout.
 */

export const PRESCRIPTION_SCAN_SESSION_PREFIX = 'dashboard:prescription-scan';

const LEGACY_PRESCRIPTION_SCAN_KEY = PRESCRIPTION_SCAN_SESSION_PREFIX;

function getMedcareStoredUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('medcare_user_data');
    if (!raw) return null;
    const u = JSON.parse(raw) as { id?: string; userId?: string; _id?: string };
    const id = u.id ?? u.userId ?? (typeof u._id === 'string' ? u._id : null);
    return typeof id === 'string' && id.trim() ? id : null;
  } catch {
    return null;
  }
}

export function getPrescriptionScanSessionStorageKey(): string {
  const id = getMedcareStoredUserId();
  return id ? `${PRESCRIPTION_SCAN_SESSION_PREFIX}:${id}` : `${PRESCRIPTION_SCAN_SESSION_PREFIX}:anon`;
}

export function clearPrescriptionScanSessionStorage(): void {
  if (typeof window === 'undefined') return;
  const toRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i);
    if (!k) continue;
    if (k === LEGACY_PRESCRIPTION_SCAN_KEY || k.startsWith(`${PRESCRIPTION_SCAN_SESSION_PREFIX}:`)) {
      toRemove.push(k);
    }
  }
  toRemove.forEach((key) => sessionStorage.removeItem(key));
}

export function readPrescriptionScanSessionPayload(): string | null {
  if (typeof window === 'undefined') return null;
  const keyed = getPrescriptionScanSessionStorageKey();
  const fromKeyed = sessionStorage.getItem(keyed);
  if (fromKeyed != null) return fromKeyed;

  const legacy = sessionStorage.getItem(LEGACY_PRESCRIPTION_SCAN_KEY);
  if (legacy) {
    sessionStorage.removeItem(LEGACY_PRESCRIPTION_SCAN_KEY);
    sessionStorage.setItem(keyed, legacy);
    return legacy;
  }

  return null;
}

export function writePrescriptionScanSessionPayload(serialized: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(LEGACY_PRESCRIPTION_SCAN_KEY);
  sessionStorage.setItem(getPrescriptionScanSessionStorageKey(), serialized);
}

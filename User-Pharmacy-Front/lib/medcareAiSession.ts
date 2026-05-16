/**
 * MedCare AI thread id (maps to webhook session_id), scoped per user in sessionStorage.
 */

export const MEDCARE_AI_SESSION_PREFIX = 'dashboard:medcare-ai';

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

export function getMedcareAiSessionStorageKey(): string {
  const id = getMedcareStoredUserId();
  return id ? `${MEDCARE_AI_SESSION_PREFIX}:${id}` : `${MEDCARE_AI_SESSION_PREFIX}:anon`;
}

export function readMedcareAiConversationId(): string | null {
  if (typeof window === 'undefined') return null;
  const v = sessionStorage.getItem(getMedcareAiSessionStorageKey());
  return v?.trim() ? v.trim() : null;
}

export function writeMedcareAiConversationId(id: string | null): void {
  if (typeof window === 'undefined') return;
  const key = getMedcareAiSessionStorageKey();
  if (!id?.trim()) sessionStorage.removeItem(key);
  else sessionStorage.setItem(key, id.trim());
}

export function clearMedcareAiSessionStorage(): void {
  if (typeof window === 'undefined') return;
  const toRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i);
    if (!k) continue;
    if (k === MEDCARE_AI_SESSION_PREFIX || k.startsWith(`${MEDCARE_AI_SESSION_PREFIX}:`)) {
      toRemove.push(k);
    }
  }
  toRemove.forEach((key) => sessionStorage.removeItem(key));
}

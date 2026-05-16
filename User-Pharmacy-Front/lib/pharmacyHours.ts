export const WEEKDAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export type DayHours = {
  open: boolean;
  allDay: boolean;
  openTime: string;
  closeTime: string;
};

export type WeeklyHours = Record<WeekdayKey, DayHours>;

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

const OPENING_HOURS_JSON_PREFIX = '{"v":1';

export function defaultDayHours(): DayHours {
  return { open: true, allDay: false, openTime: '08:00', closeTime: '20:00' };
}

export function defaultWeeklyHours(): WeeklyHours {
  return WEEKDAY_KEYS.reduce((acc, key) => {
    acc[key] = defaultDayHours();
    return acc;
  }, {} as WeeklyHours);
}

export function serializeOpeningHours(weekly: WeeklyHours): string {
  return JSON.stringify({ v: 1, days: weekly });
}

export function parseOpeningHours(raw?: string | null): {
  weekly: WeeklyHours;
  legacyText: string | null;
} {
  if (!raw?.trim()) {
    return { weekly: defaultWeeklyHours(), legacyText: null };
  }

  const trimmed = raw.trim();
  if (trimmed.startsWith('{') && trimmed.includes('"days"')) {
    try {
      const parsed = JSON.parse(trimmed) as { v?: number; days?: Partial<WeeklyHours> };
      const weekly = defaultWeeklyHours();
      if (parsed.days) {
        for (const key of WEEKDAY_KEYS) {
          const d = parsed.days[key];
          if (d) {
            weekly[key] = {
              open: Boolean(d.open),
              allDay: Boolean(d.allDay),
              openTime: typeof d.openTime === 'string' ? d.openTime : '08:00',
              closeTime: typeof d.closeTime === 'string' ? d.closeTime : '20:00'
            };
          }
        }
      }
      return { weekly, legacyText: null };
    } catch {
      return { weekly: defaultWeeklyHours(), legacyText: trimmed };
    }
  }

  return { weekly: defaultWeeklyHours(), legacyText: trimmed };
}

export function formatOpeningHoursForDisplay(raw?: string | null): string {
  if (!raw?.trim()) return 'Hours not listed';

  const { weekly, legacyText } = parseOpeningHours(raw);
  if (legacyText) return legacyText;

  const lines: string[] = [];
  for (const key of WEEKDAY_KEYS) {
    const d = weekly[key];
    const label = WEEKDAY_LABELS[key];
    if (!d.open) {
      lines.push(`${label}: Closed`);
    } else if (d.allDay) {
      lines.push(`${label}: Open 24 hours`);
    } else {
      lines.push(`${label}: ${formatTime12h(d.openTime)} – ${formatTime12h(d.closeTime)}`);
    }
  }
  return lines.join('\n');
}

function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr);
  const m = mStr ?? '00';
  if (!Number.isFinite(h)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${period}`;
}

export function isStructuredOpeningHours(raw?: string | null): boolean {
  return Boolean(raw?.trim().startsWith(OPENING_HOURS_JSON_PREFIX));
}

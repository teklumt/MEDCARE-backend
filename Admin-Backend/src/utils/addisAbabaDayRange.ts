/** IANA timezone for Ethiopia (UTC+3, no DST). */
export const ADDIS_ABABA_TIMEZONE = "Africa/Addis_Ababa";

/**
 * Calendar-day bounds for Addis Ababa, expressed as UTC Date instances suitable for MongoDB queries.
 * Uses local midnight +03:00 for the calendar date that `now` falls on in Addis Ababa.
 */
export function getAddisAbabaDayRangeUtc(now: Date = new Date()): {
  start: Date;
  endExclusive: Date;
  /** YYYY-MM-DD in Addis Ababa on that calendar day */
  dayLabelAddis: string;
} {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ADDIS_ABABA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  const dayLabelAddis = `${y}-${m}-${d}`;

  const start = new Date(`${dayLabelAddis}T00:00:00+03:00`);
  const endExclusive = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, endExclusive, dayLabelAddis };
}

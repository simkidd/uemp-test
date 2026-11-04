import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);

export type DateInput = string | number | Date | dayjs.Dayjs | null | undefined;

/**
 * Standard date & time formats used across the university portal
 */
export const DATE_FORMATS = {
  DATE_SHORT: "DD/MM/YYYY", // e.g. 03/11/2026
  DATE_MEDIUM: "DD MMM YYYY", // e.g. 03 Nov 2026
  DATE_LONG: "MMMM D, YYYY", // e.g. November 3, 2026
  DATE_FULL: "dddd, MMMM D, YYYY", // e.g. Tuesday, November 3, 2026
  TIME_12H: "h:mm A", // e.g. 10:35 PM
  TIME_24H: "HH:mm", // e.g. 22:35
  TIME_WITH_SECONDS: "h:mm:ss A", // e.g. 10:35:12 PM
  DATETIME_SHORT: "DD/MM/YYYY h:mm A", // e.g. 03/11/2026 10:35 PM
  DATETIME_MEDIUM: "DD MMM YYYY, h:mm A", // e.g. 03 Nov 2026, 10:35 PM
  DATETIME_LONG: "MMMM D, YYYY [at] h:mm A", // e.g. November 3, 2026 at 10:35 PM
  ISO_DATE: "YYYY-MM-DD", // e.g. 2026-11-03
} as const;

/**
 * Format a date into a standard human-readable date string
 */
export function formatDate(
  date: DateInput,
  format: string = DATE_FORMATS.DATE_MEDIUM,
  fallback: string = "—"
): string {
  if (!date) return fallback;
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format(format) : fallback;
}

/**
 * Format a date and time string
 */
export function formatDateTime(
  date: DateInput,
  format: string = DATE_FORMATS.DATETIME_MEDIUM,
  fallback: string = "—"
): string {
  if (!date) return fallback;
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format(format) : fallback;
}

/**
 * Format time only
 */
export function formatTime(
  date: DateInput,
  format: string = DATE_FORMATS.TIME_12H,
  fallback: string = "—"
): string {
  if (!date) return fallback;
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format(format) : fallback;
}

/**
 * Format a date relative to now (e.g. "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(
  date: DateInput,
  fallback: string = "—"
): string {
  if (!date) return fallback;
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.fromNow() : fallback;
}

/**
 * Format a date range (e.g., "01 Oct 2026 – 31 Jul 2027")
 */
export function formatDateRange(
  startDate: DateInput,
  endDate: DateInput,
  format: string = DATE_FORMATS.DATE_MEDIUM,
  fallback: string = "—"
): string {
  const startStr = formatDate(startDate, format, "");
  const endStr = formatDate(endDate, format, "");

  if (startStr && endStr) return `${startStr} – ${endStr}`;
  if (startStr) return `From ${startStr}`;
  if (endStr) return `Until ${endStr}`;
  return fallback;
}

/**
 * Check if a date has passed
 */
export function isPastDate(date: DateInput): boolean {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs());
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: DateInput): boolean {
  if (!date) return false;
  return dayjs(date).isAfter(dayjs());
}

export { dayjs };
export default dayjs;

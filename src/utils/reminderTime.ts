/** Pure helpers for the daily-reminder time (stored as "HH:MM", 24h). */

export interface HourMinute {
  hour: number;
  minute: number;
}

const FALLBACK: HourMinute = { hour: 8, minute: 0 };

export function parseTimeHHMM(value: string | null | undefined): HourMinute {
  if (!value) return { ...FALLBACK };
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return { ...FALLBACK };
  return {
    hour: Math.min(23, Math.max(0, parseInt(m[1], 10))),
    minute: Math.min(59, Math.max(0, parseInt(m[2], 10))),
  };
}

export function formatTimeHHMM({ hour, minute }: HourMinute): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Human 12-hour label, e.g. "8:00 AM". */
export function formatTimeLabel(value: string | null | undefined): string {
  const { hour, minute } = parseTimeHHMM(value);
  const period = hour < 12 ? 'AM' : 'PM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${period}`;
}

/** Preset reminder times the UI cycles through. */
export const REMINDER_PRESETS = ['06:00', '08:00', '12:00', '18:00', '21:00'];

export function nextPreset(current: string | null | undefined): string {
  const normalized = formatTimeHHMM(parseTimeHHMM(current));
  const idx = REMINDER_PRESETS.indexOf(normalized);
  return REMINDER_PRESETS[(idx + 1) % REMINDER_PRESETS.length];
}

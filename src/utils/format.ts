import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Internal: UTC. Display: Asia/Seoul (KST = UTC+9)
export const TZ = 'Asia/Seoul';

export function fmtDateTime(ms: number | null | undefined): string {
  if (!ms) return '-';
  return dayjs(ms).tz(TZ).format('YYYY-MM-DD HH:mm');
}

export function fmtDate(ms: number | null | undefined): string {
  if (!ms) return '-';
  return dayjs(ms).tz(TZ).format('YYYY-MM-DD');
}

export function fmtPnl(v: number | null | undefined, digits = 2): string {
  if (v == null) return '-';
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(digits)}`;
}

export function fmtPct(v: number | null | undefined): string {
  if (v == null) return '-';
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

export function fmtHoldTime(sec: number | null | undefined): string {
  if (!sec) return '-';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m}m`;
}

export function fmtPrice(v: number | null | undefined, digits = 2): string {
  if (v == null) return '-';
  return v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function fmtUsdt(v: number): string {
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function presetToRange(preset: string): { from_ms: number | null; to_ms: number | null } {
  const now = Date.now();
  switch (preset) {
    case '7d':  return { from_ms: now - 7  * 86400000, to_ms: now };
    case '30d': return { from_ms: now - 30 * 86400000, to_ms: now };
    case '90d': return { from_ms: now - 90 * 86400000, to_ms: now };
    default:    return { from_ms: null, to_ms: null };
  }
}

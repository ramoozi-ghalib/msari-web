import type { Discount } from '@/types';

export type DiscountSource = 'hotel' | 'global';

export interface EffectiveDiscount {
  percent: number;
  source: DiscountSource | null;
  startAt: string | null;
  endAt: string | null;
}

function clampDiscountPercent(raw: unknown): number {
  const num = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.min(90, Math.round(num * 100) / 100);
}

function parseTimestamp(raw: unknown): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw;
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as { toDate?: () => Date; _seconds?: number; seconds?: number };
    if (typeof obj.toDate === 'function') {
      const d = obj.toDate();
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const secs = typeof obj._seconds === 'number' ? obj._seconds : obj.seconds;
    if (typeof secs === 'number' && Number.isFinite(secs)) {
      return new Date(secs * 1000);
    }
  }
  if (typeof raw === 'string' || typeof raw === 'number') {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function isWindowActive(startAt: Date | null, endAt: Date | null, now: Date): boolean {
  if (startAt && now.getTime() < startAt.getTime()) return false;
  if (endAt && now.getTime() > endAt.getTime()) return false;
  return true;
}

/**
 * Mirrors functions/index.js & Flutter DiscountPricingResolver:
 * rounds to 2 decimals and clamps positive prices to at least $0.01.
 */
export function applyPercentageDiscountUsd(baseUsd: number, percent: number): number {
  const safeBase = Number.isFinite(baseUsd) && baseUsd > 0 ? baseUsd : 0;
  const pct = clampDiscountPercent(percent);
  if (safeBase <= 0 || pct <= 0) return Math.round(safeBase * 100) / 100;
  const discounted = Math.round(safeBase * (1 - pct / 100) * 100) / 100;
  return Math.max(0.01, discounted);
}

/**
 * Precedence:
 * 1. Active hotel-specific discount overrides global.
 * 2. Hotel `excludeGlobal: true` opts out of global discount.
 * 3. Active global discount (`app_settings/discounts`).
 * 4. Otherwise 0%.
 */
export function resolveEffectiveDiscount(
  hotelDiscount: unknown,
  globalDiscount: unknown,
  now: Date = new Date()
): EffectiveDiscount {
  const hd = hotelDiscount && typeof hotelDiscount === 'object' ? (hotelDiscount as Record<string, unknown>) : null;
  if (hd) {
    const pct = clampDiscountPercent(hd.percent);
    const startAt = parseTimestamp(hd.startAt);
    const endAt = parseTimestamp(hd.endAt);
    if (hd.enabled === true && pct > 0 && isWindowActive(startAt, endAt, now)) {
      return {
        percent: pct,
        source: 'hotel',
        startAt: startAt ? startAt.toISOString() : null,
        endAt: endAt ? endAt.toISOString() : null,
      };
    }
    if (hd.excludeGlobal === true) {
      return { percent: 0, source: null, startAt: null, endAt: null };
    }
  }

  const gd = globalDiscount && typeof globalDiscount === 'object' ? (globalDiscount as Record<string, unknown>) : null;
  if (gd) {
    const pct = clampDiscountPercent(gd.percent);
    const startAt = parseTimestamp(gd.startAt);
    const endAt = parseTimestamp(gd.endAt);
    if (gd.isEnabled === true && pct > 0 && isWindowActive(startAt, endAt, now)) {
      return {
        percent: pct,
        source: 'global',
        startAt: startAt ? startAt.toISOString() : null,
        endAt: endAt ? endAt.toISOString() : null,
      };
    }
  }

  return { percent: 0, source: null, startAt: null, endAt: null };
}

export function buildWebsiteDiscount(
  percent: unknown,
  source?: unknown,
  rawWindow?: { startAt?: unknown; endAt?: unknown } | null
): Discount | undefined {
  const pct = clampDiscountPercent(percent);
  if (pct <= 0) return undefined;
  const normalizedSource: DiscountSource | undefined =
    source === 'hotel' || source === 'global' ? source : undefined;
  const start = parseTimestamp(rawWindow?.startAt);
  const end = parseTimestamp(rawWindow?.endAt);
  return {
    id: normalizedSource ? `${normalizedSource}-discount` : 'discount',
    percentage: pct,
    validFrom: start ? start.toISOString() : '',
    validTo: end ? end.toISOString() : '',
    source: normalizedSource,
  };
}

export function formatDiscountPercent(percent: number): string {
  const rounded = Math.round(percent * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

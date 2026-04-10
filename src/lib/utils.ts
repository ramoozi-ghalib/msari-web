import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: 'USD' | 'SAR' | 'YER' = 'USD'): string {
  const formats: Record<string, { locale: string; symbol: string; rate: number }> = {
    USD: { locale: 'en-US', symbol: '$', rate: 1 },
    SAR: { locale: 'ar-SA', symbol: 'ر.س', rate: 3.75 },
    YER: { locale: 'ar-YE', symbol: 'ر.ي', rate: 250 },
  };

  const config = formats[currency];
  const converted = amount * config.rate;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(converted);
}

export function getStarArray(rating: number): ('full' | 'half' | 'empty')[] {
  const stars: ('full' | 'half' | 'empty')[] = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push('full');
    else if (rating >= i - 0.5) stars.push('half');
    else stars.push('empty');
  }
  return stars;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

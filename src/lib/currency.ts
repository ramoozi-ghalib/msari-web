import { db } from '@/lib/firebase-admin';

export interface ExchangeRates {
  usd: number;
  sar: number;
  yerSouth: number;
  yerNorth: number;
}

let cachedRates: ExchangeRates | null = null;
let cacheTime = 0;

export async function getExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();
  // 10 minutes cache
  if (cachedRates && (now - cacheTime < 600000)) {
    return cachedRates;
  }

  try {
    const doc = await db.collection('rates').doc('global').get();
    if (doc.exists) {
      const data = doc.data() as any;
      cachedRates = {
        usd: 1,
        sar: Number(data.sar) || 3.8,
        yerSouth: Number(data.yerSouth) || 1561,
        yerNorth: Number(data.yerNorth) || 535,
      };
      cacheTime = now;
      return cachedRates;
    }
  } catch (error) {
    console.error('Error fetching exchange rates from Firestore:', error);
  }

  return {
    usd: 1,
    sar: 3.8,
    yerSouth: 1561,
    yerNorth: 535,
  };
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'دولار أمريكي' },
  { code: 'SAR', symbol: 'ر.س', label: 'ريال سعودي' },
  { code: 'YER_NEW', symbol: 'ر.ي.ج', label: 'ريال يمني جديد' },
  { code: 'YER_OLD', symbol: 'ر.ي.ق', label: 'ريال يمني قديم' },
];

export function convertPrice(usdAmount: number, targetCurrency: string, rates: ExchangeRates): { amount: number; symbol: string; label: string } {
  const code = targetCurrency.toUpperCase();
  if (code === 'SAR') {
    return { amount: Math.round(usdAmount * rates.sar), symbol: 'ر.س', label: 'ريال سعودي' };
  }
  if (code === 'YER_NEW') {
    return { amount: Math.round(usdAmount * rates.yerSouth), symbol: 'ر.ي.ج', label: 'ريال يمني جديد' };
  }
  if (code === 'YER_OLD') {
    return { amount: Math.round(usdAmount * rates.yerNorth), symbol: 'ر.ي.ق', label: 'ريال يمني قديم' };
  }
  return { amount: usdAmount, symbol: '$', label: 'دولار أمريكي' };
}

export function formatConvertedPrice(usdAmount: number, targetCurrency: string, rates: ExchangeRates): string {
  const { amount, symbol } = convertPrice(usdAmount, targetCurrency, rates);
  return `${amount.toLocaleString()} ${symbol}`;
}

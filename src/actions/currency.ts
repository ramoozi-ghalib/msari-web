'use server';

import { getExchangeRates, ExchangeRates } from '@/lib/currency';

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  return await getExchangeRates();
}

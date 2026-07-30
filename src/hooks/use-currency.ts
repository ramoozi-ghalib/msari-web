import { useState, useEffect } from 'react';
import { fetchExchangeRates } from '@/actions/currency';

export function useCurrency() {
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/(^| )currency=([^;]+)/);
    if (match) {
      setCurrency(match[2].toUpperCase());
    }
    fetchExchangeRates().then(r => {
      setRates(r);
      setMounted(true);
    }).catch(err => {
      console.error('Failed to load exchange rates:', err);
    });
  }, []);

  const formatPrice = (usdAmount: number) => {
    if (!mounted || !rates || currency === 'USD') {
      return `$${Math.round(usdAmount).toLocaleString('en-US')}`;
    }
    const currencySymbols: Record<string, string> = {
      SAR: 'ر.س',
      YER_NEW: 'ر.ي.ج',
      YER_OLD: 'ر.ي.ق',
    };
    const rateKeys: Record<string, string> = {
      SAR: 'sar',
      YER_NEW: 'yerSouth',
      YER_OLD: 'yerNorth',
    };
    const rate = rates[rateKeys[currency]] || 1;
    const amount = Math.round(usdAmount * rate);
    return `${amount.toLocaleString('en-US')} ${currencySymbols[currency] || 'USD'}`;
  };

  return { currency, rates, mounted, formatPrice };
}

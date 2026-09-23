'use client';

import { useCurrency } from '@/hooks/use-currency';

/**
 * BookingTotal — displays a booking total in the USER's selected currency.
 * USD amounts go through formatPrice (cookie currency + live rates), exactly
 * like the checkout flow. Genuinely foreign-coded snapshots render raw.
 */
export default function BookingTotal({
  amount,
  currency,
}: {
  amount: number;
  currency: string;
}) {
  const { formatPrice } = useCurrency();

  if (currency !== 'USD') {
    return (
      <span className="font-black text-[var(--brand-primary)] text-lg">
        {`${amount} ${currency}`}
      </span>
    );
  }

  return (
    <span className="font-black text-[var(--brand-primary)] text-lg">
      {formatPrice(amount)}
    </span>
  );
}

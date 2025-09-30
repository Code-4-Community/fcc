export const donationTypes = ['one_time', 'recurring'] as const;
export type DonationType = (typeof donationTypes)[number];
export const recurringIntervals = [
  'monthly',
  'bimonthly',
  'quarterly',
  'annually',
  'weekly',
] as const;
export type NormalizedInterval = (typeof recurringIntervals)[number];

export function normalizeInterval(
  input: string | null,
): NormalizedInterval | null {
  if (!input) {
    return null;
  }

  const normalized = input.toLowerCase().trim();

  return (recurringIntervals as readonly string[]).includes(normalized)
    ? (normalized as NormalizedInterval)
    : null;
}

export function normalizeDonorName(
  input: string | null,
  anonymous: boolean,
): string | null {
  return anonymous ? null : input;
}

export function normalizeDonationAmount(amount: string | number): number {
  const num = Number(amount);

  return isFinite(num) ? num : 0;
}

import { RecurringInterval } from '../../donations/donation.entity';

export function normalizeInterval(
  input: string | null,
): RecurringInterval | null {
  if (!input) {
    return null;
  }

  const normalized = input.toLowerCase().trim();

  return Object.values(RecurringInterval).includes(
    normalized as RecurringInterval,
  )
    ? (normalized as RecurringInterval)
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

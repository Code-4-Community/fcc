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

export class CreateDonationDTO {
  firstName: string;

  lastName: string;

  email: string;

  amount: number;

  isAnonymous: boolean = false;

  donationType: DonationType;

  recurringInterval?: NormalizedInterval | null;

  dedicationMessage?: string | null;

  showDedicationPublicly?: boolean = false;

  private normalizeInterval(input: string | null): NormalizedInterval | null {
    if (!input) {
      return null;
    }

    const normalized = input.toLowerCase().trim();

    return (recurringIntervals as readonly string[]).includes(normalized)
      ? (normalized as NormalizedInterval)
      : null;
  }
}

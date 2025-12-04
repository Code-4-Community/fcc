import type { RecurringInterval } from './donation-form.types';

export const DONATION_PRESET_AMOUNTS: number[] = [10, 30, 50, 100];

export interface DonationRecurrenceOption {
  donationType: 'one_time' | 'recurring';
  label: string;
  recurringInterval?: RecurringInterval;
}

export const DONATION_RECURRENCE_OPTIONS: DonationRecurrenceOption[] = [
  {
    donationType: 'one_time',
    label: 'One Time',
  },
  {
    donationType: 'recurring',
    label: 'Weekly',
    recurringInterval: 'weekly',
  },
  {
    donationType: 'recurring',
    label: 'Monthly',
    recurringInterval: 'monthly',
  },
  {
    donationType: 'recurring',
    label: 'Yearly',
    recurringInterval: 'yearly',
  },
];

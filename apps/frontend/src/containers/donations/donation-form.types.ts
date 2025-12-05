export type RecurringInterval = 'weekly' | 'monthly' | 'yearly';

export type DedicationKind = 'honor' | 'memory';

export type DonationStep = 1 | 2 | 3 | 4;

export interface DonationFormData {
  firstName: string;
  lastName: string;
  email: string;
  amount: string;
  donationType: 'one_time' | 'recurring';
  recurringInterval: RecurringInterval;
  isDedicated?: boolean;
  dedicationKind?: DedicationKind | null;
  isAnonymous: boolean;
  dedicationMessage: string;
  showDedicationPublicly: boolean;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  coverFees: boolean;
}

export interface DonationFormProps {
  onSuccess: (donationId: string) => void;
  onError: (error: Error) => void;
}

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  amount?: string;
  recurringInterval?: string;
}

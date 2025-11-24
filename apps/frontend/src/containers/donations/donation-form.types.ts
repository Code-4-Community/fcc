export type RecurringInterval =
  | 'weekly'
  | 'bimonthly'
  | 'monthly'
  | 'quarterly';

export type DonationStep = 1 | 2 | 3 | 4;

export interface DonationFormData {
  firstName: string;
  lastName: string;
  email: string;
  amount: string;
  donationType: 'one_time' | 'recurring';
  recurringInterval: RecurringInterval;
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

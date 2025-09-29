import {
  DonationType,
  NormalizedInterval,
} from '../../util/donations/donations.util';

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
}

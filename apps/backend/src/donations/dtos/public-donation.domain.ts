import { DonationType } from '../../util/donations/donations.util';

export class PublicDonationDTO {
  id: number;

  amount: number;

  donationType: DonationType;

  dedicationMessage?: string | null;

  isAnonymous: boolean;

  donorName?: string | null;

  createdAt: string;
}

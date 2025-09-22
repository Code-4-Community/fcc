import { DonationType } from './create-donation.domain';

export class PublicDonationDTO {
  id: number;

  amount: number;

  donationType: DonationType;

  dedicationMessage?: string | null;

  isAnonymous: boolean;

  donorName?: string | null;

  createdAt: string;

  private normalizeDonorName(input: string | null): string | null {
    return this.isAnonymous ? null : input;
  }
}

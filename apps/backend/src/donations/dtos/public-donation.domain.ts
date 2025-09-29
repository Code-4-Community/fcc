import { DonationType } from './create-donation.domain';

export class PublicDonationDTO {
  id: number;

  amount: number;

  donationType: DonationType;

  dedicationMessage?: string | null;

  isAnonymous: boolean;

  donorName?: string | null;

  createdAt: string;

  private static normalizeDonorName(
    input: string | null,
    anonymous: boolean,
  ): string | null {
    return anonymous ? null : input;
  }

  private static normalizeDonationAmount(amount: string | number): number {
    const num = Number(amount);

    return isFinite(num) ? num : 0;
  }
}

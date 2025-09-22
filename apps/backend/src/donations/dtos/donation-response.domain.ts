import { CreateDonationDTO } from './create-donation.domain';

export class DonationResponseDTO {
  id: number;

  stored: CreateDonationDTO;

  createdAt: string;

  updatedAt: string;
}

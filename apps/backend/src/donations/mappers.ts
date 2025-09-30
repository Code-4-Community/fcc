import {
  CreateDonationDto,
  DonationType,
  RecurringInterval,
} from './dtos/create-donation-dto';
import {
  DonationResponseDto,
  DonationStatus,
} from './dtos/donation-response-dto';
import { PublicDonationDto } from './dtos/public-donation-dto';

export interface CreateDonationRequest {
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  isAnonymous: boolean;
  donationType: 'one_time' | 'recurring';
  recurringInterval?:
    | 'weekly'
    | 'monthly'
    | 'bimonthly'
    | 'quarterly'
    | 'annually';
  dedicationMessage?: string;
  showDedicationPublicly: boolean;
}

export interface Donation {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  isAnonymous: boolean;
  donationType: 'one_time' | 'recurring';
  recurringInterval?:
    | 'weekly'
    | 'monthly'
    | 'bimonthly'
    | 'quarterly'
    | 'annually';
  dedicationMessage?: string;
  showDedicationPublicly: boolean;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  transactionId?: string;
}

export class DonationMappers {
  static toCreateDonationRequest(
    dto: CreateDonationDto,
  ): CreateDonationRequest {
    return {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      amount: dto.amount,
      isAnonymous: dto.isAnonymous ?? false,
      donationType: dto.donationType as 'one_time' | 'recurring',
      recurringInterval: dto.recurringInterval as
        | 'weekly'
        | 'monthly'
        | 'bimonthly'
        | 'quarterly'
        | 'annually'
        | undefined,
      dedicationMessage: dto.dedicationMessage,
      showDedicationPublicly: dto.showDedicationPublicly ?? false,
    };
  }

  static toDonationResponseDto(donation: Donation): DonationResponseDto {
    return {
      id: donation.id,
      firstName: donation.firstName,
      lastName: donation.lastName,
      email: donation.email,
      amount: donation.amount,
      isAnonymous: donation.isAnonymous,
      donationType: donation.donationType as DonationType,
      recurringInterval: donation.recurringInterval as RecurringInterval,
      dedicationMessage: donation.dedicationMessage,
      showDedicationPublicly: donation.showDedicationPublicly,
      status: donation.status as DonationStatus,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
      transactionId: donation.transactionId,
    };
  }

  static toPublicDonationDto(donation: Donation): PublicDonationDto {
    const publicDto: PublicDonationDto = {
      id: donation.id,
      amount: donation.amount,
      isAnonymous: donation.isAnonymous,
      donationType: donation.donationType as DonationType,
      recurringInterval: donation.recurringInterval as RecurringInterval,
      status: donation.status as DonationStatus,
      createdAt: donation.createdAt,
    };

    if (!donation.isAnonymous) {
      publicDto.donorName = `${donation.firstName} ${donation.lastName}`;
    }

    if (donation.showDedicationPublicly && donation.dedicationMessage) {
      publicDto.dedicationMessage = donation.dedicationMessage;
    }

    return publicDto;
  }

  static toDonationResponseDtos(donations: Donation[]): DonationResponseDto[] {
    return donations.map((donation) => this.toDonationResponseDto(donation));
  }

  static toPublicDonationDtos(donations: Donation[]): PublicDonationDto[] {
    return donations.map((donation) => this.toPublicDonationDto(donation));
  }
}

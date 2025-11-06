import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDonationDto } from './dtos/create-donation-dto';
import { DonationResponseDto } from './dtos/donation-response-dto';
import { PublicDonationDto } from './dtos/public-donation-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Donation, DonationType } from './donation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
  ) {}

  async create(
    createDonationDTO: CreateDonationDto,
  ): Promise<DonationResponseDto> {
    if (createDonationDTO.amount <= 0) {
      throw new BadRequestException('Donation amount must be positive.');
    }

    if (
      createDonationDTO.donationType == DonationType.RECURRING &&
      !createDonationDTO.recurringInterval
    ) {
      throw new BadRequestException(
        'Recurring donation must specify interval.',
      );
    }

    if (
      createDonationDTO.donationType == DonationType.ONE_TIME &&
      createDonationDTO.recurringInterval
    ) {
      throw new BadRequestException(
        'One time donation does not have recurring interval.',
      );
    }

    if (
      createDonationDTO.showDedicationPublicly &&
      !createDonationDTO.dedicationMessage
    ) {
      throw new BadRequestException(
        'Cannot show dedication publicly without a dedication message.',
      );
    }

    const donation = await this.donationRepository.create(createDonationDTO);
    const savedDonation = await this.donationRepository.save(donation);

    return {
      id: savedDonation.id,
      firstName: savedDonation.firstName,
      lastName: savedDonation.lastName,
      email: savedDonation.email,
      amount: savedDonation.amount,
      isAnonymous: savedDonation.isAnonymous,
      donationType: savedDonation.donationType,
      recurringInterval: savedDonation.recurringInterval,
      dedicationMessage: savedDonation.dedicationMessage,
      showDedicationPublicly: savedDonation.showDedicationPublicly,
      status: savedDonation.status,
      transactionId: savedDonation.transactionId,
      createdAt: savedDonation.createdAt,
      updatedAt: savedDonation.updatedAt,
    };
  }

  async findAll(): Promise<DonationResponseDto[]> {
    const donations: Donation[] = await this.donationRepository.find();

    const donationResponseDtos: DonationResponseDto[] = donations.map(
      (donation) => {
        return {
          id: donation.id,
          firstName: donation.firstName,
          lastName: donation.lastName,
          email: donation.email,
          amount: donation.amount,
          isAnonymous: donation.isAnonymous,
          donationType: donation.donationType,
          recurringInterval: donation.recurringInterval,
          dedicationMessage: donation.dedicationMessage,
          showDedicationPublicly: donation.showDedicationPublicly,
          status: donation.status,
          transactionId: donation.transactionId,
          createdAt: donation.createdAt,
          updatedAt: donation.updatedAt,
        };
      },
    );

    return donationResponseDtos;
  }

  async findPublic(): Promise<PublicDonationDto[]> {
    const publicDonationDtos = this.findAll();

    return (await publicDonationDtos).map((dto) => {
      return {
        id: dto.id,
        amount: dto.amount,
        donationType: dto.donationType,
        recurringInterval: dto.recurringInterval,
        ...(dto.showDedicationPublicly && dto.dedicationMessage
          ? { dedicationMessage: dto.dedicationMessage }
          : {}),
        isAnonymous: dto.isAnonymous,
        ...(!dto.isAnonymous
          ? { donorName: dto.firstName + ' ' + dto.lastName }
          : {}),
        status: dto.status,
        createdAt: dto.createdAt,
      };
    });
  }

  async findOne(id: number): Promise<DonationResponseDto | null> {
    const donation = await this.donationRepository.findOne({
      where: { id },
    });

    if (donation === undefined || donation === null) {
      return null;
    }

    return {
      id: donation.id,
      firstName: donation.firstName,
      lastName: donation.lastName,
      email: donation.email,
      amount: donation.amount,
      isAnonymous: donation.isAnonymous,
      donationType: donation.donationType,
      recurringInterval: donation.recurringInterval,
      dedicationMessage: donation.dedicationMessage,
      showDedicationPublicly: donation.showDedicationPublicly,
      status: donation.status,
      transactionId: donation.transactionId,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
    };
  }

  async getTotalDonations(): Promise<{ total: number; count: number }> {
    const [donations] = await this.donationRepository.manager.query(
      `SELECT COUNT(amount) AS count, SUM(amount) AS total FROM donation`,
    );

    return { total: donations.total, count: donations.count };
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { DonationResponseDto } from './dtos/donation-response-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Donation, DonationType, RecurringInterval } from './donation.entity';
import { Repository } from 'typeorm';
import { CreateDonationRequest, Donation as DomainDonation } from './mappers';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
  ) {}

  async create(
    createDonationRequest: CreateDonationRequest,
  ): Promise<DomainDonation> {
    console.log(
      '[DonationsService.create] incoming request:',
      createDonationRequest,
    );
    if (createDonationRequest.amount <= 0) {
      throw new BadRequestException('Donation amount must be positive.');
    }

    if (
      createDonationRequest.donationType === 'recurring' &&
      !createDonationRequest.recurringInterval
    ) {
      throw new BadRequestException(
        'Recurring donation must specify interval.',
      );
    }

    if (
      createDonationRequest.donationType === 'one_time' &&
      createDonationRequest.recurringInterval
    ) {
      throw new BadRequestException(
        'One time donation does not have recurring interval.',
      );
    }

    if (
      createDonationRequest.showDedicationPublicly &&
      !createDonationRequest.dedicationMessage
    ) {
      throw new BadRequestException(
        'Cannot show dedication publicly without a dedication message.',
      );
    }

    const donation = this.donationRepository.create({
      firstName: createDonationRequest.firstName,
      lastName: createDonationRequest.lastName,
      email: createDonationRequest.email,
      amount: createDonationRequest.amount,
      isAnonymous: createDonationRequest.isAnonymous,
      donationType:
        createDonationRequest.donationType === 'one_time'
          ? DonationType.ONE_TIME
          : DonationType.RECURRING,
      recurringInterval:
        createDonationRequest.recurringInterval as RecurringInterval | null,
      dedicationMessage: createDonationRequest.dedicationMessage || null,
      showDedicationPublicly: createDonationRequest.showDedicationPublicly,
    });

    const savedDonation = await this.donationRepository.save(donation);

    console.log(
      `[DonationsService.create] savedDonation id=${savedDonation.id} email=${savedDonation.email} amount=${savedDonation.amount}`,
      savedDonation,
    );

    return {
      id: savedDonation.id,
      firstName: savedDonation.firstName,
      lastName: savedDonation.lastName,
      email: savedDonation.email,
      amount: savedDonation.amount,
      isAnonymous: savedDonation.isAnonymous,
      donationType: savedDonation.donationType as 'one_time' | 'recurring',
      recurringInterval: savedDonation.recurringInterval as
        | 'weekly'
        | 'monthly'
        | 'bimonthly'
        | 'quarterly'
        | 'annually'
        | undefined,
      dedicationMessage: savedDonation.dedicationMessage || undefined,
      showDedicationPublicly: savedDonation.showDedicationPublicly,
      status: savedDonation.status as
        | 'pending'
        | 'succeeded'
        | 'failed'
        | 'cancelled',
      createdAt: savedDonation.createdAt,
      updatedAt: savedDonation.updatedAt,
      transactionId: savedDonation.transactionId || undefined,
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

  async findPublic(limit = 50): Promise<DomainDonation[]> {
    console.log('[DonationsService.findPublic] limit=', limit);
    const donations: Donation[] = await this.donationRepository.find({
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return donations.map((donation) => ({
      id: donation.id,
      firstName: donation.firstName,
      lastName: donation.lastName,
      email: donation.email,
      amount: donation.amount,
      isAnonymous: donation.isAnonymous,
      donationType: donation.donationType as 'one_time' | 'recurring',
      recurringInterval: donation.recurringInterval as
        | 'weekly'
        | 'monthly'
        | 'bimonthly'
        | 'quarterly'
        | 'annually'
        | undefined,
      dedicationMessage: donation.dedicationMessage || undefined,
      showDedicationPublicly: donation.showDedicationPublicly,
      status: donation.status as
        | 'pending'
        | 'succeeded'
        | 'failed'
        | 'cancelled',
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
      transactionId: donation.transactionId || undefined,
    }));
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
    console.log('[DonationsService.getTotalDonations] querying totals');
    const [donations] = await this.donationRepository.manager.query(
      `SELECT COUNT(amount) AS count, SUM(amount) AS total FROM donations`,
    );

    console.log('[DonationsService.getTotalDonations] result=', donations);

    // SQL SUM returns null when no rows exist; coerce to numbers with sensible defaults
    const total =
      donations.total !== null && donations.total !== undefined
        ? Number(donations.total)
        : 0;
    const count =
      donations.count !== null && donations.count !== undefined
        ? Number(donations.count)
        : 0;

    return { total, count };
  }
}

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DonationResponseDto } from './dtos/donation-response-dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Donation,
  DonationType,
  RecurringInterval,
  DonationStatus,
} from './donation.entity';
import { Repository } from 'typeorm';
import { CreateDonationRequest, Donation as DomainDonation } from './mappers';

interface PaymentIntentSyncPayload {
  donationId?: number;
  transactionId?: string;
  status: DonationStatus;
}

@Injectable()
export class DonationsService {
  private readonly logger = new Logger(DonationsService.name);

  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
  ) {}

  async create(
    createDonationRequest: CreateDonationRequest,
  ): Promise<DomainDonation> {
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
      transactionId: createDonationRequest.paymentIntentId || null,
    });

    // Reload from database so any DB-side defaults are reflected
    const savedDonation = await this.donationRepository.save(donation);
    const reloaded = await this.donationRepository.findOne({
      where: { id: savedDonation.id },
    });

    const finalDonation = reloaded ?? savedDonation;

    return {
      id: finalDonation.id,
      firstName: finalDonation.firstName,
      lastName: finalDonation.lastName,
      email: finalDonation.email,
      amount: finalDonation.amount,
      isAnonymous: finalDonation.isAnonymous,
      donationType: finalDonation.donationType as 'one_time' | 'recurring',
      recurringInterval: finalDonation.recurringInterval as
        | 'weekly'
        | 'monthly'
        | 'bimonthly'
        | 'quarterly'
        | 'annually'
        | undefined,
      dedicationMessage: finalDonation.dedicationMessage || undefined,
      showDedicationPublicly: finalDonation.showDedicationPublicly,
      status: finalDonation.status as
        | 'pending'
        | 'succeeded'
        | 'failed'
        | 'cancelled',
      createdAt: finalDonation.createdAt,
      updatedAt: finalDonation.updatedAt,
      transactionId: finalDonation.transactionId || undefined,
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
    // Return only non-anonymous donations that have succeeded for public display
    const donations: Donation[] = await this.donationRepository.find({
      where: {
        isAnonymous: false,
        status: DonationStatus.SUCCEEDED,
      },
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
    const [donations] = await this.donationRepository.manager.query(
      `SELECT COUNT(amount) AS count, SUM(amount) AS total FROM donations`,
    );

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

  async syncPaymentIntentStatus(
    payload: PaymentIntentSyncPayload,
  ): Promise<void> {
    const { donationId, transactionId, status } = payload;

    if (!donationId && !transactionId) {
      this.logger.warn('Unable to sync donation without identifiers');
      return;
    }

    let donation: Donation | null = null;

    if (donationId !== undefined) {
      donation = await this.donationRepository.findOne({
        where: { id: donationId },
      });
    }

    if (!donation && transactionId) {
      donation = await this.donationRepository.findOne({
        where: { transactionId },
      });
    }

    if (!donation) {
      this.logger.warn(
        `No donation found to sync for payment intent ${transactionId ?? 'unknown'}`,
      );
      return;
    }

    donation.status = status;
    if (transactionId) {
      donation.transactionId = transactionId;
    }

    await this.donationRepository.save(donation);
  }
}

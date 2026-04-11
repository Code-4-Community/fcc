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
import { Readable } from 'stream';
import { DonationsRepository } from './donations.repository';
import { Goal } from './goal.entity';

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

    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,

    private readonly donationsRepository: DonationsRepository,
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

  async getLapsedDonors(numMonths = 6): Promise<{ emails: string[] }> {
    if (!Number.isFinite(numMonths) || numMonths <= 0) {
      throw new BadRequestException('numMonths must be a positive number');
    }

    const emails = await this.donationsRepository.findLapsedDonors(numMonths);
    return { emails };
  }

  async exportToCsv(): Promise<Readable> {
    const donations = await this.donationRepository.find();
    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Amount',
      'Type',
      'Interval',
      'Date',
      'Transaction ID',
    ];

    // Helper function to escape CSV fields
    const escapeCsvField = (
      field: string | number | null | undefined,
    ): string => {
      if (field === null || field === undefined) {
        return '';
      }
      const stringValue = String(field);
      // If the field contains comma, quote, or newline, wrap in quotes and escape quotes
      if (
        stringValue.includes(',') ||
        stringValue.includes('"') ||
        stringValue.includes('\n')
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvRows: string[] = [headers.join(',')];
    for (const donation of donations) {
      const row = [
        escapeCsvField(donation.id),
        escapeCsvField(donation.firstName),
        escapeCsvField(donation.lastName),
        escapeCsvField(donation.email),
        escapeCsvField(donation.amount),
        escapeCsvField(donation.donationType),
        escapeCsvField(donation.recurringInterval),
        escapeCsvField(donation.createdAt.toISOString()),
        escapeCsvField(donation.transactionId),
      ];
      csvRows.push(row.join(','));
    }
    const csvContent = csvRows.join('\n');
    const stream = Readable.from([csvContent]);

    return stream;
  }

  async getActiveGoalSummary() {
    const today = new Date().toISOString().split('T')[0];

    // 1. find active goal
    const goal = await this.goalRepository
      .createQueryBuilder('goal')
      .where(':today BETWEEN goal.startDate AND goal.endDate', { today })
      .orderBy('goal.startDate', 'DESC')
      .getOne();

    if (!goal) {
      return {
        goal: null,
        amountRaised: 0,
        progressPercent: 0,
      };
    }

    // 2. sum donations in goal period
    const result = await this.donationRepository
      .createQueryBuilder('donation')
      .select('COALESCE(SUM(donation.amount), 0)', 'amount')
      .where('donation.status = :status', { status: DonationStatus.SUCCEEDED })
      .andWhere('donation.createdAt >= :startDate', {
        startDate: goal.startDate,
      })
      .andWhere('donation.createdAt <= :endDate', {
        endDate: `${goal.endDate} 23:59:59`,
      })
      .getRawOne<{ amount: string }>();

    const amountRaised = Number(result?.amount ?? 0);

    const progressPercent =
      goal.targetAmount > 0
        ? Math.min((amountRaised / goal.targetAmount) * 100, 100)
        : 0;

    return {
      goal: {
        id: goal.id,
        targetAmount: goal.targetAmount,
        startDate: goal.startDate,
        endDate: goal.endDate,
        dateRangeLabel: this.formatDateRange(goal.startDate, goal.endDate),
      },
      amountRaised,
      progressPercent,
    };
  }

  private formatDateRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const startMonth = startDate.toLocaleString('en-US', { month: 'long' });
    const endMonth = endDate.toLocaleString('en-US', { month: 'long' });

    if (startDate.getFullYear() === endDate.getFullYear()) {
      return `${startMonth} - ${endMonth} ${startDate.getFullYear()}`;
    }

    return `${startMonth} ${startDate.getFullYear()} - ${endMonth} ${endDate.getFullYear()}`;
  }
}

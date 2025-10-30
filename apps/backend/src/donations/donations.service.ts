import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Donation,
  DonationType,
  RecurringInterval,
  DonationStatus,
} from './donation.entity';
import { CreateDonationRequest, Donation as DomainDonation } from './mappers';
import { DonationsRepository } from './donations.repository';

export interface DonationsServiceInterface {
  create(request: CreateDonationRequest): Promise<DomainDonation>;
  findPublic(limit?: number): Promise<DomainDonation[]>;
  getTotalDonations(): Promise<{ total: number; count: number }>;
}

@Injectable()
export class DonationsService implements DonationsServiceInterface {
  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
    private readonly donationsRepository: DonationsRepository,
  ) {}

  async create(request: CreateDonationRequest): Promise<DomainDonation> {
    const donation = this.donationRepository.create({
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      amount: request.amount,
      isAnonymous: request.isAnonymous ?? false,
      donationType:
        request.donationType === 'one_time'
          ? DonationType.ONE_TIME
          : DonationType.RECURRING,
      recurringInterval: request.recurringInterval
        ? (request.recurringInterval as RecurringInterval)
        : null,
      dedicationMessage: request.dedicationMessage ?? null,
      showDedicationPublicly: request.showDedicationPublicly ?? false,
      status: DonationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const saved = await this.donationRepository.save(donation);
    return this.mapEntityToDomain(saved);
  }

  async findPublic(limit: number = 50): Promise<DomainDonation[]> {
    const donations = await this.donationRepository.find({
      where: { status: DonationStatus.SUCCEEDED },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return donations.map((d) => this.mapEntityToDomain(d));
  }

  async getTotalDonations(): Promise<{ total: number; count: number }> {
    const result = await this.donationRepository
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'total')
      .addSelect('COUNT(donation.id)', 'count')
      .getRawOne();
    return {
      total: parseFloat(result.total) || 0,
      count: parseInt(result.count, 10) || 0,
    };
  }

  private mapEntityToDomain(entity: Donation): DomainDonation {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      amount: entity.amount,
      isAnonymous: entity.isAnonymous,
      donationType: entity.donationType as 'one_time' | 'recurring',
      recurringInterval: entity.recurringInterval as
        | 'weekly'
        | 'monthly'
        | 'bimonthly'
        | 'quarterly'
        | 'annually'
        | undefined,
      dedicationMessage: entity.dedicationMessage ?? undefined,
      showDedicationPublicly: entity.showDedicationPublicly,
      status: entity.status as 'pending' | 'succeeded' | 'failed' | 'cancelled',
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      transactionId: entity.transactionId ?? undefined,
    };
  }
}

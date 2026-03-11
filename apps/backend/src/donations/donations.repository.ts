import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import {
  Donation,
  DonationType,
  RecurringInterval,
  DonationStatus,
} from './donation.entity';
import { DonationMappers, Donation as DomainDonation } from './mappers';
import { PublicDonationDto } from './dtos/public-donation-dto';

export interface PaginationFilters {
  donationType?: DonationType;
  isAnonymous?: boolean;
  recurringInterval?: RecurringInterval;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  status?: DonationStatus;
}

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

@Injectable()
export class DonationsRepository {
  constructor(
    @InjectRepository(Donation)
    private readonly repository: Repository<Donation>,
  ) {}

  /**
   * Find donations with pagination and optional filters
   */
  async findPaginated(
    page: number,
    perPage: number,
    filters?: PaginationFilters,
  ): Promise<PaginatedResult<Donation>> {
    const queryBuilder = this.repository.createQueryBuilder('donation');

    // Apply filters
    if (filters) {
      if (filters.donationType) {
        queryBuilder.andWhere('donation.donationType = :donationType', {
          donationType: filters.donationType,
        });
      }

      if (filters.isAnonymous !== undefined) {
        queryBuilder.andWhere('donation.isAnonymous = :isAnonymous', {
          isAnonymous: filters.isAnonymous,
        });
      }

      if (filters.recurringInterval) {
        queryBuilder.andWhere(
          'donation.recurringInterval = :recurringInterval',
          {
            recurringInterval: filters.recurringInterval,
          },
        );
      }

      if (filters.minAmount !== undefined) {
        queryBuilder.andWhere('donation.amount >= :minAmount', {
          minAmount: filters.minAmount,
        });
      }

      if (filters.maxAmount !== undefined) {
        queryBuilder.andWhere('donation.amount <= :maxAmount', {
          maxAmount: filters.maxAmount,
        });
      }

      if (filters.startDate) {
        queryBuilder.andWhere('donation.createdAt >= :startDate', {
          startDate: filters.startDate,
        });
      }

      if (filters.endDate) {
        queryBuilder.andWhere('donation.createdAt <= :endDate', {
          endDate: filters.endDate,
        });
      }

      if (filters.status) {
        queryBuilder.andWhere('donation.status = :status', {
          status: filters.status,
        });
      }
    }

    // Order by most recent first
    queryBuilder.orderBy('donation.createdAt', 'DESC');

    // Apply pagination
    const offset = (page - 1) * perPage;
    queryBuilder.skip(offset).take(perPage);

    // Execute query
    const [rows, total] = await queryBuilder.getManyAndCount();

    return {
      rows,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  /**
   * Search donations by donor name or email
   * Useful for admin search functionality
   */
  async searchByDonorNameOrEmail(
    query: string,
    limit = 50,
  ): Promise<Donation[]> {
    const searchTerm = `%${query.toLowerCase()}%`;

    return this.repository
      .createQueryBuilder('donation')
      .where(
        new Brackets((qb) => {
          qb.where('LOWER(donation.firstName) LIKE :searchTerm', { searchTerm })
            .orWhere('LOWER(donation.lastName) LIKE :searchTerm', {
              searchTerm,
            })
            .orWhere('LOWER(donation.email) LIKE :searchTerm', { searchTerm })
            .orWhere(
              "LOWER(CONCAT(donation.firstName, ' ', donation.lastName)) LIKE :searchTerm",
              { searchTerm },
            );
        }),
      )
      .orderBy('donation.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Get aggregated totals for a date range
   * Useful for admin dashboards and reporting
   */
  async getTotalsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<{ total: number; count: number }> {
    const result = await this.repository
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'total')
      .addSelect('COUNT(donation.id)', 'count')
      .where('donation.createdAt >= :startDate', { startDate })
      .andWhere('donation.createdAt <= :endDate', { endDate })
      .getRawOne();

    return {
      total: parseFloat(result.total) || 0,
      count: parseInt(result.count, 10) || 0,
    };
  }

  /**
   * Find recent public donations for display on public pages
   * Respects privacy settings (anonymous, dedication visibility)
   */
  async findRecentPublic(limit: number): Promise<PublicDonationDto[]> {
    const donations = await this.repository
      .createQueryBuilder('donation')
      .orderBy('donation.createdAt', 'DESC')
      .limit(limit)
      .getMany();

    // Map to public DTOs using the mapper's privacy logic
    return DonationMappers.toPublicDonationDtos(
      donations.map((d) => this.mapEntityToDomain(d)),
    );
  }

  /**
   * Find unique donor emails that have not made a successful donation in `numMonths` months,
   * and do NOT have any recurring donation record.
   *
   * - Only considers SUCCEEDED donations for "last donated" logic
   * - Excludes donors with at least one recurring donation (any status)
   */
  async findLapsedDonors(numMonths: number): Promise<string[]> {
    if (!Number.isFinite(numMonths) || numMonths <= 0) {
      throw new Error('numMonths must be a positive number');
    }

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - numMonths);

    const qb = this.repository.createQueryBuilder('donation');

    const recurringExistsSubquery = this.repository
      .createQueryBuilder()
      .subQuery()
      .select('1')
      .from(Donation, 'recurringDonation')
      .where('LOWER(recurringDonation.email) = LOWER(donation.email)')
      .andWhere('recurringDonation.donationType = :recurringType')
      .getQuery();

    const rows = await qb
      .select('LOWER(donation.email)', 'email')
      .where('donation.status = :succeededStatus', {
        succeededStatus: DonationStatus.SUCCEEDED,
      })
      .andWhere('donation.email IS NOT NULL')
      .andWhere("donation.email <> ''")
      .andWhere(`NOT EXISTS ${recurringExistsSubquery}`)
      .setParameter('recurringType', DonationType.RECURRING)
      .groupBy('LOWER(donation.email)')
      .having('MAX(donation.createdAt) < :cutoff', { cutoff })
      .getRawMany<{ email: string }>();

    return [...new Set(rows.map((r) => r.email.trim().toLowerCase()))];
  }

  /**
   * Delete a donation by ID (admin-only destructive operation)
   */
  async deleteById(id: number): Promise<void> {
    const result = await this.repository.delete(id);

    if (result.affected === 0) {
      throw new Error(`Donation with ID ${id} not found`);
    }
  }

  /**
   * Map entity to domain model
   * This bridges the gap between the entity and the domain model used in mappers
   */
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

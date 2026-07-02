import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindOptionsWhere } from 'typeorm';
import { DonationType, Donation, DonationStatus } from './donation.entity';
import { DonationsService } from './donations.service';
import { CreateDonationRequest } from './mappers';
import { DonationResponseDto } from './dtos/donation-response-dto';
import { DonationsRepository } from './donations.repository';
import { Goal } from './goal.entity';
// mock donations

// invalid donation: non positive donation amount
const invalidAmountDonation: CreateDonationRequest = {
  firstName: 'John',

  lastName: 'Smith',

  email: 'john.smith@gmail.com',

  amount: -500,
  isAnonymous: true,
  donationType: 'one_time',
  showDedicationPublicly: false,
};

// invalid donation: recurring donation but no interval
const invalidRecurringDonation: CreateDonationRequest = {
  firstName: 'John',

  lastName: 'Smith',

  email: 'john.smith@gmail.com',

  amount: 500,

  isAnonymous: true,

  donationType: 'recurring',

  showDedicationPublicly: false,
};

// invalid donation: one time but interval
const invalidOneTimeDonation: CreateDonationRequest = {
  firstName: 'John',

  lastName: 'Smith',

  email: 'john.smith@gmail.com',

  amount: 500,

  isAnonymous: true,

  donationType: 'one_time',

  recurringInterval: 'bimonthly',

  showDedicationPublicly: false,
};

// invalid donation: showing dedication publicly without a message
const invalidDedicationDonation: CreateDonationRequest = {
  firstName: 'John',

  lastName: 'Smith',

  email: 'john.smith@gmail.com',

  amount: 500,

  isAnonymous: false,

  donationType: 'one_time',

  showDedicationPublicly: true,
};

// valid donation
const validCreateDonation1: CreateDonationRequest = {
  firstName: 'John',

  lastName: 'Smith',

  email: 'john.smith@gmail.com',

  amount: 500,

  isAnonymous: true,

  donationType: 'one_time',

  dedicationMessage: 'I love fcc!',

  showDedicationPublicly: false,
};

// valid donation
const validDonation1: Donation = {
  id: 0,

  firstName: 'John',

  lastName: 'Smith',

  email: 'john.smith@gmail.com',

  amount: 500,

  isAnonymous: true,

  donationType: DonationType.ONE_TIME,

  dedicationMessage: 'I love fcc!',

  showDedicationPublicly: false,

  status: DonationStatus.PENDING,

  transactionId: null,

  createdAt: new Date(2025, 6, 4),

  updatedAt: new Date(2026, 7, 1),
  recurringInterval: null,
  feeAmount: null,
};

const validDonation2: Donation = {
  id: 1,

  firstName: 'Sally',

  lastName: 'Smith',

  email: 'sally.smith@gmail.com',

  amount: 700,

  isAnonymous: false,

  donationType: DonationType.ONE_TIME,

  showDedicationPublicly: true,

  status: DonationStatus.PENDING,

  transactionId: null,

  createdAt: new Date(2025, 6, 4),

  updatedAt: new Date(2026, 7, 1),
  recurringInterval: null,

  dedicationMessage: 'I love fcc!',
  feeAmount: null,
};

const validDonation3: Donation = {
  id: 2,

  firstName: 'Hannah',

  lastName: 'Smith',

  email: 'hannah.smith@gmail.com',

  amount: 100,

  isAnonymous: false,

  donationType: DonationType.ONE_TIME,

  showDedicationPublicly: false,

  status: DonationStatus.PENDING,

  transactionId: null,

  createdAt: new Date(2025, 6, 4),

  updatedAt: new Date(2026, 7, 1),
  recurringInterval: null,

  dedicationMessage: 'I love fcc!',
  feeAmount: null,
};

const allDonations: Donation[] = [
  validDonation1,
  validDonation2,
  validDonation3,
];

const expectedDonations: DonationResponseDto[] = allDonations.map(
  (donation) => {
    return {
      id: donation.id,
      firstName: donation.firstName,
      lastName: donation.lastName,
      email: donation.email,
      amount: donation.amount,
      isAnonymous: donation.isAnonymous,
      donationType: donation.donationType,
      recurringInterval: donation.recurringInterval ?? undefined,
      dedicationMessage: donation.dedicationMessage ?? undefined,
      showDedicationPublicly: donation.showDedicationPublicly,
      status: donation.status,
      transactionId: donation.transactionId ?? undefined,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
    };
  },
);

describe('DonationsService', () => {
  let service: DonationsService;
  let repo: any;
  let mockDonationsRepository: jest.Mocked<
    Pick<DonationsRepository, 'findLapsedDonors'>
  >;
  beforeAll(async () => {
    const statsRow = {
      count: '3',
      total: '1300',
      yearToDate: '800',
      monthToDate: '100',
    };

    const repoMock = {
      manager: {
        query: jest.fn().mockResolvedValue([statsRow]),
      },
      save: jest.fn().mockResolvedValue(validDonation1),
      create: jest.fn(),
      find: jest.fn().mockResolvedValue(allDonations),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Partial<Repository<Donation>>>;

    mockDonationsRepository = {
      findLapsedDonors: jest.fn(),
    };

    const app = await Test.createTestingModule({
      providers: [
        DonationsService,
        { provide: getRepositoryToken(Donation), useValue: repoMock },
        { provide: getRepositoryToken(Goal), useValue: {} },
        { provide: DonationsRepository, useValue: mockDonationsRepository },
      ],
    }).compile();

    service = app.get<DonationsService>(DonationsService);
    repo = app.get(getRepositoryToken(Donation));

    repo.findOne.mockImplementation(
      async (options?: FindOneOptions<Donation>) => {
        const where = options?.where as FindOptionsWhere<Donation> | undefined;
        if (!where) return null;

        if (where.id !== undefined && where.id !== null) {
          const donation = allDonations.find((d) => d.id === where.id);
          if (donation) return donation;
        }

        if (where.transactionId) {
          const donation = allDonations.find(
            (d) => d.transactionId === where.transactionId,
          );
          if (donation) return donation;
        }

        return null;
      },
    );
  });

  describe('Create donation method', () => {
    it('should throw an error if the donation amount is not positive', async () => {
      await expect(service.create(invalidAmountDonation)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if one time donation has recurring interval', async () => {
      await expect(service.create(invalidOneTimeDonation)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if recurring donation does not have interval set', async () => {
      await expect(service.create(invalidRecurringDonation)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if showing dedication publicly without a message', async () => {
      await expect(service.create(invalidDedicationDonation)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return domain donation if valid donation created', async () => {
      repo.create.mockReturnValue(validDonation1);
      repo.save.mockResolvedValue(validDonation1);
      const createReturned = await service.create(validCreateDonation1);

      expect(createReturned).toEqual({
        id: validDonation1.id,
        firstName: validCreateDonation1.firstName,
        lastName: validCreateDonation1.lastName,
        email: validCreateDonation1.email,
        amount: validCreateDonation1.amount,
        isAnonymous: validCreateDonation1.isAnonymous,
        donationType: validCreateDonation1.donationType,
        recurringInterval: undefined,
        dedicationMessage: validCreateDonation1.dedicationMessage,
        showDedicationPublicly: validCreateDonation1.showDedicationPublicly,
        status: validDonation1.status,
        transactionId: undefined,
        createdAt: validDonation1.createdAt,
        updatedAt: validDonation1.updatedAt,
      });
    });
  });

  describe('Find all donations method', () => {
    it('should return createDonationDTO if valid donation', async () => {
      const findDonations = await service.findAll();
      expect(findDonations).toEqual(expectedDonations);
    });
  });

  describe('getLapsedDonors', () => {
    it('should call repository.findLapsedDonors with numMonths', async () => {
      mockDonationsRepository.findLapsedDonors.mockResolvedValue([
        'a@example.com',
        'b@example.com',
      ]);

      const result = await service.getLapsedDonors(9);

      expect(mockDonationsRepository.findLapsedDonors).toHaveBeenCalledWith(9);
      expect(result).toEqual({
        emails: ['a@example.com', 'b@example.com'],
      });
    });

    it('should default to 6 months if numMonths is undefined', async () => {
      mockDonationsRepository.findLapsedDonors.mockResolvedValue([]);

      const result = await service.getLapsedDonors();

      expect(mockDonationsRepository.findLapsedDonors).toHaveBeenCalledWith(6);
      expect(result).toEqual({ emails: [] });
    });

    it('should throw if numMonths is not positive', async () => {
      await expect(service.getLapsedDonors(0)).rejects.toThrow();
      await expect(service.getLapsedDonors(-3)).rejects.toThrow();
    });
  });

  describe('Find public donations method', () => {
    it('should return all public donations as domain objects', async () => {
      const publicDonations = await service.findPublic();
      // findPublic now returns domain donations (full objects), not PublicDonationDto
      expect(publicDonations.length).toBe(3);
      expect(publicDonations[0]).toHaveProperty('firstName');
      expect(publicDonations[0]).toHaveProperty('lastName');
      expect(publicDonations[0]).toHaveProperty('email');
    });
  });

  describe('Find one donation method', () => {
    it('should find donation by id', async () => {
      const findDonation0 = await service.findOne(0);
      const findDonation1 = await service.findOne(1);
      const findDonation2 = await service.findOne(2);

      expect(findDonation0).toEqual(
        expectedDonations.find((d) => d.id === 0) ?? null,
      );
      expect(findDonation1).toEqual(
        expectedDonations.find((d) => d.id === 1) ?? null,
      );
      expect(findDonation2).toEqual(
        expectedDonations.find((d) => d.id === 2) ?? null,
      );
    });
  });

  describe('Get total donations method', () => {
    it('should find total amount, count, and date-window aggregates for successful donations', async () => {
      const stats = await service.getTotalDonations();

      expect(stats).toEqual({
        total: 1300,
        count: 3,
        yearToDate: 800,
        monthToDate: 100,
      });
      expect(repo.manager.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE "status" = $1'),
        [DonationStatus.SUCCEEDED, expect.any(Date), expect.any(Date)],
      );
    });
  });

  describe('syncPaymentIntentStatus', () => {
    it('updates donation status when donation id is provided', async () => {
      const saveSpy = jest.spyOn(repo, 'save');
      await service.syncPaymentIntentStatus({
        donationId: validDonation1.id,
        transactionId: 'pi_sync_123',
        status: DonationStatus.SUCCEEDED,
      });

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: validDonation1.id,
          transactionId: 'pi_sync_123',
          status: DonationStatus.SUCCEEDED,
        }),
      );
    });

    it('falls back to transactionId lookup when donation id missing', async () => {
      validDonation2.transactionId = 'pi_existing_456';
      const saveSpy = jest.spyOn(repo, 'save');
      await service.syncPaymentIntentStatus({
        transactionId: 'pi_existing_456',
        status: DonationStatus.FAILED,
      });

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: validDonation2.id,
          status: DonationStatus.FAILED,
        }),
      );
    });
  });

  describe('exportToCsv', () => {
    it('should include all donation data in CSV rows', async () => {
      const stream = await service.exportToCsv();

      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      const csvContent = Buffer.concat(chunks).toString('utf-8');

      const lines = csvContent.split('\n');
      expect(lines.length).toBe(4); // Header + 3 data rows

      // Check that donation data is present
      expect(csvContent).toContain(validDonation1.firstName);
      expect(csvContent).toContain(validDonation1.email);
      expect(csvContent).toContain(String(validDonation1.amount));
    });

    it('should handle empty donations list', async () => {
      // Clear the in-memory donations
      jest.spyOn(repo, 'find').mockResolvedValue([]);

      const stream = await service.exportToCsv();

      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      const csvContent = Buffer.concat(chunks).toString('utf-8');

      const lines = csvContent.split('\n');
      expect(lines.length).toBe(1); // Should only have header
      expect(lines[0]).toBe(
        'ID,First Name,Last Name,Email,Amount,Type,Interval,Date,Transaction ID',
      );
    });

    it('should escape CSV fields with commas correctly', async () => {
      const donationWithComma = {
        ...validDonation1,
        id: 999,
        firstName: 'John, Jr.',
        lastName: 'Smith, Sr.',
      };

      jest
        .spyOn(repo, 'find')
        .mockResolvedValue([donationWithComma as Donation]);

      const stream = await service.exportToCsv();

      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      const csvContent = Buffer.concat(chunks).toString('utf-8');

      // Fields with commas should be wrapped in quotes
      expect(csvContent).toContain('"John, Jr."');
      expect(csvContent).toContain('"Smith, Sr."');
    });

    it('should handle null/undefined values correctly', async () => {
      const donationWithNulls = {
        ...validDonation1,
        id: 888,
        recurringInterval: null,
        transactionId: null,
      };

      jest
        .spyOn(repo, 'find')
        .mockResolvedValue([donationWithNulls as Donation]);

      const stream = await service.exportToCsv();

      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      const csvContent = Buffer.concat(chunks).toString('utf-8');

      const lines = csvContent.split('\n');
      const dataRow = lines[1];
      const fields = dataRow.split(',');

      // Null values should be empty strings
      expect(fields[6]).toBe(''); // recurringInterval
      expect(fields[8]).toBe(''); // transactionId
    });
  });
});

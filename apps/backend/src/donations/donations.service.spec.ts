import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindOptionsWhere } from 'typeorm';
import { DonationType, Donation, DonationStatus } from './donation.entity';
import { DonationsService } from './donations.service';
import { CreateDonationRequest } from './mappers';
import { DonationResponseDto } from './dtos/donation-response-dto';

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

  recurringInterval: undefined,
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

  recurringInterval: undefined,

  dedicationMessage: 'I love fcc!',
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

  recurringInterval: undefined,

  dedicationMessage: 'I love fcc!',
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

describe('DonationsService', () => {
  let service: DonationsService;
  let repo: jest.Mocked<Partial<Repository<Donation>>>;

  beforeAll(async () => {
    const repoMock = {
      manager: {
        query: jest.fn().mockResolvedValue([
          {
            count: allDonations.length,
            total: allDonations.reduce(
              (total, current) => total + current.amount,
              0,
            ),
          },
        ]),
      },
      save: jest.fn().mockResolvedValue(validDonation1),
      create: jest.fn(),
      find: jest.fn().mockResolvedValue(allDonations),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Partial<Repository<Donation>>>;

    const app = await Test.createTestingModule({
      providers: [
        DonationsService,
        { provide: getRepositoryToken(Donation), useValue: repoMock },
      ],
    }).compile();

    service = app.get<DonationsService>(DonationsService);
    repo = app.get(getRepositoryToken(Donation));

    repo.findOne.mockImplementation(
      async (options?: FindOneOptions<Donation>) => {
        const where = options?.where;
        if (where && !Array.isArray(where)) {
          const id = (where as FindOptionsWhere<Donation>).id;
          if (id !== undefined && id !== null) {
            const donation = allDonations.find((d) => d.id === id);
            return donation ?? null;
          }
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
    it('should find total amount and count of all donations', async () => {
      const { total, count } = await service.getTotalDonations();
      expect({ total, count }).toEqual({
        total:
          validDonation1.amount + validDonation2.amount + validDonation3.amount,
        count: 3,
      });
    });
  });
});

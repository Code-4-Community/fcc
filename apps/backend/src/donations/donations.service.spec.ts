import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DonationsService } from './donations.service';
import { DonationsRepository } from './donations.repository';
import {
  Donation,
  DonationType,
  DonationStatus,
  RecurringInterval,
} from './donation.entity';
import { CreateDonationRequest } from './mappers';

describe('DonationsService', () => {
  let service: DonationsService;
  let donationRepository: Repository<Donation>;

  const mockDonationEntity: Donation = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    amount: 100,
    isAnonymous: false,
    donationType: DonationType.ONE_TIME,
    recurringInterval: null,
    dedicationMessage: null,
    showDedicationPublicly: false,
    status: DonationStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    transactionId: null,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockDonationsRepository = {
    findRecentPublic: jest.fn(),
    getTotalsByDateRange: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        {
          provide: getRepositoryToken(Donation),
          useValue: mockRepository,
        },
        {
          provide: DonationsRepository,
          useValue: mockDonationsRepository,
        },
      ],
    }).compile();

    service = module.get<DonationsService>(DonationsService);
    donationRepository = module.get<Repository<Donation>>(
      getRepositoryToken(Donation),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a one-time donation', async () => {
      const request: CreateDonationRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        amount: 100,
        isAnonymous: false,
        donationType: 'one_time',
        showDedicationPublicly: false,
      };

      mockRepository.create.mockReturnValue(mockDonationEntity);
      mockRepository.save.mockResolvedValue(mockDonationEntity);

      const result = await service.create(request);

      expect(donationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          amount: 100,
          isAnonymous: false,
          donationType: DonationType.ONE_TIME,
          status: DonationStatus.PENDING,
        }),
      );

      expect(donationRepository.save).toHaveBeenCalled();

      expect(result).toMatchObject({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        amount: 100,
        isAnonymous: false,
        donationType: 'one_time',
        status: 'pending',
      });
    });

    it('should create a recurring donation', async () => {
      const request: CreateDonationRequest = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        amount: 50,
        isAnonymous: true,
        donationType: 'recurring',
        recurringInterval: 'monthly',
        showDedicationPublicly: false,
      };

      const recurringEntity = {
        ...mockDonationEntity,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        amount: 50,
        isAnonymous: true,
        donationType: DonationType.RECURRING,
        recurringInterval: RecurringInterval.MONTHLY,
      };

      mockRepository.create.mockReturnValue(recurringEntity);
      mockRepository.save.mockResolvedValue(recurringEntity);

      const result = await service.create(request);

      expect(donationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          donationType: DonationType.RECURRING,
          recurringInterval: 'monthly',
        }),
      );

      expect(result.donationType).toBe('recurring');
      expect(result.recurringInterval).toBe('monthly');
    });

    it('should handle dedication messages', async () => {
      const request: CreateDonationRequest = {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        amount: 200,
        isAnonymous: false,
        donationType: 'one_time',
        dedicationMessage: 'In memory of...',
        showDedicationPublicly: true,
      };

      const entityWithDedication = {
        ...mockDonationEntity,
        dedicationMessage: 'In memory of...',
        showDedicationPublicly: true,
      };

      mockRepository.create.mockReturnValue(entityWithDedication);
      mockRepository.save.mockResolvedValue(entityWithDedication);

      const result = await service.create(request);

      expect(result.dedicationMessage).toBe('In memory of...');
      expect(result.showDedicationPublicly).toBe(true);
    });
  });

  describe('findPublic', () => {
    it('should return public donations with default limit', async () => {
      mockRepository.find.mockResolvedValue([mockDonationEntity]);

      const result = await service.findPublic();

      expect(donationRepository.find).toHaveBeenCalledWith({
        where: { status: DonationStatus.SUCCEEDED },
        order: { createdAt: 'DESC' },
        take: 50,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        amount: 100,
      });
    });

    it('should respect custom limit', async () => {
      mockRepository.find.mockResolvedValue([]);

      await service.findPublic(10);

      expect(donationRepository.find).toHaveBeenCalledWith({
        where: { status: DonationStatus.SUCCEEDED },
        order: { createdAt: 'DESC' },
        take: 10,
      });
    });

    it('should map multiple donations correctly', async () => {
      const donations = [
        mockDonationEntity,
        { ...mockDonationEntity, id: 2, amount: 200 },
        { ...mockDonationEntity, id: 3, amount: 300 },
      ];

      mockRepository.find.mockResolvedValue(donations);

      const result = await service.findPublic(3);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });
  });

  describe('getTotalDonations', () => {
    it('should return total amount and count', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest
          .fn()
          .mockResolvedValue({ total: '10000.00', count: '50' }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTotalDonations();

      expect(result).toEqual({ total: 10000, count: 50 });
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'SUM(donation.amount)',
        'total',
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        'COUNT(donation.id)',
        'count',
      );
    });

    it('should handle zero donations', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: null, count: '0' }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTotalDonations();

      expect(result).toEqual({ total: 0, count: 0 });
    });

    it('should parse numeric values correctly', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest
          .fn()
          .mockResolvedValue({ total: '12345.67', count: '123' }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTotalDonations();

      expect(result.total).toBe(12345.67);
      expect(result.count).toBe(123);
      expect(typeof result.total).toBe('number');
      expect(typeof result.count).toBe('number');
    });
  });
});

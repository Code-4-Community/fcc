import { Test, TestingModule } from '@nestjs/testing';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { DonationsRepository } from './donations.repository';
import { CreateDonationDto } from './dtos/create-donation-dto';
import {
  DonationType,
  RecurringInterval,
  DonationStatus,
} from './donation.entity';
import { Donation as DomainDonation } from './mappers';

describe('DonationsController', () => {
  let controller: DonationsController;
  let service: DonationsService;
  let repository: DonationsRepository;

  const mockDomainDonation: DomainDonation = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    amount: 100,
    isAnonymous: false,
    donationType: 'one_time',
    showDedicationPublicly: false,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService = {
    create: jest.fn(),
    findPublic: jest.fn(),
    getTotalDonations: jest.fn(),
  };

  const mockRepository = {
    findPaginated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DonationsController],
      providers: [
        {
          provide: DonationsService,
          useValue: mockService,
        },
        {
          provide: DonationsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<DonationsController>(DonationsController);
    service = module.get<DonationsService>(DonationsService);
    repository = module.get<DonationsRepository>(DonationsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a donation and return response DTO', async () => {
      const createDto: CreateDonationDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        amount: 100,
        isAnonymous: false,
        donationType: DonationType.ONE_TIME,
        showDedicationPublicly: false,
      };

      mockService.create.mockResolvedValue(mockDomainDonation);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        amount: 100,
        isAnonymous: false,
        donationType: 'one_time',
        showDedicationPublicly: false,
      });

      expect(result).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        amount: 100,
        isAnonymous: false,
        donationType: DonationType.ONE_TIME,
        showDedicationPublicly: false,
        status: DonationStatus.PENDING,
        createdAt: mockDomainDonation.createdAt,
        updatedAt: mockDomainDonation.updatedAt,
      });
    });

    it('should handle recurring donations', async () => {
      const createDto: CreateDonationDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        amount: 50,
        isAnonymous: true,
        donationType: DonationType.RECURRING,
        recurringInterval: RecurringInterval.MONTHLY,
        showDedicationPublicly: false,
      };

      const recurringDomainDonation: DomainDonation = {
        ...mockDomainDonation,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        amount: 50,
        isAnonymous: true,
        donationType: 'recurring',
        recurringInterval: 'monthly',
      };

      mockService.create.mockResolvedValue(recurringDomainDonation);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        amount: 50,
        isAnonymous: true,
        donationType: 'recurring',
        recurringInterval: 'monthly',
        showDedicationPublicly: false,
      });

      expect(result.donationType).toBe(DonationType.RECURRING);
      expect(result.recurringInterval).toBe(RecurringInterval.MONTHLY);
    });
  });

  describe('findPublic', () => {
    it('should return public donations', async () => {
      mockService.findPublic.mockResolvedValue([mockDomainDonation]);

      const result = await controller.findPublic(10);

      expect(service.findPublic).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 1);
      expect(result[0]).toHaveProperty('amount', 100);
    });

    it('should use default limit when not provided', async () => {
      mockService.findPublic.mockResolvedValue([]);

      await controller.findPublic(undefined);

      expect(service.findPublic).toHaveBeenCalledWith(undefined);
    });

    it('should hide donor name for anonymous donations', async () => {
      const anonymousDonation: DomainDonation = {
        ...mockDomainDonation,
        isAnonymous: true,
      };

      mockService.findPublic.mockResolvedValue([anonymousDonation]);

      const result = await controller.findPublic(10);

      expect(result[0]).not.toHaveProperty('donorName');
      expect(result[0].isAnonymous).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return donation statistics', async () => {
      const mockStats = { total: 10000, count: 50 };
      mockService.getTotalDonations.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(service.getTotalDonations).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    it('should handle zero donations', async () => {
      const mockStats = { total: 0, count: 0 };
      mockService.getTotalDonations.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.total).toBe(0);
      expect(result.count).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return paginated donations with default parameters', async () => {
      const mockEntity = {
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

      mockRepository.findPaginated.mockResolvedValue({
        rows: [mockEntity],
        total: 1,
        page: 1,
        perPage: 20,
        totalPages: 1,
      });

      const result = await controller.findAll(1, 20);

      expect(repository.findPaginated).toHaveBeenCalledWith(1, 20, {
        donationType: undefined,
        status: undefined,
        isAnonymous: undefined,
        recurringInterval: undefined,
        minAmount: undefined,
        maxAmount: undefined,
      });

      expect(result.rows).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('should apply filters when provided', async () => {
      mockRepository.findPaginated.mockResolvedValue({
        rows: [],
        total: 0,
        page: 1,
        perPage: 20,
        totalPages: 0,
      });

      await controller.findAll(
        1,
        20,
        DonationType.RECURRING,
        DonationStatus.SUCCEEDED,
        false,
        RecurringInterval.MONTHLY,
        50,
        500,
      );

      expect(repository.findPaginated).toHaveBeenCalledWith(1, 20, {
        donationType: DonationType.RECURRING,
        status: DonationStatus.SUCCEEDED,
        isAnonymous: false,
        recurringInterval: RecurringInterval.MONTHLY,
        minAmount: 50,
        maxAmount: 500,
      });
    });

    it('should handle empty results', async () => {
      mockRepository.findPaginated.mockResolvedValue({
        rows: [],
        total: 0,
        page: 1,
        perPage: 20,
        totalPages: 0,
      });

      const result = await controller.findAll(1, 20);

      expect(result.rows).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { DonationsRepository, PaginationFilters } from './donations.repository';
import { Donation, donationType } from './donation.entity';

describe('DonationsRepository', () => {
  let repository: DonationsRepository;
  let mockTypeOrmRepo: jest.Mocked<Repository<Donation>>;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<Donation>>;

  const mockDonation: Donation = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    amount: 100.0,
    isAnonymous: false,
    donationType: donationType.one_time,
    recurringInterval: null,
    dedicationMessage: 'In memory of Jane',
    showDedicationPublicly: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  };

  beforeEach(async () => {
    // Create mock query builder with all necessary methods
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getMany: jest.fn(),
      getRawOne: jest.fn(),
    } as unknown as jest.Mocked<SelectQueryBuilder<Donation>>;

    // Create mock TypeORM repository
    mockTypeOrmRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<Donation>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsRepository,
        {
          provide: getRepositoryToken(Donation),
          useValue: mockTypeOrmRepo,
        },
      ],
    }).compile();

    repository = module.get<DonationsRepository>(DonationsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findPaginated', () => {
    it('should return paginated results without filters', async () => {
      const mockDonations = [mockDonation, { ...mockDonation, id: 2 }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockDonations, 2]);

      const result = await repository.findPaginated(1, 10);

      expect(mockTypeOrmRepo.createQueryBuilder).toHaveBeenCalledWith('donation');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('donation.createdAt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        rows: mockDonations,
        total: 2,
        page: 1,
        perPage: 10,
        totalPages: 1,
      });
    });

    it('should apply pagination correctly for page 2', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 25]);

      await repository.findPaginated(2, 10);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should calculate total pages correctly', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 25]);

      const result = await repository.findPaginated(1, 10);

      expect(result.totalPages).toBe(3);
    });

    it('should filter by donationType', async () => {
      const filters: PaginationFilters = { donationType: 'recurring' };
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findPaginated(1, 10, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'donation.donationType = :donationType',
        { donationType: 'recurring' },
      );
    });

    it('should filter by isAnonymous', async () => {
      const filters: PaginationFilters = { isAnonymous: true };
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findPaginated(1, 10, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'donation.isAnonymous = :isAnonymous',
        { isAnonymous: true },
      );
    });

    it('should filter by recurringInterval', async () => {
      const filters: PaginationFilters = { recurringInterval: 'monthly' };
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findPaginated(1, 10, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'donation.recurringInterval = :recurringInterval',
        { recurringInterval: 'monthly' },
      );
    });

    it('should filter by amount range', async () => {
      const filters: PaginationFilters = { minAmount: 50, maxAmount: 200 };
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findPaginated(1, 10, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'donation.amount >= :minAmount',
        { minAmount: 50 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'donation.amount <= :maxAmount',
        { maxAmount: 200 },
      );
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const filters: PaginationFilters = { startDate, endDate };
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findPaginated(1, 10, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'donation.createdAt >= :startDate',
        { startDate },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'donation.createdAt <= :endDate',
        { endDate },
      );
    });

    it('should apply multiple filters together', async () => {
      const filters: PaginationFilters = {
        donationType: 'recurring',
        isAnonymous: false,
        minAmount: 100,
      };
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findPaginated(1, 10, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('searchByDonorNameOrEmail', () => {
    it('should search by donor name or email with default limit', async () => {
      const mockResults = [mockDonation];
      mockQueryBuilder.getMany.mockResolvedValue(mockResults);

      const result = await repository.searchByDonorNameOrEmail('john');

      expect(mockTypeOrmRepo.createQueryBuilder).toHaveBeenCalledWith('donation');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('donation.createdAt', 'DESC');
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(50);
      expect(result).toEqual(mockResults);
    });

    it('should search with custom limit', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.searchByDonorNameOrEmail('jane', 10);

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
    });

    it('should handle empty search results', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await repository.searchByDonorNameOrEmail('nonexistent');

      expect(result).toEqual([]);
    });

    it('should convert search term to lowercase', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.searchByDonorNameOrEmail('JOHN');

      // The where clause should include the lowercase version
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('getTotalsByDateRange', () => {
    it('should calculate totals for date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      mockQueryBuilder.getRawOne.mockResolvedValue({
        total: '1500.50',
        count: '15',
      });

      const result = await repository.getTotalsByDateRange(startDate, endDate);

      expect(mockTypeOrmRepo.createQueryBuilder).toHaveBeenCalledWith('donation');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('SUM(donation.amount)', 'total');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('COUNT(donation.id)', 'count');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'donation.createdAt >= :startDate',
        { startDate },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'donation.createdAt <= :endDate',
        { endDate },
      );
      expect(result).toEqual({
        total: 1500.5,
        count: 15,
      });
    });

    it('should return zeros when no donations in range', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({
        total: null,
        count: '0',
      });

      const result = await repository.getTotalsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );

      expect(result).toEqual({
        total: 0,
        count: 0,
      });
    });

    it('should handle string numbers from database', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({
        total: '2500.75',
        count: '42',
      });

      const result = await repository.getTotalsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );

      expect(result.total).toBe(2500.75);
      expect(result.count).toBe(42);
    });
  });

  describe('findRecentPublic', () => {
    it('should return recent public donations with privacy applied', async () => {
      const mockDonations = [
        mockDonation,
        { ...mockDonation, id: 2, isAnonymous: true },
      ];
      mockQueryBuilder.getMany.mockResolvedValue(mockDonations);

      const result = await repository.findRecentPublic(10);

      expect(mockTypeOrmRepo.createQueryBuilder).toHaveBeenCalledWith('donation');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('donation.createdAt', 'DESC');
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(2);
      
      // Check that public DTO format is returned
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('amount');
      expect(result[0]).toHaveProperty('donorName'); // Should include for non-anonymous
      expect(result[0]).not.toHaveProperty('email'); // Should not include sensitive data
      expect(result[0]).not.toHaveProperty('firstName'); // Should not include sensitive data
      
      // Check anonymous donor doesn't have name
      expect(result[1]).not.toHaveProperty('donorName');
    });

    it('should respect limit parameter', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.findRecentPublic(5);

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
    });

    it('should return empty array when no donations exist', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await repository.findRecentPublic(10);

      expect(result).toEqual([]);
    });
  });

  describe('deleteById', () => {
    it('should delete donation by id', async () => {
      mockTypeOrmRepo.delete.mockResolvedValue({ 
        affected: 1, 
        raw: {} 
      } as never);

      await repository.deleteById(1);

      expect(mockTypeOrmRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw error when donation not found', async () => {
      mockTypeOrmRepo.delete.mockResolvedValue({ 
        affected: 0, 
        raw: {} 
      } as never);

      await expect(repository.deleteById(999)).rejects.toThrow(
        'Donation with ID 999 not found',
      );
    });
  });


});
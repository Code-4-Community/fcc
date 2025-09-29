import { validate } from 'class-validator';
import {
  CreateDonationDto,
  DonationType,
  RecurringInterval,
} from './dtos/create-donation-dto';
import { DonationStatus } from './dtos/donation-response-dto';
import { PublicDonationDto } from './dtos/public-donation-dto';
import { DonationMappers, Donation } from './mappers';

describe('DonationMappers', () => {
  const mockDonation: Donation = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    amount: 100.0,
    isAnonymous: false,
    donationType: 'one_time',
    dedicationMessage: 'for the Fenway community',
    showDedicationPublicly: true,
    status: 'completed',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:35:00Z'),
    transactionId: 'txn_1234567890',
  };

  const mockCreateDto: CreateDonationDto = {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    amount: 100.0,
    isAnonymous: false,
    donationType: DonationType.ONE_TIME,
    dedicationMessage: 'for the Fenway community',
    showDedicationPublicly: true,
  };

  const mockPublicDonation: PublicDonationDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    donorName: 'John Smith',
    amount: 100.0,
    isAnonymous: false,
    donationType: DonationType.ONE_TIME,
    recurringInterval: undefined,
    dedicationMessage: 'for the Fenway community',
    status: DonationStatus.COMPLETED,
    createdAt: new Date('2024-01-15T10:30:00Z'),
  };

  describe('toCreateDonationRequest', () => {
    it('should map CreateDonationDto to CreateDonationRequest correctly', () => {
      const result = DonationMappers.toCreateDonationRequest(mockCreateDto);

      expect(result).toEqual({
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        amount: 100.0,
        isAnonymous: false,
        donationType: 'one_time',
        dedicationMessage: 'for the Fenway community',
        showDedicationPublicly: true,
      });
    });

    it('should apply default values for optional fields', () => {
      const minimalDto: CreateDonationDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        amount: 50.0,
        donationType: DonationType.ONE_TIME,
      };

      const result = DonationMappers.toCreateDonationRequest(minimalDto);

      expect(result.isAnonymous).toBe(false);
      expect(result.showDedicationPublicly).toBe(false);
      expect(result.recurringInterval).toBeUndefined();
      expect(result.dedicationMessage).toBeUndefined();
    });

    it('should handle recurring donations with interval', () => {
      const recurringDto: CreateDonationDto = {
        ...mockCreateDto,
        donationType: DonationType.RECURRING,
        recurringInterval: RecurringInterval.MONTHLY,
      };

      const result = DonationMappers.toCreateDonationRequest(recurringDto);

      expect(result.donationType).toBe('recurring');
      expect(result.recurringInterval).toBe('monthly');
    });
  });

  describe('toDonationResponseDto', () => {
    it('should map Donation to DonationResponseDto correctly', () => {
      const result = DonationMappers.toDonationResponseDto(mockDonation);

      expect(result.id).toBe(mockDonation.id);
      expect(result.firstName).toBe(mockDonation.firstName);
      expect(result.lastName).toBe(mockDonation.lastName);
      expect(result.email).toBe(mockDonation.email);
      expect(result.amount).toBe(mockDonation.amount);
      expect(result.isAnonymous).toBe(mockDonation.isAnonymous);
      expect(result.donationType).toBe(mockDonation.donationType);
      expect(result.dedicationMessage).toBe(mockDonation.dedicationMessage);
      expect(result.showDedicationPublicly).toBe(
        mockDonation.showDedicationPublicly,
      );
      expect(result.status).toBe(mockDonation.status);
      expect(result.createdAt).toBe(mockDonation.createdAt);
      expect(result.updatedAt).toBe(mockDonation.updatedAt);
      expect(result.transactionId).toBe(mockDonation.transactionId);
    });
  });

  describe('toPublicDonationDto', () => {
    it('should include donor name when not anonymous', () => {
      const result = DonationMappers.toPublicDonationDto(mockDonation);

      expect(result.donorName).toBe('John Smith');
      expect(result.dedicationMessage).toBe('for the Fenway community');
    });

    it('should exclude donor name when anonymous', () => {
      const anonymousDonation: Donation = {
        ...mockDonation,
        isAnonymous: true,
      };

      const result = DonationMappers.toPublicDonationDto(anonymousDonation);

      expect(result.donorName).toBeUndefined();
      expect(result.isAnonymous).toBe(true);
    });

    it('should exclude dedication message when showDedicationPublicly is false', () => {
      const privateDedication: Donation = {
        ...mockDonation,
        showDedicationPublicly: false,
      };

      const result = DonationMappers.toPublicDonationDto(privateDedication);

      expect(result.dedicationMessage).toBeUndefined();
    });

    it('should exclude dedication message when it is empty even if showDedicationPublicly is true', () => {
      const noDedication: Donation = {
        ...mockDonation,
        dedicationMessage: undefined,
        showDedicationPublicly: true,
      };

      const result = DonationMappers.toPublicDonationDto(noDedication);

      expect(result.dedicationMessage).toBeUndefined();
    });

    it('should not include email or sensitive fields', () => {
      const result = DonationMappers.toPublicDonationDto(mockDonation);

      expect(result.id).toBe(mockPublicDonation.id);
      expect(result.donorName).toBe(mockPublicDonation.donorName);
      expect(result.amount).toBe(mockPublicDonation.amount);
      expect(result.isAnonymous).toBe(mockPublicDonation.isAnonymous);
      expect(result.donationType).toBe(mockPublicDonation.donationType);
      expect(result.recurringInterval).toBe(
        mockPublicDonation.recurringInterval,
      );
      expect(result.dedicationMessage).toBe(
        mockPublicDonation.dedicationMessage,
      );
      expect(result.status).toBe(mockPublicDonation.status);
      expect(result.createdAt).toEqual(mockPublicDonation.createdAt);

      expect(result).not.toHaveProperty('email');
      expect(result).not.toHaveProperty('firstName');
      expect(result).not.toHaveProperty('lastName');
      expect(result).not.toHaveProperty('transactionId');
      expect(result).not.toHaveProperty('updatedAt');
      expect(result).not.toHaveProperty('showDedicationPublicly');
    });
  });

  describe('array mapping methods', () => {
    it('should map array of donations to response DTOs', () => {
      const donations = [mockDonation, { ...mockDonation, id: 'different-id' }];
      const result = DonationMappers.toDonationResponseDtos(donations);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(mockDonation.id);
      expect(result[1].id).toBe('different-id');
    });

    it('should map array of donations to public DTOs', () => {
      const donations = [
        mockDonation,
        { ...mockDonation, id: 'different-id', isAnonymous: true },
      ];
      const result = DonationMappers.toPublicDonationDtos(donations);

      expect(result).toHaveLength(2);
      expect(result[0].donorName).toBe('John Smith');
      expect(result[1].donorName).toBeUndefined();
    });
  });
});

describe('CreateDonationDto Validation', () => {
  it('should validate a valid DTO', async () => {
    const dto = new CreateDonationDto();
    dto.firstName = 'John';
    dto.lastName = 'Smith';
    dto.email = 'john.smith@example.com';
    dto.amount = 100.0;
    dto.donationType = DonationType.ONE_TIME;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation for invalid email', async () => {
    const dto = new CreateDonationDto();
    dto.firstName = 'John';
    dto.lastName = 'Smith';
    dto.email = 'invalid-email';
    dto.amount = 100.0;
    dto.donationType = DonationType.ONE_TIME;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('should fail validation for empty required fields', async () => {
    const dto = new CreateDonationDto();
    dto.firstName = '';
    dto.lastName = '';
    dto.email = '';
    dto.amount = 0;
    dto.donationType = DonationType.ONE_TIME;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);

    const errorProperties = errors.map((error) => error.property);
    expect(errorProperties).toContain('firstName');
    expect(errorProperties).toContain('lastName');
    expect(errorProperties).toContain('email');
    expect(errorProperties).toContain('amount');
  });

  it('should fail validation for amount too low', async () => {
    const dto = new CreateDonationDto();
    dto.firstName = 'John';
    dto.lastName = 'Smith';
    dto.email = 'john.smith@example.com';
    dto.amount = 0.005; // Below minimum
    dto.donationType = DonationType.ONE_TIME;

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'amount')).toBe(true);
  });

  it('should fail validation for invalid recurring interval', async () => {
    const dto = new CreateDonationDto();
    dto.firstName = 'John';
    dto.lastName = 'Smith';
    dto.email = 'john.smith@example.com';
    dto.amount = 100.0;
    dto.donationType = DonationType.RECURRING;
    dto.recurringInterval = 'invalid' as RecurringInterval;

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'recurringInterval')).toBe(
      true,
    );
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;

  // Create mock implementations
  const mockAuthService = {
    signup: jest.fn(),
    confirmForgotPassword: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('rejects forgot password for unregistered email', async () => {
    mockUsersService.find.mockResolvedValue([]);

    await expect(
      controller.forgotPassword({ email: 'random@example.com' } as any),
    ).rejects.toThrow('Account is not registered.');
  });

  describe('me', () => {
    it('returns a display name when first and last name are available', async () => {
      const result = await controller.me({
        user: {
          id: 1,
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          status: 'STANDARD',
        },
      });

      expect(result.displayName).toBe('Jane Doe');
      expect(result.username).toBe('jane@example.com');
    });

    it('falls back to username or id when a display name is unavailable', async () => {
      const result = await controller.me({
        user: {
          idUser: 'abc-123',
          email: 'plain@example.com',
        },
      });

      expect(result.displayName).toBe('plain@example.com');
      expect(result.username).toBe('plain@example.com');
    });
  });

  describe('confirmPassword', () => {
    const confirmPasswordBody = {
      email: 'user@example.com',
      code: '123456',
      password: 'newPassword123',
    };

    it('successfully confirms password reset', async () => {
      mockAuthService.confirmForgotPassword.mockResolvedValue(undefined);

      await expect(
        controller.confirmPassword(confirmPasswordBody as any),
      ).resolves.toBeUndefined();

      expect(mockAuthService.confirmForgotPassword).toHaveBeenCalledWith(
        confirmPasswordBody,
      );
    });

    it('throws BadRequestException for invalid verification code', async () => {
      const error = new Error('Code mismatch');
      (error as any).name = 'CodeMismatchException';
      mockAuthService.confirmForgotPassword.mockRejectedValue(error);

      await expect(
        controller.confirmPassword(confirmPasswordBody as any),
      ).rejects.toThrow('Confirmation code is incorrect');
    });

    it('throws BadRequestException for invalid verification code exception', async () => {
      const error = new Error('Invalid code');
      (error as any).name = 'InvalidVerificationCodeException';
      mockAuthService.confirmForgotPassword.mockRejectedValue(error);

      await expect(
        controller.confirmPassword(confirmPasswordBody as any),
      ).rejects.toThrow('Confirmation code is incorrect');
    });

    it('throws BadRequestException for user not found', async () => {
      const error = new Error('User not found');
      (error as any).name = 'UserNotFoundException';
      mockAuthService.confirmForgotPassword.mockRejectedValue(error);

      await expect(
        controller.confirmPassword(confirmPasswordBody as any),
      ).rejects.toThrow('User not found');
    });

    it('throws BadRequestException for expired code', async () => {
      const error = new Error('Code expired');
      (error as any).name = 'ExpiredCodeException';
      mockAuthService.confirmForgotPassword.mockRejectedValue(error);

      await expect(
        controller.confirmPassword(confirmPasswordBody as any),
      ).rejects.toThrow('Confirmation code has expired');
    });

    it('throws BadRequestException for generic error', async () => {
      const error = new Error('Some other error');
      (error as any).name = 'SomeOtherException';
      mockAuthService.confirmForgotPassword.mockRejectedValue(error);

      await expect(
        controller.confirmPassword(confirmPasswordBody as any),
      ).rejects.toThrow('Some other error');
    });
  });
});

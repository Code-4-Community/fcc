import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;

  // Create mock implementations
  const mockAuthService = {
    signup: jest.fn(),
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
});

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
});

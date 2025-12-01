import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { INestApplication, BadRequestException } from '@nestjs/common';
import request from 'supertest';
describe('PaymentsControler', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockService = {
    createPaymentIntent: jest.fn(),
    createSubscription: jest.fn(),
    retrievePaymentIntent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});

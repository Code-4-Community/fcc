import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DonationType, RecurringInterval, DonationStatus } from '../src/donations/donation.entity';
import { DonationsController } from '../src/donations/donations.controller';
import { DonationsService } from '../src/donations/donations.service';
import { DonationsRepository } from '../src/donations/donations.repository';
// import { User } from '../src/users/user.entity';

interface TestDonation {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  isAnonymous: boolean;
  donationType: DonationType;
  recurringInterval: RecurringInterval | null;
  dedicationMessage?: string | null;
  showDedicationPublicly: boolean;
  status: DonationStatus;
  createdAt: Date;
  updatedAt: Date;
  transactionId?: string | null;
}

describe('Donations (e2e) - expanded stubs', () => {
  // Increase Jest timeout for slower CI/initialization (DB + Nest app init)
  // Default is 5000ms which is often too small for integration tests.
  jest.setTimeout(30000);

  let app: INestApplication;
  // We use an in-memory array to simulate stored donations for controller tests
  let inMemoryDonations: TestDonation[] = [];
  let nextId = 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockService: any;

  beforeAll(async () => {
    // Create a testing module that instantiates the DonationsController but
    // uses a simple in-memory mock for the DonationsService so tests don't
    // depend on TypeORM behavior during controller-level validation tests.
    inMemoryDonations = [];
    nextId = 1;

    mockService = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: jest.fn(async (request: any) => {
        const now = new Date();
        const donation = {
          id: nextId++,
          firstName: request.firstName,
          lastName: request.lastName,
          email: request.email,
          amount: request.amount,
          isAnonymous: request.isAnonymous ?? false,
          donationType:
            request.donationType === 'one_time' ? DonationType.ONE_TIME : DonationType.RECURRING,
          recurringInterval: request.recurringInterval ?? null,
          dedicationMessage: request.dedicationMessage ?? undefined,
          showDedicationPublicly: request.showDedicationPublicly ?? false,
          status: DonationStatus.SUCCEEDED,
          createdAt: now,
          updatedAt: now,
        };
        inMemoryDonations.push(donation);
        return donation;
      }),
      findPublic: jest.fn(async (limit?: number) => {
        return inMemoryDonations.filter((d) => d.status === DonationStatus.SUCCEEDED && !d.isAnonymous).slice(0, limit ?? 50);
      }),
      getTotalDonations: jest.fn(async () => {
        const succeeded = inMemoryDonations.filter((d) => d.status === DonationStatus.SUCCEEDED);
        const total = succeeded.reduce((s, d) => s + (d.amount || 0), 0);
        return { total, count: succeeded.length };
      }),
  };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DonationsController],
      providers: [
        { provide: DonationsService, useValue: mockService },
        { provide: DonationsRepository, useValue: {} },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Match runtime API prefix used by the real application
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // Helper sample payloads used in the stubs below
  const oneTimePayload = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    amount: 50,
    isAnonymous: false,
    donationType: DonationType.ONE_TIME,
  };

  const recurringPayload = {
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice.smith@example.com',
    amount: 25,
    isAnonymous: false,
    donationType: DonationType.RECURRING,
    recurringInterval: RecurringInterval.MONTHLY,
  };

  // Note: repo-level mocking helpers remo
  // ved — controller tests use the mocked
  // DonationsService above to simulate DB errors where needed.

  // Small smoke test to ensure supertest and the app wiring are working.
  it('smoke: GET / (should 404 or 200 depending on routes)', async () => {
    const res = await request(app.getHttpServer()).get('/');
    // We don't make assumptions about the root route; assert we get a response
    expect([200, 404]).toContain(res.status);
  });
  
  describe('POST /api/donations', () => {
    it('Successfuly commits a one-time donation creation', async () => {
      // Arrange
      const payload = { ...oneTimePayload };
  // prevent unused-var/unused-local complaints
  void payload;

      // Act (example supertest call)
      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(201);

      // Assert response shape (example)
      expect(res.body).toHaveProperty('id');
      expect(res.body.amount).toBe(payload.amount);

  // Verify in-memory state recorded by the mocked service
  const created = inMemoryDonations.find((d) => d.email === payload.email);
  expect(created).toBeDefined();
  expect(created!.amount).toBe(payload.amount);
    });

    it('Successful creates a recurring donation with interval', async () => {
      const payload = { ...recurringPayload };
  void payload;

      // Example supertest + assertions (commented until route exists)
      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(201);

      expect(res.body.donationType).toBe('recurring');
      expect(res.body.recurringInterval).toBe('monthly');
    });

    it('rejects a negative amount (returns 400)', async () => {
        const payload = { ...oneTimePayload, amount: -10 };

        const res = await request(app.getHttpServer())
           .post('/api/donations')
           .send(payload)
           .expect(400);

        expect(res.body).toHaveProperty('statusCode', 400);
        expect(res.body).toHaveProperty('message');
      });

    it('rejects an invalid email format amount (returns 400)', async () => {
        const payload = { ...oneTimePayload, email: 'not-an-email' };

        const res = await request(app.getHttpServer())
           .post('/api/donations')
           .send(payload)
           .expect(400);

        expect(res.body).toHaveProperty('statusCode', 400);
        expect(res.body).toHaveProperty('message');
    });

    it('rejects a negative amount (returns 400)', async () => {
      const payload: Partial<typeof recurringPayload> = { ...recurringPayload };
      delete payload.recurringInterval;

        const res = await request(app.getHttpServer())
           .post('/api/donations')
           .send(payload)
           .expect(400);

        expect(res.body).toHaveProperty('statusCode', 400);
        expect(res.body).toHaveProperty('message');
      });

    it('rejects a one-time donation that has a recurring interval (returns 400)', async () => {
      const payload: Record<string, unknown> = { ...oneTimePayload, recurringInterval: 'MONTHLY' };

        const res = await request(app.getHttpServer())
           .post('/api/donations')
           .send(payload)
           .expect(400);

        expect(res.body).toHaveProperty('statusCode', 400);
        expect(res.body).toHaveProperty('message');
    });

    it('throws 500 server error if the database errors', async () => {
      // Simulate a DB failure by making the mocked service throw
      mockService.create.mockRejectedValueOnce(new Error('Simulated DB failure'));
      const payload = { ...oneTimePayload };
      try {
        const res = await request(app.getHttpServer()).post('/api/donations').send(payload).expect(500);
        expect(res.body).toHaveProperty('statusCode', 500);
        expect(res.body).toHaveProperty('message');
      } finally {
        mockService.create.mockReset();
      }
    });
  });

  describe('GET /api/donations/public', () => {
    it('returns only non-anonymous donations', async () => {
      // Example setup: insert public and anonymous donations, then call endpoint
      const now = new Date();
      inMemoryDonations.push({ ...oneTimePayload, email: 'public@example.com', isAnonymous: false, status: DonationStatus.SUCCEEDED, createdAt: now, updatedAt: now, id: nextId++ } as TestDonation);
      inMemoryDonations.push({ ...oneTimePayload, email: 'anon@example.com', isAnonymous: true, status: DonationStatus.SUCCEEDED, createdAt: now, updatedAt: now, id: nextId++ } as TestDonation);

      const res = await request(app.getHttpServer())
        .get('/api/donations/public')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((d: { isAnonymous: boolean }) => d.isAnonymous === false)).toBe(true);
    });

    it('returns no donations if there are none in the database', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/donations/public')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((d: { isAnonymous: boolean }) => d.isAnonymous === false)).toBe(true);
    });

    it('throws 500 server error if the database errors', async () => {
      // Simulate DB find/query failures by making the mocked service throw
      mockService.findPublic.mockRejectedValueOnce(new Error('Simulated DB failure'));
      try {
        const res = await request(app.getHttpServer()).get('/api/donations/public').expect(500);
        expect(res.body).toHaveProperty('statusCode', 500);
        expect(res.body).toHaveProperty('message');
      } finally {
        mockService.findPublic.mockReset();
      }
    });
  });

  describe('GET /api/donations/stats', () => {
    it('successfully returns the correct total and count', async () => {
      // Example: seed two donations and verify totals endpoint
      // await donationRepo!.save({ ...oneTimePayload, email: 'a@example.com', amount: 10 });
      // await donationRepo!.save({ ...oneTimePayload, email: 'b@example.com', amount: 15 });

      // const res = await request(app.getHttpServer())
      //   .get('/api/donations/stats')
      //   .expect(200);

      // expect(res.body).toEqual({ total: 25, count: 2 });
    });

    it('successfully returns the correct total and count even if the database is empty', async () => {
      // const res = await request(app.getHttpServer())
      //   .get('/api/donations/stats')
      //   .expect(200);

      // expect(res.body).toEqual({ total: 0, count: 0 });
    });

        it('throws 500 server error if the database errors', async () => {
            // Simulate DB find/query failures by making the mocked service throw
            mockService.getTotalDonations.mockRejectedValueOnce(new Error('Simulated DB failure'));
            try {
              const res = await request(app.getHttpServer()).get('/api/donations/stats').expect(500);
              expect(res.body).toHaveProperty('statusCode', 500);
              expect(res.body).toHaveProperty('message');
            } finally {
              mockService.getTotalDonations.mockReset();
            }
    });
  });
});

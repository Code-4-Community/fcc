import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import {
  DonationType,
  RecurringInterval,
  DonationStatus,
} from '../src/donations/donation.entity';
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
            request.donationType === 'one_time'
              ? DonationType.ONE_TIME
              : DonationType.RECURRING,
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
        return inMemoryDonations
          .filter(
            (d) => d.status === DonationStatus.SUCCEEDED && !d.isAnonymous,
          )
          .slice(0, limit ?? 50);
      }),
      getTotalDonations: jest.fn(async () => {
        const succeeded = inMemoryDonations.filter(
          (d) => d.status === DonationStatus.SUCCEEDED,
        );
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

  // Reusable seeds and helpers for in-memory donation construction
  const donationASeed: Pick<TestDonation, 'email' | 'amount'> = {
    email: 'a@example.com',
    amount: 10,
  };
  const donationBSeed: Pick<TestDonation, 'email' | 'amount'> = {
    email: 'b@example.com',
    amount: 15,
  };

  function buildTestDonation(
    seed: Pick<TestDonation, 'email' | 'amount'>,
    now: Date,
    overrides: Partial<TestDonation> = {},
  ): TestDonation {
    return {
      id: nextId++,
      firstName: oneTimePayload.firstName,
      lastName: oneTimePayload.lastName,
      email: seed.email,
      amount: seed.amount,
      isAnonymous: oneTimePayload.isAnonymous,
      donationType: oneTimePayload.donationType,
      recurringInterval: null,
      dedicationMessage: null,
      showDedicationPublicly: false,
      status: DonationStatus.SUCCEEDED,
      createdAt: now,
      updatedAt: now,
      transactionId: null,
      ...overrides,
    };
  }

  // ---------- DTO shape validators ----------
  const isISODateString = (value: unknown): boolean => {
    if (typeof value !== 'string') return false;
    const dt = new Date(value);
    return !Number.isNaN(dt.getTime());
  };

  const expectDonationResponseDtoShape = (
    obj: Record<string, unknown>,
    expected: {
      donationType: DonationType;
      recurringInterval?: RecurringInterval | null;
      email?: string;
      firstName?: string;
      lastName?: string;
      transactionIdPresent?: boolean;
    },
  ) => {
    expect(typeof obj.id).toBe('number');
    expect(typeof obj.firstName).toBe('string');
    expect(typeof obj.lastName).toBe('string');
    expect(typeof obj.email).toBe('string');
    expect(typeof obj.amount).toBe('number');
    expect(typeof obj.isAnonymous).toBe('boolean');
    expect(obj.donationType).toBe(expected.donationType);
    if (expected.recurringInterval) {
      expect(obj.recurringInterval).toBe(expected.recurringInterval);
    } else {
      // Could be null or undefined depending on mapper; both acceptable
      expect(['undefined', 'string', 'object']).toContain(
        typeof obj.recurringInterval as string,
      );
      if (typeof obj.recurringInterval === 'string') {
        expect([
          RecurringInterval.WEEKLY,
          RecurringInterval.MONTHLY,
          RecurringInterval.BIMONTHLY,
          RecurringInterval.QUARTERLY,
          RecurringInterval.ANNUALLY,
        ]).toContain(obj.recurringInterval);
      } else if (typeof obj.recurringInterval === 'object') {
        // JSON null
        expect(obj.recurringInterval).toBeNull();
      }
    }
    // dedicationMessage is optional
    if (obj.dedicationMessage !== undefined && obj.dedicationMessage !== null) {
      expect(typeof obj.dedicationMessage).toBe('string');
    }
    expect(typeof obj.showDedicationPublicly).toBe('boolean');
    expect(['pending', 'succeeded', 'failed', 'cancelled']).toContain(
      obj.status as string,
    );
    expect(isISODateString(String(obj.createdAt))).toBe(true);
    expect(isISODateString(String(obj.updatedAt))).toBe(true);
    if (expected.transactionIdPresent) {
      expect(typeof obj.transactionId).toBe('string');
    } else {
      // Can be absent or null
      expect(['undefined', 'string']).toContain(
        typeof obj.transactionId as string,
      );
    }
  };

  const expectPublicDonationDtoShape = (
    obj: Record<string, unknown>,
    opts: { anonymous: boolean; hasDedication: boolean },
  ) => {
    expect(typeof obj.id).toBe('number');
    expect(typeof obj.amount).toBe('number');
    expect(typeof obj.isAnonymous).toBe('boolean');
    expect([DonationType.ONE_TIME, DonationType.RECURRING]).toContain(
      obj.donationType as DonationType,
    );
    if (obj.recurringInterval !== undefined && obj.recurringInterval !== null) {
      expect([
        RecurringInterval.WEEKLY,
        RecurringInterval.MONTHLY,
        RecurringInterval.BIMONTHLY,
        RecurringInterval.QUARTERLY,
        RecurringInterval.ANNUALLY,
      ]).toContain(obj.recurringInterval as RecurringInterval);
    }
    expect(['pending', 'succeeded', 'failed', 'cancelled']).toContain(
      obj.status as string,
    );
    expect(isISODateString(String(obj.createdAt))).toBe(true);

    if (opts.anonymous) {
      expect(obj).not.toHaveProperty('donorName');
    } else {
      expect(typeof obj.donorName).toBe('string');
      expect((obj.donorName as string).length).toBeGreaterThan(0);
    }

    if (opts.hasDedication) {
      expect(typeof obj.dedicationMessage).toBe('string');
    } else {
      expect(obj).not.toHaveProperty('dedicationMessage');
    }

    // Ensure sensitive fields are not leaked in public DTO
    expect(obj).not.toHaveProperty('email');
    expect(obj).not.toHaveProperty('firstName');
    expect(obj).not.toHaveProperty('lastName');
    expect(obj).not.toHaveProperty('transactionId');
  };

  it('smoke: GET / (should 404 or 200 depending on routes)', async () => {
    const res = await request(app.getHttpServer()).get('/');
    expect([200, 404]).toContain(res.status);
  });

  describe('POST /api/donations', () => {
    it('Successfuly commits a one-time donation creation', async () => {
      const payload = { ...oneTimePayload };

      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(201);

      expectDonationResponseDtoShape(res.body, {
        donationType: DonationType.ONE_TIME,
        recurringInterval: null,
      });
      expect(res.body.amount).toBe(payload.amount);

      const created = inMemoryDonations.find((d) => d.email === payload.email);
      expect(created).toBeDefined();
      expect(created!.amount).toBe(payload.amount);
    });

    it('Successfuly creates a recurring donation with interval', async () => {
      const payload = { ...recurringPayload };

      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(201);

      expectDonationResponseDtoShape(res.body, {
        donationType: DonationType.RECURRING,
        recurringInterval: RecurringInterval.MONTHLY,
      });
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

    it('rejects a recurring donation if recurringInterval is missing (DTO allows optional)', async () => {
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
      const payload: Record<string, unknown> = {
        ...oneTimePayload,
        recurringInterval: 'MONTHLY',
      };

      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('message');
    });

    it('throws 500 server error if the database errors', async () => {
      // Simulate a DB failure by making the mocked service throw
      mockService.create.mockRejectedValueOnce(
        new Error('Simulated DB failure'),
      );
      const payload = { ...oneTimePayload };
      try {
        const res = await request(app.getHttpServer())
          .post('/api/donations')
          .send(payload)
          .expect(500);
        expect(res.body).toHaveProperty('statusCode', 500);
        expect(res.body).toHaveProperty('message');
      } finally {
        mockService.create.mockClear();
      }
    });

    it('gracefully rejects a payload that is missing the first name', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { ...oneTimePayload };
      delete payload.firstName;

      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('message');
      expect(String(res.body.message).toLowerCase()).toContain(
        'firstName'.toLowerCase(),
      );
    });

    it('gracefully rejects a payload that is missing the last name', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { ...oneTimePayload };
      delete payload.lastName;

      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('message');
      expect(String(res.body.message).toLowerCase()).toContain(
        'lastName'.toLowerCase(),
      );
    });

    it('gracefully rejects a payload that is missing the email', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { ...oneTimePayload };
      delete payload.email;

      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('message');
      expect(String(res.body.message).toLowerCase()).toContain(
        'email'.toLowerCase(),
      );
    });

    it('gracefully rejects a payload that is missing the amount', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { ...oneTimePayload };
      delete payload.amount;

      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('message');
      expect(String(res.body.message).toLowerCase()).toContain(
        'amount'.toLowerCase(),
      );
    });

    it('Successfuly commits a one-time donation creation even if isAnonymous is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { ...oneTimePayload };
      delete payload.isAnonymous;

      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.amount).toBe(payload.amount);

      const created = inMemoryDonations.find((d) => d.email === payload.email);
      expect(created).toBeDefined();
      expect(created!.amount).toBe(payload.amount);
    });

    it('gracefully rejects a payload that is missing the donationType', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { ...oneTimePayload };
      delete payload.donationType;

      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('message');
      expect(String(res.body.message).toLowerCase()).toContain(
        'donationType'.toLowerCase(),
      );
    });

    it('gracefully rejects a payload that is contains the wrong recurring interval (not the enum)', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { ...oneTimePayload, recurring: 'invalid' };

      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('message');
      expect(String(res.body.message).toLowerCase()).toContain(
        'recurring'.toLowerCase(),
      );
    });

    it('gracefully rejects a payload that is contains the wrong donation type (not the enum)', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { ...oneTimePayload, donationType: 'invalid' };

      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('message');
      expect(String(res.body.message).toLowerCase()).toContain(
        'donationType'.toLowerCase(),
      );
    });
  });

  describe('GET /api/donations/public', () => {
    it('returns only non-anonymous donations', async () => {
      const now = new Date();
      inMemoryDonations.push({
        ...oneTimePayload,
        email: 'public@example.com',
        isAnonymous: false,
        status: DonationStatus.SUCCEEDED,
        createdAt: now,
        updatedAt: now,
        id: nextId++,
      } as TestDonation);
      inMemoryDonations.push({
        ...oneTimePayload,
        email: 'anon@example.com',
        isAnonymous: true,
        status: DonationStatus.SUCCEEDED,
        createdAt: now,
        updatedAt: now,
        id: nextId++,
      } as TestDonation);

      const res = await request(app.getHttpServer())
        .get('/api/donations/public')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(
        res.body.every(
          (d: { isAnonymous: boolean }) => d.isAnonymous === false,
        ),
      ).toBe(true);
      // Validate public DTO shape for the first item
      if (res.body.length > 0) {
        expectPublicDonationDtoShape(res.body[0], {
          anonymous: false,
          hasDedication: false,
        });
      }
    });

    it('returns no donations if there are none in the database', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/donations/public')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(
        res.body.every(
          (d: { isAnonymous: boolean }) => d.isAnonymous === false,
        ),
      ).toBe(true);
    });

    it('throws 500 server error if the database errors', async () => {
      // Simulate DB find/query failures by making the mocked service throw
      mockService.findPublic.mockRejectedValueOnce(
        new Error('Simulated DB failure'),
      );
      try {
        const res = await request(app.getHttpServer())
          .get('/api/donations/public')
          .expect(500);
        expect(res.body).toHaveProperty('statusCode', 500);
        expect(res.body).toHaveProperty('message');
      } finally {
        mockService.findPublic.mockClear();
      }
    });

    it('Returns items with correct DTO (expected keys)', async () => {
      inMemoryDonations.length = 0;
      const now = new Date();
      inMemoryDonations.push(
        buildTestDonation({ email: 'x@example.com', amount: 11 }, now, {
          isAnonymous: false,
          showDedicationPublicly: true,
          dedicationMessage: 'Nice work',
          donationType: DonationType.RECURRING,
          recurringInterval: RecurringInterval.MONTHLY,
        }),
      );

      const res = await request(app.getHttpServer())
        .get('/api/donations/public')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        const item = res.body[0];
        const keys = Object.keys(item);
        const required = [
          'id',
          'amount',
          'isAnonymous',
          'donationType',
          'status',
          'createdAt',
        ];
        const optional = [
          'donorName',
          'recurringInterval',
          'dedicationMessage',
        ];
        const allowed = [...required, ...optional];

        required.forEach((k) => expect(keys).toContain(k));
        keys.forEach((k) => expect(allowed).toContain(k));
      }
    });
  });

  describe('GET /api/donations/stats', () => {
    it('successfully returns the correct total and count', async () => {
      // Example: seed two donations and verify totals endpoint
      inMemoryDonations.length = 0; // reset
      const now = new Date();
      inMemoryDonations.push(buildTestDonation(donationASeed, now));
      inMemoryDonations.push(buildTestDonation(donationBSeed, now));

      const res = await request(app.getHttpServer())
        .get('/api/donations/stats')
        .expect(200);

      expect(res.body).toEqual({ total: 25, count: 2 });
    });

    it('successfully returns the correct total and count even if the database is empty', async () => {
      inMemoryDonations.length = 0;
      const res = await request(app.getHttpServer())
        .get('/api/donations/stats')
        .expect(200);

      expect(res.body).toEqual({ total: 0, count: 0 });
    });

    it('throws 500 server error if the database errors', async () => {
      mockService.getTotalDonations.mockRejectedValueOnce(
        new Error('Simulated DB failure'),
      );
      try {
        const res = await request(app.getHttpServer())
          .get('/api/donations/stats')
          .expect(500);
        expect(res.body).toHaveProperty('statusCode', 500);
        expect(res.body).toHaveProperty('message');
      } finally {
        mockService.getTotalDonations.mockClear();
      }
    });
  });
});

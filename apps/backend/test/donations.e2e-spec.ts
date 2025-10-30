import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Donation, DonationType, RecurringInterval } from '../src/donations/donation.entity';
import { User } from '../src/users/user.entity';

describe('Donations (e2e) - expanded stubs', () => {
  // Increase Jest timeout for slower CI/initialization (DB + Nest app init)
  // Default is 5000ms which is often too small for integration tests.
  jest.setTimeout(30000);

  let app: INestApplication;
  let donationRepo: Repository<Donation> | null = null;

  beforeAll(async () => {
    // Create a testing module using an in-memory SQLite database so tests
    // exercise TypeORM and the repository layer without touching Postgres.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Donation, User],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([Donation]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Repository is available for DB assertions. When tests are enabled
    // (not skipped) you can use this to verify DB state after POSTs.
    try {
      donationRepo = moduleFixture.get<Repository<Donation>>(getRepositoryToken(Donation));
    } catch (e) {
      donationRepo = null;
    }
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

  // Helper to mock all common repository methods (reads and writes) to throw once.
  // This ensures any call into the repository will reject and can be used to test
  // global DB failure handling without needing to know which method will be invoked.
  function mockAllRepoMethodsThrow(repo: Repository<Donation>, message = 'Simulated DB failure') {
    const spies: Array<jest.SpyInstance> = [];

    // Common repo method names to mock
    const methodNames = [
      'find',
      'findOne',
      'findOneBy',
      'findBy',
      'findAndCount',
      'save',
      'insert',
      'update',
      'delete',
      'remove',
      'softRemove',
      'softDelete',
      'clear',
      'count',
      'query',
      'create',
    ];

    for (const name of methodNames) {
      // dynamic access for testing - repository methods are dynamic and tested at runtime
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fn = (repo as any)[name];
      if (typeof fn === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spies.push(jest.spyOn(repo as any, name).mockRejectedValueOnce(new Error(message)));
      }
    }

    // Also mock createQueryBuilder if present
    let qbSpy: jest.SpyInstance | null = null;
  if ((repo as unknown as Record<string, unknown>).createQueryBuilder) {
      // The query-builder stub is only used to mock chainable methods in tests.
      // We scope-disable the explicit any rule for this mock object only.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValueOnce(new Error(message)),
        getManyAndCount: jest.fn().mockRejectedValueOnce(new Error(message)),
        getRawOne: jest.fn().mockRejectedValueOnce(new Error(message)),
        getRawMany: jest.fn().mockRejectedValueOnce(new Error(message)),
      } as unknown as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      qbSpy = jest.spyOn(repo as any, 'createQueryBuilder').mockReturnValue(qb as any);
    }

    return () => {
      for (const s of spies) s.mockRestore();
      if (qbSpy) qbSpy.mockRestore();
    };
  }

  // Small smoke test to ensure supertest and the app wiring are working.
  it('smoke: GET / (should 404 or 200 depending on routes)', async () => {
    const res = await request(app.getHttpServer()).get('/');
    // We don't make assumptions about the root route; assert we get a response
    expect([200, 404]).toContain(res.status);
  });
  
  describe('POST /api/donations', () => {
    it.skip('Successfuly commits a one-time donation creation', async () => {
      // Arrange
      const payload = { ...oneTimePayload };
      // prevent unused-var/unused-local complaints while this test is skipped
      void payload;
      void donationRepo;

      // Act (example supertest call)
      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(201);

      // Assert response shape (example)
      expect(res.body).toHaveProperty('id');
      expect(res.body.amount).toBe(payload.amount);

      // Verify DB state (example)
      const created = await donationRepo!.findOne({ where: { email: payload.email } });
      expect(created).toBeDefined();
      expect(created!.amount).toBe(payload.amount);
    });

    it.skip('Successful creates a recurring donation with interval', async () => {
      const payload = { ...recurringPayload };
      void payload;
      void donationRepo;

      // Example supertest + assertions (commented until route exists)
      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(201);

      expect(res.body.donationType).toBe('RECURRING');
      expect(res.body.recurringInterval).toBe('MONTHLY');
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
      // Simulate a DB failure by spying on the repository save method.
      if (!donationRepo) {
        // If the repo isn't available, fail the test to make the problem visible
        throw new Error('donationRepo not available for mocking');
      }

      const payload = { ...oneTimePayload };

      const saveSpy = jest.spyOn(donationRepo, 'save').mockRejectedValueOnce(new Error('Simulated DB failure'));
      try {
        const res = await request(app.getHttpServer())
          .post('/api/donations')
          .send(payload)
          .expect(500);

        // Expect standard Nest error shape for unhandled errors
        expect(res.body).toHaveProperty('statusCode', 500);
        expect(res.body).toHaveProperty('message');
      } finally {
        saveSpy.mockRestore();
      }
    });
  });

  describe('GET /api/donations/public', () => {
    it.skip('returns only non-anonymous donations', async () => {
      // Example setup: insert public and anonymous donations, then call endpoint
      await donationRepo!.save({ ...oneTimePayload, email: 'public@example.com', isAnonymous: false });
      await donationRepo!.save({ ...oneTimePayload, email: 'anon@example.com', isAnonymous: true });

      const res = await request(app.getHttpServer())
        .get('/api/donations/public')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((d: { isAnonymous: boolean }) => d.isAnonymous === false)).toBe(true);
    });

    it.skip('returns no donations if there are none in the database', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/donations/public')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((d: { isAnonymous: boolean }) => d.isAnonymous === false)).toBe(true);
    });

    it('throws 500 server error if the database errors', async () => {
      // Simulate DB find/query failures by mocking find variants to throw.
      if (!donationRepo) throw new Error('donationRepo not available for mocking');

      const restore = mockAllRepoMethodsThrow(donationRepo);
      try {
        const res = await request(app.getHttpServer()).get('/api/donations/public').expect(500);
        expect(res.body).toHaveProperty('statusCode', 500);
        expect(res.body).toHaveProperty('message');
      } finally {
        restore();
      }
    });
  });

  describe('GET /api/donations/stats', () => {
    it.skip('successfully returns the correct total and count', async () => {
      // Example: seed two donations and verify totals endpoint
      // await donationRepo!.save({ ...oneTimePayload, email: 'a@example.com', amount: 10 });
      // await donationRepo!.save({ ...oneTimePayload, email: 'b@example.com', amount: 15 });

      // const res = await request(app.getHttpServer())
      //   .get('/api/donations/stats')
      //   .expect(200);

      // expect(res.body).toEqual({ total: 25, count: 2 });
    });

    it.skip('successfully returns the correct total and count even if the database is empty', async () => {
      // const res = await request(app.getHttpServer())
      //   .get('/api/donations/stats')
      //   .expect(200);

      // expect(res.body).toEqual({ total: 0, count: 0 });
    });

        it('throws 500 server error if the database errors', async () => {
          // Simulate DB find/query failures by mocking find variants to throw.
          if (!donationRepo) throw new Error('donationRepo not available for mocking');

          const restore = mockAllRepoMethodsThrow(donationRepo);
          try {
            const res = await request(app.getHttpServer()).get('/api/donations/stats').expect(500);
            expect(res.body).toHaveProperty('statusCode', 500);
            expect(res.body).toHaveProperty('message');
          } finally {
            restore();
          }
    });
  });
});

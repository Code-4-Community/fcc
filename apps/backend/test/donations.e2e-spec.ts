import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

// Import entities directly from src so tests run against the same models
import { Donation } from '../src/donations/donation.entity';
import { User } from '../src/users/user.entity';

describe('Donations (e2e) - expanded stubs', () => {
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
    donationType: 'ONE_TIME',
  };

  const recurringPayload = {
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice.smith@example.com',
    amount: 25,
    isAnonymous: false,
    donationType: 'RECURRING',
    recurringInterval: 'MONTHLY',
  };

  // Each test is currently skipped. They contain concrete, ready-to-run
  // supertest calls and DB assertions; remove `.skip` to enable a test
  // once the corresponding controller/routes are implemented.

  it.skip('POST /api/donations - successful one-time donation creation', async () => {
    // Arrange
  const payload = { ...oneTimePayload };
  // prevent unused-var/unused-local complaints while this test is skipped
  void payload;
  void donationRepo;

  // Act (example supertest call)
  // const res = await request(app.getHttpServer())
  //   .post('/api/donations')
  //   .send(payload)
  //   .expect(201);

  // Assert response shape (example)
  // expect(res.body).toHaveProperty('id');
  // expect(res.body.amount).toBe(payload.amount);

  // Verify DB state (example)
  // const created = await donationRepo!.findOne({ where: { email: payload.email } });
  // expect(created).toBeDefined();
  // expect(created!.amount).toBe(payload.amount);
  });

  it.skip('POST /api/donations - successful recurring donation with interval', async () => {
  const payload = { ...recurringPayload };
  void payload;
  void donationRepo;

  // Example supertest + assertions (commented until route exists)
  // const res = await request(app.getHttpServer())
  //   .post('/api/donations')
  //   .send(payload)
  //   .expect(201);

  // expect(res.body.donationType).toBe('RECURRING');
  // expect(res.body.recurringInterval).toBe('MONTHLY');
  });

  describe('POST /api/donations - validation errors', () => {
    it.skip('Negative amount returns 400', async () => {
  const payload = { ...oneTimePayload, amount: -10 };
  void payload;
  void donationRepo;

  // const res = await request(app.getHttpServer())
  //   .post('/api/donations')
  //   .send(payload)
  //   .expect(400);

  // expect(res.body).toHaveProperty('message');
    });

    it.skip('Invalid email format returns 400', async () => {
  const payload = { ...oneTimePayload, email: 'not-an-email' };
  void payload;
  void donationRepo;

  // const res = await request(app.getHttpServer())
  //   .post('/api/donations')
  //   .send(payload)
  //   .expect(400);

  // expect(res.body).toHaveProperty('message');
    });

    it.skip('Recurring without interval returns 400', async () => {
      const payload = { ...recurringPayload };
  // @ts-expect-error - simulate missing interval
  delete payload.recurringInterval;

      // const res = await request(app.getHttpServer())
      //   .post('/api/donations')
      //   .send(payload)
      //   .expect(400);
    });

    it.skip('One-time with interval returns 400', async () => {
  const payload: Record<string, unknown> = { ...oneTimePayload, recurringInterval: 'MONTHLY' };
  void payload;
  void donationRepo;

  // const res = await request(app.getHttpServer())
  //   .post('/api/donations')
  //   .send(payload)
  //   .expect(400);
    });
  });

  it.skip('GET /api/donations/public - returns only non-anonymous donations', async () => {
    // Example setup: insert public and anonymous donations, then call endpoint
    // await donationRepo!.save({ ...oneTimePayload, email: 'public@example.com', isAnonymous: false });
    // await donationRepo!.save({ ...oneTimePayload, email: 'anon@example.com', isAnonymous: true });

    // const res = await request(app.getHttpServer())
    //   .get('/api/donations/public')
    //   .expect(200);

    // expect(Array.isArray(res.body)).toBe(true);
    // expect(res.body.every((d: any) => d.isAnonymous === false)).toBe(true);
  });

  it.skip('GET /api/donations/stats - returns correct total and count', async () => {
    // Example: seed two donations and verify totals endpoint
    // await donationRepo!.save({ ...oneTimePayload, email: 'a@example.com', amount: 10 });
    // await donationRepo!.save({ ...oneTimePayload, email: 'b@example.com', amount: 15 });

    // const res = await request(app.getHttpServer())
    //   .get('/api/donations/stats')
    //   .expect(200);

    // expect(res.body).toEqual({ total: 25, count: 2 });
  });

  // Small smoke test to ensure supertest and the app wiring are working.
  it('smoke: GET / (should 404 or 200 depending on routes)', async () => {
    const res = await request(app.getHttpServer()).get('/');
    // We don't make assumptions about the root route; assert we get a response
    expect([200, 404]).toContain(res.status);
  });
});

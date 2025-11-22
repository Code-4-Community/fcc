import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import {
  DonationType,
  RecurringInterval,
  DonationStatus,
} from '../src/donations/donation.entity';
import { DonationsModule } from '../src/donations/donations.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Donation } from '../src/donations/donation.entity'; // adjust path if needed

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
  let nextId = 1;
  let donationRepository: Repository<Donation>;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    nextId = 1;

    // Use actual Postgres DB for tests. IMPORTANT: Make sure these env vars
    // point to a dedicated test database (never run tests against production DB).
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.NX_DB_HOST || 'localhost',
          port: parseInt(process.env.NX_DB_PORT || '5432', 10),
          username: 'postgres',
          password: '12345678',
          database: 'fcc_dev',
          entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
          // Prefer running migrations in tests for parity; set migrationsRun to true
          // if you keep migrations up-to-date. If you want schema auto-sync for
          // a test DB, set `synchronize: true` manually here.
          synchronize: false,
          migrationsRun: true,
          migrations: [__dirname + '/../src/migrations/*{.ts,.js}'],
          logging: false,
        }),
        DonationsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Match runtime API prefix used by the real application
    app.setGlobalPrefix('api');
    await app.init();

    donationRepository = moduleFixture.get<Repository<Donation>>(
      getRepositoryToken(Donation),
    );
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await donationRepository.clear();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
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

  // ---------- DTO shape validators ----------
  const isValidDateValue = (value: unknown): boolean => {
    console.log('value:', value);
    console.log(typeof value);
    // Accept either a Date object or a string that can be parsed as a date.
    if (value instanceof Date) {
      return !Number.isNaN(value.getTime());
    }
    if (typeof value === 'string') {
      const dt = new Date(value);
      return !Number.isNaN(dt.getTime());
    }
    // Some DB drivers may return date-like objects; try to stringify/parse as fallback
    if (value && typeof value === 'object') {
      try {
        const asString = (value as any).toISOString
          ? (value as any).toISOString()
          : String(value);
        const dt = new Date(asString);
        return !Number.isNaN(dt.getTime());
      } catch {
        return false;
      }
    }

    return false;
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
    expect(isValidDateValue(obj.createdAt)).toBe(true);
    expect(isValidDateValue(obj.updatedAt)).toBe(true);
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
    expect(isValidDateValue(obj.createdAt)).toBe(true);

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

      // Validate DB state (repository query)
      const created = await donationRepository.findOne({
        where: { email: payload.email },
      });
      expect(created).toBeDefined();
      expect(created).toBeInstanceOf(Donation);
      if (created instanceof Donation) {
        expect((created as Donation).id).toBeDefined();
        expect((created as Donation).firstName).toBe(payload.firstName);
        expect((created as Donation).lastName).toBe(payload.lastName);
        expect((created as Donation).email).toBe(payload.email);
        expect((created as Donation).amount).toBe(payload.amount);
        expect((created as Donation).isAnonymous).toBe(payload.isAnonymous);
        expect((created as Donation).donationType).toBe(payload.donationType);
        expect((created as Donation).recurringInterval).toBeNull();
        expect((created as Donation).dedicationMessage).toBeNull();
        expect((created as Donation).showDedicationPublicly).toBe(false);
        expect((created as Donation).status).toBe('pending');
        expect(isValidDateValue((created as Donation).createdAt)).toBe(true);
        expect(isValidDateValue((created as Donation).updatedAt)).toBe(true);
        expect((created as Donation).transactionId).toBeNull();
      }
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

      // Validate DB state (repository query)
      const created = await donationRepository.findOne({
        where: { email: payload.email },
      });

      expect(created).toBeDefined();
      expect(created).toBeInstanceOf(Donation);
      if (created instanceof Donation) {
        expect((created as Donation).id).toBeDefined();
        expect((created as Donation).firstName).toBe(payload.firstName);
        expect((created as Donation).lastName).toBe(payload.lastName);
        expect((created as Donation).email).toBe(payload.email);
        expect((created as Donation).amount).toBe(payload.amount);
        expect((created as Donation).isAnonymous).toBe(payload.isAnonymous);
        expect((created as Donation).donationType).toBe(payload.donationType);
        expect((created as Donation).recurringInterval).toBe(
          payload.recurringInterval,
        );
        expect((created as Donation).dedicationMessage).toBeNull();
        expect((created as Donation).showDedicationPublicly).toBe(false);
        expect((created as Donation).status).toBe('pending');
        expect(isValidDateValue((created as Donation).createdAt)).toBe(true);
        expect(isValidDateValue((created as Donation).updatedAt)).toBe(true);
        expect((created as Donation).transactionId).toBeNull();
      }
    });

    it('rejects a negative amount (returns 400)', async () => {
      const payload = { ...oneTimePayload, amount: -10 };

      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('message');

      const dbCount = await donationRepository.count();
      expect(dbCount).toBe(0);
    });

    it('rejects an invalid email format amount (returns 400)', async () => {
      const payload = { ...oneTimePayload, email: 'not-an-email' };

      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('message');

      const dbCount = await donationRepository.count();
      expect(dbCount).toBe(0);
    });

    it('rejects a donation marked recurring if recurringInterval is missing', async () => {
      const payload: Partial<typeof recurringPayload> = { ...recurringPayload };
      delete payload.recurringInterval;

      const res = await request(app.getHttpServer())
        .post('/api/donations')
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('message');

      const dbCount = await donationRepository.count();
      expect(dbCount).toBe(0);
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

      const dbCount = await donationRepository.count();
      expect(dbCount).toBe(0);
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

      const dbCount = await donationRepository.count();
      expect(dbCount).toBe(0);
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

      const dbCount = await donationRepository.count();
      expect(dbCount).toBe(0);
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

      const dbCount = await donationRepository.count();
      expect(dbCount).toBe(0);
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

      const dbCount = await donationRepository.count();
      expect(dbCount).toBe(0);
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

      // Validate DB state (repository query)
      const created = await donationRepository.findOne({
        where: { email: payload.email },
      });

      expect(created).toBeDefined();
      expect(created).toBeInstanceOf(Donation);
      if (created instanceof Donation) {
        expect((created as Donation).id).toBeDefined();
        expect((created as Donation).firstName).toBe(payload.firstName);
        expect((created as Donation).lastName).toBe(payload.lastName);
        expect((created as Donation).email).toBe(payload.email);
        expect((created as Donation).amount).toBe(payload.amount);
        expect((created as Donation).isAnonymous).toBe(false);
        expect((created as Donation).donationType).toBe(payload.donationType);
        expect((created as Donation).recurringInterval).toBeNull();
        expect((created as Donation).dedicationMessage).toBeNull();
        expect((created as Donation).showDedicationPublicly).toBe(false);
        expect((created as Donation).status).toBe('pending');
        expect(isValidDateValue((created as Donation).createdAt)).toBe(true);
        expect(isValidDateValue((created as Donation).updatedAt)).toBe(true);
        expect((created as Donation).transactionId).toBeNull();
      }
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

      const dbCount = await donationRepository.count();
      expect(dbCount).toBe(0);
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

      const dbCount = await donationRepository.count();
      expect(dbCount).toBe(0);
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

      const dbCount = await donationRepository.count();
      expect(dbCount).toBe(0);
    });
  });

  describe('GET /api/donations/public', () => {
    it('returns only non-anonymous donations', async () => {
      // Seed anonymous and non-anonymous donations
      const now = new Date();
      await donationRepository.save([
        {
          firstName: 'Sam',
          lastName: 'Nie',
          email: 'nie.sa@example.com',
          amount: 10,
          isAnonymous: true,
          donationType: DonationType.ONE_TIME,
          recurringInterval: null,
          dedicationMessage: null,
          showDedicationPublicly: false,
          status: DonationStatus.SUCCEEDED,
          transactionId: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          firstName: 'Rex',
          lastName: 'Jeff',
          email: 'Re.Je@example.com',
          amount: 15,
          isAnonymous: false,
          donationType: DonationType.ONE_TIME,
          recurringInterval: null,
          dedicationMessage: null,
          showDedicationPublicly: false,
          status: DonationStatus.SUCCEEDED,
          transactionId: null,
          createdAt: now,
          updatedAt: now,
        },
      ] as Partial<Donation>[]);

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

    it('Returns items with correct DTO (expected keys)', async () => {
      const now = new Date();

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
      // Seed two donations so the total is 25 and count is 2
      const now = new Date();
      await donationRepository.save([
        {
          firstName: 'Sam',
          lastName: 'Nie',
          email: 'nie.sa@example.com',
          amount: 10,
          isAnonymous: false,
          donationType: DonationType.ONE_TIME,
          recurringInterval: null,
          dedicationMessage: null,
          showDedicationPublicly: false,
          status: DonationStatus.SUCCEEDED,
          transactionId: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          firstName: 'Rex',
          lastName: 'Jeff',
          email: 'Re.Je@example.com',
          amount: 15,
          isAnonymous: false,
          donationType: DonationType.ONE_TIME,
          recurringInterval: null,
          dedicationMessage: null,
          showDedicationPublicly: false,
          status: DonationStatus.SUCCEEDED,
          transactionId: null,
          createdAt: now,
          updatedAt: now,
        },
      ] as Partial<Donation>[]);

      const res = await request(app.getHttpServer())
        .get('/api/donations/stats')
        .expect(200);

      expect(res.body).toEqual({ total: 25, count: 2 });
    });

    it('successfully returns the correct total and count even if the database is empty', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/donations/stats')
        .expect(200);

      expect(res.body).toEqual({ total: 0, count: 0 });
    });
  });
});

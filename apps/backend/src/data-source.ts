import { DataSource } from 'typeorm';
import { Donation } from './donations/donation.entity';
import { User } from './users/user.entity';
import * as dotenv from 'dotenv';
import { Goal } from './donations/goal.entity';
import { EmailTemplate } from './emails/email-template.entity';
import { EmailSubscriber } from './emails/email-subscriber.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.NX_DB_HOST,
  port: parseInt(process.env.NX_DB_PORT as string, 10),
  username: process.env.NX_DB_USERNAME,
  password: process.env.NX_DB_PASSWORD,
  database: process.env.NX_DB_DATABASE,
  entities: [User, Donation, Goal, EmailTemplate, EmailSubscriber],
  migrations: ['apps/backend/src/migrations/*.ts'],
  migrationsRun: true,
  synchronize: false,
  ssl: process.env.NX_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;

import { DataSource } from 'typeorm';
import { PluralNamingStrategy } from './strategies/plural-naming.strategy';
import { Task } from './task/types/task.entity';
import { Donation } from './donations/donation.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.NX_DB_HOST,
  port: parseInt(process.env.NX_DB_PORT as string, 10),
  username: process.env.NX_DB_USERNAME,
  password: process.env.NX_DB_PASSWORD,
  database: process.env.NX_DB_DATABASE,
  entities: [Task, Donation],
  migrations: ['apps/backend/src/migrations/*.js', 'apps/backend/src/migrations/*-add_donations.ts'],
  // Setting synchronize: true shouldn't be used in production - otherwise you can lose production data
  synchronize: false,
  namingStrategy: new PluralNamingStrategy(),
});

export default AppDataSource;

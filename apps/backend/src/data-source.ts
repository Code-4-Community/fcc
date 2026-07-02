import { DataSource } from 'typeorm';
import { Donation } from './donations/donation.entity';
import { User } from './users/user.entity';
import * as dotenv from 'dotenv';
import { Goal } from './donations/goal.entity';
import { EmailTemplate } from './emails/email-template.entity';
import { EmailSubscriber } from './emails/email-subscriber.entity';

// Statically import migrations for Webpack bundling
import { AddTask1754254886189 } from './migrations/1754254886189-add_task';
import { AddUsers1759151412730 } from './migrations/1759151412730-add_users';
import { AddDonations1763769154611 } from './migrations/1763769154611-add_donations';
import { AddEmailTemplates1778800000001 } from './migrations/1778800000001-add_email_templates';
import { AddEmailSubscribers1778800000002 } from './migrations/1778800000002-add_email_subscribers';
import { AddGoals1780531200000 } from './migrations/1780531200000-add_goals';
import { UserRefactoringId1780931163251 } from './migrations/1780931163251-user-refactoring-id';
import { RenameGoalColumns1781161660000 } from './migrations/1781161660-rename-goal-columns';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.NX_DB_HOST,
  port: parseInt(process.env.NX_DB_PORT as string, 10),
  username: process.env.NX_DB_USERNAME,
  password: process.env.NX_DB_PASSWORD,
  database: process.env.NX_DB_DATABASE,
  entities: [User, Donation, Goal, EmailTemplate, EmailSubscriber],
  migrations: [
    AddTask1754254886189,
    AddUsers1759151412730,
    AddDonations1763769154611,
    AddEmailTemplates1778800000001,
    AddEmailSubscribers1778800000002,
    AddGoals1780531200000,
    UserRefactoringId1780931163251,
    RenameGoalColumns1781161660000,
  ],
  migrationsRun: true,
  synchronize: false,
  ssl: process.env.NX_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum DonationType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
}

export enum RecurringInterval {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  BIMONTHLY = 'bimonthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
}

export enum DonationStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: false })
  isAnonymous: boolean;

  @Column({ type: 'varchar' })
  donationType: DonationType;

  @Column({ type: 'varchar', nullable: true })
  recurringInterval: RecurringInterval | null;

  @Column({ nullable: true })
  dedicationMessage: string | null;

  @Column({ default: false })
  showDedicationPublicly: boolean;

  @Column({ type: 'varchar', default: DonationStatus.PENDING })
  status: DonationStatus;

  @Column({ nullable: true })
  transactionId: string | null;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}

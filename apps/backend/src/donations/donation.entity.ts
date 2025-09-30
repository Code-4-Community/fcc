import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum donationType {
  'one_time',
  'recurring',
}

export enum recurringInterval {
  'weekly',
  'monthly',
  'bimonthly',
  'quarterly',
  'annually',
}

@Entity()
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

  @Column()
  donationType: donationType;

  @Column({ nullable: true })
  recurringInterval: recurringInterval;

  @Column({ nullable: true })
  dedicationMessage: string;

  @Column({ default: false })
  showDedicationPublicly: boolean;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}

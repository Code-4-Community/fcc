import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('email_subscribers')
export class EmailSubscriber {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  firstName: string | null;

  @Column({ nullable: true })
  lastName: string | null;

  @Column({ default: true })
  isSubscribed: boolean;

  @Column({ nullable: true })
  unsubscribedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  id: number;

  @Column({ type: 'int' })
  targetAmount: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}

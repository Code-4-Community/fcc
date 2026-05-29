import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TemplateType {
  DONATION_RESPONSE = 'donation_response',
  RELAPSED_DONOR = 'relapsed_donor',
  EMAIL_SUBSCRIBERS = 'email_subscribers',
}

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  id: number;

  @Column({ type: 'varchar', unique: true })
  type: TemplateType;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  bodyHtml: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}

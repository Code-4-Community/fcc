import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

import type { Status } from './types';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  status!: Status;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;
}

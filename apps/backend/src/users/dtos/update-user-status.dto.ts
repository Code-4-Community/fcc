import { IsEnum } from 'class-validator';
import { Status } from '../types';

export class UpdateUserStatusDto {
  @IsEnum(Status)
  status!: Status;
}

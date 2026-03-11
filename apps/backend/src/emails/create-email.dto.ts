import { IsEmail, IsString } from 'class-validator';

export class CreateEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  emailSubject: string;

  @IsString()
  emailContent: string;
}

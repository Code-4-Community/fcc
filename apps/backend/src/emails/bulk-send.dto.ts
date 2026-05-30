import { IsEnum, IsString } from 'class-validator';

export enum EmailTargetGroup {
  RELAPSED_DONORS = 'relapsed_donors',
  EMAIL_SUBSCRIBERS = 'email_subscribers',
}

export class BulkSendDto {
  @IsEnum(EmailTargetGroup)
  targetGroup: EmailTargetGroup;

  @IsString()
  subject: string;

  @IsString()
  bodyHtml: string;
}

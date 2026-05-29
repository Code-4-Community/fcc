import { IsEnum, IsString } from 'class-validator';
import { TemplateType } from './email-template.entity';

export class SaveTemplateDto {
  @IsEnum(TemplateType)
  type: TemplateType;

  @IsString()
  subject: string;

  @IsString()
  bodyHtml: string;
}

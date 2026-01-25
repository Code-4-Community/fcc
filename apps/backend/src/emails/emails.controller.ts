import { Controller, Post, Body } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { CreateEmailDto } from './create-email.dto';

@Controller('emails')
export class EmailsController {
  constructor(private readonly emailService: EmailsService) {}

  @Post('send-email')
  async sendVerificationEmail(@Body() body: CreateEmailDto) {
    await this.emailService.sendEmail(
      body.email,
      body.emailSubject,
      body.emailContent,
    );
    return { message: 'email sent' };
  }
}

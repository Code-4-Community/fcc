import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { CreateEmailDto } from './create-email.dto';

@Controller('emails')
export class EmailsController {
  constructor(private readonly emailService: EmailsService) {}

  @Post('send-email')
  // @UseGuards(JwtAuthGuard) (should use auth, not implemented rn)
  async sendVerificationEmail(@Body() body: CreateEmailDto) {
    await this.emailService.sendEmail(
      body.email,
      body.emailSubject,
      body.emailContent,
    );
    return { message: 'email sent' };
  }
}

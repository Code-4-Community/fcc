import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmailsService } from './emails.service';
import { CreateEmailDto } from './create-email.dto';
import { SaveTemplateDto } from './save-template.dto';
import { BulkSendDto, EmailTargetGroup } from './bulk-send.dto';
import { DonationsService } from '../donations/donations.service';

@Controller('emails')
export class EmailsController {
  constructor(
    private readonly emailService: EmailsService,
    private readonly donationsService: DonationsService,
  ) {}

  @Post('send-email')
  @UseGuards(AuthGuard('jwt'))
  async sendVerificationEmail(@Body() body: CreateEmailDto) {
    await this.emailService.sendEmail(
      body.email,
      body.emailSubject,
      body.emailContent,
    );
    return { message: 'email sent' };
  }

  @Get('template')
  @UseGuards(AuthGuard('jwt'))
  async getTemplates() {
    return this.emailService.getAllTemplates();
  }

  @Get('subscribers')
  @UseGuards(AuthGuard('jwt'))
  async getSubscribers() {
    const emails = await this.emailService.getSubscribers();
    return { emails, count: emails.length };
  }

  @Post('template')
  @UseGuards(AuthGuard('jwt'))
  async saveTemplate(@Body() body: SaveTemplateDto) {
    const template = await this.emailService.saveTemplate(
      body.type,
      body.subject,
      body.bodyHtml,
    );
    return {
      message: 'Template saved successfully',
      template: {
        id: template.id,
        type: template.type,
        subject: template.subject,
        updatedAt: template.updatedAt,
      },
    };
  }

  @Post('bulk-send')
  @UseGuards(AuthGuard('jwt'))
  async bulkSend(@Body() body: BulkSendDto) {
    let recipientEmails: string[] = [];

    if (body.targetGroup === EmailTargetGroup.RELAPSED_DONORS) {
      const lapsedResult = await this.donationsService.getLapsedDonors(6);
      recipientEmails = lapsedResult.emails;
    } else if (body.targetGroup === EmailTargetGroup.EMAIL_SUBSCRIBERS) {
      recipientEmails = await this.emailService.getSubscribers();
    } else {
      throw new BadRequestException('Invalid target group');
    }

    if (recipientEmails.length === 0) {
      return {
        message: 'No recipients found for the target group',
        sent: 0,
        targetGroup: body.targetGroup,
      };
    }

    // Send bulk emails
    const result = await this.emailService.sendBulkEmail(
      recipientEmails,
      body.subject,
      body.bodyHtml,
    );

    return {
      message: 'Bulk email campaign sent successfully',
      sent: result.sent,
      failed: result.failed,
      targetGroup: body.targetGroup,
    };
  }
}

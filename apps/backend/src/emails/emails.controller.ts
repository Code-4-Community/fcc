import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  Query,
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

  @Post('subscribers/sync')
  @UseGuards(AuthGuard('jwt'))
  async syncSubscribers(@Body() body: { emails: string[] }) {
    await this.emailService.syncSubscribers(body.emails || []);
    return { message: 'Subscribers synced successfully' };
  }

  @Delete('subscribers/:email')
  @UseGuards(AuthGuard('jwt'))
  async removeSubscriber(@Param('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    // Using unsubscribe logic to mark as unsubscribed instead of hard delete
    // so they are properly filtered out of relapsed emails too.
    await this.emailService.unsubscribe(email);
    return { message: 'Subscriber removed successfully' };
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

  @Get('unsubscribe')
  async unsubscribe(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    await this.emailService.unsubscribe(email);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f9fafb; }
          .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          h1 { color: #1f2937; margin-bottom: 16px; }
          p { color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Successfully Unsubscribed</h1>
          <p>You have been removed from our mass mailing list.</p>
        </div>
      </body>
      </html>
    `;
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

    // Filter out anyone who has unsubscribed
    recipientEmails =
      await this.emailService.filterSubscribedEmails(recipientEmails);

    if (recipientEmails.length === 0) {
      return {
        message: 'No subscribed recipients found after filtering unsubscribes',
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

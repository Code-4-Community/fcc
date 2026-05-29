import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMAZON_SES_WRAPPER } from './amazon-ses.wrapper';
import { EmailTemplate, TemplateType } from './email-template.entity';
import { EmailSubscriber } from './email-subscriber.entity';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);
  constructor(
    @Inject(AMAZON_SES_WRAPPER)
    private readonly amazonSESWrapper: any,
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
    @InjectRepository(EmailSubscriber)
    private readonly emailSubscriberRepository: Repository<EmailSubscriber>,
  ) {}

  /**
   * Sends an email.
   *
   * @param recipientEmail the email address of the recipient
   * @param subject the subject of the email
   * @param bodyHtml the HTML body of the email
   * @resolves if the email was sent successfully
   * @rejects if the email was not sent successfully
   */
  public async sendEmail(
    recipientEmail: string,
    subject: string,
    bodyHTML: string,
  ): Promise<unknown> {
    try {
      return this.amazonSESWrapper.sendEmail(
        [recipientEmail],
        subject,
        bodyHTML,
      );
    } catch (error) {
      this.logger.error('Error sending email', error);
      throw error;
    }
  }

  /**
   * Sends bulk emails to multiple recipients.
   *
   * @param recipientEmails array of recipient email addresses
   * @param subject the subject of the email
   * @param bodyHTML the HTML body of the email
   * @resolves with the number of emails sent
   * @rejects if sending fails
   */
  public async sendBulkEmail(
    recipientEmails: string[],
    subject: string,
    bodyHTML: string,
  ): Promise<{ sent: number }> {
    try {
      // Send emails in batches to avoid rate limiting
      const batchSize = 50; // AWS SES recommends batch sizes
      const batches: string[][] = [];

      for (let i = 0; i < recipientEmails.length; i += batchSize) {
        batches.push(recipientEmails.slice(i, i + batchSize));
      }

      let sentCount = 0;
      for (const batch of batches) {
        await this.amazonSESWrapper.sendEmail(batch, subject, bodyHTML);
        sentCount += batch.length;
        this.logger.log(`Sent batch of ${batch.length} emails`);
      }

      this.logger.log(
        `Successfully sent ${sentCount} emails with subject: ${subject}`,
      );
      return { sent: sentCount };
    } catch (error) {
      this.logger.error('Error sending bulk email', error);
      throw error;
    }
  }

  /**
   * Saves or updates an email template.
   *
   * @param type the template type
   * @param subject the email subject
   * @param bodyHtml the HTML body
   * @returns the saved template
   */
  public async saveTemplate(
    type: TemplateType,
    subject: string,
    bodyHtml: string,
  ): Promise<EmailTemplate> {
    try {
      let template = await this.emailTemplateRepository.findOne({
        where: { type },
      });

      if (template) {
        template.subject = subject;
        template.bodyHtml = bodyHtml;
        template.updatedAt = new Date();
      } else {
        template = this.emailTemplateRepository.create({
          type,
          subject,
          bodyHtml,
          isActive: true,
        });
      }

      return await this.emailTemplateRepository.save(template);
    } catch (error) {
      this.logger.error(`Error saving template ${type}`, error);
      throw error;
    }
  }

  /**
   * Gets an email template by type.
   *
   * @param type the template type
   * @returns the template or null if not found
   */
  public async getTemplate(type: TemplateType): Promise<EmailTemplate | null> {
    return await this.emailTemplateRepository.findOne({
      where: { type, isActive: true },
    });
  }

  /**
   * Gets all active email subscribers.
   *
   * @returns array of subscribed email addresses
   */
  public async getSubscribers(): Promise<string[]> {
    const subscribers = await this.emailSubscriberRepository.find({
      where: { isSubscribed: true },
      select: ['email'],
    });

    return subscribers.map((sub) => sub.email);
  }

  /**
   * Sends the Donation Response email to a donor using the stored template.
   *
   * @param recipientEmail the donor's email address
   * @param donorName the donor's name for personalization
   * @param amount the donation amount
   * @resolves if the email was sent successfully
   * @rejects if the template doesn't exist or sending fails
   */
  public async sendDonationResponseEmail(
    recipientEmail: string,
    donorName: string,
    amount: number,
  ): Promise<void> {
    try {
      const template = await this.getTemplate(TemplateType.DONATION_RESPONSE);

      if (!template) {
        this.logger.warn(
          'Donation Response template not found, skipping email',
        );
        return;
      }

      const bodyHTML = template.bodyHtml
        .replace(/\{\{donorName\}\}/g, donorName)
        .replace(/\{\{amount\}\}/g, amount.toString());

      await this.sendEmail(recipientEmail, template.subject, bodyHTML);

      this.logger.log(
        `Sent Donation Response email to ${recipientEmail} for amount $${amount}`,
      );
    } catch (error) {
      this.logger.error('Error sending Donation Response email', error);
      throw error;
    }
  }
}

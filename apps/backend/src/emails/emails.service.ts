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
   * @resolves with the number of emails sent and failed
   */
  public async sendBulkEmail(
    recipientEmails: string[],
    subject: string,
    bodyHTML: string,
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const email of recipientEmails) {
      try {
        await this.amazonSESWrapper.sendEmail([email], subject, bodyHTML);
        sent += 1;
      } catch (error) {
        failed += 1;
        this.logger.error(`Failed to send bulk email to ${email}`, error);
      }
    }

    this.logger.log(
      `Bulk send complete: ${sent} sent, ${failed} failed (subject: ${subject})`,
    );
    return { sent, failed };
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

  public async getAllTemplates(): Promise<EmailTemplate[]> {
    return await this.emailTemplateRepository.find();
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

      let bodyHTML = template.bodyHtml;
      try {
        bodyHTML = template.bodyHtml
          .replace(/\{\{donorName\}\}/g, donorName)
          .replace(/\{\{amount\}\}/g, amount.toString());
      } catch (error) {
        // Fall back to the raw template so a bad value doesn't drop the email.
        this.logger.error(
          'Error replacing template variables, sending raw template',
          error,
        );
      }

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

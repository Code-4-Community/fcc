import { Inject, Injectable, Logger } from '@nestjs/common';
// import { AmazonSESWrapper } from './amazon-ses.wrapper';
import { AMAZON_SES_WRAPPER } from './amazon-ses.wrapper';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);
  constructor(
    @Inject(AMAZON_SES_WRAPPER)
    private readonly amazonSESWrapper: any,
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
}

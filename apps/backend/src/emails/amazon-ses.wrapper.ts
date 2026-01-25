import { Inject, Injectable } from '@nestjs/common';
import {
  SES as AmazonSESClient,
  SendRawEmailCommandInput,
  SendRawEmailCommand,
} from '@aws-sdk/client-ses';
import { AMAZON_SES_CLIENT } from './amazon-ses-client.factory';
import MailComposer = require('nodemailer/lib/mail-composer');
import * as dotenv from 'dotenv';
import Mail from 'nodemailer/lib/mailer';
dotenv.config();

@Injectable()
export class AmazonSESWrapper {
  private client: AmazonSESClient;

  /**
   * @param client injected from `amazon-ses-client.factory.ts`
   */
  constructor(@Inject(AMAZON_SES_CLIENT) client: AmazonSESClient) {
    this.client = client;
  }

  /**
   * Sends an email via Amazon SES.
   *
   * @param recipientEmails the email addresses of the recipients
   * @param subject the subject of the email
   * @param emailContent the HTML body of the email
   * @resolves if the email was sent successfully
   * @rejects if the email was not sent successfully
   */
  async sendEmail(
    recipientEmails: string[],
    subject: string,
    emailContent: string,
  ) {
    const mailOptions: Mail.Options = {
      from: process.env.AWS_SES_SENDER_EMAIL,
      to: recipientEmails,
      subject: subject,
      html: emailContent,
    };

    const messageData = await new MailComposer(mailOptions).compile().build();

    const params: SendRawEmailCommandInput = {
      Source: process.env.AWS_SES_SENDER_EMAIL,
      RawMessage: { Data: messageData },
      Destinations: recipientEmails,
    };
    await this.client.send(new SendRawEmailCommand(params));
  }
}

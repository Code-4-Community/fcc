import { Provider } from '@nestjs/common';
import { SES as AmazonSESClient } from '@aws-sdk/client-ses';
import { assert } from 'console';
import * as dotenv from 'dotenv';
dotenv.config();

export const AMAZON_SES_CLIENT = 'AMAZON_SES_CLIENT';

/**
 * Factory that produces a new instance of the Amazon SES client.
 * Used to send emails via Amazon SES.
 */
export const amazonSESClientFactory: Provider<AmazonSESClient> = {
  provide: AMAZON_SES_CLIENT,
  useFactory: () => {
    assert(
      process.env.AWS_SES_ACCESS_KEY_ID !== undefined,
      'AWS_SES_ACCESS_KEY_ID is not defined',
    );
    assert(
      process.env.AWS_SES_SECRET_ACCESS_KEY !== undefined,
      'AWS_SES_SECRET_ACCESS_KEY is not defined',
    );
    assert(
      process.env.AWS_SES_REGION !== undefined,
      'AWS_SES_REGION is not defined',
    );
    const SES_CONFIG = {
      region: process.env.AWS_SES_REGION,
      credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
      },
    };

    return new AmazonSESClient(SES_CONFIG);
  },
};

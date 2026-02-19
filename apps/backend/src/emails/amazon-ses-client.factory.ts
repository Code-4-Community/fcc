import { Provider } from '@nestjs/common';
import { SES as AmazonSESClient } from '@aws-sdk/client-ses';
import { strict as assert } from 'node:assert';
import * as dotenv from 'dotenv';
import path from 'node:path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

export const AMAZON_SES_CLIENT = 'AMAZON_SES_CLIENT';

export const amazonSESClientFactory: Provider<AmazonSESClient> = {
  provide: AMAZON_SES_CLIENT,
  useFactory: () => {
    assert(
      process.env.AWS_SES_ACCESS_KEY_ID,
      'AWS_SES_ACCESS_KEY_ID is not defined',
    );
    assert(
      process.env.AWS_SES_SECRET_ACCESS_KEY,
      'AWS_SES_SECRET_ACCESS_KEY is not defined',
    );
    assert(process.env.AWS_SES_REGION, 'AWS_SES_REGION is not defined');

    return new AmazonSESClient({
      region: process.env.AWS_SES_REGION,
      credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
      },
    });
  },
};

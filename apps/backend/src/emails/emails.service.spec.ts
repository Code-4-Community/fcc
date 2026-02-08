import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { AMAZON_SES_WRAPPER } from './amazon-ses.wrapper';

describe('EmailsService', () => {
  let service: EmailsService;
  let mockAmazonSESWrapper: any;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    mockAmazonSESWrapper = {
      sendEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailsService,
        {
          provide: AMAZON_SES_WRAPPER,
          useValue: mockAmazonSESWrapper,
        },
      ],
    }).compile();
    //   loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');
    //   service = module.get<EmailsService>(EmailsService);
    service = module.get<EmailsService>(EmailsService);
    loggerErrorSpy = jest.spyOn(service['logger'], 'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    const recipientEmail = 'user@example.com';
    const subject = 'Test Email Subject';
    const bodyHTML = '<h1>Test Email</h1><p>This is a test email body.</p>';

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should send email successfully with valid parameters', async () => {
      const expectedResponse = { MessageId: 'test-message-id-123' };
      mockAmazonSESWrapper.sendEmail.mockResolvedValue(expectedResponse);

      const result = await service.sendEmail(recipientEmail, subject, bodyHTML);

      expect(mockAmazonSESWrapper.sendEmail).toHaveBeenCalledTimes(1);
      expect(mockAmazonSESWrapper.sendEmail).toHaveBeenCalledWith(
        [recipientEmail],
        subject,
        bodyHTML,
      );
      expect(result).toEqual(expectedResponse);
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw an error and pass on information with no loss if the SESWrapper throws', async () => {
      mockAmazonSESWrapper.sendEmail.mockRejectedValueOnce(
        new Error('Error in sending email.'),
      );
      await expect(
        service.sendEmail('recipient@email.com', 'Subject', '<h1>body</h1>'),
      ).rejects.toThrow('Error in sending email.');
    });

    it('should propagate the exact error thrown by wrapper', async () => {
      const customError = new Error('Custom error message');
      customError.name = 'CustomSESError';
      (customError as any).code = 'CUSTOM_CODE';
      mockAmazonSESWrapper.sendEmail.mockRejectedValue(customError);

      await expect(
        service.sendEmail(recipientEmail, subject, bodyHTML),
      ).rejects.toThrow(customError);

      try {
        await service.sendEmail(recipientEmail, subject, bodyHTML);
        fail('Should have thrown an error');
      } catch (thrownError) {
        expect(thrownError).toBeInstanceOf(Error);
        expect((thrownError as Error).name).toBe('CustomSESError');
        expect((thrownError as any).code).toBe('CUSTOM_CODE');
      }
    });

    it('should handle concurrent email sending calls', async () => {
      mockAmazonSESWrapper.sendEmail.mockResolvedValue({ MessageId: 'test' });
      const promises = [
        service.sendEmail('user1@example.com', 'Subject 1', '<p>Body 1</p>'),
        service.sendEmail('user2@example.com', 'Subject 2', '<p>Body 2</p>'),
        service.sendEmail('user3@example.com', 'Subject 3', '<p>Body 3</p>'),
      ];

      await Promise.all(promises);
      expect(mockAmazonSESWrapper.sendEmail).toHaveBeenCalledTimes(3);
      expect(mockAmazonSESWrapper.sendEmail).toHaveBeenNthCalledWith(
        1,
        ['user1@example.com'],
        'Subject 1',
        '<p>Body 1</p>',
      );
      expect(mockAmazonSESWrapper.sendEmail).toHaveBeenNthCalledWith(
        2,
        ['user2@example.com'],
        'Subject 2',
        '<p>Body 2</p>',
      );
      expect(mockAmazonSESWrapper.sendEmail).toHaveBeenNthCalledWith(
        3,
        ['user3@example.com'],
        'Subject 3',
        '<p>Body 3</p>',
      );
    });
  });
});

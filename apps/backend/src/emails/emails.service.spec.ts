import { Test, TestingModule } from '@nestjs/testing';
import { EmailsService } from './emails.service';
import { AMAZON_SES_WRAPPER } from './amazon-ses.wrapper';

import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailTemplate } from './email-template.entity';
import { EmailSubscriber } from './email-subscriber.entity';

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
        {
          provide: getRepositoryToken(EmailTemplate),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(EmailSubscriber),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();
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

  describe('unsubscribe', () => {
    it('should update an existing subscriber to unsubscribed', async () => {
      const mockSubscriber = {
        email: 'test@example.com',
        isSubscribed: true,
        unsubscribedAt: null,
      };
      const mockRepo = service['emailSubscriberRepository'];
      (mockRepo.findOne as jest.Mock).mockResolvedValue(mockSubscriber);
      (mockRepo.save as jest.Mock).mockResolvedValue({
        ...mockSubscriber,
        isSubscribed: false,
      });

      await service.unsubscribe('test@example.com');

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockSubscriber.isSubscribed).toBe(false);
      expect(mockSubscriber.unsubscribedAt).toBeInstanceOf(Date);
      expect(mockRepo.save).toHaveBeenCalledWith(mockSubscriber);
    });

    it('should create a new unsubscribed record if subscriber does not exist', async () => {
      const mockRepo = service['emailSubscriberRepository'];
      (mockRepo.findOne as jest.Mock).mockResolvedValue(null);
      (mockRepo.create as jest.Mock).mockImplementation((dto) => dto);
      (mockRepo.save as jest.Mock).mockImplementation(async (entity) => entity);

      await service.unsubscribe('new@example.com');

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          isSubscribed: false,
        }),
      );
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('filterSubscribedEmails', () => {
    it('should return empty array if empty list provided', async () => {
      const result = await service.filterSubscribedEmails([]);
      expect(result).toEqual([]);
    });

    it('should filter out emails that have isSubscribed === false', async () => {
      const mockRepo = service['emailSubscriberRepository'];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { email: 'sub1@example.com', isSubscribed: true },
          { email: 'unsub@example.com', isSubscribed: false },
        ]),
      };
      (mockRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      const input = [
        'sub1@example.com',
        'unsub@example.com',
        'unknown@example.com',
      ];
      const result = await service.filterSubscribedEmails(input);

      expect(result).toEqual(['sub1@example.com', 'unknown@example.com']);
    });
  });
});

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  StreamableFile,
  Header,
  UseInterceptors,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DonationsService } from './donations.service';
import { DonationsRepository, PaginationFilters } from './donations.repository';
import { CreateDonationDto } from './dtos/create-donation-dto';
import { DonationResponseDto } from './dtos/donation-response-dto';
import { PublicDonationDto } from './dtos/public-donation-dto';
import { DonationMappers } from './mappers';
import {
  DonationType,
  RecurringInterval,
  DonationStatus,
} from './donation.entity';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { Status } from '../users/types';

@ApiTags('Donations')
@Controller('donations')
export class DonationsController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly donationsRepository: DonationsRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'create a new donation',
    description:
      'submit a new donation with donor information and donation details',
  })
  @ApiResponse({
    status: 201,
    description: 'donation successfully created',
    type: DonationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'validation error',
  })
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createDonationDto: CreateDonationDto,
  ): Promise<DonationResponseDto> {
    const request = DonationMappers.toCreateDonationRequest(createDonationDto);
    const donation = await this.donationsService.create(request);
    return DonationMappers.toDonationResponseDto(donation);
  }

  @Get('public')
  @ApiOperation({
    summary: 'get public donations',
    description:
      'retrieve a list of recent donations for public display, respecting privacy settings',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'maximum number of donations to return',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'list of public donations',
    type: [PublicDonationDto],
  })
  async findPublic(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<PublicDonationDto[]> {
    const donations = await this.donationsService.findPublic(limit);
    return DonationMappers.toPublicDonationDtos(donations);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'get donation statistics',
    description:
      'retrieve aggregate donation statistics including total amount and count',
  })
  @ApiResponse({
    status: 200,
    description: 'donation statistics',
    schema: {
      type: 'object',
      properties: {
        total: {
          type: 'number',
          description: 'total donation amount in dollars',
          example: 25000.0,
        },
        count: {
          type: 'number',
          description: 'total number of donations',
          example: 150,
        },
      },
    },
  })
  async getStats(): Promise<{ total: number; count: number }> {
    const stats = await this.donationsService.getTotalDonations();
    return stats;
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'get paginated donation list (admin)',
    description:
      'retrieve a paginated list of all donations with optional filters. Requires authentication.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'page number (one-indexed)',
    example: 1,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'number of items per page',
    example: 20,
  })
  @ApiQuery({
    name: 'donationType',
    required: false,
    enum: DonationType,
    description: 'filter by donation type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: DonationStatus,
    description: 'filter by donation status',
  })
  @ApiQuery({
    name: 'isAnonymous',
    required: false,
    type: Boolean,
    description: 'filter by anonymous status',
  })
  @ApiQuery({
    name: 'recurringInterval',
    required: false,
    enum: RecurringInterval,
    description: 'filter by recurring interval',
  })
  @ApiQuery({
    name: 'minAmount',
    required: false,
    type: Number,
    description: 'minimum donation amount',
  })
  @ApiQuery({
    name: 'maxAmount',
    required: false,
    type: Number,
    description: 'maximum donation amount',
  })
  @ApiResponse({
    status: 200,
    description: 'paginated donation list',
    schema: {
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          items: { $ref: '#/components/schemas/DonationResponseDto' },
        },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        perPage: { type: 'number', example: 20 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'unauthorized',
  })
  @UseInterceptors(CurrentUserInterceptor)
  async findAll(
    @Req() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('perPage', new ParseIntPipe({ optional: true }))
    perPage = 20,
    @Query('donationType') donationType?: DonationType,
    @Query('status') status?: DonationStatus,
    @Query('isAnonymous') isAnonymous?: boolean,
    @Query('recurringInterval') recurringInterval?: RecurringInterval,
    @Query('minAmount', new ParseIntPipe({ optional: true }))
    minAmount?: number,
    @Query('maxAmount', new ParseIntPipe({ optional: true }))
    maxAmount?: number,
  ): Promise<{
    rows: DonationResponseDto[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  }> {
    if (
      req.user.status !== Status.ADMIN &&
      req.user.status !== Status.STANDARD
    ) {
      throw new UnauthorizedException('Admin access required');
    }

    const filters: PaginationFilters = {
      donationType,
      status,
      isAnonymous,
      recurringInterval,
      minAmount,
      maxAmount,
    };

    const result = await this.donationsRepository.findPaginated(
      page,
      perPage,
      filters,
    );

    const domainDonations = result.rows.map((entity) => ({
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      amount: entity.amount,
      isAnonymous: entity.isAnonymous,
      donationType: entity.donationType as 'one_time' | 'recurring',
      recurringInterval: entity.recurringInterval as
        | 'weekly'
        | 'monthly'
        | 'bimonthly'
        | 'quarterly'
        | 'annually'
        | undefined,
      dedicationMessage: entity.dedicationMessage ?? undefined,
      showDedicationPublicly: entity.showDedicationPublicly,
      status: entity.status as 'pending' | 'succeeded' | 'failed' | 'cancelled',
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      transactionId: entity.transactionId ?? undefined,
    }));

    return {
      rows: DonationMappers.toDonationResponseDtos(domainDonations),
      total: result.total,
      page: result.page,
      perPage: result.perPage,
      totalPages: result.totalPages,
    };
  }

  @Get('export')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(CurrentUserInterceptor)
  @ApiBearerAuth()
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="donations.csv"')
  @ApiOperation({
    summary: 'export donations to CSV (admin)',
    description:
      'export all donations to a CSV file with streaming support. Requires authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'CSV file stream',
  })
  @ApiResponse({
    status: 401,
    description: 'unauthorized',
  })
  async exportCsv(@Req() req: any): Promise<StreamableFile> {
    if (
      req.user.status !== Status.ADMIN &&
      req.user.status !== Status.STANDARD
    ) {
      throw new UnauthorizedException(
        'User must have ADMIN or STANDARD status',
      );
    }
    const stream = await this.donationsService.exportToCsv();
    return new StreamableFile(stream);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, IsOptional } from 'class-validator';

export class UpdateGoalDto {
  @ApiProperty({ example: 50000 })
  @IsInt()
  @Min(0)
  targetAmount!: number;

  @ApiProperty({ example: 'Summer Goal' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: '2026-01-01' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2026-06-30' })
  @IsString()
  @IsOptional()
  endDate?: string;
}

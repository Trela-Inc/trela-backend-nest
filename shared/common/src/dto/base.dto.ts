import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

export class BaseDto {
  @IsUUID()
  @Expose()
  id: string;

  @IsDateString()
  @Expose()
  createdAt: string;

  @IsDateString()
  @Expose()
  updatedAt: string;

  @IsOptional()
  @IsString()
  @Expose()
  createdBy?: string;

  @IsOptional()
  @IsString()
  @Expose()
  updatedBy?: string;
}

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class PaginatedResponseDto<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ApiResponseDto<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  correlationId?: string;
}

export class ErrorResponseDto {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  correlationId?: string;
  path?: string;
} 
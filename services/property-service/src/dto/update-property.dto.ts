import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePropertyDto } from './create-property.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { PropertyStatus } from '../enums/property.enum';

export class UpdatePropertyDto extends PartialType(
  OmitType(CreatePropertyDto, ['ownerId'] as const),
) {
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;
} 
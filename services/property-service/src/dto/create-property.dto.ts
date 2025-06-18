import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
  IsUUID,
  Min,
  Max,
  IsUrl,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType, AreaUnit, Currency } from '../enums/property.enum';

export class LocationDto {
  @ApiProperty({ description: 'Property address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'City name' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State or province' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Country name' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'ZIP or postal code' })
  @IsString()
  zipCode: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Neighborhood name' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({ description: 'Nearby landmarks', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  landmarks?: string[];
}

export class PropertyFeaturesDto {
  @ApiProperty({ description: 'Number of bedrooms' })
  @IsNumber()
  @Min(0)
  bedrooms: number;

  @ApiProperty({ description: 'Number of bathrooms' })
  @IsNumber()
  @Min(0)
  bathrooms: number;

  @ApiProperty({ description: 'Property area' })
  @IsNumber()
  @Min(0)
  area: number;

  @ApiProperty({ description: 'Area unit', enum: AreaUnit })
  @IsEnum(AreaUnit)
  areaUnit: AreaUnit;

  @ApiPropertyOptional({ description: 'Number of parking spaces' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  parking?: number;

  @ApiPropertyOptional({ description: 'Is property furnished' })
  @IsOptional()
  @IsBoolean()
  furnished?: boolean;

  @ApiPropertyOptional({ description: 'Property amenities', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ description: 'Year built' })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  yearBuilt?: number;

  @ApiPropertyOptional({ description: 'Floor number' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  floor?: number;

  @ApiPropertyOptional({ description: 'Total floors in building' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalFloors?: number;
}

export class CreatePropertyDto {
  @ApiProperty({ description: 'Property title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Property description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Property type', enum: PropertyType })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({ description: 'Property price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Currency', enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ description: 'Property location' })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ description: 'Property features' })
  @ValidateNested()
  @Type(() => PropertyFeaturesDto)
  features: PropertyFeaturesDto;

  @ApiPropertyOptional({ description: 'Media URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  @ArrayMinSize(1)
  mediaUrls?: string[];

  @ApiPropertyOptional({ description: 'Primary image URL' })
  @IsOptional()
  @IsUrl()
  primaryImageUrl?: string;

  @ApiProperty({ description: 'Owner ID' })
  @IsUUID()
  ownerId: string;

  @ApiPropertyOptional({ description: 'Agent ID' })
  @IsOptional()
  @IsUUID()
  agentId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
} 
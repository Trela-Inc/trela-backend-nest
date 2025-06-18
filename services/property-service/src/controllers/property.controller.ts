import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PropertyService } from '../services/property.service';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { PropertyQueryDto } from '../dto/property-query.dto';
import { PropertyResponseDto } from '../dto/property-response.dto';
import { PropertyStatus } from '../enums/property.enum';

@ApiTags('Properties')
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({ status: 201, description: 'Property created successfully', type: PropertyResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @Request() req: any,
  ): Promise<PropertyResponseDto> {
    const userId = req.user?.id || 'system'; // In real app, get from JWT
    return this.propertyService.create(createPropertyDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Properties retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: PropertyStatus })
  @ApiQuery({ name: 'status', required: false, enum: PropertyStatus })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(@Query() query: PropertyQueryDto) {
    return this.propertyService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a property by ID' })
  @ApiResponse({ status: 200, description: 'Property retrieved successfully', type: PropertyResponseDto })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOne(@Param('id') id: string): Promise<PropertyResponseDto> {
    return this.propertyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a property' })
  @ApiResponse({ status: 200, description: 'Property updated successfully', type: PropertyResponseDto })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Request() req: any,
  ): Promise<PropertyResponseDto> {
    const userId = req.user?.id || 'system';
    return this.propertyService.update(id, updatePropertyDto, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update property status' })
  @ApiResponse({ status: 200, description: 'Property status updated successfully', type: PropertyResponseDto })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: PropertyStatus,
    @Request() req: any,
  ): Promise<PropertyResponseDto> {
    const userId = req.user?.id || 'system';
    return this.propertyService.updateStatus(id, status, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive a property (soft delete)' })
  @ApiResponse({ status: 204, description: 'Property archived successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user?.id || 'system';
    return this.propertyService.remove(id, userId);
  }

  @Get('types/list')
  @ApiOperation({ summary: 'Get all property types' })
  @ApiResponse({ status: 200, description: 'Property types retrieved successfully' })
  async getPropertyTypes() {
    return {
      types: Object.values(PropertyStatus),
      message: 'Property types retrieved successfully',
    };
  }

  @Get('statuses/list')
  @ApiOperation({ summary: 'Get all property statuses' })
  @ApiResponse({ status: 200, description: 'Property statuses retrieved successfully' })
  async getPropertyStatuses() {
    return {
      statuses: Object.values(PropertyStatus),
      message: 'Property statuses retrieved successfully',
    };
  }
} 
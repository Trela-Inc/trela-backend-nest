import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { Property } from '../entities/property.entity';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { PropertyQueryDto } from '../dto/property-query.dto';
import { PropertyResponseDto } from '../dto/property-response.dto';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { PropertyStatus } from '../enums/property.enum';

@Injectable()
export class PropertyService {
  private readonly logger = new Logger(PropertyService.name);

  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, userId: string): Promise<PropertyResponseDto> {
    try {
      this.logger.log(`Creating property for user: ${userId}`);

      // Create property entity
      const property = this.propertyRepository.create({
        ...createPropertyDto,
        address: createPropertyDto.location.address,
        city: createPropertyDto.location.city,
        state: createPropertyDto.location.state,
        country: createPropertyDto.location.country,
        zipCode: createPropertyDto.location.zipCode,
        latitude: createPropertyDto.location.latitude,
        longitude: createPropertyDto.location.longitude,
        neighborhood: createPropertyDto.location.neighborhood,
        landmarks: createPropertyDto.location.landmarks,
        bedrooms: createPropertyDto.features.bedrooms,
        bathrooms: createPropertyDto.features.bathrooms,
        area: createPropertyDto.features.area,
        areaUnit: createPropertyDto.features.areaUnit,
        parking: createPropertyDto.features.parking,
        furnished: createPropertyDto.features.furnished,
        amenities: createPropertyDto.features.amenities,
        yearBuilt: createPropertyDto.features.yearBuilt,
        floor: createPropertyDto.features.floor,
        totalFloors: createPropertyDto.features.totalFloors,
        createdBy: userId,
      });

      const savedProperty = await this.propertyRepository.save(property);

      // Publish Kafka event
      await this.kafkaProducer.publish('real-estate.events.property.created', {
        value: {
          eventType: 'property.created',
          data: {
            id: savedProperty.id,
            title: savedProperty.title,
            type: savedProperty.type,
            status: savedProperty.status,
            ownerId: savedProperty.ownerId,
            agentId: savedProperty.agentId,
            location: {
              city: savedProperty.city,
              state: savedProperty.state,
              country: savedProperty.country,
            },
          },
          timestamp: Date.now(),
        },
      });

      this.logger.log(`Property created successfully: ${savedProperty.id}`);
      return this.mapToResponseDto(savedProperty);
    } catch (error) {
      this.logger.error('Failed to create property:', error);
      throw error;
    }
  }

  async findAll(query: PropertyQueryDto): Promise<{ data: PropertyResponseDto[]; total: number; page: number; limit: number }> {
    try {
      const { page = 1, limit = 10, ...filters } = query;
      const skip = (page - 1) * limit;

      // Build query
      const queryBuilder = this.propertyRepository.createQueryBuilder('property');

      // Apply filters
      if (filters.type) {
        queryBuilder.andWhere('property.type = :type', { type: filters.type });
      }

      if (filters.status) {
        queryBuilder.andWhere('property.status = :status', { status: filters.status });
      }

      if (filters.minPrice !== undefined) {
        queryBuilder.andWhere('property.price >= :minPrice', { minPrice: filters.minPrice });
      }

      if (filters.maxPrice !== undefined) {
        queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice: filters.maxPrice });
      }

      if (filters.currency) {
        queryBuilder.andWhere('property.currency = :currency', { currency: filters.currency });
      }

      if (filters.bedrooms !== undefined) {
        queryBuilder.andWhere('property.bedrooms >= :bedrooms', { bedrooms: filters.bedrooms });
      }

      if (filters.bathrooms !== undefined) {
        queryBuilder.andWhere('property.bathrooms >= :bathrooms', { bathrooms: filters.bathrooms });
      }

      if (filters.minArea !== undefined) {
        queryBuilder.andWhere('property.area >= :minArea', { minArea: filters.minArea });
      }

      if (filters.maxArea !== undefined) {
        queryBuilder.andWhere('property.area <= :maxArea', { maxArea: filters.maxArea });
      }

      if (filters.furnished !== undefined) {
        queryBuilder.andWhere('property.furnished = :furnished', { furnished: filters.furnished });
      }

      if (filters.city) {
        queryBuilder.andWhere('property.city ILIKE :city', { city: `%${filters.city}%` });
      }

      if (filters.state) {
        queryBuilder.andWhere('property.state ILIKE :state', { state: `%${filters.state}%` });
      }

      if (filters.country) {
        queryBuilder.andWhere('property.country ILIKE :country', { country: `%${filters.country}%` });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(property.title ILIKE :search OR property.description ILIKE :search OR property.address ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      if (filters.ownerId) {
        queryBuilder.andWhere('property.ownerId = :ownerId', { ownerId: filters.ownerId });
      }

      if (filters.agentId) {
        queryBuilder.andWhere('property.agentId = :agentId', { agentId: filters.agentId });
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'DESC';
      queryBuilder.orderBy(`property.${sortBy}`, sortOrder);

      // Apply pagination
      queryBuilder.skip(skip).take(limit);

      // Execute query
      const [properties, total] = await queryBuilder.getManyAndCount();

      this.logger.log(`Found ${properties.length} properties out of ${total}`);

      return {
        data: properties.map(property => this.mapToResponseDto(property)),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('Failed to find properties:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<PropertyResponseDto> {
    try {
      const property = await this.propertyRepository.findOne({ where: { id } });

      if (!property) {
        throw new NotFoundException(`Property with ID ${id} not found`);
      }

      return this.mapToResponseDto(property);
    } catch (error) {
      this.logger.error(`Failed to find property ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto, userId: string): Promise<PropertyResponseDto> {
    try {
      const property = await this.propertyRepository.findOne({ where: { id } });

      if (!property) {
        throw new NotFoundException(`Property with ID ${id} not found`);
      }

      // Update property
      const updatedProperty = await this.propertyRepository.save({
        ...property,
        ...updatePropertyDto,
        updatedBy: userId,
      });

      // Publish Kafka event
      await this.kafkaProducer.publish('real-estate.events.property.updated', {
        value: {
          eventType: 'property.updated',
          data: {
            id: updatedProperty.id,
            title: updatedProperty.title,
            type: updatedProperty.type,
            status: updatedProperty.status,
            ownerId: updatedProperty.ownerId,
            agentId: updatedProperty.agentId,
            location: {
              city: updatedProperty.city,
              state: updatedProperty.state,
              country: updatedProperty.country,
            },
          },
          timestamp: Date.now(),
        },
      });

      this.logger.log(`Property updated successfully: ${id}`);
      return this.mapToResponseDto(updatedProperty);
    } catch (error) {
      this.logger.error(`Failed to update property ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const property = await this.propertyRepository.findOne({ where: { id } });

      if (!property) {
        throw new NotFoundException(`Property with ID ${id} not found`);
      }

      // Soft delete by setting status to archived
      await this.propertyRepository.save({
        ...property,
        status: PropertyStatus.ARCHIVED,
        updatedBy: userId,
      });

      // Publish Kafka event
      await this.kafkaProducer.publish('real-estate.events.property.archived', {
        value: {
          eventType: 'property.archived',
          data: {
            id: property.id,
            title: property.title,
            ownerId: property.ownerId,
          },
          timestamp: Date.now(),
        },
      });

      this.logger.log(`Property archived successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to archive property ${id}:`, error);
      throw error;
    }
  }

  async updateStatus(id: string, status: PropertyStatus, userId: string): Promise<PropertyResponseDto> {
    try {
      const property = await this.propertyRepository.findOne({ where: { id } });

      if (!property) {
        throw new NotFoundException(`Property with ID ${id} not found`);
      }

      const updatedProperty = await this.propertyRepository.save({
        ...property,
        status,
        updatedBy: userId,
      });

      // Publish Kafka event
      await this.kafkaProducer.publish('real-estate.events.property.status-changed', {
        value: {
          eventType: 'property.status-changed',
          data: {
            id: updatedProperty.id,
            title: updatedProperty.title,
            oldStatus: property.status,
            newStatus: status,
            ownerId: updatedProperty.ownerId,
          },
          timestamp: Date.now(),
        },
      });

      this.logger.log(`Property status updated to ${status}: ${id}`);
      return this.mapToResponseDto(updatedProperty);
    } catch (error) {
      this.logger.error(`Failed to update property status ${id}:`, error);
      throw error;
    }
  }

  private mapToResponseDto(property: Property): PropertyResponseDto {
    return {
      id: property.id,
      title: property.title,
      description: property.description,
      type: property.type,
      status: property.status,
      price: property.price,
      currency: property.currency,
      fullAddress: property.fullAddress,
      address: property.address,
      city: property.city,
      state: property.state,
      country: property.country,
      zipCode: property.zipCode,
      latitude: property.latitude,
      longitude: property.longitude,
      neighborhood: property.neighborhood,
      landmarks: property.landmarks,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      areaUnit: property.areaUnit,
      parking: property.parking,
      furnished: property.furnished,
      amenities: property.amenities,
      yearBuilt: property.yearBuilt,
      floor: property.floor,
      totalFloors: property.totalFloors,
      mediaUrls: property.mediaUrls,
      primaryImageUrl: property.primaryImageUrl,
      ownerId: property.ownerId,
      agentId: property.agentId,
      metadata: property.metadata,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      createdBy: property.createdBy,
      updatedBy: property.updatedBy,
    } as PropertyResponseDto;
  }
} 
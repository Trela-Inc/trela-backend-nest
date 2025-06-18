import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';

export interface PropertyDocument {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  price: number;
  currency: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  landmarks?: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  parking: number;
  furnished: boolean;
  amenities: string[];
  yearBuilt?: number;
  floor?: number;
  totalFloors?: number;
  mediaUrls: string[];
  primaryImageUrl?: string;
  ownerId: string;
  agentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchQuery {
  query?: string;
  type?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  furnished?: boolean;
  city?: string;
  state?: string;
  country?: string;
  location?: {
    lat: number;
    lon: number;
    distance: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly indexName = 'properties';

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {}

  async createIndex(): Promise<void> {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.indexName,
      });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: this.indexName,
          body: {
            settings: {
              analysis: {
                analyzer: {
                  text_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'stop', 'snowball'],
                  },
                },
              },
            },
            mappings: {
              properties: {
                id: { type: 'keyword' },
                title: { 
                  type: 'text',
                  analyzer: 'text_analyzer',
                  fields: {
                    keyword: { type: 'keyword' },
                  },
                },
                description: { 
                  type: 'text',
                  analyzer: 'text_analyzer',
                },
                type: { type: 'keyword' },
                status: { type: 'keyword' },
                price: { type: 'double' },
                currency: { type: 'keyword' },
                address: { 
                  type: 'text',
                  analyzer: 'text_analyzer',
                },
                city: { 
                  type: 'text',
                  analyzer: 'text_analyzer',
                  fields: {
                    keyword: { type: 'keyword' },
                  },
                },
                state: { 
                  type: 'text',
                  analyzer: 'text_analyzer',
                  fields: {
                    keyword: { type: 'keyword' },
                  },
                },
                country: { 
                  type: 'text',
                  analyzer: 'text_analyzer',
                  fields: {
                    keyword: { type: 'keyword' },
                  },
                },
                zipCode: { type: 'keyword' },
                location: { type: 'geo_point' },
                neighborhood: { type: 'text' },
                landmarks: { type: 'text' },
                bedrooms: { type: 'integer' },
                bathrooms: { type: 'integer' },
                area: { type: 'double' },
                areaUnit: { type: 'keyword' },
                parking: { type: 'integer' },
                furnished: { type: 'boolean' },
                amenities: { type: 'text' },
                yearBuilt: { type: 'integer' },
                floor: { type: 'integer' },
                totalFloors: { type: 'integer' },
                mediaUrls: { type: 'keyword' },
                primaryImageUrl: { type: 'keyword' },
                ownerId: { type: 'keyword' },
                agentId: { type: 'keyword' },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' },
              },
            },
          },
        });

        this.logger.log(`Index ${this.indexName} created successfully`);
      }
    } catch (error) {
      this.logger.error('Failed to create index:', error);
      throw error;
    }
  }

  async indexProperty(property: PropertyDocument): Promise<void> {
    try {
      const document = {
        ...property,
        location: property.latitude && property.longitude 
          ? { lat: property.latitude, lon: property.longitude }
          : undefined,
      };

      await this.elasticsearchService.index({
        index: this.indexName,
        id: property.id,
        body: document,
      });

      this.logger.log(`Property ${property.id} indexed successfully`);
    } catch (error) {
      this.logger.error(`Failed to index property ${property.id}:`, error);
      throw error;
    }
  }

  async updateProperty(property: PropertyDocument): Promise<void> {
    try {
      const document = {
        ...property,
        location: property.latitude && property.longitude 
          ? { lat: property.latitude, lon: property.longitude }
          : undefined,
      };

      await this.elasticsearchService.update({
        index: this.indexName,
        id: property.id,
        body: {
          doc: document,
        },
      });

      this.logger.log(`Property ${property.id} updated successfully`);
    } catch (error) {
      this.logger.error(`Failed to update property ${property.id}:`, error);
      throw error;
    }
  }

  async deleteProperty(propertyId: string): Promise<void> {
    try {
      await this.elasticsearchService.delete({
        index: this.indexName,
        id: propertyId,
      });

      this.logger.log(`Property ${propertyId} deleted successfully`);
    } catch (error) {
      this.logger.error(`Failed to delete property ${propertyId}:`, error);
      throw error;
    }
  }

  async searchProperties(searchQuery: SearchQuery): Promise<{
    hits: PropertyDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { page = 1, limit = 10, ...query } = searchQuery;
      const from = (page - 1) * limit;

      const must: any[] = [];
      const filter: any[] = [];

      // Full-text search
      if (query.query) {
        must.push({
          multi_match: {
            query: query.query,
            fields: ['title^3', 'description^2', 'address', 'city', 'state', 'country'],
            type: 'best_fields',
            fuzziness: 'AUTO',
          },
        });
      }

      // Filters
      if (query.type) {
        filter.push({ term: { type: query.type } });
      }

      if (query.status) {
        filter.push({ term: { status: query.status } });
      }

      if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        const range: any = { price: {} };
        if (query.minPrice !== undefined) range.price.gte = query.minPrice;
        if (query.maxPrice !== undefined) range.price.lte = query.maxPrice;
        filter.push({ range });
      }

      if (query.currency) {
        filter.push({ term: { currency: query.currency } });
      }

      if (query.bedrooms !== undefined) {
        filter.push({ range: { bedrooms: { gte: query.bedrooms } } });
      }

      if (query.bathrooms !== undefined) {
        filter.push({ range: { bathrooms: { gte: query.bathrooms } } });
      }

      if (query.minArea !== undefined || query.maxArea !== undefined) {
        const range: any = { area: {} };
        if (query.minArea !== undefined) range.area.gte = query.minArea;
        if (query.maxArea !== undefined) range.area.lte = query.maxArea;
        filter.push({ range });
      }

      if (query.furnished !== undefined) {
        filter.push({ term: { furnished: query.furnished } });
      }

      if (query.city) {
        filter.push({ match: { 'city.keyword': query.city } });
      }

      if (query.state) {
        filter.push({ match: { 'state.keyword': query.state } });
      }

      if (query.country) {
        filter.push({ match: { 'country.keyword': query.country } });
      }

      // Geo search
      if (query.location) {
        filter.push({
          geo_distance: {
            distance: query.location.distance,
            location: {
              lat: query.location.lat,
              lon: query.location.lon,
            },
          },
        });
      }

      const searchBody: any = {
        query: {
          bool: {
            must,
            filter,
          },
        },
        from,
        size: limit,
      };

      // Sorting
      if (query.sortBy) {
        const sortOrder = query.sortOrder || 'desc';
        searchBody.sort = [{ [query.sortBy]: { order: sortOrder } }];
      } else {
        searchBody.sort = [{ createdAt: { order: 'desc' } }];
      }

      const response = await this.elasticsearchService.search({
        index: this.indexName,
        body: searchBody,
      });

      const hits = response.hits.hits.map((hit: any) => ({
        ...hit._source,
        score: hit._score,
      }));

      return {
        hits,
        total: response.hits.total.value,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('Search failed:', error);
      throw error;
    }
  }

  async getSuggestions(query: string): Promise<string[]> {
    try {
      const response = await this.elasticsearchService.search({
        index: this.indexName,
        body: {
          suggest: {
            suggestions: {
              prefix: query,
              completion: {
                field: 'title_suggest',
                size: 5,
              },
            },
          },
        },
      });

      return response.suggest.suggestions[0].options.map((option: any) => option.text);
    } catch (error) {
      this.logger.error('Suggestion search failed:', error);
      return [];
    }
  }

  async getStats(): Promise<any> {
    try {
      const response = await this.elasticsearchService.search({
        index: this.indexName,
        body: {
          size: 0,
          aggs: {
            total_properties: { value_count: { field: 'id' } },
            by_type: { terms: { field: 'type' } },
            by_status: { terms: { field: 'status' } },
            price_stats: { stats: { field: 'price' } },
            area_stats: { stats: { field: 'area' } },
            by_city: { terms: { field: 'city.keyword', size: 10 } },
          },
        },
      });

      return response.aggregations;
    } catch (error) {
      this.logger.error('Stats aggregation failed:', error);
      throw error;
    }
  }
} 
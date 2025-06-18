export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  currency: string;
  location: Location;
  features: PropertyFeatures;
  media: PropertyMedia[];
  ownerId: string;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  VILLA = 'villa',
  PLOT = 'plot',
  COMMERCIAL = 'commercial',
  OFFICE = 'office',
  SHOP = 'shop',
  WAREHOUSE = 'warehouse'
}

export enum PropertyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SOLD = 'sold',
  RENTED = 'rented',
  INACTIVE = 'inactive',
  PENDING_APPROVAL = 'pending_approval'
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  neighborhood?: string;
  landmarks?: string[];
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: 'sqft' | 'sqm' | 'acres';
  parking: number;
  furnished: boolean;
  amenities: string[];
  yearBuilt?: number;
  floor?: number;
  totalFloors?: number;
}

export interface PropertyMedia {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
}

export interface CreatePropertyDto {
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  currency: string;
  location: Location;
  features: PropertyFeatures;
  ownerId: string;
  agentId?: string;
}

export interface UpdatePropertyDto {
  title?: string;
  description?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  price?: number;
  currency?: string;
  location?: Partial<Location>;
  features?: Partial<PropertyFeatures>;
  agentId?: string;
}

export interface PropertySearchFilters {
  type?: PropertyType[];
  status?: PropertyStatus[];
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
  amenities?: string[];
  yearBuilt?: {
    min?: number;
    max?: number;
  };
}

export interface PropertySearchResult {
  properties: Property[];
  total: number;
  filters: PropertySearchFilters;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
} 
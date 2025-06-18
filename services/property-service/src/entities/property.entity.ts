import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PropertyType, PropertyStatus } from '../enums/property.enum';

@Entity('properties')
@Index(['status', 'createdAt'])
@Index(['city', 'state'])
@Index(['latitude', 'longitude'])
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: PropertyType,
    default: PropertyType.APARTMENT,
  })
  type: PropertyType;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.PENDING_APPROVAL,
  })
  status: PropertyStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // Location data
  @Column({ type: 'varchar', length: 500 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'varchar', length: 20 })
  zipCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  neighborhood: string;

  @Column({ type: 'text', array: true, default: [] })
  landmarks: string[];

  // Property features
  @Column({ type: 'int', default: 0 })
  bedrooms: number;

  @Column({ type: 'int', default: 0 })
  bathrooms: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area: number;

  @Column({ type: 'varchar', length: 10, default: 'sqft' })
  areaUnit: string;

  @Column({ type: 'int', default: 0 })
  parking: number;

  @Column({ type: 'boolean', default: false })
  furnished: boolean;

  @Column({ type: 'text', array: true, default: [] })
  amenities: string[];

  @Column({ type: 'int', nullable: true })
  yearBuilt: number;

  @Column({ type: 'int', nullable: true })
  floor: number;

  @Column({ type: 'int', nullable: true })
  totalFloors: number;

  // Media URLs
  @Column({ type: 'text', array: true, default: [] })
  mediaUrls: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  primaryImageUrl: string;

  // Ownership and relationships
  @Column({ type: 'uuid' })
  ownerId: string;

  @Column({ type: 'uuid', nullable: true })
  agentId: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  // Virtual properties for computed values
  get fullAddress(): string {
    return `${this.address}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
  }

  get isActive(): boolean {
    return this.status === PropertyStatus.ACTIVE;
  }

  get isApproved(): boolean {
    return this.status === PropertyStatus.ACTIVE || this.status === PropertyStatus.SOLD;
  }
} 
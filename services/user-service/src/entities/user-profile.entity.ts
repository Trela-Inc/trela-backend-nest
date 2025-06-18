import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole } from '../enums/user.enum';

@Entity('user_profiles')
@Index(['userId'])
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  // Personal Information
  @Column({ type: 'varchar', length: 500, nullable: true })
  bio: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  profilePicture: string;

  // Contact Information
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  alternatePhone: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website: string;

  // Address Information
  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  // Professional Information (for Agents)
  @Column({ type: 'varchar', length: 100, nullable: true })
  licenseNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  agencyName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  agencyAddress: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  agencyPhone: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  agencyWebsite: string;

  @Column({ type: 'text', array: true, default: [] })
  specializations: string[];

  @Column({ type: 'int', default: 0 })
  yearsOfExperience: number;

  @Column({ type: 'text', array: true, default: [] })
  certifications: string[];

  @Column({ type: 'text', array: true, default: [] })
  languages: string[];

  // Social Media
  @Column({ type: 'varchar', length: 500, nullable: true })
  linkedinUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  facebookUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  twitterUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  instagramUrl: string;

  // Preferences
  @Column({ type: 'jsonb', default: {} })
  preferences: {
    language: string;
    timezone: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      marketing: boolean;
    };
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
      showAddress: boolean;
    };
  };

  // Statistics
  @Column({ type: 'int', default: 0 })
  propertiesListed: number;

  @Column({ type: 'int', default: 0 })
  propertiesSold: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSalesVolume: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get fullAddress(): string {
    if (!this.address) return '';
    return `${this.address}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
  }

  get isAgent(): boolean {
    return this.licenseNumber && this.agencyName;
  }

  get hasCompleteProfile(): boolean {
    return !!(this.bio && this.phone && this.address && this.city);
  }
} 
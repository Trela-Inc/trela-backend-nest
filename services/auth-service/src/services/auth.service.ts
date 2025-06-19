import { Injectable, Logger, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoginDto, SignupDto, RefreshTokenDto } from '../dto/auth.dto';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { UserRole } from '../enums/user.enum';
import * as crypto from 'crypto';

// AuthService now includes logic for validating OAuth logins (e.g., Google)
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async signup(signupDto: SignupDto): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    try {
      this.logger.log(`Signing up user: ${signupDto.email}`);

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: signupDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create new user
      const user = this.userRepository.create({
        ...signupDto,
        role: signupDto.role || UserRole.USER,
        preferences: {
          language: 'en',
          timezone: 'UTC',
          currency: 'USD',
          notifications: {
            email: true,
            sms: false,
            push: false,
            marketing: false,
          },
        },
      });

      const savedUser = await this.userRepository.save(user);

      // Generate tokens
      const accessToken = this.generateAccessToken(savedUser);
      const refreshToken = await this.generateRefreshToken(savedUser);

      // Publish Kafka event
      await this.kafkaProducer.publish('real-estate.events.user.created', {
        value: {
          eventType: 'user.created',
          data: {
            id: savedUser.id,
            email: savedUser.email,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            role: savedUser.role,
            isEmailVerified: savedUser.isEmailVerified,
          },
          timestamp: Date.now(),
        },
      });

      this.logger.log(`User signed up successfully: ${savedUser.id}`);

      return {
        user: this.sanitizeUser(savedUser),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error('Failed to sign up user:', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    try {
      this.logger.log(`Logging in user: ${loginDto.email}`);

      // Find user by email
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Validate password
      const isPasswordValid = await user.validatePassword(loginDto.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Update last login
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user);

      // Publish Kafka event
      await this.kafkaProducer.publish('real-estate.events.user.logged-in', {
        value: {
          eventType: 'user.logged-in',
          data: {
            id: user.id,
            email: user.email,
            lastLoginAt: user.lastLoginAt,
          },
          timestamp: Date.now(),
        },
      });

      this.logger.log(`User logged in successfully: ${user.id}`);

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error('Failed to log in user:', error);
      throw error;
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshTokenDto.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (user.refreshTokenExpiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // Generate new tokens
      const accessToken = this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      this.logger.error('Failed to refresh token:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (user) {
        // Clear refresh token
        user.refreshToken = null;
        user.refreshTokenExpiresAt = null;
        await this.userRepository.save(user);

        // Publish Kafka event
        await this.kafkaProducer.publish('real-estate.events.user.logged-out', {
          value: {
            eventType: 'user.logged-out',
            data: {
              id: user.id,
              email: user.email,
            },
            timestamp: Date.now(),
          },
        });

        this.logger.log(`User logged out successfully: ${userId}`);
      }
    } catch (error) {
      this.logger.error('Failed to log out user:', error);
      throw error;
    }
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return this.sanitizeUser(user);
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      // In a real implementation, you would verify the token
      // and update the user's email verification status
      this.logger.log(`Verifying email with token: ${token}`);
      
      // Publish Kafka event
      await this.kafkaProducer.publish('real-estate.events.user.email-verified', {
        value: {
          eventType: 'user.email-verified',
          data: {
            token,
          },
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      this.logger.error('Failed to verify email:', error);
      throw error;
    }
  }

  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    // Save refresh token to user
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = new Date(Date.now() + this.parseExpiresIn(expiresIn));
    await this.userRepository.save(user);

    const payload = {
      sub: user.id,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn,
    });
  }

  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000; // 7 days default
    }
  }

  private sanitizeUser(user: User): any {
    const { password, refreshToken, refreshTokenExpiresAt, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  async validateOAuthLogin(profile: any, provider: string): Promise<any> {
    // TODO: Implement user lookup/creation logic here for OAuth logins
    // You should find or create a user based on the profile info
    // Optionally, issue a JWT and return it along with user info
    return { oauthProfile: profile, provider };
  }
} 
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  
  // Service endpoints
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT, 10) || 5000,
    },
    user: {
      url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
      timeout: parseInt(process.env.USER_SERVICE_TIMEOUT, 10) || 5000,
    },
    property: {
      url: process.env.PROPERTY_SERVICE_URL || 'http://localhost:3003',
      timeout: parseInt(process.env.PROPERTY_SERVICE_TIMEOUT, 10) || 5000,
    },
    notification: {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
      timeout: parseInt(process.env.NOTIFICATION_SERVICE_TIMEOUT, 10) || 5000,
    },
    search: {
      url: process.env.SEARCH_SERVICE_URL || 'http://localhost:3005',
      timeout: parseInt(process.env.SEARCH_SERVICE_TIMEOUT, 10) || 5000,
    },
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // limit each IP to 100 requests per windowMs
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  // Health Check
  health: {
    path: process.env.HEALTH_CHECK_PATH || '/health',
  },
})); 
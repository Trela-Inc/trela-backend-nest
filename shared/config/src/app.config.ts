import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  cors: {
    origin: string[];
    credentials: boolean;
  };
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
}

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId: string;
  retry: {
    initialRetryTime: number;
    retries: number;
  };
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface JaegerConfig {
  agentHost: string;
  agentPort: number;
  serviceName: string;
}

export const appConfig = registerAs('app', (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
}));

export const databaseConfig = registerAs('database', (): DatabaseConfig => ({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'app_db',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
}));

export const kafkaConfig = registerAs('kafka', (): KafkaConfig => ({
  brokers: process.env.KAFKA_BROKER?.split(',') || ['localhost:9092'],
  clientId: process.env.KAFKA_CLIENT_ID || 'app-service',
  groupId: process.env.KAFKA_GROUP_ID || 'app-service-group',
  retry: {
    initialRetryTime: parseInt(process.env.KAFKA_RETRY_INITIAL_TIME || '1000', 10),
    retries: parseInt(process.env.KAFKA_RETRY_COUNT || '3', 10),
  },
}));

export const redisConfig = registerAs('redis', (): RedisConfig => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
}));

export const jaegerConfig = registerAs('jaeger', (): JaegerConfig => ({
  agentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
  agentPort: parseInt(process.env.JAEGER_AGENT_PORT || '6831', 10),
  serviceName: process.env.JAEGER_SERVICE_NAME || 'app-service',
}));

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: Joi.boolean().default(false),
  
  // Database
  POSTGRES_HOST: Joi.string().default('localhost'),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  
  // Kafka
  KAFKA_BROKER: Joi.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: Joi.string().required(),
  KAFKA_GROUP_ID: Joi.string().required(),
  KAFKA_RETRY_INITIAL_TIME: Joi.number().default(1000),
  KAFKA_RETRY_COUNT: Joi.number().default(3),
  
  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),
  REDIS_DB: Joi.number().default(0),
  
  // Jaeger
  JAEGER_AGENT_HOST: Joi.string().default('localhost'),
  JAEGER_AGENT_PORT: Joi.number().default(6831),
  JAEGER_SERVICE_NAME: Joi.string().required(),
}); 
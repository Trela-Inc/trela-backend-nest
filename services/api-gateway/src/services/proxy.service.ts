import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly httpClients: Map<string, AxiosInstance> = new Map();

  constructor(private configService: ConfigService) {
    this.initializeHttpClients();
  }

  private initializeHttpClients() {
    const services = this.configService.get('app.services');
    
    Object.entries(services).forEach(([serviceName, config]: [string, any]) => {
      const client = axios.create({
        baseURL: config.url,
        timeout: config.timeout,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Add request interceptor for logging
      client.interceptors.request.use(
        (config) => {
          this.logger.log(`Proxying request to ${serviceName}: ${config.method?.toUpperCase()} ${config.url}`);
          return config;
        },
        (error) => {
          this.logger.error(`Request error to ${serviceName}:`, error);
          return Promise.reject(error);
        }
      );

      // Add response interceptor for error handling
      client.interceptors.response.use(
        (response) => {
          this.logger.log(`Response from ${serviceName}: ${response.status}`);
          return response;
        },
        (error) => {
          this.logger.error(`Response error from ${serviceName}:`, error.response?.data || error.message);
          return Promise.reject(error);
        }
      );

      this.httpClients.set(serviceName, client);
    });
  }

  async proxyRequest(
    serviceName: string,
    method: string,
    path: string,
    data?: any,
    headers?: Record<string, string>,
  ): Promise<any> {
    const client = this.httpClients.get(serviceName);
    
    if (!client) {
      throw new HttpException(`Service ${serviceName} not found`, HttpStatus.BAD_GATEWAY);
    }

    try {
      const config = {
        method: method.toLowerCase(),
        url: path,
        data,
        headers: {
          ...headers,
          'X-Forwarded-For': headers?.['x-forwarded-for'] || 'api-gateway',
          'X-Request-ID': headers?.['x-request-id'] || this.generateRequestId(),
        },
      };

      const response: AxiosResponse = await client.request(config);
      return response.data;
    } catch (error) {
      this.handleProxyError(error, serviceName);
    }
  }

  async proxyGet(serviceName: string, path: string, headers?: Record<string, string>): Promise<any> {
    return this.proxyRequest(serviceName, 'GET', path, undefined, headers);
  }

  async proxyPost(serviceName: string, path: string, data?: any, headers?: Record<string, string>): Promise<any> {
    return this.proxyRequest(serviceName, 'POST', path, data, headers);
  }

  async proxyPut(serviceName: string, path: string, data?: any, headers?: Record<string, string>): Promise<any> {
    return this.proxyRequest(serviceName, 'PUT', path, data, headers);
  }

  async proxyPatch(serviceName: string, path: string, data?: any, headers?: Record<string, string>): Promise<any> {
    return this.proxyRequest(serviceName, 'PATCH', path, data, headers);
  }

  async proxyDelete(serviceName: string, path: string, headers?: Record<string, string>): Promise<any> {
    return this.proxyRequest(serviceName, 'DELETE', path, undefined, headers);
  }

  private handleProxyError(error: any, serviceName: string) {
    if (error.response) {
      // Service responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      this.logger.error(`Service ${serviceName} error: ${status} - ${message}`);
      
      throw new HttpException(
        {
          message: `Service ${serviceName} error: ${message}`,
          service: serviceName,
          statusCode: status,
        },
        status,
      );
    } else if (error.request) {
      // Service is unreachable
      this.logger.error(`Service ${serviceName} unreachable: ${error.message}`);
      
      throw new HttpException(
        {
          message: `Service ${serviceName} is currently unavailable`,
          service: serviceName,
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      // Other error
      this.logger.error(`Proxy error for ${serviceName}: ${error.message}`);
      
      throw new HttpException(
        {
          message: 'Internal proxy error',
          service: serviceName,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getServiceHealth(serviceName: string): Promise<boolean> {
    return this.proxyGet(serviceName, '/health')
      .then(() => true)
      .catch(() => false);
  }

  async getAllServicesHealth(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};
    const services = Array.from(this.httpClients.keys());

    await Promise.allSettled(
      services.map(async (serviceName) => {
        healthStatus[serviceName] = await this.getServiceHealth(serviceName);
      })
    );

    return healthStatus;
  }
} 
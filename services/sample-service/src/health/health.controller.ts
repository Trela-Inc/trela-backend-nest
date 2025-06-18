import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Basic health check
      () => Promise.resolve({ status: 'up' }),
      
      // Example: Check if the service can make HTTP requests
      // () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
      
      // Example: Check database connection
      // () => this.db.pingCheck('database'),
      
      // Example: Check Kafka connection
      // () => this.kafka.pingCheck('kafka'),
    ]);
  }

  @Get('readiness')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => Promise.resolve({ status: 'ready' }),
    ]);
  }

  @Get('liveness')
  @HealthCheck()
  liveness() {
    return this.health.check([
      () => Promise.resolve({ status: 'alive' }),
    ]);
  }
} 
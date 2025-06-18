import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { LoggerModule } from './logger/logger.module';
import { KafkaModule } from './kafka/kafka.module';
import { validationSchema } from '@real-estate/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      envFilePath: ['.env.local', '.env'],
    }),
    TerminusModule,
    LoggerModule,
    KafkaModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {} 
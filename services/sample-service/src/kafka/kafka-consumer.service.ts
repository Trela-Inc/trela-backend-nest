import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';

@Injectable()
export class KafkaConsumerService {
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  @MessagePattern('real-estate.events.*')
  async handleMessage(@Payload() message: any) {
    try {
      this.logger.log(`Received message: ${JSON.stringify(message)}`);
      
      // Handle different event types
      const topic = message.topic || 'unknown';
      
      switch (topic) {
        case 'real-estate.events.user.created':
          await this.handleUserCreated(message);
          break;
        case 'real-estate.events.property.listed':
          await this.handlePropertyListed(message);
          break;
        case 'real-estate.events.sample.created':
          await this.handleSampleCreated(message);
          break;
        default:
          this.logger.warn(`Unknown topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error('Error handling message:', error);
      throw error;
    }
  }

  private async handleUserCreated(message: any): Promise<void> {
    this.logger.log('Handling user.created event:', message);
    // Implement user created logic
  }

  private async handlePropertyListed(message: any): Promise<void> {
    this.logger.log('Handling property.listed event:', message);
    // Implement property listed logic
  }

  private async handleSampleCreated(message: any): Promise<void> {
    this.logger.log('Handling sample.created event:', message);
    // Implement sample created logic
  }

  async onModuleInit() {
    await this.kafkaClient.connect();
    this.logger.log('Kafka consumer connected');
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
    this.logger.log('Kafka consumer disconnected');
  }
} 
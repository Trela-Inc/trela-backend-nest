import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

export interface KafkaMessage {
  key?: string;
  value: any;
  headers?: Record<string, string>;
  timestamp?: number;
}

@Injectable()
export class KafkaProducerService {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async publish(topic: string, message: KafkaMessage): Promise<void> {
    try {
      await this.kafkaClient.emit(topic, {
        key: message.key,
        value: message.value,
        headers: message.headers,
        timestamp: message.timestamp || Date.now(),
      });
      
      this.logger.log(`Message published to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish message to topic ${topic}:`, error);
      throw error;
    }
  }

  async publishBatch(topic: string, messages: KafkaMessage[]): Promise<void> {
    try {
      const promises = messages.map(message =>
        this.publish(topic, message)
      );
      
      await Promise.all(promises);
      this.logger.log(`Batch of ${messages.length} messages published to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish batch to topic ${topic}:`, error);
      throw error;
    }
  }

  async onModuleInit() {
    await this.kafkaClient.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
    this.logger.log('Kafka producer disconnected');
  }
} 
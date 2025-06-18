import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { KafkaProducerService } from './kafka/kafka-producer.service';

describe('AppService', () => {
  let service: AppService;
  let kafkaProducer: KafkaProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: KafkaProducerService,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    kafkaProducer = module.get<KafkaProducerService>(KafkaProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return hello message', () => {
    expect(service.getHello()).toBe('Hello from Sample Service!');
  });

  describe('createSampleData', () => {
    it('should create sample data and publish event', async () => {
      const mockData = { name: 'Test Data', value: 123 };
      const mockPublish = jest.spyOn(kafkaProducer, 'publish').mockResolvedValue();

      const result = await service.createSampleData(mockData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(mockData.name);
      expect(result.value).toBe(mockData.value);
      expect(result.createdAt).toBeDefined();
      expect(mockPublish).toHaveBeenCalledWith('real-estate.events.sample.created', {
        value: {
          eventType: 'sample.created',
          data: result,
          timestamp: expect.any(Number),
        },
      });
    });

    it('should handle errors when creating sample data', async () => {
      const mockData = { name: 'Test Data' };
      jest.spyOn(kafkaProducer, 'publish').mockRejectedValue(new Error('Kafka error'));

      await expect(service.createSampleData(mockData)).rejects.toThrow('Kafka error');
    });
  });

  describe('updateSampleData', () => {
    it('should update sample data and publish event', async () => {
      const id = 'test-id';
      const mockData = { name: 'Updated Data', value: 456 };
      const mockPublish = jest.spyOn(kafkaProducer, 'publish').mockResolvedValue();

      const result = await service.updateSampleData(id, mockData);

      expect(result.id).toBe(id);
      expect(result.name).toBe(mockData.name);
      expect(result.value).toBe(mockData.value);
      expect(result.updatedAt).toBeDefined();
      expect(mockPublish).toHaveBeenCalledWith('real-estate.events.sample.updated', {
        value: {
          eventType: 'sample.updated',
          data: result,
          timestamp: expect.any(Number),
        },
      });
    });

    it('should handle errors when updating sample data', async () => {
      const id = 'test-id';
      const mockData = { name: 'Updated Data' };
      jest.spyOn(kafkaProducer, 'publish').mockRejectedValue(new Error('Kafka error'));

      await expect(service.updateSampleData(id, mockData)).rejects.toThrow('Kafka error');
    });
  });
}); 
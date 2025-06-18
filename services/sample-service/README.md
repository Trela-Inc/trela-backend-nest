# Sample Service

A base NestJS microservice boilerplate with Kafka support, health checks, logging, and comprehensive testing setup.

## Features

- **NestJS Framework**: Modern Node.js framework with TypeScript
- **Kafka Integration**: Event-driven architecture with Apache Kafka
- **Configuration Management**: Environment-based configuration with validation
- **Health Checks**: Built-in health monitoring endpoints
- **Structured Logging**: Winston-based logging with multiple transports
- **API Documentation**: Swagger/OpenAPI documentation
- **Testing**: Unit and e2e tests with Jest
- **Docker Support**: Containerized deployment
- **Security**: Helmet, CORS, rate limiting

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Apache Kafka (local or remote)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update environment variables
# Edit .env file with your configuration
```

### Development

```bash
# Start in development mode
npm run start:dev

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

### Production

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

### Docker

```bash
# Build Docker image
docker build -t sample-service .

# Run container
docker run -p 3000:3000 sample-service
```

## API Endpoints

### Health Checks
- `GET /health` - Basic health check
- `GET /health/readiness` - Readiness probe
- `GET /health/liveness` - Liveness probe

### Sample Endpoints
- `GET /` - Hello message
- `GET /info` - Service information
- `POST /events/:topic` - Publish event to Kafka topic

### Documentation
- `GET /api/docs` - Swagger documentation

## Configuration

The service uses environment variables for configuration:

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=sample_db

# Kafka
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=sample-service
KAFKA_GROUP_ID=sample-service-group

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Jaeger
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6831
JAEGER_SERVICE_NAME=sample-service
```

## Kafka Events

The service publishes and consumes Kafka events:

### Published Events
- `real-estate.events.sample.created` - When sample data is created
- `real-estate.events.sample.updated` - When sample data is updated

### Consumed Events
- `real-estate.events.user.created` - User creation events
- `real-estate.events.property.listed` - Property listing events
- `real-estate.events.sample.created` - Sample creation events

## Project Structure

```
src/
├── app.controller.ts          # Main controller
├── app.service.ts            # Main service
├── app.module.ts             # Root module
├── main.ts                   # Application bootstrap
├── health/                   # Health check endpoints
├── kafka/                    # Kafka producer/consumer
├── logger/                   # Logging configuration
└── test/                     # Test files
```

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## Monitoring

### Health Checks
The service provides health check endpoints for monitoring:

- `/health` - Overall health status
- `/health/readiness` - Service readiness
- `/health/liveness` - Service liveness

### Logging
Structured logging with Winston:
- Console output with colors
- File logging for errors and combined logs
- JSON format for production

### Metrics
Prometheus metrics are available at `/metrics` (when configured)

## Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  sample-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - KAFKA_BROKER=kafka:9092
    depends_on:
      - kafka
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sample-service
  template:
    metadata:
      labels:
        app: sample-service
    spec:
      containers:
      - name: sample-service
        image: sample-service:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health/liveness
            port: 3000
        readinessProbe:
          httpGet:
            path: /health/readiness
            port: 3000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## License

MIT License 
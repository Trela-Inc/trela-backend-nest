# Real Estate Platform - Microservices Backend

A production-ready microservices backend architecture for a real estate platform built with NestJS, TypeScript, Kafka, PostgreSQL, Redis, Docker, and Kubernetes.

## 🏗️ Architecture Overview

This project implements a domain-driven microservices architecture with the following components:

### Core Services
- **API Gateway** - Unified entry point (BFF pattern)
- **Auth Service** - JWT-based authentication & authorization
- **User Service** - User profile management
- **Property Service** - Property listings & management
- **Notification Service** - Email/SMS notifications (Kafka-driven)
- **Search Service** - Elasticsearch-powered property search

### Infrastructure
- **Kafka** - Event-driven communication
- **PostgreSQL** - Primary database (one per service)
- **Redis** - Caching & session management
- **Elasticsearch** - Full-text search
- **Prometheus** - Metrics collection
- **Grafana** - Monitoring dashboards
- **Jaeger** - Distributed tracing

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nest-backend-micro
```

### 2. Environment Setup
```bash
# Copy environment files
cp .env.example .env
cp docker-compose.override.yml.example docker-compose.override.yml

# Edit environment variables
nano .env
```

### 3. Start Infrastructure
```bash
# Start all infrastructure services
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 4. Install Dependencies
```bash
# Install shared packages
cd shared/config && npm install
cd ../kafka && npm install

# Install service dependencies
cd ../../services
for service in */; do
  cd "$service" && npm install && cd ..
done
```

### 5. Database Setup
```bash
# Run migrations for each service
cd services/property-service && npm run migration:run
cd ../auth-service && npm run migration:run
cd ../user-service && npm run migration:run
cd ../notification-service && npm run migration:run
```

### 6. Start Services
```bash
# Start all services in development mode
cd services
for service in */; do
  cd "$service" && npm run start:dev &
  cd ..
done
```

## 📁 Project Structure

```
nest-backend-micro/
├── shared/                    # Shared libraries
│   ├── config/               # Configuration management
│   └── kafka/                # Kafka producer/consumer
├── services/                 # Microservices
│   ├── api-gateway/          # API Gateway (BFF)
│   ├── auth-service/         # Authentication service
│   ├── user-service/         # User profile service
│   ├── property-service/     # Property listings
│   ├── notification-service/ # Notifications (Kafka-driven)
│   └── search-service/       # Search with Elasticsearch
├── infrastructure/           # Infrastructure configs
│   ├── docker-compose.yml    # Main compose file
│   ├── prometheus/           # Prometheus config
│   └── grafana/              # Grafana dashboards
├── k8s/                      # Kubernetes manifests
└── docs/                     # Documentation
```

## 🔧 Service Details

### API Gateway (Port 3000)
- **Purpose**: Unified entry point, request routing, authentication
- **Features**: Rate limiting, request logging, error handling
- **Endpoints**: `/api/v1/*`

### Auth Service (Port 3001)
- **Purpose**: JWT-based authentication
- **Features**: Login/signup, token refresh, OAuth support
- **Endpoints**: `/auth/*`

### User Service (Port 3002)
- **Purpose**: User profile management
- **Features**: Profile CRUD, agent/buyer roles
- **Endpoints**: `/users/*`

### Property Service (Port 3003)
- **Purpose**: Property listings management
- **Features**: CRUD operations, filtering, status management
- **Endpoints**: `/properties/*`

### Notification Service (Port 3004)
- **Purpose**: Email/SMS notifications
- **Features**: Kafka event-driven, templates, retry mechanism
- **Endpoints**: `/notifications/*`

### Search Service (Port 3005)
- **Purpose**: Property search with Elasticsearch
- **Features**: Full-text search, filtering, geo-search
- **Endpoints**: `/search/*`

## 🔄 Event-Driven Communication

### Kafka Topics
- `real-estate.events.user.*` - User events
- `real-estate.events.property.*` - Property events
- `real-estate.events.notification.*` - Notification events

### Event Types
- `user.created` - New user registration
- `user.updated` - Profile updates
- `property.created` - New property listing
- `property.updated` - Property updates
- `property.status-changed` - Status changes

## 📊 Monitoring & Observability

### Prometheus Metrics
- HTTP request metrics
- Database connection metrics
- Kafka consumer/producer metrics
- Custom business metrics

### Grafana Dashboards
- Service health overview
- Database performance
- Kafka traffic monitoring
- Error rate tracking

### Jaeger Tracing
- Distributed request tracing
- Service dependency mapping
- Performance analysis

## 🐳 Docker & Kubernetes

### Docker Compose
```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes
```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n real-estate
```

## 🧪 Testing

### Unit Tests
```bash
# Run unit tests for all services
cd services
for service in */; do
  cd "$service" && npm test && cd ..
done
```

### E2E Tests
```bash
# Run E2E tests
cd services/property-service && npm run test:e2e
```

### Load Testing
```bash
# Using Artillery
npm install -g artillery
artillery run load-tests/property-api.yml
```

## 🔒 Security

### Authentication
- JWT tokens with refresh mechanism
- Role-based access control (RBAC)
- OAuth 2.0 integration (Google, Facebook)

### Data Protection
- Password hashing with bcrypt
- Input validation with class-validator
- SQL injection prevention with TypeORM
- XSS protection with helmet

### API Security
- Rate limiting
- CORS configuration
- Request validation
- Error handling without sensitive data exposure

## 📈 Performance

### Caching Strategy
- Redis for session storage
- Database query caching
- API response caching

### Database Optimization
- Connection pooling
- Query optimization
- Indexing strategy
- Read replicas for scaling

### Load Balancing
- Round-robin load balancing
- Health checks
- Circuit breaker pattern

## 🚀 Deployment

### Development
```bash
# Start development environment
docker-compose up -d
npm run dev:all
```

### Staging
```bash
# Deploy to staging
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

### Production
```bash
# Deploy to production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📚 API Documentation

### Swagger UI
- Auth Service: http://localhost:3001/api/docs
- User Service: http://localhost:3002/api/docs
- Property Service: http://localhost:3003/api/docs
- Search Service: http://localhost:3005/api/docs

### Postman Collection
Import the `postman/real-estate-api.json` collection for API testing.

## 🔧 Configuration

### Environment Variables
Key environment variables for each service:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Kafka
KAFKA_BROKERS=localhost:9092

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Add JSDoc comments for public APIs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs <service-name>

# Check dependencies
npm install

# Check environment variables
echo $DATABASE_URL
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose ps postgres

# Check connection
docker-compose exec postgres psql -U postgres -d realestate
```

#### Kafka Issues
```bash
# Check Kafka status
docker-compose logs kafka

# Check topics
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092
```

### Getting Help
- Check the [Wiki](../../wiki) for detailed documentation
- Open an [Issue](../../issues) for bugs
- Join our [Discord](https://discord.gg/realestate) for community support

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic microservices architecture
- ✅ Authentication & authorization
- ✅ Property management
- ✅ Event-driven communication

### Phase 2 (Next)
- 🔄 Advanced search with filters
- 🔄 Real-time notifications
- 🔄 File upload service
- 🔄 Payment integration

### Phase 3 (Future)
- 📋 AI-powered recommendations
- 📋 Advanced analytics
- 📋 Mobile app backend
- 📋 Multi-tenant support

---

**Built with ❤️ using NestJS and TypeScript** 
# Real Estate Microservices Architecture

## 🎯 Architecture Decision Record (ADR)

### 1. Polyrepo vs Monorepo Decision

**Decision**: Polyrepo approach for maximum service isolation

**Rationale**:
- **Independent Deployment**: Each service can be deployed independently
- **Team Autonomy**: Different teams can work on different services
- **Technology Flexibility**: Services can evolve with different tech stacks
- **Clear Boundaries**: Forces clear service boundaries and contracts
- **Scalability**: Easier to scale teams and services independently

**Trade-offs**:
- **Code Duplication**: Some shared code may be duplicated
- **Version Management**: More complex dependency management
- **Development Setup**: More complex local development environment

### 2. Database Strategy: Database-per-Service

**Decision**: Each service owns its own database

**Rationale**:
- **Data Isolation**: Services cannot directly access other services' data
- **Technology Flexibility**: Different services can use different databases
- **Independent Scaling**: Database scaling per service needs
- **Fault Isolation**: Database failures don't cascade across services

## 🏗️ Service Architecture Details

### Gateway API Service (Port: 3000)

**Responsibilities**:
- API Gateway and BFF (Backend for Frontend)
- Request routing and load balancing
- Authentication and authorization
- Rate limiting and throttling
- Request/response transformation
- API documentation (Swagger)

**Key Components**:
- Route handlers for each service
- Authentication middleware
- Rate limiting middleware
- Request validation
- Response caching
- Error handling and logging

**Database**: None (stateless)

### Auth Service (Port: 3001)

**Responsibilities**:
- User authentication (JWT, OAuth)
- Authorization and permissions
- Session management
- Password management
- Multi-factor authentication
- Social login integration

**Key Components**:
- JWT token generation and validation
- OAuth providers (Google, Facebook, etc.)
- Password hashing and validation
- Permission management
- Session storage (Redis)

**Database**: PostgreSQL (users, sessions, permissions)

### User Service (Port: 3002)

**Responsibilities**:
- User profile management
- User preferences and settings
- Account verification
- User search and discovery
- User analytics and behavior tracking

**Key Components**:
- User CRUD operations
- Profile management
- Preference management
- User search functionality
- Analytics tracking

**Database**: PostgreSQL (users, profiles, preferences, analytics)

### Property Service (Port: 3003)

**Responsibilities**:
- Property listing management
- Property details and metadata
- Property status management
- Property categorization
- Property analytics

**Key Components**:
- Property CRUD operations
- Property search and filtering
- Property status workflows
- Property categorization
- Property analytics

**Database**: PostgreSQL (properties, categories, statuses, analytics)

### Agent Service (Port: 3004)

**Responsibilities**:
- Agent and agency management
- Agent credentials and verification
- Agent performance tracking
- Agency management
- Agent search and discovery

**Key Components**:
- Agent CRUD operations
- Credential verification
- Performance tracking
- Agency management
- Agent search

**Database**: PostgreSQL (agents, agencies, credentials, performance)

### Project Service (Port: 3005)

**Responsibilities**:
- Construction project management
- Project timelines and milestones
- Construction updates
- Project documentation
- Project analytics

**Key Components**:
- Project CRUD operations
- Timeline management
- Update tracking
- Document management
- Project analytics

**Database**: PostgreSQL (projects, timelines, updates, documents)

### Contact Service (Port: 3006)

**Responsibilities**:
- Lead management
- Inquiry handling
- Communication history
- Contact analytics
- Lead scoring

**Key Components**:
- Lead CRUD operations
- Inquiry processing
- Communication tracking
- Lead scoring
- Analytics

**Database**: PostgreSQL (leads, inquiries, communications, analytics)

### Notification Service (Port: 3007)

**Responsibilities**:
- Email notifications
- SMS notifications
- Push notifications
- Notification templates
- Notification delivery tracking

**Key Components**:
- Email service integration
- SMS service integration
- Push notification service
- Template management
- Delivery tracking

**Database**: PostgreSQL (notifications, templates, delivery_logs)

### Media Service (Port: 3008)

**Responsibilities**:
- File upload and storage
- Image processing and optimization
- CDN management
- Media metadata management
- Media access control

**Key Components**:
- File upload handling
- Image processing (resize, compress)
- CDN integration
- Metadata management
- Access control

**Database**: PostgreSQL (media, metadata, access_logs)

### Search Service (Port: 3009)

**Responsibilities**:
- Advanced search functionality
- Filtering and sorting
- Search analytics
- Search suggestions
- Search optimization

**Key Components**:
- Elasticsearch integration
- Search algorithms
- Filter management
- Analytics tracking
- Performance optimization

**Database**: Elasticsearch (search indices, analytics)

### Admin Service (Port: 3010)

**Responsibilities**:
- Admin panel backend
- Analytics and reporting
- System configuration
- User management
- Content moderation

**Key Components**:
- Admin CRUD operations
- Analytics and reporting
- Configuration management
- Moderation tools
- Dashboard data

**Database**: PostgreSQL (admin_users, analytics, configurations)

## 🔄 Communication Patterns

### Synchronous Communication

#### REST APIs
- **Standard**: HTTP/HTTPS with JSON payloads
- **Authentication**: JWT tokens for service-to-service calls
- **Rate Limiting**: Per-service rate limiting
- **Error Handling**: Standardized error responses

#### Health Checks
- **Endpoint**: `/health`
- **Response**: Service status, dependencies, metrics
- **Frequency**: 30-second intervals
- **Use Case**: Service discovery and monitoring

### Asynchronous Communication

#### Kafka Event Structure
```typescript
interface EventMessage {
  id: string;
  timestamp: string;
  eventType: string;
  service: string;
  version: string;
  data: any;
  metadata: {
    correlationId: string;
    userId?: string;
    sessionId?: string;
  };
}
```

#### Event Topics
```
real-estate.events.{service}.{action}
real-estate.events.{service}.{action}.{version}
```

#### Key Event Types
- `user.created`, `user.updated`, `user.deleted`
- `property.listed`, `property.updated`, `property.sold`
- `contact.inquiry-received`, `contact.lead-assigned`
- `notification.sent`, `notification.delivered`
- `media.uploaded`, `media.processed`

## 🛠️ Shared Components

### Common Package (`shared/common`)
- DTOs and interfaces
- Utility functions
- Constants and enums
- Validation schemas
- Error handling

### Config Package (`shared/config`)
- Environment configuration
- Database configuration
- Kafka configuration
- Service discovery configuration

### Database Package (`shared/database`)
- Database connection utilities
- Migration utilities
- Query builders
- Transaction management

### Kafka Package (`shared/kafka`)
- Event definitions
- Producer/consumer utilities
- Schema registry integration
- Event serialization/deserialization

## 🔒 Security Architecture

### Authentication Flow
1. **Client** → **Gateway API**: Login request
2. **Gateway API** → **Auth Service**: Validate credentials
3. **Auth Service**: Generate JWT token
4. **Client**: Store JWT token
5. **Client** → **Any Service**: Include JWT in headers
6. **Service**: Validate JWT with Auth Service

### Authorization
- **Role-based Access Control (RBAC)**
- **Resource-level permissions**
- **Service-to-service authentication**
- **API key management for external integrations**

### Data Protection
- **Encryption at rest**: Database encryption
- **Encryption in transit**: TLS/SSL for all communications
- **PII Protection**: Data masking and anonymization
- **Audit Logging**: Complete request/response logging

## 📊 Monitoring and Observability

### Metrics Collection
- **Prometheus**: Service metrics, business metrics
- **Custom Metrics**: Response times, error rates, throughput
- **Health Checks**: Service and dependency health

### Distributed Tracing
- **Jaeger**: Request tracing across services
- **Correlation IDs**: Track requests across service boundaries
- **Performance Analysis**: Identify bottlenecks

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Log Aggregation**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Log Levels**: Error, Warn, Info, Debug

### Alerting
- **Service Health**: Service down alerts
- **Performance**: Response time alerts
- **Business Metrics**: Error rate alerts
- **Infrastructure**: Resource utilization alerts

## 🚀 Deployment Strategy

### Development Environment
- **Docker Compose**: Local service orchestration
- **Hot Reloading**: Development mode with file watching
- **Local Databases**: PostgreSQL, Redis, Elasticsearch
- **Mock Services**: External service mocks

### Staging Environment
- **Kubernetes**: Container orchestration
- **CI/CD Pipeline**: Automated deployment
- **Database Migrations**: Automated schema updates
- **Load Testing**: Performance validation

### Production Environment
- **Kubernetes**: High availability deployment
- **Auto-scaling**: Horizontal pod autoscaling
- **Blue-Green Deployment**: Zero-downtime deployments
- **Monitoring**: Comprehensive observability

## 📈 Scalability Considerations

### Horizontal Scaling
- **Stateless Services**: Easy horizontal scaling
- **Database Scaling**: Read replicas, sharding
- **Cache Distribution**: Redis cluster
- **Load Balancing**: Multiple service instances

### Performance Optimization
- **Caching Strategy**: Redis for frequently accessed data
- **CDN Integration**: Global content delivery
- **Database Optimization**: Indexing, query optimization
- **Async Processing**: Background job processing

### Data Consistency
- **Eventual Consistency**: Acceptable for most use cases
- **Saga Pattern**: Distributed transaction management
- **Event Sourcing**: Audit trail and data reconstruction
- **CQRS**: Separate read and write models

## 🔄 Data Flow Examples

### Property Listing Flow
1. **User Service**: User creates property listing
2. **Property Service**: Stores property data
3. **Media Service**: Uploads property images
4. **Search Service**: Indexes property for search
5. **Notification Service**: Sends listing notifications
6. **Contact Service**: Handles inquiries

### User Registration Flow
1. **Gateway API**: Receives registration request
2. **Auth Service**: Creates user account
3. **User Service**: Creates user profile
4. **Notification Service**: Sends welcome email
5. **Search Service**: Indexes user for search

## 📝 Development Guidelines

### Code Organization
- **Domain-Driven Design**: Clear domain boundaries
- **Clean Architecture**: Separation of concerns
- **SOLID Principles**: Maintainable and extensible code
- **Testing**: Unit, integration, and e2e tests

### API Design
- **RESTful Principles**: Standard HTTP methods and status codes
- **Versioning**: API versioning strategy
- **Documentation**: OpenAPI/Swagger documentation
- **Validation**: Request/response validation

### Error Handling
- **Standardized Errors**: Consistent error responses
- **Error Codes**: Meaningful error codes
- **Logging**: Comprehensive error logging
- **Monitoring**: Error tracking and alerting 
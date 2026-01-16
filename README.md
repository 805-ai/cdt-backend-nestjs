# FINALBOSSTECH-CDT
CDT-DEMO
# FINALBOSSTECH-CDT

Confidential — Patent Pending (USPTO #3493)

CDT Demo kit aligned with NIST SP 800-53 AI Control Overlays.







Thank you for the feedback. I’ll expand the README to provide a deeper technical breakdown of the module structure within the Consent Data Tracking (CDT) System, detailing each module’s purpose, functionality, and implementation. This will give a comprehensive view of the backend architecture, emphasizing the technical design and how the modules interact to deliver the system’s capabilities.

---

# Consent Data Tracking (CDT) System

## Overview

The Consent Data Tracking (CDT) System is a robust backend API designed to manage user consent, enforce data privacy regulations (e.g., EU AI Act, NIST SP 800-53 AI Control Overlays), and provide real-time auditing capabilities. This middleware solution serves AI and SaaS applications by offering endpoints for consent generation, verification, revocation, and usage tracking. Built with a focus on security, scalability, and compliance, the system ensures data integrity, transparency, and auditability while supporting partner onboarding and role-based access control.

This project delivers a production-ready backend that can be extended for future AI integrations (e.g., OpenAI APIs) while maintaining a modular and maintainable codebase.

## Features

- **Consent Management**: Generate signed consent receipts, verify their validity, and revoke them with full audit trails.
- **Partner Onboarding**: Secure admin-led partner registration with configurable rate limiting.
- **Auditing**: Immutable, append-only logs for all system actions (e.g., create, update, login).
- **Authentication**: Firebase-based authentication with OTP and email verification.
- **Rate Limiting**: Tiered limits per partner using Redis for traffic control.
- **User Management**: Role-based access (OWNER, ADMIN, USER, PARTNER, AUDITOR).
- **Security**: HMAC signing, HTTPS enforcement, IP/user-agent tracking, and no hardcoded secrets.

## Technical Stack

- **Backend Framework**: NestJS (TypeScript/Node.js v20+) with Express under the hood for high-performance routing.
- **Database**: MongoDB with Mongoose ORM for schema definition and data persistence.
- **Authentication**: Firebase Admin SDK for user management and secure authentication flows.
- **Caching/Rate Limiting**: Redis for in-memory storage and request rate management.
- **Validation**: Class-Validator and Swagger for API documentation and input validation.
- **Logging**: Custom NestJS logger service with extensible logging capabilities.
- **Containerization**: Docker with multi-stage builds for optimized production deployment.
- **Dependencies**: All open-source, leveraging free tiers (e.g., MongoDB Atlas, Firebase) with no paid licenses.

## Architecture

The CDT System is built using a modular, service-oriented architecture to ensure scalability, maintainability, and clear separation of concerns. The system is organized into distinct NestJS modules, each handling a specific domain of functionality. Below is a detailed breakdown of each module, its purpose, and its technical implementation.

### Module Structure

1. **Auth Module**
   - **Purpose**: Manages user authentication, registration, and password management.
   - **Functionality**:
     - Handles login, logout, and session management using JWT tokens.
     - Implements OTP generation and email verification via Firebase Auth.
     - Supports password reset with secure token generation.
   - **Implementation**:
     - Uses Firebase Admin SDK for user creation, verification, and token issuance.
     - Integrates `passport-jwt` for JWT-based authentication guards.
     - Employs DTOs (e.g., `LoginDto`, `ResetPasswordDto`) with Class-Validator for input validation.
     - Endpoints: `/auth/login`, `/auth/verify-otp`, `/auth/reset-password`.
   - **Dependencies**: `@nestjs/passport`, `@nestjs/jwt`, `firebase-admin`.

2. **User Module**
   - **Purpose**: Manages user profiles, roles, and status updates.
   - **Functionality**:
     - Provides CRUD operations for user data (e.g., profile updates, status changes).
     - Enforces role-based access control (OWNER, ADMIN, USER).
     - Supports self-service endpoints for authenticated users.
   - **Implementation**:
     - Leverages Mongoose to define the `User` schema with fields like `userId`, `email`, `role`, and `status`.
     - Uses a `UsersService` to encapsulate business logic (e.g., role assignment, status updates).
     - Implements guards (e.g., `RolesGuard`) to restrict access based on user roles.
     - Endpoints: `/users/self`, `/users/admin/list`.
   - **Dependencies**: `@nestjs/mongoose`, `class-validator`.

3. **Partner Module**
   - **Purpose**: Handles partner registration, configuration, and management.
   - **Functionality**:
     - Allows admin-led creation of partners with custom scopes and rate limits.
     - Provides listing and retrieval of partner details.
     - Integrates with rate limiting configuration.
   - **Implementation**:
     - Defines a `Partner` schema in Mongoose with fields like `partnerId`, `name`, `environment`, and `rateLimitTier`.
     - Uses a `PartnersService` to manage partner lifecycle and validate scopes.
     - Restricts access to OWNER role via guards.
     - Endpoints: `/partners/admin/create`, `/partners/admin/list`.
   - **Dependencies**: `@nestjs/mongoose`, `class-validator`.

4. **Consent Module**
   - **Purpose**: Manages the full lifecycle of consent data (generation, verification, revocation).
   - **Functionality**:
     - Generates signed consent receipts with HMAC using a system-wide secret.
     - Verifies receipt validity and revokes consents with audit logging.
     - Ensures compliance with data integrity requirements.
   - **Implementation**:
     - Defines a `Consent` schema in Mongoose with fields like `userId`, `partnerId`, `timestamp`, and `status`.
     - Implements `ConsentsService` with methods for signing (using `crypto` module), verification, and revocation.
     - Integrates with `AuditModule` to log all consent actions.
     - Endpoints: `/consents/admin/create`, `/consents/admin/verify`, `/consents/admin/revoke`.
   - **Dependencies**: `@nestjs/mongoose`, `crypto`, `class-validator`.

5. **Audit Module**
   - **Purpose**: Maintains an immutable audit trail for all system actions.
   - **Functionality**:
     - Logs actions (e.g., CREATE, LOGIN, REVOKE) with metadata (IP, user-agent, timestamp).
     - Provides read-only access to audit records for authorized users.
   - **Implementation**:
     - Defines an `Audit` schema in Mongoose with fields like `action`, `userId`, `timestamp`, and `details`.
     - Uses an `AuditsService` to append records to an append-only collection.
     - Implements a custom logger to capture request metadata.
     - Endpoints: `/audits/admin/list`.
   - **Dependencies**: `@nestjs/mongoose`, `@nestjs/common`.

6. **RateLimit Module**
   - **Purpose**: Enforces tiered rate limits per partner using Redis.
   - **Functionality**:
     - Tracks request counts within a time window (e.g., 100 requests/hour).
     - Assigns limits based on partner tier (DEFAULT, PRO, ENTERPRISE).
     - Provides administrative oversight of usage.
   - **Implementation**:
     - Integrates with `@nestjs/throttler` and custom Redis storage.
     - Uses a `RateLimitService` to increment counters and reset them based on `lastReset`.
     - Defines a `RateLimit` schema in Mongoose for persistence.
     - Endpoints: `/rate-limits/admin/:partnerId`.
   - **Dependencies**: `@nestjs/throttler`, `redis`, `@nestjs/mongoose`.

### Inter-Module Communication
- **Dependency Injection**: NestJS’s DI container manages module dependencies, with services injected where needed (e.g., `AuditsService` injected into `ConsentModule`).
- **Event-Driven**: Modules like `AuditModule` subscribe to events from `ConsentModule` (e.g., consent revocation) to log actions.
- **Shared Logic**: Common utilities (e.g., HMAC signing, validation pipes) are centralized in a `SharedModule`.

## Setup Instructions

### Prerequisites
- Node.js v20+ (LTS recommended).
- MongoDB (local or MongoDB Atlas free tier).
- Firebase project (configured via console.firebase.google.com).
- Redis (local or Redis Labs free tier).
- Docker and Git.

### Installation
1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd FINALBOSSTECH-CDT
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following:
   ```
   MONGODB_URI_LOCAL=mongodb://localhost:27017/cdt_db
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your-redis-password
   PORT=3000
   JWT_SECRET=your-strong-jwt-secret
   RATE_LIMIT_WINDOW_SECONDS=3600
   RATE_LIMIT_DEFAULT=100
   RATE_LIMIT_PRO=500
   RATE_LIMIT_ENTERPRISE=1000
   CDT_SECRET=your-32-byte-random-secret
   ```
   - Generate secrets with `openssl rand -hex 32`.
   - Do not commit `.env` to Git.

4. Start services:
   - MongoDB: `mongod` or `docker run -d -p 27017:27017 mongo`.
   - Redis: `redis-server` or `docker run -d -p 6379:6379 redis`.

5. Run the application:
   - Development: `npm run start:dev`
   - Production: `npm run build && npm run start:prod`
   - Access at `http://localhost:3000`.

6. Verify setup:
   - Health check: `/healthz`
   - Swagger docs: `/api`

## Usage

### API Endpoints
- **Auth**: `/auth/login`, `/auth/verify-otp`, `/auth/reset-password`.
- **Users**: `/users/self`, `/users/admin/list`.
- **Partners**: `/partners/admin/create`, `/partners/admin/list`.
- **Consents**: `/consents/admin/create`, `/consents/admin/verify`, `/consents/admin/revoke`.
- **Audits**: `/audits/admin/list`.
- **Rate Limits**: `/rate-limits/admin/:partnerId`.

All admin routes require OWNER role authentication. Refer to Swagger docs at `/api` for detailed schemas.

### Testing
- Unit tests: `npm run test`
- End-to-end tests: `npm run test:e2e`
- Coverage: `npm run test:cov`

## Deployment

### Local Deployment
- Build: `npm run build`
- Run: `node dist/main.js` or use PM2: `pm2 start dist/main.js --name cdt-api`.
- Configure Nginx for reverse proxy with HTTPS.

### Docker Deployment
- Build image: `docker build -t cdt-api:latest .`
- Run container: `docker run -d -p 3000:3000 --env-file .env cdt-api:latest`.

### Docker Compose
Use the provided `docker-compose.yml`:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - '3000:3000'
    env_file:
      - .env
    depends_on:
      - mongo
      - redis
  mongo:
    image: mongo:latest
    ports:
      - '27017:27017'
  redis:
    image: redis:latest
    ports:
      - '6379:6379'
```
- Start: `docker-compose up -d`

For production, consider Kubernetes or cloud platforms.

## Security Practices

- Secrets are stored in `.env` and excluded from version control.
- HTTPS and HSTS are enforced in production.
- Rate limiting is implemented with Redis (default 100 requests/hour).
- Audit logs include timestamps, IP, and user-agent.
- Input validation uses Class-Validator with DTOs.

## Support and Maintenance

- **Bug Fixes**: Included for 2 weeks post-delivery.
- **Long-Term Support**: Available 
- **Intellectual Property**: All code and IP belong to the client, with no reuse or relicensing.

## Troubleshooting

- MongoDB connection issues: Verify `MONGODB_URI_LOCAL`.
- Firebase errors: Check service account keys.
- Redis failures: Ensure host/port/password.
- Build errors: Run `npm ci` to reinstall dependencies.
- Logs: Review console output or implement Winston for file logging.

## Contributing

The codebase is structured for extensibility with modular NestJS modules, clean DAOs, services, and controllers. Contributions are welcome—please submit pull requests with detailed descriptions.

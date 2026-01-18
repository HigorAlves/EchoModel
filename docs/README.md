# Foundry Documentation

Welcome to the Foundry monorepo documentation. This guide provides comprehensive coverage of the architecture, packages, and patterns used throughout the project.

## Table of Contents

### Architecture
- [Architecture Overview](./architecture/overview.md) - High-level system architecture and design principles
- [Domain-Driven Design](./architecture/ddd.md) - DDD patterns and bounded contexts

### Core Packages
- [Domain Package](./packages/domain.md) - Domain entities, value objects, and business logic
- [Application Package](./packages/application.md) - CQRS commands, queries, and use cases

### Kernel (Shared Infrastructure)
- [Error Handling](./kernel/error.md) - Enterprise error handling foundation
- [Logger](./kernel/logger.md) - Centralized structured logging with Pino
- [Authorization](./kernel/authorization.md) - RBAC/ABAC access control system
- [Encryption](./kernel/encryption.md) - Data encryption and compliance
- [Feature Flags](./kernel/feature-flags.md) - Dynamic feature management

### Infrastructure
- [Database](./infrastructure/database.md) - PostgreSQL, TypeORM, migrations
- [Deployment](./infrastructure/deployment.md) - AWS CDK, environments, CI/CD
- [GitHub Environments](./infrastructure/github-environments.md) - CI/CD secrets, variables, and environment setup
- [LocalStack](./infrastructure/localstack.md) - Local development with AWS emulation
- [Lambda APIs](./infrastructure/lambda-apis.md) - Hono-based API Lambdas

### Configuration
- [Environment](./configuration/environment.md) - Environment variable management
- [TypeScript](./configuration/typescript.md) - Shared TypeScript configurations
- [Testing](./configuration/testing.md) - Vitest configuration and coverage

## Quick Start

```bash
# Install dependencies
yarn install

# Run type checking
yarn check-types

# Run tests
yarn test

# Start development
yarn dev
```

## Local Development with LocalStack

Run the complete AWS infrastructure locally:

```bash
# Option 1: Automated setup
./scripts/setup-local-env.sh

# Option 2: Step by step
yarn system:up              # Start PostgreSQL + LocalStack
yarn lambda:build           # Build Lambda packages
yarn cdk:local:bootstrap    # Bootstrap CDK
yarn cdk:local:deploy       # Deploy to LocalStack
```

After deployment, access:
- **API**: `http://localhost:4566/restapis/<api-id>/local/_user_request_/users`
- **Swagger UI**: `http://localhost:4566/restapis/<api-id>/local/_user_request_/docs`
- **Health Check**: `http://localhost:4566/restapis/<api-id>/local/_user_request_/users/health`

See [LocalStack documentation](./infrastructure/localstack.md) for detailed instructions.

## Deployment

Deploy to AWS environments:

```bash
# Development
yarn workspace @foundry/cdk run deploy:dev

# Staging
yarn workspace @foundry/cdk run deploy:staging

# Production
yarn workspace @foundry/cdk run deploy:prod
```

See [Deployment documentation](./infrastructure/deployment.md) for CI/CD and environment details.

## Project Structure

```
foundry/
├── apps/                    # Application deployables
│   └── lambdas/             # AWS Lambda functions
│       ├── user/            # User API (@foundry/api-user)
│       └── feature-flag/    # Feature Flag API (@foundry/api-feature-flag)
├── packages/                # Core business logic
│   ├── application/         # CQRS commands, queries, events
│   ├── domain/              # Domain entities and value objects
│   └── lambda/              # Lambda utilities and factories
├── kernel/                  # Shared infrastructure
│   ├── authorization/       # RBAC/ABAC access control
│   ├── encryption/          # Data encryption
│   ├── error/               # Error handling foundation
│   ├── feature-flags/       # Feature flag management
│   └── logger/              # Structured logging with Pino
├── infra/                   # Infrastructure adapters
│   ├── cdk/                 # AWS CDK (Infrastructure as Code)
│   ├── database/            # PostgreSQL with TypeORM
│   └── docker/              # Docker initialization scripts
├── config/                  # Shared configurations
│   ├── enviroment/          # Environment variables
│   ├── typescript-config/   # TypeScript settings
│   └── vitest-config/       # Test configuration
├── scripts/                 # Build and deployment scripts
└── docs/                    # This documentation
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 22+ |
| Language | TypeScript 5.9+ |
| Package Manager | Yarn 4 (Berry) |
| Build System | Turbo + tsdown |
| API Framework | Hono |
| Cloud | AWS (Lambda, API Gateway, RDS) |
| Infrastructure | AWS CDK |
| Local Dev | LocalStack + Docker Compose |
| ORM | TypeORM 0.3+ |
| Database | PostgreSQL 18 |
| Validation | Zod |
| Logging | Pino + pino-pretty |
| Testing | Vitest + Testcontainers |
| Linting | Biome |
| CI/CD | GitHub Actions |

# EchoModel Documentation

Welcome to the EchoModel monorepo documentation. This guide provides comprehensive coverage of the architecture, packages, and patterns used throughout the project.

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

## Project Structure

```
echomodel/
├── apps/                    # Application deployables
│   ├── dashboard/           # Next.js web dashboard
│   └── functions/           # Firebase Cloud Functions (planned)
├── packages/                # Core business logic
│   ├── application/         # CQRS commands, queries, events
│   └── domain/              # Domain entities and value objects
├── kernel/                  # Shared infrastructure
│   ├── error/               # Error handling foundation
│   ├── logger/              # Structured logging with Pino
│   └── testing/             # Test utilities and factories
├── infra/                   # Infrastructure configuration
│   └── firebase/            # Firebase configuration (Firestore, Storage rules)
├── config/                  # Shared configurations
│   ├── enviroment/          # Environment variables
│   ├── typescript-config/   # TypeScript settings
│   └── vitest-config/       # Test configuration
└── docs/                    # This documentation
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 22+ |
| Language | TypeScript 5.9+ |
| Package Manager | Yarn 4 (Berry) |
| Build System | Turbo + tsdown |
| Frontend | Next.js 15 with App Router |
| UI Components | shadcn/ui + Tailwind CSS |
| Backend | Firebase Cloud Functions |
| Database | Firestore |
| Storage | Firebase Storage |
| Authentication | Firebase Auth |
| Monitoring | Sentry |
| Validation | Zod |
| Logging | Pino + pino-pretty |
| Testing | Vitest |
| Linting | Biome |
| CI/CD | GitHub Actions |

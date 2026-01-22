# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies
yarn install

# Build all packages (builds dependencies first, runs type-check)
yarn build

# Type checking
yarn check-types

# Linting (Biome)
yarn lint
yarn lint:fix

# Run all tests
yarn test

# Run unit tests only
yarn test:unit

# Run tests for a specific package
yarn workspace @foundry/domain run test:unit
yarn workspace @foundry/application run test:unit

# Development servers
yarn dev              # Start all dev servers
yarn dev:web          # Start web dashboard only

# Workflows
yarn bootstrap        # Setup development environment
yarn verify           # Run lint, types, and tests
yarn verify:fix       # Run lint with auto-fix, types, and tests

# Code generators
yarn generate         # Interactive menu to select generator
yarn gen:application  # Add CQRS components to bounded context
yarn gen:domain       # Add DDD components to bounded context
```

## Architecture Overview

This is a TypeScript monorepo implementing **Domain-Driven Design (DDD)**, **Hexagonal Architecture (Ports & Adapters)**, and **CQRS (Command Query Responsibility Segregation)**.

### Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Backend**: Firebase Cloud Functions
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth (email/password, Google SSO)
- **Monitoring**: Sentry for error tracking

### Package Structure

```
apps/
├── dashboard/        # Next.js web dashboard
└── functions/        # Firebase Cloud Functions (planned)

packages/
├── domain/           # Domain layer - entities, value objects, repository interfaces
└── application/      # Application layer - CQRS commands, queries, events, DTOs

kernel/               # Shared infrastructure (cross-cutting concerns)
├── error/            # Base error classes (EnterpriseError, ValidationError)
├── logger/           # Centralized structured logging with Pino
└── testing/          # In-memory repositories, factories, test utilities

infra/
└── firebase/         # Firebase configuration (Firestore rules, Storage rules)

config/
├── enviroment/       # Type-safe environment variables with Zod
├── typescript-config/ # Shared tsconfig presets
└── vitest-config/    # Shared test configuration
```

### Layer Dependencies

```
Application Layer (@foundry/application)
    └── Domain Layer (@foundry/domain)
            └── Error (@foundry/error)
```

### Key Patterns

**Domain Layer (`packages/domain/`):**
- Aggregate roots with factory methods (`User.create()`, `Model.create()`)
- Value objects with validation (`UserId`, `FullName`, `Locale`, `ExternalId`)
- Domain events collected on aggregates, pulled after persistence
- Repository interfaces (implementations use Firestore)

**Application Layer (`packages/application/`):**
- Commands for writes: `CreateUserCommand`, `UpdateUserCommand`, `DeleteUserCommand`
- Queries for reads: `GetUserByIdQuery`, `ListUsersQuery`
- DTOs with Zod validation schemas
- Mappers between domain entities and DTOs
- InMemoryEventBus for event publishing

**Bounded Contexts:**
- `User/` - User management and lifecycle
- `Model/` - AI model creation and configuration
- `Generation/` - Image generation workflows
- `Asset/` - File and media management

## Code Style

- **Formatter**: Biome with tabs, 120 line width, single quotes, trailing commas
- **Imports**: Use Node.js protocol (`node:fs`, `node:path`)
- **Validation**: Zod schemas for all inputs
- **Errors**: Extend `EnterpriseError` from `@foundry/error`
- **Logging**: Use `@foundry/logger` - never use `console.log/warn/error`

## Logging

Use the centralized `@foundry/logger` package for all logging. **Never use `console.log`, `console.warn`, or `console.error`** in application code.

```typescript
import { createLogger } from '@foundry/logger'

const logger = createLogger('MyService')

// Simple messages
logger.info('Operation completed')
logger.warn('Cache miss detected')
logger.error('Connection failed')

// Structured logging with context
logger.info({ userId: '123', action: 'login' }, 'User logged in')
logger.error({ err: error, requestId: '456' }, 'Request failed')

// Log levels: trace, debug, info, warn, error, fatal
logger.debug({ query }, 'Executing database query')
```

**Environment Variables:**
- `LOG_LEVEL` - Set minimum log level (trace, debug, info, warn, error, fatal)
- `LOG_JSON` - Output raw JSON logs (`true` for production/structured logging)
- `LOG_SINGLE_LINE` - Output logs on single line (`false` for multi-line output)

## Testing

Tests use Vitest. Test files are colocated with source files as `*.test.ts`.

```bash
# Run single test file
yarn workspace @foundry/domain run test:unit src/User/User.entity.test.ts

# Run tests in watch mode
yarn workspace @foundry/domain run test -- --watch
```

## Firebase Configuration

Firebase configuration is in `infra/firebase/`:

- `firebase.json` - Firebase project configuration
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore indexes
- `storage.rules` - Firebase Storage security rules

## Next.js Dashboard

The dashboard app is in `apps/dashboard/` using:

- **Next.js 15** with App Router
- **shadcn/ui** for components
- **Tailwind CSS** for styling
- **Sentry** for error tracking
- **Firebase Auth** for authentication

### Key Features

- Dashboard with stats and quick actions
- Model creation wizard (5-step flow)
- Models listing with search and filters
- Asset management with uploads
- Account management
- Settings pages

## Code Generators

Use the Turbo generators to scaffold new bounded contexts or add components:

### Application Generator (`yarn generate` → Application)

Adds CQRS components to an existing bounded context in `packages/application/`:

- **Commands**: Create, Update, Delete
- **Queries**: GetById, List
- **DTOs**: Input/Output schemas with Zod
- **Mappers**: Domain ↔ DTO conversion
- **Events**: Application event handlers

### Domain Generator (`yarn generate` → Domain)

Adds DDD components to an existing bounded context in `packages/domain/`:

- **Entity**: Aggregate root with factory method
- **Value Objects**: ID and other value objects
- **Repository**: Interface definition
- **Enums**: Status and other enumerations
- **Errors**: Domain-specific error classes
- **Events**: Domain event definitions
- **Mapper**: Domain ↔ Persistence conversion
- **Service**: Domain service for cross-entity logic

## Architectural Guidelines

When making changes, **always follow these principles**:

1. **Dependency Direction**: Dependencies only point inward (Infrastructure → Application → Domain)
2. **CQRS**: Separate commands (writes) from queries (reads) in application layer
3. **Repository Pattern**: Define interfaces in domain, implement with Firestore
4. **Domain Events**: Collect events on aggregates, publish after persistence
5. **Validation**: Use Zod schemas at API boundaries, domain validation in entities
6. **Error Handling**: Extend `EnterpriseError`, use Result pattern in commands/queries
7. **Logging**: Always use `@foundry/logger`, never `console.*`
8. **Testing**: Colocate tests with source, use in-memory repositories for unit tests

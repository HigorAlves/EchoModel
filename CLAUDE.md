# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Reference

**IMPORTANT**: Before making changes, consult the relevant documentation in `docs/`:

| Topic | Documentation |
|-------|---------------|
| Architecture & Patterns | `docs/architecture/overview.md`, `docs/architecture/ddd.md` |
| Domain Layer | `docs/packages/domain.md` |
| Application Layer (CQRS) | `docs/packages/application.md` |
| Database & TypeORM | `docs/infrastructure/database.md` |
| Lambda APIs | `docs/infrastructure/lambda-apis.md` |
| CDK Deployment | `docs/infrastructure/deployment.md` |
| GitHub Environments | `docs/infrastructure/github-environments.md` |
| LocalStack Development | `docs/infrastructure/localstack.md` |
| Error Handling | `docs/kernel/error.md` |
| Logging | `docs/kernel/logger.md` |
| Authorization | `docs/kernel/authorization.md` |
| Feature Flags | `docs/kernel/feature-flags.md` |
| Testing Utilities | `docs/kernel/testing.md` |
| Environment Config | `docs/configuration/environment.md` |
| Testing Config | `docs/configuration/testing.md` |

When adding new features or modifying existing code, **follow the patterns documented** in these files.

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
yarn dev:lambdas      # Start Lambda APIs locally
yarn dev:web          # Start web dashboard only

# Lambda development
yarn build:lambdas    # Build all Lambda packages
yarn workspace @foundry/api-user run start:local      # Run User API locally (port 3001)
yarn workspace @foundry/api-feature-flag run start:local  # Run Feature Flag API locally (port 3002)
yarn workspace @foundry/api-auth run start:local      # Run Auth API locally (port 3003)

# LocalStack deployment
yarn system:up              # Start PostgreSQL + LocalStack
yarn cdk:local:bootstrap    # Bootstrap CDK for LocalStack
yarn cdk:local:deploy       # Deploy to LocalStack
yarn cdk:local:destroy      # Destroy LocalStack stacks
yarn localstack:logs        # View LocalStack logs
yarn localstack:reset       # Reset LocalStack (removes all data)

# Production deployment
yarn workspace @foundry/cdk run deploy:dev      # Deploy to dev
yarn workspace @foundry/cdk run deploy:staging  # Deploy to staging
yarn workspace @foundry/cdk run deploy:prod     # Deploy to production

# Workflows
yarn bootstrap          # Setup development environment
yarn verify             # Run lint, types, and tests
yarn verify:fix         # Run lint with auto-fix, types, and tests
yarn ci:local           # Simulate CI locally

# Database operations
yarn db                 # Interactive TypeORM menu
yarn db:migrate         # Run pending migrations
yarn db:generate        # Generate migration from changes
yarn db:status          # Show migration status

# Code generators
yarn generate           # Interactive menu to select generator
yarn gen:lambda         # Create new Lambda API bounded context
yarn gen:application    # Add CQRS components to bounded context
yarn gen:domain         # Add DDD components to bounded context
```

## Architecture Overview

This is a TypeScript monorepo implementing **Domain-Driven Design (DDD)**, **Hexagonal Architecture (Ports & Adapters)**, and **CQRS (Command Query Responsibility Segregation)**.

### Package Structure

```
apps/
└── lambdas/          # AWS Lambda functions (Hono-based APIs)
    ├── auth/         # @foundry/api-auth - Authentication API
    ├── user/         # @foundry/api-user - User management API
    └── feature-flag/ # @foundry/api-feature-flag - Feature flags API

packages/
├── domain/           # Domain layer - entities, value objects, repository interfaces
├── application/      # Application layer - CQRS commands, queries, events, DTOs
└── lambda/           # Lambda utilities - handler factory, middleware, database config

kernel/               # Shared infrastructure (cross-cutting concerns)
├── authorization/    # RBAC + ABAC access control with decorators
├── encryption/       # AES-256-GCM encryption, key management, compliance audit
├── error/            # Base error classes (EnterpriseError, DatabaseError, ValidationError)
├── feature-flags/    # Feature toggles, A/B testing, targeting rules
├── logger/           # Centralized structured logging with Pino
└── testing/          # In-memory repositories, factories, E2E utilities

infra/
├── cdk/              # AWS CDK - Infrastructure as Code
├── database/         # TypeORM + PostgreSQL, migrations, transaction decorators
└── docker/           # Docker initialization scripts for LocalStack

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

Infrastructure (@foundry/database)
    ├── Domain (@foundry/domain)
    └── Environment (@foundry/enviroment)
```

### Key Patterns

**Domain Layer (`packages/domain/`):**
- Aggregate roots with factory methods (`User.create()`, `FeatureFlag.create()`, `Auth.createRefreshToken()`)
- Value objects with validation (`UserId`, `FullName`, `Locale`, `Variant`, `TokenId`, `RefreshToken`)
- Domain events collected on aggregates, pulled after persistence
- Repository interfaces (implementations in infrastructure layer)

**Application Layer (`packages/application/`):**
- Commands for writes: `CreateUserCommand`, `UpdateUserCommand`, `DeleteUserCommand`
- Queries for reads: `GetUserByIdQuery`, `ListUsersQuery`
- DTOs with Zod validation schemas
- Mappers between domain entities and DTOs
- InMemoryEventBus for event publishing

**Bounded Contexts:**
- `User/` - User management and lifecycle
- `FeatureFlag/` - Feature toggles with variants, targeting, scheduling
- `Auth/` - Authentication, refresh tokens, and SSO integration

### Database

TypeORM with PostgreSQL. Key decorators:
- `@Transactional({ timeout: 5000 })` - Method-level transactions
- `@TransactionalClass()` - All methods transactional
- `@InjectRepository(RepositoryType.USER)` - Transaction-aware repository injection

Migrations in `infra/database/src/postgres/migration/`.

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

Pretty printing is enabled by default. Set `LOG_JSON=true` for production environments that need structured JSON logs.

## Testing

Tests use Vitest. Test files are colocated with source files as `*.test.ts`.

```bash
# Run single test file
yarn workspace @foundry/domain run test:unit src/User/User.entity.test.ts

# Run tests in watch mode
yarn workspace @foundry/domain run test -- --watch

# Run E2E tests (requires PostgreSQL)
yarn workspace @foundry/api-user run test:e2e
```

## Lambda API Patterns

When creating or modifying Lambda APIs in `apps/lambdas/`, follow these patterns:

### Handler Structure

```typescript
// handlers/createUser.handler.ts
import { Container } from 'typedi'
import { CREATE_USER_COMMAND } from '../di/tokens'

export async function createUserHandler(c: Context) {
  const command = Container.get(CREATE_USER_COMMAND)
  const body = await c.req.json()

  const result = await command.execute({
    input: body,
    context: { correlationId: c.get('correlationId') },
  })

  if (result.isErr()) {
    throw result.error
  }

  return c.json(result.value, 201)
}
```

### OpenAPI Route Definition

```typescript
// routes/user.openapi.ts
import { createRoute } from '@hono/zod-openapi'

export const createUserRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Users'],
  request: { body: { content: { 'application/json': { schema: CreateUserSchema } } } },
  responses: {
    201: { content: { 'application/json': { schema: UserResponseSchema } } },
    400: CommonErrorResponses[400],
  },
})
```

### Dependency Injection

- Use TypeDI for container management
- Initialize container in `di/container.ts`
- Register commands/queries from `@foundry/application`
- Use `getRepositoryConfig()` for environment-aware repository injection

## CDK & Infrastructure Patterns

When modifying CDK stacks in `infra/cdk/`:

### Package Resolution

Always use package-based resolution for Lambda code paths:

```typescript
// Use this (package-based)
import { getUserLambdaCodePath } from '../utils/index.js'
code: lambda.Code.fromAsset(getUserLambdaCodePath())

// NOT this (relative paths)
code: lambda.Code.fromAsset('../../../apps/lambdas/user/dist')  // WRONG
```

### Adding New Lambda

1. Create package in `apps/lambdas/<name>/`
2. Add package to CDK dependencies in `infra/cdk/package.json`
3. Add resolver function in `infra/cdk/lib/utils/package-resolver.ts`
4. Create Lambda in stack using the resolver

### Environment Configuration

- Use `LambdaStackLocalConfig` for LocalStack
- Use `EnvironmentConfig` for production environments
- Swagger/OpenAPI routes only enabled for non-prod

## Code Generators

Use the Turbo generators to scaffold new bounded contexts or add components:

### Lambda Generator (`yarn generate` → Lambda)

Creates a complete Lambda API for a new bounded context:

```
apps/lambdas/{name}/
├── package.json, tsconfig.json, tsdown.config.ts
├── vitest.config.ts, vitest.e2e.config.ts
└── src/
    ├── index.ts, app.ts, local.ts
    ├── di/           # TypeDI container setup
    ├── handlers/     # CRUD handlers
    ├── routes/       # OpenAPI route definitions
    └── testing/      # Test setup files
```

**After generating**, you need to:
1. Add domain and application layer components using the other generators
2. Update CDK integration in `infra/cdk/lib/utils/package-resolver.ts`
3. Add Lambda to CDK stacks

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
3. **Repository Pattern**: Define interfaces in domain, implement in infrastructure
4. **Domain Events**: Collect events on aggregates, publish after persistence
5. **Validation**: Use Zod schemas at API boundaries, domain validation in entities
6. **Error Handling**: Extend `EnterpriseError`, use Result pattern in commands/queries
7. **Logging**: Always use `@foundry/logger`, never `console.*`
8. **Testing**: Colocate tests with source, use in-memory repositories for unit tests

For detailed patterns, see:
- `docs/architecture/overview.md` - High-level architecture
- `docs/architecture/ddd.md` - Domain-Driven Design patterns
- `docs/infrastructure/lambda-apis.md` - Lambda API implementation

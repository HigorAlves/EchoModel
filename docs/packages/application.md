# Application Package (@foundry/application)

The application package implements CQRS (Command Query Responsibility Segregation) patterns with use cases organized by bounded contexts.

## Overview

| Property | Value |
|----------|-------|
| Package | `@foundry/application` |
| Location | `packages/application` |
| Purpose | Commands, queries, events, and use cases |
| Dependencies | `@foundry/domain`, `@foundry/error`, `zod` |

## Package Structure

```
packages/application/src/
├── index.ts                    # Main exports
├── shared/                     # Cross-cutting concerns
│   ├── index.ts
│   ├── interfaces/             # Core contracts
│   │   └── index.ts
│   ├── errors/
│   │   └── ApplicationError.ts
│   └── events/
│       └── InMemoryEventBus.ts
├── User/                       # User bounded context
│   ├── index.ts
│   ├── commands/
│   │   ├── CreateUser.command.ts
│   │   ├── UpdateUser.command.ts
│   │   └── DeleteUser.command.ts
│   ├── queries/
│   │   ├── GetUserById.query.ts
│   │   └── ListUsers.query.ts
│   ├── events/
│   │   ├── UserCreated.event.ts
│   │   ├── UserUpdated.event.ts
│   │   └── UserDeleted.event.ts
│   ├── dtos/
│   │   ├── input/
│   │   └── output/
│   └── mappers/
│       └── User.mapper.ts
└── FeatureFlag/                # FeatureFlag bounded context
    ├── index.ts
    ├── commands/
    ├── queries/
    ├── events/
    ├── dtos/
    └── mappers/
```

## Core Concepts

### Context

Every operation receives a context with request metadata:

```typescript
interface Context {
  readonly correlationId: string    // Request tracking
  readonly userId?: string          // Authenticated user
  readonly tenantId?: string        // Multi-tenant support
  readonly permissions?: string[]   // User permissions
}

// Create context
const ctx = createContext({
  correlationId: 'req-123',
  userId: 'user-456',
  tenantId: 'tenant-789',
  permissions: ['user:read', 'user:write']
})
```

### Handler Interface

All commands and queries implement the handler interface:

```typescript
interface Handler<TInput = unknown, TOutput = unknown> {
  execute(input: TInput, ctx?: Context): Promise<TOutput>
}
```

### Middleware Pattern

Cross-cutting concerns can be added via middleware:

```typescript
interface Middleware<TInput = unknown, TOutput = unknown> {
  readonly name: string
  readonly order: number
  execute(input: TInput, next: NextFunction<TOutput>, ctx?: Context): Promise<TOutput>
}

type NextFunction<T = unknown> = () => Promise<T>
```

## User Bounded Context

### Commands

#### CreateUserCommand

Creates a new user in the system.

```typescript
import { User } from '@foundry/application'

// Instantiate with dependencies
const command = new User.CreateUserCommand(userRepository, eventBus)

// Execute
const result = await command.execute({
  fullName: 'John Doe',
  locale: 'en-US'
}, ctx)

// Result
console.log(result.userId)  // 'new-user-id'
```

**Input Schema:**
```typescript
const CreateUserSchema = z.object({
  fullName: z.string().min(2).max(100),
  locale: z.string().length(5)  // e.g., 'en-US'
})
```

#### UpdateUserCommand

Updates an existing user.

```typescript
const command = new User.UpdateUserCommand(userRepository, eventBus)

const result = await command.execute({
  userId: 'user-123',
  fullName: 'Jane Doe',  // optional
  locale: 'pt-BR'        // optional
}, ctx)
```

**Validation:**
- At least one of `fullName` or `locale` must be provided
- Throws `ApplicationError.notFound()` if user doesn't exist

#### DeleteUserCommand

Soft-deletes a user.

```typescript
const command = new User.DeleteUserCommand(userRepository, eventBus)

await command.execute({
  userId: 'user-123'
}, ctx)
```

**Validation:**
- Throws `ApplicationError.notFound()` if user doesn't exist
- Throws `ApplicationError.conflict()` if user already deleted

### Queries

#### GetUserByIdQuery

Retrieves a single user by ID.

```typescript
const query = new User.GetUserByIdQuery(userRepository)

const user = await query.execute({
  userId: 'user-123'
})

// Result: UserOutput
{
  id: 'user-123',
  fullName: 'John Doe',
  locale: 'en-US',
  status: 'ACTIVE',
  createdAt: Date,
  updatedAt: Date
}
```

#### ListUsersQuery

Lists users with pagination and filtering.

```typescript
const query = new User.ListUsersQuery(userRepository)

const result = await query.execute({
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  status: 'ACTIVE',
  search: 'john'
})

// Result: PaginatedResult<UserOutput>
{
  items: UserOutput[],
  total: 100,
  page: 1,
  limit: 20,
  totalPages: 5,
  hasNextPage: true,
  hasPreviousPage: false
}
```

**Input Schema:**
```typescript
const ListUsersSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['fullName', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.string().optional(),
  search: z.string().optional()
})
```

### Events

#### UserCreatedEvent Handler

```typescript
const handler = new User.UserCreatedEvent(eventBus)

eventBus.subscribe('UserCreated', async (event) => {
  console.log('User created:', event.aggregateId)
  // Send welcome email, sync to CRM, etc.
})
```

### DTOs

#### Input DTOs

```typescript
// With Zod validation
import { CreateUserInput, CreateUserSchema } from '@foundry/application'

// Validate input
const validated = CreateUserSchema.parse(rawInput)
```

#### Output DTOs

```typescript
interface UserOutput {
  id: string
  fullName: string
  locale: string
  status: string
  createdAt: Date
  updatedAt: Date
}
```

### Mappers

```typescript
import { toUserResponse, toUserResponseList } from '@foundry/application'

// Single user
const output = toUserResponse(user)

// User list
const outputs = toUserResponseList(users)
```

## FeatureFlag Bounded Context

### Commands

#### CreateFeatureFlagCommand

```typescript
const command = new FeatureFlag.CreateFeatureFlagCommand(flagRepository, eventBus)

const result = await command.execute({
  key: 'new-feature',
  name: 'New Feature',
  variants: [
    { key: 'control', name: 'Control', type: 'BOOLEAN', value: false, weight: 50 },
    { key: 'treatment', name: 'Treatment', type: 'BOOLEAN', value: true, weight: 50 }
  ],
  defaultVariantKey: 'control'
}, ctx)
```

**Validation:**
- Key must be unique (2-100 chars, lowercase, alphanumeric with hyphens/underscores)
- Minimum 2 variants required for A/B testing
- Variant weights must sum to 100

#### EnableFeatureFlagCommand

```typescript
const command = new FeatureFlag.EnableFeatureFlagCommand(flagRepository, eventBus)

await command.execute({
  flagId: 'flag-123'
}, ctx)
```

#### DisableFeatureFlagCommand

```typescript
const command = new FeatureFlag.DisableFeatureFlagCommand(flagRepository, eventBus)

await command.execute({
  flagId: 'flag-123'
}, ctx)
```

### Queries

#### GetFeatureFlagByKeyQuery

```typescript
const query = new FeatureFlag.GetFeatureFlagByKeyQuery(flagRepository)

const flag = await query.execute({
  key: 'new-feature'
})
```

#### ListFeatureFlagsQuery

```typescript
const query = new FeatureFlag.ListFeatureFlagsQuery(flagRepository)

const result = await query.execute({
  page: 1,
  limit: 20,
  status: 'ACTIVE',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})
```

#### EvaluateFeatureFlagQuery

Evaluates a feature flag for a specific user context.

```typescript
const query = new FeatureFlag.EvaluateFeatureFlagQuery(flagRepository, flagService)

const result = await query.execute({
  flagKey: 'new-feature',
  context: {
    userId: 'user-123',
    attributes: {
      country: 'US',
      planType: 'premium',
      loginCount: 50
    }
  }
})

// Result
{
  enabled: true,
  variant: {
    key: 'treatment',
    name: 'Treatment',
    value: true
  },
  reason: 'TARGETING_MATCH'
}
```

## Auth Bounded Context

The Auth bounded context handles authentication operations (login, register, logout, token refresh, SSO).

**Architecture Note:** Unlike User and FeatureFlag, Auth operations are implemented directly in the Lambda handlers (`apps/lambdas/auth/`) rather than through CQRS commands/queries in this package. This design choice reflects that:

1. Auth operations are tightly coupled to HTTP request/response handling
2. JWT generation and validation are infrastructure concerns
3. SSO integration (Okta) requires direct HTTP interaction

The domain layer (`@foundry/domain`) still defines the Auth aggregate and repository interface for refresh token management.

See [Lambda APIs - Auth API](../infrastructure/lambda-apis.md#auth-api-foundryapi-auth) for handler implementation details.

## Shared Infrastructure

### Event Bus

In-memory event bus for publishing domain events:

```typescript
import { createEventBus, IEventBus, IntegrationEvent } from '@foundry/application'

const eventBus = createEventBus()

// Subscribe to specific event type
eventBus.subscribe('UserCreated', async (event: IntegrationEvent) => {
  console.log('User created:', event.payload)
})

// Subscribe to all events
eventBus.subscribeAll(async (event: IntegrationEvent) => {
  console.log('Event received:', event.eventType)
})

// Publish event
await eventBus.publish({
  eventType: 'UserCreated',
  aggregateType: 'User',
  aggregateId: 'user-123',
  payload: { userId: 'user-123' },
  correlationId: 'req-456',
  occurredAt: new Date()
})

// Clear subscriptions
eventBus.clear()
```

**Production Note:** For production, replace with RabbitMQ, Kafka, or AWS EventBridge.

### Application Errors

```typescript
import { ApplicationError, ErrorCode } from '@foundry/application'

// Error codes
ErrorCode.NOT_FOUND
ErrorCode.VALIDATION_FAILED
ErrorCode.CONFLICT
ErrorCode.UNAUTHORIZED
ErrorCode.FORBIDDEN
ErrorCode.FAILED

// Create errors
throw ApplicationError.notFound('User', 'user-123')
throw ApplicationError.validation('At least one field required')
throw ApplicationError.conflict('User with email already exists')
throw ApplicationError.unauthorized()
throw ApplicationError.forbidden('Cannot delete admin user')
throw ApplicationError.failed('External service unavailable')

// With metadata
throw ApplicationError.validation('Invalid input', {
  field: 'email',
  reason: 'Invalid format'
})
```

### Pagination

```typescript
interface PaginatedResult<T> {
  readonly items: T[]
  readonly total: number
  readonly page: number
  readonly limit: number
  readonly totalPages: number
  readonly hasNextPage: boolean
  readonly hasPreviousPage: boolean
}
```

## Usage Example

```typescript
import { User, FeatureFlag, createContext, createEventBus } from '@foundry/application'

// Setup
const eventBus = createEventBus()
const userRepo = new UserRepository()  // Your implementation
const flagRepo = new FeatureFlagRepository()

// Create context
const ctx = createContext({
  correlationId: 'req-123',
  userId: 'admin-user',
  permissions: ['user:manage']
})

// Create user command
const createUser = new User.CreateUserCommand(userRepo, eventBus)
const { userId } = await createUser.execute({
  fullName: 'John Doe',
  locale: 'en-US'
}, ctx)

// Query users
const listUsers = new User.ListUsersQuery(userRepo)
const users = await listUsers.execute({
  page: 1,
  limit: 10,
  status: 'ACTIVE'
})

// Evaluate feature flag
const evaluateFlag = new FeatureFlag.EvaluateFeatureFlagQuery(flagRepo, flagService)
const flagResult = await evaluateFlag.execute({
  flagKey: 'new-dashboard',
  context: {
    userId,
    attributes: { planType: 'premium' }
  }
})

if (flagResult.enabled) {
  // Show new dashboard
}
```

## Namespace Imports

The package exports bounded contexts as namespaces:

```typescript
import { User, FeatureFlag } from '@foundry/application'

// User context
new User.CreateUserCommand(repo, eventBus)
new User.ListUsersQuery(repo)
User.CreateUserSchema  // Zod schema

// FeatureFlag context
new FeatureFlag.CreateFeatureFlagCommand(repo, eventBus)
new FeatureFlag.EvaluateFeatureFlagQuery(repo, service)
```

## Testing

Commands and queries are designed for easy testing:

```typescript
import { User } from '@foundry/application'
import { createMockUserRepository } from './mocks'

describe('CreateUserCommand', () => {
  it('should create a user', async () => {
    const mockRepo = createMockUserRepository()
    const mockEventBus = createMockEventBus()
    const command = new User.CreateUserCommand(mockRepo, mockEventBus)

    const result = await command.execute({
      fullName: 'John Doe',
      locale: 'en-US'
    })

    expect(result.userId).toBeDefined()
    expect(mockRepo.create).toHaveBeenCalled()
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'UserCreated' })
    )
  })
})
```

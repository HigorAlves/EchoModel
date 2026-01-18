# Testing Package (@foundry/testing)

Testing utilities, in-memory repositories, and factories for the Foundry monorepo.

## Overview

| Property | Value |
|----------|-------|
| Package | `@foundry/testing` |
| Location | `kernel/testing` |
| Purpose | Test utilities, in-memory repositories, factories |
| Dependencies | `@foundry/domain`, `@foundry/logger` |
| Peer Dependencies | `hono`, `typeorm`, `vitest`, `@testcontainers/postgresql` |

## Package Structure

```
kernel/testing/src/
├── index.ts                    # Main exports
├── repositories/               # In-memory repository implementations
│   ├── InMemoryUserRepository.ts
│   ├── InMemoryAuthRepository.ts
│   └── InMemoryFeatureFlagRepository.ts
├── factories/                  # Test data factories
│   ├── UserFactory.ts
│   └── FeatureFlagFactory.ts
├── e2e/                        # E2E testing utilities
│   └── createE2ESetup.ts
├── hono/                       # Hono test utilities
│   └── index.ts
└── vitest/                     # Vitest setup utilities
    └── index.ts
```

## In-Memory Repositories

In-memory implementations of domain repository interfaces for unit testing.

### InMemoryUserRepository

```typescript
import { InMemoryUserRepository, UserFactory } from '@foundry/testing'

// Create repository
const repo = new InMemoryUserRepository()

// Create with initial data
const repo = new InMemoryUserRepository([user1, user2])

// CRUD operations
const user = UserFactory.create({ fullName: 'John Doe' })
await repo.create(user)
await repo.findById(user.id.value)
await repo.update(user)
await repo.remove(user.id.value)

// Query operations
await repo.findMany({ status: UserStatus.ACTIVE, limit: 10 })
await repo.findByStatus(UserStatus.ACTIVE)
await repo.findByExternalId('external-123')
await repo.count({ status: UserStatus.ACTIVE })
await repo.exists(user.id.value)

// Test utilities
repo.clear()          // Clear all data
repo.seed([user1])    // Seed with test data
repo.getAll()         // Get all users
repo.size             // Current count
```

### InMemoryAuthRepository

```typescript
import { InMemoryAuthRepository } from '@foundry/testing'

const repo = new InMemoryAuthRepository()

// Token operations
await repo.create(auth)
await repo.findByToken('refresh-token-string')
await repo.findByUserId('user-123')
await repo.revokeToken('token-id')
await repo.revokeAllUserTokens('user-id')
await repo.countActiveTokens('user-id')
await repo.deleteExpiredTokens()

// Test utilities
repo.clear()
```

### InMemoryFeatureFlagRepository

```typescript
import { InMemoryFeatureFlagRepository } from '@foundry/testing'

const repo = new InMemoryFeatureFlagRepository()

// Flag operations
await repo.create(flag)
await repo.findByKey('feature-key')
await repo.findMany({ status: FeatureFlagStatus.ACTIVE })

// Test utilities
repo.clear()
```

## Test Factories

Factories for creating domain entities with sensible defaults.

### UserFactory

```typescript
import { UserFactory } from '@foundry/testing'

// Create single user with defaults
const user = UserFactory.create()
// { fullName: 'Test User 1', locale: 'en-US', status: ACTIVE }

// Create with overrides
const user = UserFactory.create({
  fullName: 'John Doe',
  locale: 'pt-BR',
  status: UserStatus.INACTIVE
})

// Create multiple users
const users = UserFactory.createMany(5, { locale: 'en-GB' })

// Create with specific status
const activeUser = UserFactory.createActive({ fullName: 'Active User' })
const inactiveUser = UserFactory.createInactive({ fullName: 'Inactive User' })
const suspendedUser = UserFactory.createSuspended({ fullName: 'Suspended User' })

// Reset counter between test suites
UserFactory.reset()
```

### FeatureFlagFactory

```typescript
import { FeatureFlagFactory } from '@foundry/testing'

// Create flag with defaults
const flag = FeatureFlagFactory.create()

// Create with overrides
const flag = FeatureFlagFactory.create({
  key: 'my-feature',
  name: 'My Feature',
  enabled: true
})

// Create multiple flags
const flags = FeatureFlagFactory.createMany(3)
```

## E2E Testing

Utilities for setting up E2E tests with PostgreSQL testcontainers.

### createE2ESetup

Creates a standardized E2E test setup with PostgreSQL container:

```typescript
// testing/setup-e2e.ts
import 'reflect-metadata'
import { createE2ESetup } from '@foundry/testing'
import { TypeORMUserRepository, User as UserEntity } from '@foundry/database'
import type { IUserRepository } from '@foundry/domain'
import { initializeContainer, resetContainer } from '../di'

export const { getRepository, getDataSource, clearData } = createE2ESetup({
  // TypeORM entities to register
  entities: [UserEntity],

  // Factory to create repository from DataSource
  createRepository: (dataSource) =>
    new TypeORMUserRepository(dataSource.getRepository(UserEntity)),

  // DI container initialization
  initializeContainer: async ({ repository }) => {
    await initializeContainer({
      userRepository: repository as IUserRepository
    })
  },

  // DI container reset
  resetContainer,

  // Optional configuration
  containerStartupTimeout: 60000,  // Default: 60000ms
  cleanupTimeout: 30000,           // Default: 30000ms
  postgresImage: 'postgres:18-alpine'  // Default
})
```

Usage in tests:

```typescript
// user.e2e.test.ts
import { describe, it, expect } from 'vitest'
import { getRepository, clearData } from './testing/setup-e2e'

describe('User E2E', () => {
  it('should create and retrieve user', async () => {
    const repo = getRepository()

    const user = UserFactory.create({ fullName: 'E2E Test User' })
    const id = await repo.create(user)

    const found = await repo.findById(id)
    expect(found?.fullName.value).toBe('E2E Test User')
  })

  it('should handle multiple users', async () => {
    await clearData()  // Clear between tests if needed

    const repo = getRepository()
    // ... test code
  })
})
```

### E2ESetupConfig

```typescript
interface E2ESetupConfig<TRepository> {
  entities: EntityClass[]
  createRepository: (dataSource: DataSource) => TRepository
  initializeContainer: (options: { repository: TRepository }) => Promise<void>
  resetContainer: () => void
  containerStartupTimeout?: number  // Default: 60000
  cleanupTimeout?: number           // Default: 30000
  postgresImage?: string            // Default: 'postgres:18-alpine'
}
```

### E2ESetupResult

```typescript
interface E2ESetupResult<TRepository> {
  getRepository: () => TRepository
  getDataSource: () => DataSource
  clearData: () => Promise<void>
}
```

## Hono Test Utilities

Utilities for testing Hono-based Lambda handlers.

### createTestClient

```typescript
import { createTestClient, parseResponse } from '@foundry/testing'
import { app } from '../app'

const client = createTestClient(app)

// Make requests
const response = await client.get('/users')
const response = await client.post('/users', {
  json: { fullName: 'John Doe', locale: 'en-US' }
})

// Parse response
const { status, body } = await parseResponse(response)
expect(status).toBe(201)
expect(body.id).toBeDefined()
```

### makeRequest

```typescript
import { makeRequest } from '@foundry/testing'

const response = await makeRequest(app, {
  method: 'POST',
  path: '/users',
  body: { fullName: 'John Doe', locale: 'en-US' },
  headers: { 'Authorization': 'Bearer token' }
})
```

## Vitest Setup Utilities

Shared test configuration and setup utilities.

### createTestSetup

```typescript
import { createTestSetup } from '@foundry/testing'

const { beforeAll, afterAll, getContext } = createTestSetup({
  // Configuration options
})
```

## Usage Examples

### Unit Test with In-Memory Repository

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository, UserFactory } from '@foundry/testing'
import { CreateUserCommand } from '@foundry/application'

describe('CreateUserCommand', () => {
  let repo: InMemoryUserRepository

  beforeEach(() => {
    repo = new InMemoryUserRepository()
  })

  it('should create a user', async () => {
    const command = new CreateUserCommand(repo)

    const result = await command.execute({
      fullName: 'John Doe',
      locale: 'en-US'
    })

    expect(result.userId).toBeDefined()
    expect(repo.size).toBe(1)

    const user = await repo.findById(result.userId)
    expect(user?.fullName.value).toBe('John Doe')
  })
})
```

### Integration Test with Factory

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository, UserFactory } from '@foundry/testing'

describe('UserRepository', () => {
  let repo: InMemoryUserRepository

  beforeEach(() => {
    repo = new InMemoryUserRepository()
    UserFactory.reset()
  })

  it('should find users by status', async () => {
    // Seed data using factory
    const activeUsers = UserFactory.createMany(3, { status: UserStatus.ACTIVE })
    const inactiveUser = UserFactory.createInactive()

    repo.seed([...activeUsers, inactiveUser])

    const found = await repo.findByStatus(UserStatus.ACTIVE)

    expect(found).toHaveLength(3)
  })
})
```

### E2E Test with Real Database

```typescript
import { describe, it, expect } from 'vitest'
import { getRepository, getDataSource } from './testing/setup-e2e'
import { UserFactory } from '@foundry/testing'

describe('User Repository E2E', () => {
  it('should persist and retrieve user', async () => {
    const repo = getRepository()
    const user = UserFactory.create({ fullName: 'E2E User' })

    const id = await repo.create(user)
    const found = await repo.findById(id)

    expect(found).not.toBeNull()
    expect(found!.fullName.value).toBe('E2E User')
  })

  it('should query with filters', async () => {
    const repo = getRepository()
    const users = UserFactory.createMany(5)

    for (const user of users) {
      await repo.create(user)
    }

    const result = await repo.findMany({ limit: 3 })
    expect(result).toHaveLength(3)
  })
})
```

## Best Practices

1. **Reset factories between test suites** to ensure consistent IDs
2. **Use `clear()` between tests** when test isolation is needed
3. **Prefer in-memory repositories** for unit tests (fast, no I/O)
4. **Use E2E setup** for integration tests that need real database behavior
5. **Seed data explicitly** rather than relying on test order

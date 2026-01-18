# Testing Configuration (@foundry/vitest-config)

Shared Vitest configuration with coverage aggregation for the monorepo.

## Overview

| Property | Value |
|----------|-------|
| Package | `@foundry/vitest-config` |
| Location | `config/vitest-config` |
| Purpose | Test configuration and coverage |
| Dependencies | `vitest`, `@vitest/coverage-istanbul` |

## Available Configurations

### Base Configuration

Standard configuration for backend packages:

```typescript
// config/vitest-config/configs/base-config.ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export const baseConfig = defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    passWithNoTests: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['html', 'json', 'json-summary'],
      reportsDirectory: '../coverage.json',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/index.ts',
        'src/**/*.d.ts'
      ]
    }
  }
})
```

### UI Configuration

For React/frontend packages with DOM testing:

```typescript
// config/vitest-config/configs/ui-config.ts
import { mergeConfig } from 'vitest/config'
import { baseConfig } from './base-config'

export const uiConfig = mergeConfig(baseConfig, {
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true
  }
})
```

## Usage in Packages

### Backend Package

```typescript
// packages/domain/vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config'
import { baseConfig } from '@foundry/vitest-config'

export default mergeConfig(baseConfig, defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      reportsDirectory: './coverage'
    }
  }
}))
```

### Frontend Package

```typescript
// libs/ui/vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config'
import { uiConfig } from '@foundry/vitest-config'

export default mergeConfig(uiConfig, defineConfig({
  test: {
    include: ['src/**/*.test.tsx'],
    setupFiles: ['./src/test/setup.ts']
  }
}))
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Coverage Aggregation

The monorepo aggregates coverage from all packages:

### Workflow

```bash
# 1. Run tests in all packages
yarn test:unit

# 2. Collect coverage reports
yarn collect:reports

# 3. Merge into single report
yarn merge:reports

# 4. View aggregated report
yarn view:report

# Or run all steps
yarn coverage
```

### Turbo Tasks

```json
// config/vitest-config/turbo.json
{
  "tasks": {
    "collect-json-reports": {
      "cache": false,
      "outputs": ["coverage/raw/**"]
    },
    "merge-json-reports": {
      "dependsOn": ["collect-json-reports"],
      "outputs": ["coverage/merged/**"]
    },
    "report": {
      "dependsOn": ["merge-json-reports"],
      "outputs": ["coverage/report/**"]
    },
    "view-report": {
      "dependsOn": ["report"],
      "cache": false
    }
  }
}
```

### Coverage Output

```
coverage/
├── raw/                    # Individual package reports
│   ├── application/
│   ├── domain/
│   └── ...
├── merged/                 # Merged coverage data
│   └── coverage-final.json
└── report/                 # HTML report
    └── index.html
```

## Writing Tests

### Unit Test Example

```typescript
// src/User/User.entity.test.ts
import { describe, it, expect } from 'vitest'
import { User } from './User.entity'

describe('User', () => {
  describe('create', () => {
    it('should create a user with valid data', () => {
      const user = User.create({
        fullName: 'John Doe',
        locale: 'en-US'
      })

      expect(user.fullName.value).toBe('John Doe')
      expect(user.locale.value).toBe('en-US')
      expect(user.status).toBe('ACTIVE')
    })

    it('should throw for invalid full name', () => {
      expect(() => User.create({
        fullName: '',
        locale: 'en-US'
      })).toThrow()
    })
  })

  describe('update', () => {
    it('should update user properties', () => {
      const user = User.create({
        fullName: 'John Doe',
        locale: 'en-US'
      })

      const updated = user.update({
        fullName: 'Jane Doe'
      })

      expect(updated.fullName.value).toBe('Jane Doe')
      expect(updated.locale.value).toBe('en-US') // Unchanged
    })
  })
})
```

### Integration Test Example

```typescript
// src/User/CreateUser.command.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateUserCommand } from './CreateUser.command'

describe('CreateUserCommand', () => {
  let command: CreateUserCommand
  let mockRepo: MockUserRepository
  let mockEventBus: MockEventBus

  beforeEach(() => {
    mockRepo = createMockUserRepository()
    mockEventBus = createMockEventBus()
    command = new CreateUserCommand(mockRepo, mockEventBus)
  })

  it('should create user and publish event', async () => {
    mockRepo.create.mockResolvedValue('user-123')

    const result = await command.execute({
      fullName: 'John Doe',
      locale: 'en-US'
    })

    expect(result.userId).toBe('user-123')
    expect(mockRepo.create).toHaveBeenCalled()
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'UserCreated'
      })
    )
  })

  it('should validate input', async () => {
    await expect(command.execute({
      fullName: '',
      locale: 'en-US'
    })).rejects.toThrow()
  })
})
```

### Mock Factories

```typescript
// src/test/mocks/repository.mock.ts
import { vi } from 'vitest'
import type { IUserRepository } from '@foundry/domain'

export function createMockUserRepository(): IUserRepository {
  return {
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    findById: vi.fn(),
    findMany: vi.fn(),
    findOne: vi.fn(),
    findByStatus: vi.fn(),
    count: vi.fn(),
    exists: vi.fn()
  }
}
```

### Test Setup File

```typescript
// src/test/setup.ts
import 'reflect-metadata'
import { beforeAll, afterAll, afterEach } from 'vitest'

// Global setup
beforeAll(async () => {
  // Initialize test database, etc.
})

afterAll(async () => {
  // Cleanup
})

afterEach(() => {
  // Reset mocks between tests
  vi.clearAllMocks()
})
```

## Database Testing

For tests that need a real database:

```typescript
// src/test/database.ts
import { AppDataSource } from '@foundry/database'

export async function setupTestDatabase() {
  await AppDataSource.initialize()
  await AppDataSource.synchronize(true)
}

export async function teardownTestDatabase() {
  await AppDataSource.destroy()
}

export async function clearTestDatabase() {
  const entities = AppDataSource.entityMetadatas

  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name)
    await repository.clear()
  }
}
```

```typescript
// src/User/User.repository.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { setupTestDatabase, teardownTestDatabase, clearTestDatabase } from '../test/database'
import { UserRepository } from './User.repository'

describe('UserRepository', () => {
  let repository: UserRepository

  beforeAll(async () => {
    await setupTestDatabase()
    repository = new UserRepository()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
  })

  it('should create and find user', async () => {
    const user = User.create({ fullName: 'John', locale: 'en-US' })
    const id = await repository.create(user)

    const found = await repository.findById(id)
    expect(found?.fullName.value).toBe('John')
  })
})
```

## Best Practices

### 1. Test File Naming

```
src/
├── User/
│   ├── User.entity.ts
│   ├── User.entity.test.ts      # Unit tests
│   └── User.entity.spec.ts      # Alternative naming
```

### 2. Test Organization

```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should do expected behavior', () => {})
    it('should handle edge case', () => {})
    it('should throw for invalid input', () => {})
  })
})
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should create user', async () => {
  // Arrange
  const input = { fullName: 'John', locale: 'en-US' }
  mockRepo.create.mockResolvedValue('user-123')

  // Act
  const result = await command.execute(input)

  // Assert
  expect(result.userId).toBe('user-123')
})
```

### 4. Test Isolation

Each test should be independent:

```typescript
beforeEach(() => {
  vi.clearAllMocks()
  // Reset state
})
```

### 5. Coverage Thresholds

Configure minimum coverage in vitest.config.ts:

```typescript
export default defineConfig({
  test: {
    coverage: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
})
```

## Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run specific file
yarn test src/User/User.entity.test.ts

# Run with coverage
yarn test:coverage

# Run with UI
yarn test:ui

# Run only unit tests
yarn test:unit

# Run only e2e tests
yarn test:e2e
```

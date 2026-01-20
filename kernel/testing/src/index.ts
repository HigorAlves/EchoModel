/**
 * @foundry/testing
 *
 * Testing utilities for the Foundry monorepo.
 * Provides in-memory repositories and factories for unit and integration tests.
 *
 * @example
 * ```typescript
 * import { InMemoryUserRepository, UserFactory } from '@foundry/testing'
 *
 * // Create a test repository
 * const repository = new InMemoryUserRepository()
 *
 * // Create test data
 * const user = UserFactory.create({ fullName: 'John Doe' })
 * await repository.create(user)
 *
 * // Run your tests
 * const found = await repository.findById(user.id.value)
 * expect(found).toEqual(user)
 *
 * // Clean up between tests
 * repository.clear()
 * ```
 */

// E2E testing utilities
// export { createE2ESetup, type E2ESetupConfig, type E2ESetupResult } from './e2e'
// Factories
export { type CreateUserInput, UserFactory } from './factories'
// Hono test utilities
// export { createTestClient, makeRequest, parseResponse } from './hono'
// Repositories
export { InMemoryUserRepository } from './repositories'
// Vitest setup utilities
export { createTestSetup, type TestSetupConfig, type TestSetupResult } from './vitest'

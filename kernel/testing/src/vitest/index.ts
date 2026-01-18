/**
 * @fileoverview Vitest Test Setup Factory
 *
 * Provides a factory function to standardize test setup across Lambda projects.
 */

import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'

/**
 * Configuration for test setup
 */
export interface TestSetupConfig<TRepository, TContainerOptions> {
	/**
	 * Factory function to create a fresh repository instance
	 */
	createRepository: () => TRepository

	/**
	 * Function to build container options from the repository
	 */
	buildContainerOptions: (repository: TRepository) => TContainerOptions

	/**
	 * Function to initialize the DI container
	 */
	initializeContainer: (options: TContainerOptions) => Promise<void>

	/**
	 * Function to reset the DI container
	 */
	resetContainer: () => void
}

/**
 * Result returned by createTestSetup
 */
export interface TestSetupResult<TRepository> {
	/**
	 * Returns the current test repository instance.
	 * Must be called within test functions (after beforeEach has run).
	 */
	getRepository: () => TRepository

	/**
	 * A proxy to the repository that forwards all operations.
	 * This allows backwards compatibility with code that uses
	 * testRepository.method() directly instead of getRepository().method()
	 */
	repositoryProxy: TRepository
}

/**
 * Creates a standardized test setup for Lambda handler tests.
 *
 * Sets up beforeAll, beforeEach, afterEach, and afterAll hooks to:
 * - Set test environment variables
 * - Create fresh repository instances for each test
 * - Initialize and reset the DI container
 *
 * @example
 * ```typescript
 * // testing/setup.ts
 * import 'reflect-metadata'
 * import { createTestSetup, InMemoryUserRepository } from '@foundry/testing'
 * import { initializeContainer, resetContainer } from '@/di'
 *
 * const { getRepository, repositoryProxy } = createTestSetup({
 *   createRepository: () => new InMemoryUserRepository(),
 *   buildContainerOptions: (repo) => ({ userRepository: repo }),
 *   initializeContainer,
 *   resetContainer,
 * })
 *
 * // Export proxy for backwards compatibility
 * export { repositoryProxy as testRepository }
 * export { getRepository }
 * ```
 */
export function createTestSetup<TRepository extends object, TContainerOptions>(
	config: TestSetupConfig<TRepository, TContainerOptions>,
): TestSetupResult<TRepository> {
	const { createRepository, buildContainerOptions, initializeContainer, resetContainer } = config

	let repository: TRepository

	beforeAll(async () => {
		// Set test environment
		process.env.NODE_ENV = 'test'
		process.env.VITEST = 'true'
	})

	beforeEach(async () => {
		// Create fresh repository for each test
		repository = createRepository()

		// Build container options and initialize
		const options = buildContainerOptions(repository)
		await initializeContainer(options)
	})

	afterEach(() => {
		// Reset container after each test
		resetContainer()
	})

	afterAll(() => {
		// Final cleanup
		resetContainer()
	})

	// Create a proxy that forwards all operations to the current repository
	const repositoryProxy = new Proxy({} as TRepository, {
		get(_target, prop) {
			const value = repository[prop as keyof TRepository]
			// If it's a function, bind it to the repository
			if (typeof value === 'function') {
				return value.bind(repository)
			}
			return value
		},
		set(_target, prop, value) {
			;(repository as Record<string | symbol, unknown>)[prop] = value
			return true
		},
	})

	return {
		getRepository: () => repository,
		repositoryProxy,
	}
}

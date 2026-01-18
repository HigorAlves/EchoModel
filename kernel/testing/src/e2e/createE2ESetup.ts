/**
 * @fileoverview E2E Test Setup Factory
 *
 * Provides a reusable factory for creating E2E test environments with
 * PostgreSQL testcontainers and TypeORM.
 */

import { createLogger } from '@foundry/logger'
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { DataSource } from 'typeorm'
import type { EntitySchema } from 'typeorm/entity-schema/EntitySchema'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'

const logger = createLogger('E2ETestSetup')

/**
 * Entity type for TypeORM DataSource
 */
// biome-ignore lint/complexity/noBannedTypes: TypeORM requires Function type for entity classes
type EntityClass = Function | EntitySchema<unknown>

/**
 * Configuration for E2E test setup
 */
export interface E2ESetupConfig<TRepository> {
	/**
	 * Entity classes to register with TypeORM
	 */
	entities: EntityClass[]

	/**
	 * Factory to create repository from DataSource
	 */
	createRepository: (dataSource: DataSource) => TRepository

	/**
	 * DI container initialization function
	 */
	initializeContainer: (options: { repository: TRepository }) => Promise<void>

	/**
	 * DI container reset function
	 */
	resetContainer: () => void

	/**
	 * Optional: Custom container startup timeout (default: 60000ms)
	 */
	containerStartupTimeout?: number

	/**
	 * Optional: Custom cleanup timeout (default: 30000ms)
	 */
	cleanupTimeout?: number

	/**
	 * Optional: PostgreSQL image version (default: 'postgres:18-alpine')
	 */
	postgresImage?: string
}

/**
 * Result returned by createE2ESetup
 */
export interface E2ESetupResult<TRepository> {
	/**
	 * Returns the current test repository instance.
	 * Must be called within test functions (after beforeAll has run).
	 */
	getRepository: () => TRepository

	/**
	 * Returns the current DataSource instance.
	 * Must be called within test functions (after beforeAll has run).
	 */
	getDataSource: () => DataSource

	/**
	 * Clears all data from the specified entity tables.
	 * Useful for resetting state between tests.
	 */
	clearData: () => Promise<void>
}

/**
 * Creates a standardized E2E test setup with PostgreSQL testcontainers.
 *
 * Sets up beforeAll, beforeEach, afterEach, and afterAll hooks to:
 * - Start PostgreSQL container
 * - Initialize TypeORM DataSource
 * - Create repository instances
 * - Initialize and reset DI container
 * - Clean up resources after tests
 *
 * @example
 * ```typescript
 * // testing/setup-e2e.ts
 * import 'reflect-metadata'
 * import { createE2ESetup } from '@foundry/testing'
 * import { TypeORMUserRepository, User as UserEntity } from '@foundry/database'
 * import type { IUserRepository } from '@foundry/domain'
 * import { initializeContainer, resetContainer } from '@/di'
 *
 * export const { getRepository, getDataSource, clearData } = createE2ESetup({
 *   entities: [UserEntity],
 *   createRepository: (ds) => new TypeORMUserRepository(ds.getRepository(UserEntity)),
 *   initializeContainer: (opts) => initializeContainer({
 *     userRepository: opts.repository as unknown as IUserRepository
 *   }),
 *   resetContainer,
 * })
 * ```
 */
export function createE2ESetup<TRepository>(config: E2ESetupConfig<TRepository>): E2ESetupResult<TRepository> {
	const {
		entities,
		createRepository,
		initializeContainer,
		resetContainer,
		containerStartupTimeout = 60000,
		cleanupTimeout = 30000,
		postgresImage = 'postgres:18-alpine',
	} = config

	let container: StartedPostgreSqlContainer
	let dataSource: DataSource
	let repository: TRepository

	beforeAll(async () => {
		// Set test environment
		process.env.NODE_ENV = 'test'
		process.env.VITEST = 'true'

		logger.info('Starting PostgreSQL container for E2E tests...')

		// Start PostgreSQL container
		container = await new PostgreSqlContainer(postgresImage)
			.withDatabase('testdb')
			.withUsername('postgres')
			.withPassword('postgres')
			.withStartupTimeout(containerStartupTimeout)
			.start()

		logger.info(
			{
				host: container.getHost(),
				port: container.getPort(),
			},
			'PostgreSQL container started',
		)

		// Initialize TypeORM DataSource
		dataSource = new DataSource({
			type: 'postgres',
			host: container.getHost(),
			port: container.getPort(),
			username: container.getUsername(),
			password: container.getPassword(),
			database: container.getDatabase(),
			entities,
			synchronize: true,
			logging: false,
		})

		await dataSource.initialize()

		logger.info('TypeORM DataSource initialized')

		// Create repository adapter
		repository = createRepository(dataSource)

		// Initialize DI container with real repository
		await initializeContainer({ repository })

		logger.info('E2E test environment ready')
	}, containerStartupTimeout + 60000) // Extra buffer for container startup

	beforeEach(async () => {
		// Reinitialize container before each test to ensure clean state
		resetContainer()
		await initializeContainer({ repository })

		// Clear all data between tests
		for (const entity of entities) {
			await dataSource.getRepository(entity).clear()
		}
	})

	afterEach(() => {
		// Reset container after each test
		resetContainer()
	})

	afterAll(async () => {
		logger.info('Cleaning up E2E test environment...')

		// Reset DI container
		resetContainer()

		// Close DataSource
		if (dataSource?.isInitialized) {
			await dataSource.destroy()
		}

		// Stop container
		if (container) {
			await container.stop()
		}

		logger.info('E2E test environment cleaned up')
	}, cleanupTimeout)

	return {
		getRepository: () => repository,
		getDataSource: () => dataSource,
		clearData: async () => {
			for (const entity of entities) {
				await dataSource.getRepository(entity).clear()
			}
		},
	}
}

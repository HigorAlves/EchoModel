import type { User } from './User.entity'
import type { UserStatus } from './user.enum'

/**
 * @fileoverview User Repository Interface
 *
 * Repositories provide a collection-like interface for accessing domain objects.
 * They encapsulate the logic needed to access data sources and act as:
 * - An in-memory domain object collection
 * - A bridge between the domain and data mapping layers
 * - A more object-oriented view of the persistence layer
 *
 * Repositories should:
 * - Use domain language and concepts
 * - Provide query methods that express business rules
 * - Hide persistence technology details
 * - Return domain objects, not data structures
 * - Support unit testing through interfaces
 *
 * Note: This interface is synced with the database schema (infra/database)
 */

/**
 * Persistence representation of User
 * This represents how the entity is stored in the database
 */
export interface PersistenceUser {
	readonly id: string
	readonly fullName: string
	readonly locale: string
	readonly status: UserStatus
	readonly externalId: string | null
	readonly createdAt: Date
	readonly updatedAt: Date
	readonly deletedAt: Date | null
}

/**
 * Query filters for User searches
 */
export interface UserQueryFilters {
	readonly fullName?: string
	readonly status?: UserStatus
	readonly locale?: string
	readonly externalId?: string
	readonly includeDeleted?: boolean
	readonly limit?: number
	readonly offset?: number
	readonly sortBy?: string
	readonly sortOrder?: 'asc' | 'desc'
}

/**
 * User Repository Interface
 *
 * Defines the contract for accessing and persisting User entities.
 * This interface uses domain language and hides implementation details.
 */
export interface IUserRepository {
	/**
	 * Creates a new user and returns the generated ID
	 * @param user - The user entity to create
	 * @returns Promise with the created entity's ID
	 * @throws Error if creation fails
	 */
	create(user: User): Promise<string>

	/**
	 * Saves a user with a specific ID (create or replace)
	 * @param id - The ID to use for the entity
	 * @param user - The user entity to save
	 * @returns Promise that resolves when save is complete
	 * @throws Error if save fails
	 */
	save(id: string, user: User): Promise<void>

	/**
	 * Updates an existing user
	 * @param user - The user entity with updates
	 * @returns Promise that resolves when update is complete
	 * @throws Error if entity doesn't exist or update fails
	 */
	update(user: User): Promise<void>

	/**
	 * Removes a user by its ID
	 * @param id - The ID of the user to delete
	 * @returns Promise that resolves when deletion is complete
	 * @throws Error if entity doesn't exist or deletion fails
	 */
	remove(id: string): Promise<void>

	/**
	 * Finds a user by its ID
	 * @param id - The ID to search for
	 * @returns Promise with the user entity or null if not found
	 */
	findById(id: string): Promise<User | null>

	/**
	 * Finds all users that match the given criteria
	 * @param filters - Query filters to apply
	 * @returns Promise with array of matching user entities
	 */
	findMany(filters?: UserQueryFilters): Promise<User[]>

	/**
	 * Finds a single user that matches the given criteria
	 * @param filters - Query filters to apply
	 * @returns Promise with the first matching user or null
	 */
	findOne(filters: UserQueryFilters): Promise<User | null>

	/**
	 * Counts the number of users that match the given criteria
	 * @param filters - Query filters to apply
	 * @returns Promise with the count
	 */
	count(filters?: UserQueryFilters): Promise<number>

	/**
	 * Checks if a user exists with the given ID
	 * @param id - The ID to check
	 * @returns Promise with true if exists, false otherwise
	 */
	exists(id: string): Promise<boolean>

	/**
	 * Finds users by status
	 * @param status - The status to filter by
	 * @returns Promise with array of matching user entities
	 */
	findByStatus(status: UserStatus): Promise<User[]>

	/**
	 * Finds a user by their external ID (e.g., Firebase Auth UID)
	 * @param externalId - The external identity provider's user ID
	 * @returns Promise with the user entity or null if not found
	 */
	findByExternalId(externalId: string): Promise<User | null>
}

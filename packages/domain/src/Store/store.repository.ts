import type { Store } from './Store.entity'
import type { AspectRatio, StoreStatus } from './store.enum'

/**
 * @fileoverview Store Repository Interface
 *
 * Repositories provide a collection-like interface for accessing domain objects.
 */

/**
 * Store Settings interface
 * Represents the configurable settings for a store
 */
export interface StoreSettings {
	readonly defaultAspectRatio: AspectRatio
	readonly defaultImageCount: number
	readonly watermarkEnabled: boolean
}

/**
 * Persistence representation of Store
 * This represents how the entity is stored in the database
 */
export interface PersistenceStore {
	readonly id: string
	readonly ownerId: string
	readonly name: string
	readonly description: string | null
	readonly defaultStyle: string | null
	readonly logoAssetId: string | null
	readonly status: StoreStatus
	readonly settings: StoreSettings
	readonly createdAt: Date
	readonly updatedAt: Date
	readonly deletedAt: Date | null
}

/**
 * Query filters for Store searches
 */
export interface StoreQueryFilters {
	readonly ownerId?: string
	readonly name?: string
	readonly status?: StoreStatus
	readonly includeDeleted?: boolean
	readonly limit?: number
	readonly offset?: number
	readonly sortBy?: string
	readonly sortOrder?: 'asc' | 'desc'
}

/**
 * Store Repository Interface
 *
 * Defines the contract for accessing and persisting Store entities.
 */
export interface IStoreRepository {
	/**
	 * Creates a new store and returns the generated ID
	 * @param store - The store entity to create
	 * @returns Promise with the created entity's ID
	 * @throws Error if creation fails
	 */
	create(store: Store): Promise<string>

	/**
	 * Saves a store with a specific ID (create or replace)
	 * @param id - The ID to use for the entity
	 * @param store - The store entity to save
	 * @returns Promise that resolves when save is complete
	 * @throws Error if save fails
	 */
	save(id: string, store: Store): Promise<void>

	/**
	 * Updates an existing store
	 * @param store - The store entity with updates
	 * @returns Promise that resolves when update is complete
	 * @throws Error if entity doesn't exist or update fails
	 */
	update(store: Store): Promise<void>

	/**
	 * Removes a store by its ID
	 * @param id - The ID of the store to delete
	 * @returns Promise that resolves when deletion is complete
	 * @throws Error if entity doesn't exist or deletion fails
	 */
	remove(id: string): Promise<void>

	/**
	 * Finds a store by its ID
	 * @param id - The ID to search for
	 * @returns Promise with the store entity or null if not found
	 */
	findById(id: string): Promise<Store | null>

	/**
	 * Finds all stores that match the given criteria
	 * @param filters - Query filters to apply
	 * @returns Promise with array of matching store entities
	 */
	findMany(filters?: StoreQueryFilters): Promise<Store[]>

	/**
	 * Finds a single store that matches the given criteria
	 * @param filters - Query filters to apply
	 * @returns Promise with the first matching store or null
	 */
	findOne(filters: StoreQueryFilters): Promise<Store | null>

	/**
	 * Counts the number of stores that match the given criteria
	 * @param filters - Query filters to apply
	 * @returns Promise with the count
	 */
	count(filters?: StoreQueryFilters): Promise<number>

	/**
	 * Checks if a store exists with the given ID
	 * @param id - The ID to check
	 * @returns Promise with true if exists, false otherwise
	 */
	exists(id: string): Promise<boolean>

	/**
	 * Finds stores by owner ID
	 * @param ownerId - The owner's user ID (Firebase Auth UID)
	 * @returns Promise with array of matching store entities
	 */
	findByOwnerId(ownerId: string): Promise<Store[]>

	/**
	 * Finds stores by status
	 * @param status - The status to filter by
	 * @returns Promise with array of matching store entities
	 */
	findByStatus(status: StoreStatus): Promise<Store[]>
}

import type { Model } from './Model.entity'
import type { AgeRange, BodyType, Ethnicity, Gender, ModelStatus } from './model.enum'

/**
 * @fileoverview Model Repository Interface
 *
 * Repository interface for the Model (AI Influencer) bounded context.
 */

/**
 * Persistence representation of Model
 */
export interface PersistenceModel {
	readonly id: string
	readonly storeId: string
	readonly name: string
	readonly description: string | null
	readonly status: ModelStatus
	readonly gender: Gender
	readonly ageRange: AgeRange
	readonly ethnicity: Ethnicity
	readonly bodyType: BodyType
	readonly prompt: string | null
	readonly referenceImages: string[]
	readonly calibrationImages: string[]
	readonly lockedIdentityUrl: string | null
	readonly failureReason: string | null
	readonly createdAt: Date
	readonly updatedAt: Date
	readonly deletedAt: Date | null
}

/**
 * Query filters for Model searches
 */
export interface ModelQueryFilters {
	readonly storeId?: string
	readonly name?: string
	readonly status?: ModelStatus
	readonly gender?: Gender
	readonly ageRange?: AgeRange
	readonly ethnicity?: Ethnicity
	readonly bodyType?: BodyType
	readonly includeDeleted?: boolean
	readonly includeArchived?: boolean
	readonly limit?: number
	readonly offset?: number
	readonly sortBy?: string
	readonly sortOrder?: 'asc' | 'desc'
}

/**
 * Model Repository Interface
 */
export interface IModelRepository {
	/**
	 * Creates a new model and returns the generated ID
	 */
	create(model: Model): Promise<string>

	/**
	 * Saves a model with a specific ID
	 */
	save(id: string, model: Model): Promise<void>

	/**
	 * Updates an existing model
	 */
	update(model: Model): Promise<void>

	/**
	 * Removes a model by its ID
	 */
	remove(id: string): Promise<void>

	/**
	 * Finds a model by its ID
	 */
	findById(id: string): Promise<Model | null>

	/**
	 * Finds all models that match the given criteria
	 */
	findMany(filters?: ModelQueryFilters): Promise<Model[]>

	/**
	 * Finds a single model that matches the given criteria
	 */
	findOne(filters: ModelQueryFilters): Promise<Model | null>

	/**
	 * Counts the number of models that match the given criteria
	 */
	count(filters?: ModelQueryFilters): Promise<number>

	/**
	 * Checks if a model exists with the given ID
	 */
	exists(id: string): Promise<boolean>

	/**
	 * Finds models by store ID
	 */
	findByStoreId(storeId: string, filters?: Omit<ModelQueryFilters, 'storeId'>): Promise<Model[]>

	/**
	 * Finds models by status
	 */
	findByStatus(storeId: string, status: ModelStatus): Promise<Model[]>

	/**
	 * Finds active models for a store
	 */
	findActiveByStoreId(storeId: string): Promise<Model[]>
}

import type { CameraFraming, LightingPreset } from '../Model/model.enum'
import type { AspectRatio } from '../Store/store.enum'
import type { Generation } from './Generation.entity'
import type { GenerationStatus } from './generation.enum'

/**
 * @fileoverview Generation Repository Interface
 *
 * Repository interface for the Generation bounded context.
 */

/**
 * Generated Image interface
 */
export interface GeneratedImage {
	readonly id: string
	readonly assetId: string
	readonly aspectRatio: AspectRatio
	readonly url: string | null
	readonly thumbnailUrl: string | null
	readonly createdAt: Date
}

/**
 * Generation Metadata interface
 */
export interface GenerationMetadata {
	readonly processingTimeMs?: number
	readonly aiModelVersion?: string
	readonly requestedAt?: Date
}

/**
 * Fashion configuration override for persistence
 */
export interface PersistenceFashionConfigOverride {
	readonly lightingPreset?: LightingPreset
	readonly cameraFraming?: CameraFraming
	readonly texturePreferences?: string[]
}

/**
 * Persistence representation of Generation
 */
export interface PersistenceGeneration {
	readonly id: string
	readonly storeId: string
	readonly modelId: string
	readonly status: GenerationStatus
	readonly idempotencyKey: string
	readonly garmentAssetId: string
	readonly scenePrompt: string
	readonly aspectRatios: AspectRatio[]
	readonly imageCount: number
	readonly generatedImages: GeneratedImage[]
	readonly startedAt: Date | null
	readonly completedAt: Date | null
	readonly failureReason: string | null
	readonly metadata: GenerationMetadata
	/** Fashion config override for this generation (null if using model defaults) */
	readonly fashionConfigOverride: PersistenceFashionConfigOverride | null
	readonly createdAt: Date
	readonly updatedAt: Date
}

/**
 * Query filters for Generation searches
 */
export interface GenerationQueryFilters {
	readonly storeId?: string
	readonly modelId?: string
	readonly status?: GenerationStatus
	readonly idempotencyKey?: string
	readonly limit?: number
	readonly offset?: number
	readonly sortBy?: string
	readonly sortOrder?: 'asc' | 'desc'
}

/**
 * Generation Repository Interface
 */
export interface IGenerationRepository {
	/**
	 * Creates a new generation and returns the generated ID
	 */
	create(generation: Generation): Promise<string>

	/**
	 * Saves a generation with a specific ID
	 */
	save(id: string, generation: Generation): Promise<void>

	/**
	 * Updates an existing generation
	 */
	update(generation: Generation): Promise<void>

	/**
	 * Finds a generation by its ID
	 */
	findById(id: string): Promise<Generation | null>

	/**
	 * Finds all generations that match the given criteria
	 */
	findMany(filters?: GenerationQueryFilters): Promise<Generation[]>

	/**
	 * Finds a single generation that matches the given criteria
	 */
	findOne(filters: GenerationQueryFilters): Promise<Generation | null>

	/**
	 * Counts the number of generations that match the given criteria
	 */
	count(filters?: GenerationQueryFilters): Promise<number>

	/**
	 * Checks if a generation exists with the given ID
	 */
	exists(id: string): Promise<boolean>

	/**
	 * Finds generations by store ID
	 */
	findByStoreId(storeId: string, filters?: Omit<GenerationQueryFilters, 'storeId'>): Promise<Generation[]>

	/**
	 * Finds generations by model ID
	 */
	findByModelId(modelId: string, filters?: Omit<GenerationQueryFilters, 'modelId'>): Promise<Generation[]>

	/**
	 * Finds a generation by idempotency key
	 * Used for idempotent request handling
	 */
	findByIdempotencyKey(idempotencyKey: string): Promise<Generation | null>

	/**
	 * Finds pending generations (for processing queue)
	 */
	findPending(limit?: number): Promise<Generation[]>
}

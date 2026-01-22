import type { Model } from './Model.entity'
import type {
	AgeRange,
	BackgroundType,
	BodyType,
	CameraFraming,
	Ethnicity,
	Expression,
	Gender,
	LightingPreset,
	ModelStatus,
	PoseStyle,
	PostProcessingStyle,
	ProductCategory,
} from './model.enum'
import type { CustomCameraSettings } from './value-objects/ModelCameraConfig.vo'
import type { CustomLightingSettings } from './value-objects/ModelLightingConfig.vo'

/**
 * @fileoverview Model Repository Interface
 *
 * Repository interface for the Model (AI Influencer) bounded context.
 */

/**
 * Persistence representation of lighting configuration
 */
export interface PersistenceLightingConfig {
	readonly preset: LightingPreset
	readonly customSettings?: CustomLightingSettings
}

/**
 * Persistence representation of camera configuration
 */
export interface PersistenceCameraConfig {
	readonly framing: CameraFraming
	readonly customSettings?: CustomCameraSettings
}

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
	// Seedream 4.5 Fashion configuration
	readonly lightingConfig: PersistenceLightingConfig
	readonly cameraConfig: PersistenceCameraConfig
	readonly backgroundType: BackgroundType
	readonly poseStyle: PoseStyle
	readonly expression: Expression
	readonly postProcessingStyle: PostProcessingStyle
	readonly texturePreferences: string[]
	readonly productCategories: ProductCategory[]
	readonly supportOutfitSwapping: boolean
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
	// Seedream 4.5 Fashion filters
	readonly lightingPreset?: LightingPreset
	readonly cameraFraming?: CameraFraming
	readonly backgroundType?: BackgroundType
	readonly poseStyle?: PoseStyle
	readonly expression?: Expression
	readonly postProcessingStyle?: PostProcessingStyle
	readonly productCategory?: ProductCategory
	readonly supportsOutfitSwapping?: boolean
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

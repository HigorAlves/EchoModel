/**
 * @fileoverview Model Firestore Operations
 *
 * Types and functions for the Model bounded context.
 */

import {
	Collections,
	collection,
	convertDocument,
	db,
	doc,
	getDoc,
	limit,
	onSnapshot,
	orderBy,
	query,
	setDoc,
	where,
	type QueryConstraint,
	type Unsubscribe,
} from './client'

// ==================== Fashion Configuration Types ====================

export type LightingPreset =
	| 'SOFT_STUDIO'
	| 'EDITORIAL_CONTRAST'
	| 'NATURAL_DAYLIGHT'
	| 'RING_LIGHT'
	| 'GOLDEN_HOUR'
	| 'DRAMATIC_SHADOW'
	| 'BUTTERFLY'
	| 'REMBRANDT'
	| 'CUSTOM'

export type CameraFraming =
	| 'WAIST_UP_50MM'
	| 'FULL_BODY_35MM'
	| 'PORTRAIT_85MM'
	| 'CLOSE_UP'
	| 'THREE_QUARTER'
	| 'BACK_VIEW'
	| 'KNEE_UP'
	| 'CUSTOM'

export type BackgroundType =
	| 'STUDIO_WHITE'
	| 'STUDIO_GRAY'
	| 'GRADIENT'
	| 'OUTDOOR_URBAN'
	| 'OUTDOOR_NATURE'
	| 'TRANSPARENT'

export type PoseStyle = 'STATIC_FRONT' | 'STATIC_SIDE' | 'WALKING' | 'EDITORIAL' | 'CASUAL' | 'DYNAMIC'

export type Expression = 'NEUTRAL' | 'SMILE' | 'SERIOUS' | 'CONFIDENT' | 'SOFT'

export type PostProcessingStyle = 'NATURAL' | 'VIBRANT' | 'MUTED' | 'HIGH_CONTRAST' | 'WARM' | 'COOL'

export type ProductCategory =
	| 'TOPS'
	| 'BOTTOMS'
	| 'DRESSES'
	| 'OUTERWEAR'
	| 'ACCESSORIES'
	| 'FOOTWEAR'
	| 'SWIMWEAR'
	| 'ACTIVEWEAR'
	| 'FORMAL'
	| 'JEWELRY'

export interface CustomLightingSettings {
	intensity: number
	warmth: number
	contrast: number
}

export interface CustomCameraSettings {
	focalLength: number
	cropRatio: string
	angle: string
}

export interface ModelLightingConfig {
	preset: LightingPreset
	customSettings?: CustomLightingSettings
}

export interface ModelCameraConfig {
	framing: CameraFraming
	customSettings?: CustomCameraSettings
}

// ==================== Model Document Type ====================

export interface ModelDocument {
	id: string
	storeId: string
	name: string
	description: string | null
	status: 'DRAFT' | 'CALIBRATING' | 'ACTIVE' | 'FAILED' | 'ARCHIVED'
	gender: 'FEMALE' | 'MALE' | 'NON_BINARY'
	ageRange: 'YOUNG_ADULT' | 'ADULT' | 'MIDDLE_AGED' | 'MATURE'
	ethnicity: string
	bodyType: string
	prompt: string | null
	referenceImages: string[]
	calibrationImages: string[]
	generatedImages: string[]
	lockedIdentityUrl: string | null
	failureReason: string | null
	// Fashion configuration
	lightingConfig?: ModelLightingConfig
	cameraConfig?: ModelCameraConfig
	backgroundType?: BackgroundType
	poseStyle?: PoseStyle
	expression?: Expression
	postProcessingStyle?: PostProcessingStyle
	texturePreferences?: string[]
	productCategories?: ProductCategory[]
	supportOutfitSwapping?: boolean
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

// ==================== Create Model Types ====================

export interface CreateModelInput {
	id?: string
	storeId: string
	name: string
	description?: string
	gender: 'FEMALE' | 'MALE' | 'NON_BINARY'
	ageRange: 'YOUNG_ADULT' | 'ADULT' | 'MIDDLE_AGED' | 'MATURE'
	ethnicity: string
	bodyType: string
	prompt?: string
	referenceImageIds?: string[]
	lightingPreset?: LightingPreset
	customLightingSettings?: CustomLightingSettings
	cameraFraming?: CameraFraming
	customCameraSettings?: CustomCameraSettings
	backgroundType?: BackgroundType
	poseStyle?: PoseStyle
	expression?: Expression
	postProcessingStyle?: PostProcessingStyle
	texturePreferences?: string[]
	productCategories?: ProductCategory[]
	supportOutfitSwapping?: boolean
}

// ==================== Query Functions ====================

/**
 * Subscribe to models for a store
 */
export function subscribeToModels(
	storeId: string,
	callback: (models: ModelDocument[]) => void,
	options?: {
		includeArchived?: boolean
		includeDeleted?: boolean
		status?: ModelDocument['status']
		limitCount?: number
	},
): Unsubscribe {
	const constraints: QueryConstraint[] = [where('storeId', '==', storeId)]

	if (!options?.includeDeleted) {
		constraints.push(where('deletedAt', '==', null))
	}

	if (!options?.includeArchived) {
		constraints.push(where('status', '!=', 'ARCHIVED'))
	}

	if (options?.status) {
		constraints.push(where('status', '==', options.status))
	}

	constraints.push(orderBy('createdAt', 'desc'))

	if (options?.limitCount) {
		constraints.push(limit(options.limitCount))
	}

	const q = query(collection(db, Collections.MODELS), ...constraints)

	return onSnapshot(q, (snapshot) => {
		const models = snapshot.docs.map((doc) => convertDocument<ModelDocument>(doc.id, doc.data()))
		callback(models)
	})
}

/**
 * Get a single model by ID
 */
export async function getModel(modelId: string): Promise<ModelDocument | null> {
	const docRef = doc(db, Collections.MODELS, modelId)
	const snapshot = await getDoc(docRef)

	if (!snapshot.exists()) {
		return null
	}

	return convertDocument<ModelDocument>(snapshot.id, snapshot.data())
}

// ==================== Write Functions ====================

/**
 * Create a new model
 */
export async function createModel(input: CreateModelInput): Promise<{ modelId: string }> {
	const modelId = input.id ?? crypto.randomUUID()
	const now = new Date()

	// Build lighting config
	const lightingConfig: ModelLightingConfig = {
		preset: input.lightingPreset ?? 'SOFT_STUDIO',
		...(input.customLightingSettings && { customSettings: input.customLightingSettings }),
	}

	// Build camera config
	const cameraConfig: ModelCameraConfig = {
		framing: input.cameraFraming ?? 'WAIST_UP_50MM',
		...(input.customCameraSettings && { customSettings: input.customCameraSettings }),
	}

	const modelData: Record<string, unknown> = {
		id: modelId,
		storeId: input.storeId,
		name: input.name,
		description: input.description ?? null,
		status: 'CALIBRATING',
		gender: input.gender,
		ageRange: input.ageRange,
		ethnicity: input.ethnicity,
		bodyType: input.bodyType,
		prompt: input.prompt ?? null,
		referenceImages: input.referenceImageIds ?? [],
		calibrationImages: [],
		generatedImages: [],
		lockedIdentityUrl: null,
		failureReason: null,
		// Fashion configuration
		lightingConfig,
		cameraConfig,
		backgroundType: input.backgroundType ?? 'STUDIO_WHITE',
		poseStyle: input.poseStyle ?? 'STATIC_FRONT',
		expression: input.expression ?? 'NEUTRAL',
		postProcessingStyle: input.postProcessingStyle ?? 'NATURAL',
		texturePreferences: input.texturePreferences ?? [],
		productCategories: input.productCategories ?? [],
		supportOutfitSwapping: input.supportOutfitSwapping ?? true,
		createdAt: now,
		updatedAt: now,
		deletedAt: null,
	}

	const docRef = doc(db, Collections.MODELS, modelId)
	await setDoc(docRef, modelData)

	return { modelId }
}

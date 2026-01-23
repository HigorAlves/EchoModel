/**
 * @fileoverview Firestore Client
 *
 * Provides Firestore database access for real-time data fetching and writes.
 */

import {
	collection,
	connectFirestoreEmulator,
	type DocumentData,
	doc,
	getDoc,
	getFirestore,
	limit,
	onSnapshot,
	orderBy,
	type QueryConstraint,
	query,
	serverTimestamp,
	setDoc,
	type Unsubscribe,
	updateDoc,
	where,
} from 'firebase/firestore'
import { app } from './config'

// Initialize Firestore
const db = getFirestore(app)

// Connect to emulator in development
if (
	typeof window !== 'undefined' &&
	(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_EMULATOR === 'true')
) {
	try {
		connectFirestoreEmulator(db, 'localhost', 8080)
	} catch {
		// Emulator might already be connected
	}
}

// Collection names
export const Collections = {
	STORES: 'stores',
	MODELS: 'models',
	ASSETS: 'assets',
} as const

// ==================== Type Definitions ====================

// Fashion configuration types
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

export interface AssetDocument {
	id: string
	storeId: string
	type: 'IMAGE'
	category: 'MODEL_REFERENCE' | 'GARMENT' | 'GENERATED' | 'CALIBRATION' | 'STORE_LOGO'
	filename: string
	mimeType: string
	sizeBytes: number
	storagePath: string
	cdnUrl: string | null
	thumbnailUrl: string | null
	metadata: Record<string, unknown>
	uploadedBy: string
	status: 'PENDING_UPLOAD' | 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED'
	failureReason: string | null
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export interface StoreDocument {
	id: string
	ownerId: string
	name: string
	description: string | null
	defaultStyle: string | null
	logoAssetId: string | null
	status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
	settings: {
		defaultAspectRatio: string
		defaultImageCount: number
		watermarkEnabled: boolean
	}
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

// ==================== Helper Functions ====================

/**
 * Convert Firestore timestamp to Date
 */
function toDate(value: unknown): Date | null {
	if (!value) return null
	if (value instanceof Date) return value
	if (typeof value === 'object' && 'toDate' in value && typeof (value as any).toDate === 'function') {
		return (value as any).toDate()
	}
	return null
}

/**
 * Convert document data to typed document
 */
function convertDocument<T>(id: string, data: DocumentData): T {
	const result = { id, ...data } as Record<string, unknown>

	// Convert timestamp fields
	const timestampFields = ['createdAt', 'updatedAt', 'deletedAt', 'startedAt', 'completedAt']
	for (const field of timestampFields) {
		if (result[field]) {
			result[field] = toDate(result[field])
		}
	}

	return result as T
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

/**
 * Subscribe to assets for a store
 */
export function subscribeToAssets(
	storeId: string,
	callback: (assets: AssetDocument[]) => void,
	options?: {
		category?: AssetDocument['category']
		status?: AssetDocument['status']
		includeDeleted?: boolean
		limitCount?: number
	},
): Unsubscribe {
	const constraints: QueryConstraint[] = [where('storeId', '==', storeId)]

	if (!options?.includeDeleted) {
		constraints.push(where('deletedAt', '==', null))
	}

	if (options?.category) {
		constraints.push(where('category', '==', options.category))
	}

	if (options?.status) {
		constraints.push(where('status', '==', options.status))
	}

	constraints.push(orderBy('createdAt', 'desc'))

	if (options?.limitCount) {
		constraints.push(limit(options.limitCount))
	}

	const q = query(collection(db, Collections.ASSETS), ...constraints)

	return onSnapshot(q, (snapshot) => {
		const assets = snapshot.docs.map((doc) => convertDocument<AssetDocument>(doc.id, doc.data()))
		callback(assets)
	})
}

/**
 * Get a single asset by ID
 */
export async function getAsset(assetId: string): Promise<AssetDocument | null> {
	const docRef = doc(db, Collections.ASSETS, assetId)
	const snapshot = await getDoc(docRef)

	if (!snapshot.exists()) {
		return null
	}

	return convertDocument<AssetDocument>(snapshot.id, snapshot.data())
}

/**
 * Subscribe to stores for a user
 */
export function subscribeToStores(ownerId: string, callback: (stores: StoreDocument[]) => void): Unsubscribe {
	const q = query(
		collection(db, Collections.STORES),
		where('ownerId', '==', ownerId),
		where('deletedAt', '==', null),
		orderBy('createdAt', 'desc'),
	)

	return onSnapshot(q, (snapshot) => {
		const stores = snapshot.docs.map((doc) => convertDocument<StoreDocument>(doc.id, doc.data()))
		callback(stores)
	})
}

/**
 * Get a single store by ID
 */
export async function getStoreById(storeId: string): Promise<StoreDocument | null> {
	const docRef = doc(db, Collections.STORES, storeId)
	const snapshot = await getDoc(docRef)

	if (!snapshot.exists()) {
		return null
	}

	return convertDocument<StoreDocument>(snapshot.id, snapshot.data())
}

/**
 * Subscribe to a single store for real-time updates
 */
export function subscribeToStore(storeId: string, callback: (store: StoreDocument | null) => void): Unsubscribe {
	const docRef = doc(db, Collections.STORES, storeId)

	return onSnapshot(docRef, (snapshot) => {
		if (!snapshot.exists()) {
			callback(null)
			return
		}
		callback(convertDocument<StoreDocument>(snapshot.id, snapshot.data()))
	})
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
		status: 'DRAFT',
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

// ==================== Create Store Types ====================

export interface CreateStoreInput {
	name: string
	description?: string
	defaultStyle?: string
	ownerId: string
}

/**
 * Create a new store
 */
export async function createStore(input: CreateStoreInput): Promise<{ storeId: string }> {
	const storeId = crypto.randomUUID()
	const now = new Date()

	const storeData: Record<string, unknown> = {
		id: storeId,
		ownerId: input.ownerId,
		name: input.name,
		description: input.description ?? null,
		defaultStyle: input.defaultStyle ?? null,
		logoAssetId: null,
		status: 'ACTIVE',
		settings: {
			defaultAspectRatio: '1:1',
			defaultImageCount: 4,
			watermarkEnabled: false,
		},
		createdAt: now,
		updatedAt: now,
		deletedAt: null,
	}

	const docRef = doc(db, Collections.STORES, storeId)
	await setDoc(docRef, storeData)

	return { storeId }
}

/**
 * Update store basic information
 */
export async function updateStoreInfo(
	storeId: string,
	data: {
		name?: string
		description?: string | null
		defaultStyle?: string | null
	},
): Promise<void> {
	const docRef = doc(db, Collections.STORES, storeId)
	await updateDoc(docRef, {
		...data,
		updatedAt: serverTimestamp(),
	})
}

/**
 * Update store settings
 */
export async function updateStoreSettingsFirestore(
	storeId: string,
	settings: {
		defaultAspectRatio?: string
		defaultImageCount?: number
		watermarkEnabled?: boolean
	},
): Promise<void> {
	const docRef = doc(db, Collections.STORES, storeId)

	// Build the update object with dot notation for nested fields
	const updates: Record<string, unknown> = {
		updatedAt: serverTimestamp(),
	}

	if (settings.defaultAspectRatio !== undefined) {
		updates['settings.defaultAspectRatio'] = settings.defaultAspectRatio
	}
	if (settings.defaultImageCount !== undefined) {
		updates['settings.defaultImageCount'] = settings.defaultImageCount
	}
	if (settings.watermarkEnabled !== undefined) {
		updates['settings.watermarkEnabled'] = settings.watermarkEnabled
	}

	await updateDoc(docRef, updates)
}

export { db }

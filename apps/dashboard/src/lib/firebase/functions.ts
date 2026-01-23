/**
 * @fileoverview Firebase Functions Client
 *
 * Provides typed callable functions for Cloud Functions integration.
 */

import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './config'

// Initialize Firebase Functions
const functions = getFunctions(app)

// Connect to emulator in development (must be called before any function calls)
// This works on both server and client side in Next.js
if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
	try {
		connectFunctionsEmulator(functions, 'localhost', 5001)
		if (typeof window !== 'undefined') {
			console.log('[Firebase Functions] Connected to emulator at localhost:5001')
		}
	} catch (error) {
		// Ignore if already connected
		const errorMessage = error instanceof Error ? error.message : String(error)
		if (typeof window !== 'undefined' && !errorMessage.includes('already been called')) {
			console.error('[Firebase Functions] Failed to connect to emulator:', error)
		}
	}
}

// ==================== Type Definitions ====================

// Fashion configuration types (expanded)
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

// Model types
export interface CreateModelInput {
	id?: string // Pre-generated modelId from client
	storeId: string
	name: string
	description?: string
	gender: 'FEMALE' | 'MALE' | 'NON_BINARY'
	ageRange: 'YOUNG_ADULT' | 'ADULT' | 'MIDDLE_AGED' | 'MATURE'
	ethnicity: 'ASIAN' | 'BLACK' | 'CAUCASIAN' | 'HISPANIC' | 'MIDDLE_EASTERN' | 'MIXED' | 'SOUTH_ASIAN'
	bodyType: 'SLIM' | 'ATHLETIC' | 'AVERAGE' | 'CURVY' | 'PLUS_SIZE'
	prompt?: string
	referenceImageIds?: string[]
	// Seedream 4.5 Fashion configuration (expanded)
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

export interface CreateModelResult {
	success: boolean
	modelId: string
	status: string
}

export interface StartCalibrationInput {
	modelId: string
	storeId: string
}

export interface StartCalibrationResult {
	success: boolean
	modelId: string
	calibrationImages?: Array<{
		id: string
		url: string
		thumbnailUrl?: string
	}>
	lockedIdentityUrl?: string
	error?: string
}

export interface ApproveCalibrationInput {
	modelId: string
	storeId: string
	selectedImageIds: string[]
}

export interface ApproveCalibrationResult {
	success: boolean
	modelId: string
	status: string
	lockedIdentityUrl: string
}

// Generation types
export interface CreateGenerationInput {
	storeId: string
	modelId: string
	garmentAssetId: string
	scenePrompt: string
	aspectRatios: Array<'4:5' | '9:16' | '1:1' | '16:9'>
	imageCount: number
	idempotencyKey?: string
}

export interface CreateGenerationResult {
	success: boolean
	generationId: string
	status: string
	isExisting: boolean
}

export interface ProcessGenerationInput {
	generationId: string
}

export interface ProcessGenerationResult {
	success: boolean
	generationId: string
	status: string
	images?: Array<{
		id: string
		assetId: string
		aspectRatio: string
		url: string | null
		thumbnailUrl: string | null
	}>
}

// Asset types
export interface RequestUploadUrlInput {
	storeId: string
	category: 'MODEL_REFERENCE' | 'GARMENT' | 'GENERATED' | 'CALIBRATION' | 'STORE_LOGO'
	filename: string
	mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
	sizeBytes: number
	uploadedBy: string
	metadata?: Record<string, unknown>
}

export interface RequestUploadUrlResult {
	success: boolean
	assetId: string
	uploadUrl: string
	headers?: Record<string, string>
	expiresAt: string
	storagePath: string
}

export interface ConfirmUploadInput {
	assetId: string
	storeId: string
}

export interface ConfirmUploadResult {
	success: boolean
	assetId: string
	status: string
	cdnUrl?: string
}

export interface GetDownloadUrlInput {
	assetId: string
	storeId: string
}

export interface GetDownloadUrlResult {
	success: boolean
	assetId: string
	downloadUrl: string
	expiresInSeconds: number
}

// Store types
export interface CreateStoreInput {
	name: string
	description?: string
	defaultStyle?: string
	ownerId: string
}

export interface CreateStoreResult {
	success: boolean
	storeId: string
	status: string
}

export interface GetMyStoresResult {
	success: boolean
	stores: Array<{
		id: string
		name: string
		description: string | null
		defaultStyle: string | null
		logoAssetId: string | null
		status: string
		settings: {
			defaultAspectRatio: string
			defaultImageCount: number
			watermarkEnabled: boolean
		}
		createdAt: string
		updatedAt: string
	}>
}

export interface GetStoreResult {
	success: boolean
	store: {
		id: string
		name: string
		description: string | null
		defaultStyle: string | null
		logoAssetId: string | null
		status: string
		settings: {
			defaultAspectRatio: string
			defaultImageCount: number
			watermarkEnabled: boolean
		}
		createdAt: string
		updatedAt: string
	}
}

// ==================== Callable Functions ====================

// Model functions
export const createModel = httpsCallable<CreateModelInput, CreateModelResult>(functions, 'createModel')
export const startCalibration = httpsCallable<StartCalibrationInput, StartCalibrationResult>(
	functions,
	'startCalibration',
)
export const approveCalibration = httpsCallable<ApproveCalibrationInput, ApproveCalibrationResult>(
	functions,
	'approveCalibration',
)
export const rejectCalibration = httpsCallable<
	{ modelId: string; storeId: string; reason: string },
	{ success: boolean; modelId: string; status: string }
>(functions, 'rejectCalibration')

// Generation functions
export const createGeneration = httpsCallable<CreateGenerationInput, CreateGenerationResult>(
	functions,
	'createGeneration',
)
export const processGeneration = httpsCallable<ProcessGenerationInput, ProcessGenerationResult>(
	functions,
	'processGeneration',
)

// Asset functions
export const requestUploadUrl = httpsCallable<RequestUploadUrlInput, RequestUploadUrlResult>(
	functions,
	'requestUploadUrl',
)
export const confirmUpload = httpsCallable<ConfirmUploadInput, ConfirmUploadResult>(functions, 'confirmUpload')
export const getDownloadUrl = httpsCallable<GetDownloadUrlInput, GetDownloadUrlResult>(functions, 'getDownloadUrl')
export const deleteAsset = httpsCallable<{ assetId: string; storeId: string }, { success: boolean; assetId: string }>(
	functions,
	'deleteAsset',
)

// Store functions
export const createStore = httpsCallable<CreateStoreInput, CreateStoreResult>(functions, 'createStore')
export const getMyStores = httpsCallable<void, GetMyStoresResult>(functions, 'getMyStores')
export const getStore = httpsCallable<{ storeId: string }, GetStoreResult>(functions, 'getStore')
export const updateStoreSettings = httpsCallable<
	{
		storeId: string
		settings: {
			defaultAspectRatio?: string
			defaultImageCount?: number
			watermarkEnabled?: boolean
		}
	},
	{ success: boolean; storeId: string; settings: object }
>(functions, 'updateStoreSettings')

export { functions }

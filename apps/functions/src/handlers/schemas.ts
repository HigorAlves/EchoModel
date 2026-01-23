/**
 * @fileoverview Zod validation schemas for Cloud Function inputs
 */

import {
	AgeRange,
	AspectRatio,
	AssetCategory,
	BackgroundType,
	BodyType,
	CameraFraming,
	Ethnicity,
	Expression,
	Gender,
	LightingPreset,
	PoseStyle,
	PostProcessingStyle,
	ProductCategory,
} from '@foundry/domain'
import { z } from 'zod'

// ==================== Fashion Config Schemas ====================

export const CustomLightingSettingsSchema = z.object({
	intensity: z.number().min(0).max(100),
	warmth: z.number().min(0).max(100),
	contrast: z.number().min(0).max(100),
})

export const CustomCameraSettingsSchema = z.object({
	focalLength: z.number().min(24).max(200),
	cropRatio: z.string().regex(/^\d+:\d+$/),
	angle: z.string().min(1).max(50),
})

// ==================== Model Schemas ====================

export const CreateModelInputSchema = z.object({
	id: z.string().uuid().optional(), // Pre-generated modelId from client
	storeId: z.string().min(1, 'Store ID is required'),
	name: z.string().min(1, 'Name is required').max(100),
	description: z.string().max(500).optional(),
	gender: z.nativeEnum(Gender),
	ageRange: z.nativeEnum(AgeRange),
	ethnicity: z.nativeEnum(Ethnicity),
	bodyType: z.nativeEnum(BodyType),
	prompt: z.string().min(10).max(1000).optional(),
	/** Reference image IDs for multi-image character consistency (max 14 per Seedream 4.5 API) */
	referenceImageIds: z.array(z.string()).max(14, 'Maximum 14 reference images allowed').optional(),
	// Seedream 4.5 Fashion configuration
	lightingPreset: z.nativeEnum(LightingPreset).optional(),
	customLightingSettings: CustomLightingSettingsSchema.optional(),
	cameraFraming: z.nativeEnum(CameraFraming).optional(),
	customCameraSettings: CustomCameraSettingsSchema.optional(),
	backgroundType: z.nativeEnum(BackgroundType).optional(),
	poseStyle: z.nativeEnum(PoseStyle).optional(),
	expression: z.nativeEnum(Expression).optional(),
	postProcessingStyle: z.nativeEnum(PostProcessingStyle).optional(),
	texturePreferences: z.array(z.string().min(2).max(50)).max(5).optional(),
	productCategories: z.array(z.nativeEnum(ProductCategory)).max(3).optional(),
	supportOutfitSwapping: z.boolean().optional().default(true),
})

export type CreateModelInput = z.infer<typeof CreateModelInputSchema>

export const StartCalibrationInputSchema = z.object({
	modelId: z.string().min(1, 'Model ID is required'),
	storeId: z.string().min(1, 'Store ID is required'),
})

export type StartCalibrationInput = z.infer<typeof StartCalibrationInputSchema>

export const ApproveCalibrationInputSchema = z.object({
	modelId: z.string().min(1, 'Model ID is required'),
	storeId: z.string().min(1, 'Store ID is required'),
	selectedImageIds: z.array(z.string()).min(1, 'At least one image must be selected'),
})

export type ApproveCalibrationInput = z.infer<typeof ApproveCalibrationInputSchema>

export const RejectCalibrationInputSchema = z.object({
	modelId: z.string().min(1, 'Model ID is required'),
	storeId: z.string().min(1, 'Store ID is required'),
	reason: z.string().min(1, 'Reason is required').max(500),
})

export type RejectCalibrationInput = z.infer<typeof RejectCalibrationInputSchema>

// ==================== Generation Schemas ====================

/**
 * Fashion config override schema for per-generation customization
 */
export const FashionConfigOverrideSchema = z.object({
	lightingPreset: z.nativeEnum(LightingPreset).optional(),
	cameraFraming: z.nativeEnum(CameraFraming).optional(),
	texturePreferences: z.array(z.string().min(2).max(50)).max(5).optional(),
})

export const CreateGenerationInputSchema = z.object({
	storeId: z.string().min(1, 'Store ID is required'),
	modelId: z.string().min(1, 'Model ID is required'),
	garmentAssetId: z.string().min(1, 'Garment asset ID is required'),
	scenePrompt: z.string().min(5, 'Scene prompt must be at least 5 characters').max(500),
	aspectRatios: z.array(z.nativeEnum(AspectRatio)).min(1, 'At least one aspect ratio is required'),
	imageCount: z.number().int().min(1).max(10).default(4),
	idempotencyKey: z.string().optional(),
	// Seedream 4.5 Fashion config override (optional - inherits from model if not provided)
	fashionConfigOverride: FashionConfigOverrideSchema.optional(),
})

export type CreateGenerationInput = z.infer<typeof CreateGenerationInputSchema>

export const ProcessGenerationInputSchema = z.object({
	generationId: z.string().min(1, 'Generation ID is required'),
})

export type ProcessGenerationInput = z.infer<typeof ProcessGenerationInputSchema>

// ==================== Asset Schemas ====================

/**
 * Allowed MIME types for image uploads
 * Updated per BytePlus Seedream 4.5 API docs to include BMP, TIFF, GIF
 */
export const AllowedImageMimeTypes = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/bmp',
	'image/tiff',
	'image/gif',
] as const

/**
 * Maximum file size (10 MB per BytePlus API constraints)
 */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

export const RequestUploadUrlInputSchema = z.object({
	storeId: z.string().min(1, 'Store ID is required'),
	category: z.nativeEnum(AssetCategory),
	filename: z.string().min(1, 'Filename is required').max(255),
	mimeType: z.enum(AllowedImageMimeTypes),
	sizeBytes: z.number().int().min(1).max(MAX_IMAGE_SIZE_BYTES), // Max 10MB per BytePlus docs
	uploadedBy: z.string().min(1, 'Uploader ID is required'),
	metadata: z.record(z.unknown()).optional(),
})

export type RequestUploadUrlInput = z.infer<typeof RequestUploadUrlInputSchema>

export const ConfirmUploadInputSchema = z.object({
	assetId: z.string().min(1, 'Asset ID is required'),
	storeId: z.string().min(1, 'Store ID is required'),
})

export type ConfirmUploadInput = z.infer<typeof ConfirmUploadInputSchema>

// ==================== Store Schemas ====================

export const CreateStoreInputSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100),
	description: z.string().max(500).optional(),
	defaultStyle: z.string().max(500).optional(),
	ownerId: z.string().min(1, 'Owner ID is required'),
})

export type CreateStoreInput = z.infer<typeof CreateStoreInputSchema>

// ==================== Callback Schemas ====================

export const GenerationCallbackInputSchema = z.object({
	generationId: z.string().min(1, 'Generation ID is required'),
	success: z.boolean(),
	images: z
		.array(
			z.object({
				id: z.string(),
				url: z.string().url(),
				thumbnailUrl: z.string().url().optional(),
				aspectRatio: z.nativeEnum(AspectRatio),
				width: z.number().int().optional(),
				height: z.number().int().optional(),
				seed: z.number().int().optional(),
			}),
		)
		.optional(),
	error: z.string().optional(),
	processingTimeMs: z.number().int().optional(),
})

export type GenerationCallbackInput = z.infer<typeof GenerationCallbackInputSchema>

export const CalibrationCallbackInputSchema = z.object({
	modelId: z.string().min(1, 'Model ID is required'),
	success: z.boolean(),
	images: z
		.array(
			z.object({
				id: z.string(),
				url: z.string().url(),
				thumbnailUrl: z.string().url().optional(),
				width: z.number().int().optional(),
				height: z.number().int().optional(),
			}),
		)
		.optional(),
	lockedIdentityUrl: z.string().url().optional(),
	error: z.string().optional(),
})

export type CalibrationCallbackInput = z.infer<typeof CalibrationCallbackInputSchema>

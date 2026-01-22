/**
 * @fileoverview Create Model Input DTO
 */

import {
	AgeRange,
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

/**
 * Custom lighting settings schema for CUSTOM preset
 */
export const CustomLightingSettingsSchema = z.object({
	intensity: z.number().min(0, 'Intensity must be at least 0').max(100, 'Intensity cannot exceed 100'),
	warmth: z.number().min(0, 'Warmth must be at least 0').max(100, 'Warmth cannot exceed 100'),
	contrast: z.number().min(0, 'Contrast must be at least 0').max(100, 'Contrast cannot exceed 100'),
})

export type CustomLightingSettingsInput = z.infer<typeof CustomLightingSettingsSchema>

/**
 * Custom camera settings schema for CUSTOM framing
 */
export const CustomCameraSettingsSchema = z.object({
	focalLength: z.number().min(24, 'Focal length must be at least 24mm').max(200, 'Focal length cannot exceed 200mm'),
	cropRatio: z.string().regex(/^\d+:\d+$/, 'Crop ratio must be in format "X:Y" (e.g., "3:4", "16:9")'),
	angle: z.string().min(1, 'Camera angle is required').max(50, 'Camera angle cannot exceed 50 characters'),
})

export type CustomCameraSettingsInput = z.infer<typeof CustomCameraSettingsSchema>

export const CreateModelSchema = z
	.object({
		storeId: z.string().uuid(),
		name: z.string().min(2).max(50),
		description: z.string().max(500).optional(),
		gender: z.nativeEnum(Gender),
		ageRange: z.nativeEnum(AgeRange),
		ethnicity: z.nativeEnum(Ethnicity),
		bodyType: z.nativeEnum(BodyType),
		prompt: z.string().min(10).max(2000).optional(),
		referenceImageIds: z.array(z.string().uuid()).max(10).optional(),
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
		supportOutfitSwapping: z.boolean().default(true),
	})
	.refine((data) => data.prompt || (data.referenceImageIds && data.referenceImageIds.length > 0), {
		message: 'Either prompt or referenceImageIds must be provided',
	})
	.refine(
		(data) => {
			// If CUSTOM lighting preset, require customLightingSettings
			if (data.lightingPreset === LightingPreset.CUSTOM) {
				return data.customLightingSettings !== undefined
			}
			return true
		},
		{ message: 'Custom lighting settings are required when using CUSTOM preset' },
	)
	.refine(
		(data) => {
			// If CUSTOM camera framing, require customCameraSettings
			if (data.cameraFraming === CameraFraming.CUSTOM) {
				return data.customCameraSettings !== undefined
			}
			return true
		},
		{ message: 'Custom camera settings are required when using CUSTOM framing' },
	)

export type CreateModelInput = z.infer<typeof CreateModelSchema>

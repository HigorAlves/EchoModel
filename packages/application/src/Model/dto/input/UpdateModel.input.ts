/**
 * @fileoverview Update Model Input DTO
 */

import { z } from 'zod'
import { CameraFraming, LightingPreset, ProductCategory } from '@foundry/domain'
import { CustomCameraSettingsSchema, CustomLightingSettingsSchema } from './CreateModel.input'

export const UpdateModelSchema = z
	.object({
		name: z.string().min(2).max(50).optional(),
		description: z.string().max(500).nullable().optional(),
		// Seedream 4.5 Fashion configuration updates
		lightingPreset: z.nativeEnum(LightingPreset).optional(),
		customLightingSettings: CustomLightingSettingsSchema.nullable().optional(),
		cameraFraming: z.nativeEnum(CameraFraming).optional(),
		customCameraSettings: CustomCameraSettingsSchema.nullable().optional(),
		texturePreferences: z.array(z.string().min(2).max(50)).max(5).nullable().optional(),
		productCategories: z.array(z.nativeEnum(ProductCategory)).max(3).nullable().optional(),
		supportOutfitSwapping: z.boolean().optional(),
	})
	.refine((data) => Object.values(data).some((v) => v !== undefined), {
		message: 'At least one field must be provided',
	})
	.refine(
		(data) => {
			// If CUSTOM lighting preset, require customLightingSettings
			if (data.lightingPreset === LightingPreset.CUSTOM) {
				return data.customLightingSettings !== undefined && data.customLightingSettings !== null
			}
			return true
		},
		{ message: 'Custom lighting settings are required when using CUSTOM preset' },
	)
	.refine(
		(data) => {
			// If CUSTOM camera framing, require customCameraSettings
			if (data.cameraFraming === CameraFraming.CUSTOM) {
				return data.customCameraSettings !== undefined && data.customCameraSettings !== null
			}
			return true
		},
		{ message: 'Custom camera settings are required when using CUSTOM framing' },
	)

export type UpdateModelInput = z.infer<typeof UpdateModelSchema>

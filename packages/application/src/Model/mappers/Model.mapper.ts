/**
 * @fileoverview Model Mapper
 */

import type { Model } from '@foundry/domain'
import type { CalibrationStatusOutput, CameraConfigOutput, LightingConfigOutput, ModelOutput } from '@/Model'

/**
 * Map ModelLightingConfig value object to output DTO
 */
function toLightingConfigOutput(model: Model): LightingConfigOutput {
	const lightingConfig = model.lightingConfig
	return {
		preset: lightingConfig.preset,
		customSettings: lightingConfig.customSettings
			? {
					intensity: lightingConfig.customSettings.intensity,
					warmth: lightingConfig.customSettings.warmth,
					contrast: lightingConfig.customSettings.contrast,
				}
			: undefined,
	}
}

/**
 * Map ModelCameraConfig value object to output DTO
 */
function toCameraConfigOutput(model: Model): CameraConfigOutput {
	const cameraConfig = model.cameraConfig
	return {
		framing: cameraConfig.framing,
		customSettings: cameraConfig.customSettings
			? {
					focalLength: cameraConfig.customSettings.focalLength,
					cropRatio: cameraConfig.customSettings.cropRatio,
					angle: cameraConfig.customSettings.angle,
				}
			: undefined,
	}
}

export function toModelResponse(model: Model): ModelOutput {
	return {
		id: model.id.value,
		storeId: model.storeId,
		name: model.name.value,
		description: model.description?.value ?? null,
		status: model.status,
		gender: model.gender,
		ageRange: model.ageRange,
		ethnicity: model.ethnicity,
		bodyType: model.bodyType,
		prompt: model.prompt?.value ?? null,
		referenceImages: [...model.referenceImages],
		calibrationImages: [...model.calibrationImages],
		lockedIdentityUrl: model.lockedIdentityUrl,
		failureReason: model.failureReason,
		// Fashion configuration
		lightingConfig: toLightingConfigOutput(model),
		cameraConfig: toCameraConfigOutput(model),
		backgroundType: model.backgroundType,
		poseStyle: model.poseStyle,
		expression: model.expression,
		postProcessingStyle: model.postProcessingStyle,
		texturePreferences: [...model.texturePreferences.value],
		productCategories: [...model.productCategories],
		supportOutfitSwapping: model.supportOutfitSwapping,
		createdAt: model.createdAt,
		updatedAt: model.updatedAt,
	}
}

export function toModelResponseList(models: Model[]): ModelOutput[] {
	return models.map((model) => toModelResponse(model))
}

export function toCalibrationStatusResponse(model: Model): CalibrationStatusOutput {
	return {
		modelId: model.id.value,
		status: model.status,
		calibrationImages: [...model.calibrationImages],
		failureReason: model.failureReason,
	}
}

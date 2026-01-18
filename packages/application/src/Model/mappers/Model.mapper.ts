/**
 * @fileoverview Model Mapper
 */

import type { Model } from '@foundry/domain'
import type { CalibrationStatusOutput, ModelOutput } from '@/Model'

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

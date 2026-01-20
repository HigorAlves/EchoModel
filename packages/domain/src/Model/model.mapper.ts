import { Model } from './Model.entity'
import type { PersistenceModel } from './model.repository'
import {
	ModelCameraConfig,
	ModelDescription,
	ModelId,
	ModelLightingConfig,
	ModelName,
	ModelPrompt,
	ModelTexturePreferences,
} from './value-objects'

/**
 * @fileoverview Model Mapper
 *
 * Mappers are responsible for converting between domain entities and
 * persistence representations.
 */

/**
 * Maps persistence data to a domain entity
 */
export function toDomain(data: PersistenceModel): Model {
	// Reconstruct lighting config from persistence data
	const lightingConfig = data.lightingConfig
		? ModelLightingConfig.create({
				preset: data.lightingConfig.preset,
				customSettings: data.lightingConfig.customSettings,
			})
		: ModelLightingConfig.createDefault()

	// Reconstruct camera config from persistence data
	const cameraConfig = data.cameraConfig
		? ModelCameraConfig.create({
				framing: data.cameraConfig.framing,
				customSettings: data.cameraConfig.customSettings,
			})
		: ModelCameraConfig.createDefault()

	// Reconstruct texture preferences
	const texturePreferences = data.texturePreferences
		? ModelTexturePreferences.create(data.texturePreferences)
		: ModelTexturePreferences.createEmpty()

	return Model.create({
		id: ModelId.create(data.id),
		storeId: data.storeId,
		name: ModelName.create(data.name),
		description: data.description ? ModelDescription.create(data.description) : null,
		status: data.status,
		gender: data.gender,
		ageRange: data.ageRange,
		ethnicity: data.ethnicity,
		bodyType: data.bodyType,
		prompt: data.prompt ? ModelPrompt.create(data.prompt) : null,
		referenceImages: data.referenceImages,
		calibrationImages: data.calibrationImages,
		lockedIdentityUrl: data.lockedIdentityUrl,
		failureReason: data.failureReason,
		lightingConfig,
		cameraConfig,
		texturePreferences,
		productCategories: data.productCategories ?? [],
		supportOutfitSwapping: data.supportOutfitSwapping ?? true,
		createdAt: data.createdAt,
		updatedAt: data.updatedAt,
		deletedAt: data.deletedAt,
	})
}

/**
 * Maps a domain entity to persistence format
 */
export function toPersistence(entity: Model): PersistenceModel {
	return {
		id: entity.id.value,
		storeId: entity.storeId,
		name: entity.name.value,
		description: entity.description?.value ?? null,
		status: entity.status,
		gender: entity.gender,
		ageRange: entity.ageRange,
		ethnicity: entity.ethnicity,
		bodyType: entity.bodyType,
		prompt: entity.prompt?.value ?? null,
		referenceImages: [...entity.referenceImages],
		calibrationImages: [...entity.calibrationImages],
		lockedIdentityUrl: entity.lockedIdentityUrl,
		failureReason: entity.failureReason,
		// Fashion configuration
		lightingConfig: {
			preset: entity.lightingConfig.preset,
			customSettings: entity.lightingConfig.customSettings,
		},
		cameraConfig: {
			framing: entity.cameraConfig.framing,
			customSettings: entity.cameraConfig.customSettings,
		},
		texturePreferences: [...entity.texturePreferences.value],
		productCategories: [...entity.productCategories],
		supportOutfitSwapping: entity.supportOutfitSwapping,
		createdAt: entity.createdAt,
		updatedAt: entity.updatedAt,
		deletedAt: entity.deletedAt,
	}
}

/**
 * Model Mapper namespace
 */
export const ModelMapper = {
	toDomain,
	toPersistence,
}

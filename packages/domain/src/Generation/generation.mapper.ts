import { Generation, type FashionConfigOverride } from './Generation.entity'
import type { PersistenceGeneration, PersistenceFashionConfigOverride } from './generation.repository'
import { GenerationId, IdempotencyKey, ScenePrompt } from './value-objects'

/**
 * @fileoverview Generation Mapper
 *
 * Mappers are responsible for converting between domain entities and
 * persistence representations.
 */

/**
 * Maps persistence data to a domain entity
 */
export function toDomain(data: PersistenceGeneration): Generation {
	// Map persistence fashion config override to domain type
	const fashionConfigOverride: FashionConfigOverride | null = data.fashionConfigOverride
		? {
				lightingPreset: data.fashionConfigOverride.lightingPreset,
				cameraFraming: data.fashionConfigOverride.cameraFraming,
				texturePreferences: data.fashionConfigOverride.texturePreferences,
			}
		: null

	return Generation.create({
		id: GenerationId.create(data.id),
		storeId: data.storeId,
		modelId: data.modelId,
		status: data.status,
		idempotencyKey: IdempotencyKey.create(data.idempotencyKey),
		garmentAssetId: data.garmentAssetId,
		scenePrompt: ScenePrompt.create(data.scenePrompt),
		aspectRatios: data.aspectRatios,
		imageCount: data.imageCount,
		generatedImages: data.generatedImages,
		startedAt: data.startedAt,
		completedAt: data.completedAt,
		failureReason: data.failureReason,
		metadata: data.metadata,
		fashionConfigOverride,
		createdAt: data.createdAt,
		updatedAt: data.updatedAt,
	})
}

/**
 * Maps a domain entity to persistence format
 */
export function toPersistence(entity: Generation): PersistenceGeneration {
	// Map domain fashion config override to persistence type
	const fashionConfigOverride: PersistenceFashionConfigOverride | null = entity.fashionConfigOverride
		? {
				lightingPreset: entity.fashionConfigOverride.lightingPreset,
				cameraFraming: entity.fashionConfigOverride.cameraFraming,
				texturePreferences: entity.fashionConfigOverride.texturePreferences
					? [...entity.fashionConfigOverride.texturePreferences]
					: undefined,
			}
		: null

	return {
		id: entity.id.value,
		storeId: entity.storeId,
		modelId: entity.modelId,
		status: entity.status,
		idempotencyKey: entity.idempotencyKey.value,
		garmentAssetId: entity.garmentAssetId,
		scenePrompt: entity.scenePrompt.value,
		aspectRatios: [...entity.aspectRatios],
		imageCount: entity.imageCount,
		generatedImages: [...entity.generatedImages],
		startedAt: entity.startedAt,
		completedAt: entity.completedAt,
		failureReason: entity.failureReason,
		metadata: entity.metadata,
		fashionConfigOverride,
		createdAt: entity.createdAt,
		updatedAt: entity.updatedAt,
	}
}

/**
 * Generation Mapper namespace
 */
export const GenerationMapper = {
	toDomain,
	toPersistence,
}

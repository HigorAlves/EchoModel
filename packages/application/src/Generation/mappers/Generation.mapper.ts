/**
 * @fileoverview Generation Mapper
 */

import type { Generation } from '@foundry/domain'
import type { GenerationOutput } from '@/Generation'

export function toGenerationResponse(generation: Generation): GenerationOutput {
	return {
		id: generation.id.value,
		storeId: generation.storeId,
		modelId: generation.modelId,
		status: generation.status,
		garmentAssetId: generation.garmentAssetId,
		scenePrompt: generation.scenePrompt.value,
		aspectRatios: [...generation.aspectRatios],
		imageCount: generation.imageCount,
		generatedImages: [...generation.generatedImages],
		startedAt: generation.startedAt,
		completedAt: generation.completedAt,
		failureReason: generation.failureReason,
		metadata: generation.metadata,
		createdAt: generation.createdAt,
		updatedAt: generation.updatedAt,
	}
}

export function toGenerationResponseList(generations: Generation[]): GenerationOutput[] {
	return generations.map((generation) => toGenerationResponse(generation))
}

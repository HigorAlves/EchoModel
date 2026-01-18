/**
 * @fileoverview Generation Response DTOs
 */

import type { AspectRatio, GenerationStatus } from '@foundry/domain'

export interface GeneratedImageOutput {
	readonly id: string
	readonly assetId: string
	readonly aspectRatio: AspectRatio
	readonly url: string | null
	readonly thumbnailUrl: string | null
	readonly createdAt: Date
}

export interface GenerationMetadataOutput {
	readonly processingTimeMs?: number
	readonly aiModelVersion?: string
	readonly requestedAt?: Date
}

export interface GenerationOutput {
	readonly id: string
	readonly storeId: string
	readonly modelId: string
	readonly status: GenerationStatus
	readonly garmentAssetId: string
	readonly scenePrompt: string
	readonly aspectRatios: AspectRatio[]
	readonly imageCount: number
	readonly generatedImages: GeneratedImageOutput[]
	readonly startedAt: Date | null
	readonly completedAt: Date | null
	readonly failureReason: string | null
	readonly metadata: GenerationMetadataOutput
	readonly createdAt: Date
	readonly updatedAt: Date
}

export interface CreateGenerationResponse {
	readonly generationId: string
	readonly status: GenerationStatus
	readonly isExisting: boolean
}

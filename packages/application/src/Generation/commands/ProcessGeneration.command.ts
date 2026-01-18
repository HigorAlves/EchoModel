/**
 * @fileoverview Process Generation Command Handler
 *
 * Internal command triggered by queue to process a generation.
 * Calls the AI image generation service and updates the generation status.
 */

import type {
	Generation,
	IAssetRepository,
	IGenerationRepository,
	IImageGenerationService,
	IModelRepository,
	IStorageService,
} from '@foundry/domain'
import type { Context, IEventBus } from '@/shared'
import { ApplicationError } from '@/shared'

export class ProcessGenerationCommand {
	constructor(
		private readonly generationRepository: IGenerationRepository,
		private readonly modelRepository: IModelRepository,
		private readonly assetRepository: IAssetRepository,
		private readonly imageGenerationService: IImageGenerationService,
		private readonly storageService: IStorageService,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(generationId: string, ctx: Context): Promise<void> {
		let generation = await this.generationRepository.findById(generationId)
		if (!generation) {
			throw ApplicationError.notFound('Generation', generationId)
		}

		if (!generation.isPending) {
			// Already processing or completed
			return
		}

		// Start processing
		generation = generation.startProcessing()
		await this.generationRepository.update(generation)

		try {
			// Get model for locked identity
			const model = await this.modelRepository.findById(generation.modelId)
			if (!model || !model.isActive || !model.lockedIdentityUrl) {
				throw new Error('Model is not available for generation')
			}

			// Get garment asset URL
			const garmentAsset = await this.assetRepository.findById(generation.garmentAssetId)
			if (!garmentAsset || !garmentAsset.isReady) {
				throw new Error('Garment asset is not available')
			}
			const garmentUrl = await this.storageService.generateDownloadUrl(garmentAsset.storagePath.value)

			// Generate images
			const result = await this.imageGenerationService.generateImages({
				modelIdentityUrl: model.lockedIdentityUrl,
				garmentImageUrl: garmentUrl,
				scenePrompt: generation.scenePrompt.value,
				aspectRatios: [...generation.aspectRatios],
				count: generation.imageCount,
			})

			if (!result.success) {
				generation = generation.fail(result.error || 'Image generation failed')
				await this.generationRepository.update(generation)
				await this.publishEvents(generation, ctx)
				return
			}

			// Add generated images
			for (const image of result.images) {
				generation = generation.addGeneratedImage({
					id: image.id,
					assetId: image.id, // In a real implementation, create asset records
					aspectRatio: image.aspectRatio,
					url: image.url,
					thumbnailUrl: image.thumbnailUrl ?? null,
					createdAt: new Date(),
				})
			}

			// Complete
			generation = generation.complete()
			await this.generationRepository.update(generation)
			await this.publishEvents(generation, ctx)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			generation = generation.fail(errorMessage)
			await this.generationRepository.update(generation)
			await this.publishEvents(generation, ctx)
		}
	}

	private async publishEvents(generation: Generation, ctx: Context): Promise<void> {
		if (!this.eventBus) return

		for (const event of generation.domainEvents) {
			await this.eventBus.publish({
				eventType: event.eventType,
				aggregateType: event.aggregateType,
				aggregateId: event.aggregateId,
				payload: event.eventData as Record<string, unknown>,
				correlationId: ctx.correlationId,
				occurredAt: new Date(),
			})
		}
		generation.clearDomainEvents()
	}
}

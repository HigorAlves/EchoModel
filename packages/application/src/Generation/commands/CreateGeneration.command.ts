/**
 * @fileoverview Create Generation Command Handler
 *
 * Handles idempotent generation creation. If a generation with the same
 * idempotency key exists, returns the existing generation.
 */

import type { Generation, IGenerationRepository, IModelRepository } from '@foundry/domain'
import type { CreateGenerationInput, CreateGenerationResponse } from '@/Generation'
import { CreateGenerationSchema } from '@/Generation'
import type { Context, IEventBus } from '@/shared'
import { ApplicationError } from '@/shared'

export class CreateGenerationCommand {
	constructor(
		private readonly generationRepository: IGenerationRepository,
		private readonly modelRepository: IModelRepository,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(input: CreateGenerationInput, ctx: Context): Promise<CreateGenerationResponse> {
		const validated = CreateGenerationSchema.parse(input)

		// Check for existing generation with same idempotency key
		const existingGeneration = await this.generationRepository.findByIdempotencyKey(validated.idempotencyKey)
		if (existingGeneration) {
			return {
				generationId: existingGeneration.id.value,
				status: existingGeneration.status,
				isExisting: true,
			}
		}

		// Verify model exists and is active
		const model = await this.modelRepository.findById(validated.modelId)
		if (!model) {
			throw ApplicationError.notFound('Model', validated.modelId)
		}
		if (!model.isActive) {
			throw ApplicationError.conflict('Model is not active')
		}

		const { Generation } = await import('@foundry/domain')
		const generation = Generation.createFromDTO({
			storeId: validated.storeId,
			modelId: validated.modelId,
			idempotencyKey: validated.idempotencyKey,
			garmentAssetId: validated.garmentAssetId,
			scenePrompt: validated.scenePrompt,
			aspectRatios: validated.aspectRatios,
			imageCount: validated.imageCount,
		})

		await this.generationRepository.create(generation)
		await this.publishEvents(generation, ctx)

		return {
			generationId: generation.id.value,
			status: generation.status,
			isExisting: false,
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

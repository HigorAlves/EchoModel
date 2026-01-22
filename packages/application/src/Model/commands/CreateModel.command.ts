/**
 * @fileoverview Create Model Command Handler
 */

import type { IModelRepository, Model } from '@foundry/domain'
import type { CreateModelInput, CreateModelResponse } from '@/Model'
import { CreateModelSchema } from '@/Model'
import type { Context, IEventBus } from '@/shared'

export class CreateModelCommand {
	constructor(
		private readonly modelRepository: IModelRepository,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(input: CreateModelInput, ctx: Context): Promise<CreateModelResponse> {
		const validated = CreateModelSchema.parse(input)

		const { Model } = await import('@foundry/domain')
		const model = Model.createFromDTO({
			storeId: validated.storeId,
			name: validated.name,
			description: validated.description,
			gender: validated.gender,
			ageRange: validated.ageRange,
			ethnicity: validated.ethnicity,
			bodyType: validated.bodyType,
			prompt: validated.prompt,
			referenceImageIds: validated.referenceImageIds,
			// Seedream 4.5 Fashion configuration
			lightingPreset: validated.lightingPreset,
			customLightingSettings: validated.customLightingSettings,
			cameraFraming: validated.cameraFraming,
			customCameraSettings: validated.customCameraSettings,
			backgroundType: validated.backgroundType,
			poseStyle: validated.poseStyle,
			expression: validated.expression,
			postProcessingStyle: validated.postProcessingStyle,
			texturePreferences: validated.texturePreferences,
			productCategories: validated.productCategories,
			supportOutfitSwapping: validated.supportOutfitSwapping,
		})

		const modelId = await this.modelRepository.create(model)

		await this.publishEvents(model, ctx)

		return { modelId }
	}

	private async publishEvents(model: Model, ctx: Context): Promise<void> {
		if (!this.eventBus) return

		for (const event of model.domainEvents) {
			await this.eventBus.publish({
				eventType: event.eventType,
				aggregateType: event.aggregateType,
				aggregateId: event.aggregateId,
				payload: event.eventData as Record<string, unknown>,
				correlationId: ctx.correlationId,
				occurredAt: new Date(),
			})
		}
		model.clearDomainEvents()
	}
}

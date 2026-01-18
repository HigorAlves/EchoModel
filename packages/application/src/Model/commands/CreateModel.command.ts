/**
 * @fileoverview Create Model Command Handler
 */

import type { IModelRepository, Model } from '@foundry/domain'
import type { Context, IEventBus } from '@/shared'
import type { CreateModelInput, CreateModelResponse } from '@/Model'
import { CreateModelSchema } from '@/Model'

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

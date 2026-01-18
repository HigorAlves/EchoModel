/**
 * @fileoverview Update Model Command Handler
 */

import type { IModelRepository, Model } from '@foundry/domain'
import type { Context, IEventBus } from '@/shared'
import { ApplicationError } from '@/shared'
import type { UpdateModelInput, UpdateModelResponse } from '@/Model'
import { UpdateModelSchema } from '@/Model'

export class UpdateModelCommand {
	constructor(
		private readonly modelRepository: IModelRepository,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(modelId: string, input: UpdateModelInput, ctx: Context): Promise<UpdateModelResponse> {
		const validated = UpdateModelSchema.parse(input)

		const model = await this.modelRepository.findById(modelId)
		if (!model) {
			throw ApplicationError.notFound('Model', modelId)
		}

		// Can only update in DRAFT or FAILED state
		if (!model.isDraft && !model.isFailed) {
			throw ApplicationError.conflict('Model can only be updated in DRAFT or FAILED status')
		}

		const updatedModel = model.update({
			name: validated.name,
			description: validated.description,
		})

		await this.modelRepository.update(updatedModel)
		await this.publishEvents(updatedModel, ctx)

		return { modelId, updated: true }
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

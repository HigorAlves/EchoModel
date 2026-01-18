/**
 * @fileoverview Archive Model Command Handler
 */

import type { IModelRepository, Model } from '@foundry/domain'
import type { Context, IEventBus } from '@/shared'
import { ApplicationError } from '@/shared'
import type { ArchiveModelInput, ArchiveModelResponse } from '@/Model'
import { ArchiveModelSchema } from '@/Model'

export class ArchiveModelCommand {
	constructor(
		private readonly modelRepository: IModelRepository,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(input: ArchiveModelInput, ctx: Context): Promise<ArchiveModelResponse> {
		const { modelId } = ArchiveModelSchema.parse(input)

		const model = await this.modelRepository.findById(modelId)
		if (!model) {
			throw ApplicationError.notFound('Model', modelId)
		}

		if (!model.isActive) {
			throw ApplicationError.conflict('Model must be in ACTIVE status to archive')
		}

		const archivedModel = model.archive()

		await this.modelRepository.update(archivedModel)
		await this.publishEvents(archivedModel, ctx)

		return {
			modelId,
			archived: true,
		}
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

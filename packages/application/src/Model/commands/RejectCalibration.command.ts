/**
 * @fileoverview Reject Calibration Command Handler
 */

import type { IModelRepository, Model } from '@foundry/domain'
import type { Context, IEventBus } from '@/shared'
import { ApplicationError } from '@/shared'
import type { RejectCalibrationInput, RejectCalibrationResponse } from '@/Model'
import { RejectCalibrationSchema } from '@/Model'

export class RejectCalibrationCommand {
	constructor(
		private readonly modelRepository: IModelRepository,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(input: RejectCalibrationInput, ctx: Context): Promise<RejectCalibrationResponse> {
		const { modelId, reason } = RejectCalibrationSchema.parse(input)

		const model = await this.modelRepository.findById(modelId)
		if (!model) {
			throw ApplicationError.notFound('Model', modelId)
		}

		if (!model.isCalibrating) {
			throw ApplicationError.conflict('Model must be in CALIBRATING status to reject')
		}

		const failedModel = model.rejectCalibration(reason)

		await this.modelRepository.update(failedModel)
		await this.publishEvents(failedModel, ctx)

		return {
			modelId,
			status: failedModel.status,
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

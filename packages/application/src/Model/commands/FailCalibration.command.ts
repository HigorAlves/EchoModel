/**
 * @fileoverview Fail Calibration Command Handler
 *
 * Marks a model calibration as failed with a reason.
 */

import type { IModelRepository, Model } from '@foundry/domain'
import type { FailCalibrationInput } from '@/Model'
import { FailCalibrationSchema } from '@/Model'
import type { Context, IEventBus } from '@/shared'
import { ApplicationError } from '@/shared'

export interface FailCalibrationResponse {
	readonly modelId: string
	readonly failed: boolean
}

export class FailCalibrationCommand {
	constructor(
		private readonly modelRepository: IModelRepository,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(input: FailCalibrationInput, ctx: Context): Promise<FailCalibrationResponse> {
		const validated = FailCalibrationSchema.parse(input)

		const model = await this.modelRepository.findById(validated.modelId)
		if (!model || model.isDeleted) {
			throw ApplicationError.notFound('Model', validated.modelId)
		}

		// Mark calibration as failed
		const failedModel = model.rejectCalibration(validated.reason)

		await this.modelRepository.update(failedModel)

		await this.publishEvents(failedModel, ctx)

		return {
			modelId: validated.modelId,
			failed: true,
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

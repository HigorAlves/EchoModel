/**
 * @fileoverview Complete Calibration Command Handler
 *
 * Adds calibration images to a model after successful calibration generation.
 */

import type { IModelRepository, Model } from '@foundry/domain'
import type { CompleteCalibrationInput } from '@/Model'
import { CompleteCalibrationSchema } from '@/Model'
import type { Context, IEventBus } from '@/shared'
import { ApplicationError } from '@/shared'

export interface CompleteCalibrationResponse {
	readonly modelId: string
	readonly calibrationImageCount: number
}

export class CompleteCalibrationCommand {
	constructor(
		private readonly modelRepository: IModelRepository,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(input: CompleteCalibrationInput, ctx: Context): Promise<CompleteCalibrationResponse> {
		const validated = CompleteCalibrationSchema.parse(input)

		const model = await this.modelRepository.findById(validated.modelId)
		if (!model || model.isDeleted) {
			throw ApplicationError.notFound('Model', validated.modelId)
		}

		// Add calibration images to the model
		let updatedModel = model
		for (const imageId of validated.calibrationImageIds) {
			updatedModel = updatedModel.addCalibrationImage(imageId)
		}

		await this.modelRepository.update(updatedModel)

		await this.publishEvents(updatedModel, ctx)

		return {
			modelId: validated.modelId,
			calibrationImageCount: updatedModel.calibrationImages.length,
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

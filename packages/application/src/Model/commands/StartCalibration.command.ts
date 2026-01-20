/**
 * @fileoverview Start Calibration Command Handler
 */

import type { IModelCalibrationService, IModelRepository, Model } from '@foundry/domain'
import type { StartCalibrationInput, StartCalibrationResponse } from '@/Model'
import { StartCalibrationSchema } from '@/Model'
import type { Context, IEventBus } from '@/shared'
import { ApplicationError } from '@/shared'

export class StartCalibrationCommand {
	constructor(
		private readonly modelRepository: IModelRepository,
		private readonly calibrationService: IModelCalibrationService,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(input: StartCalibrationInput, ctx: Context): Promise<StartCalibrationResponse> {
		const { modelId } = StartCalibrationSchema.parse(input)

		const model = await this.modelRepository.findById(modelId)
		if (!model) {
			throw ApplicationError.notFound('Model', modelId)
		}

		if (!model.isDraft) {
			throw ApplicationError.conflict('Model must be in DRAFT status to start calibration')
		}

		// Transition to calibrating
		let calibratingModel = model.startCalibration()

		// Generate calibration images
		const calibrationResult = await this.calibrationService.generateCalibrationImages({
			prompt: model.prompt?.value,
			referenceImageUrls: [], // TODO: Resolve reference image URLs
			gender: model.gender,
			ageRange: model.ageRange,
			ethnicity: model.ethnicity,
			bodyType: model.bodyType,
			count: 4, // Generate 4 calibration images
		})

		if (!calibrationResult.success) {
			// Mark as failed
			const failedModel = calibratingModel.rejectCalibration(calibrationResult.error || 'Calibration failed')
			await this.modelRepository.update(failedModel)
			await this.publishEvents(failedModel, ctx)

			return {
				modelId,
				status: failedModel.status,
			}
		}

		// Add calibration images
		for (const image of calibrationResult.images) {
			calibratingModel = calibratingModel.addCalibrationImage(image.id)
		}

		await this.modelRepository.update(calibratingModel)
		await this.publishEvents(calibratingModel, ctx)

		return {
			modelId,
			status: calibratingModel.status,
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

/**
 * @fileoverview Approve Calibration Command Handler
 */

import type { IModelCalibrationService, IModelRepository, Model } from '@foundry/domain'
import type { ApproveCalibrationInput, ApproveCalibrationResponse } from '@/Model'
import { ApproveCalibrationSchema } from '@/Model'
import type { Context, IEventBus } from '@/shared'
import { ApplicationError } from '@/shared'

export class ApproveCalibrationCommand {
	constructor(
		private readonly modelRepository: IModelRepository,
		private readonly calibrationService: IModelCalibrationService,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(input: ApproveCalibrationInput, ctx: Context): Promise<ApproveCalibrationResponse> {
		const { modelId, selectedCalibrationImageIds } = ApproveCalibrationSchema.parse(input)

		const model = await this.modelRepository.findById(modelId)
		if (!model) {
			throw ApplicationError.notFound('Model', modelId)
		}

		if (!model.isCalibrating) {
			throw ApplicationError.conflict('Model must be in CALIBRATING status to approve')
		}

		// Validate that selected images are valid calibration images
		for (const imageId of selectedCalibrationImageIds) {
			if (!model.calibrationImages.includes(imageId)) {
				throw ApplicationError.validation(`Image ${imageId} is not a valid calibration image for this model`)
			}
		}

		// Lock the identity
		const lockedIdentityUrl = await this.calibrationService.lockIdentity(modelId, selectedCalibrationImageIds)

		// Approve and activate
		const activeModel = model.approveCalibration(lockedIdentityUrl)

		await this.modelRepository.update(activeModel)
		await this.publishEvents(activeModel, ctx)

		return {
			modelId,
			status: activeModel.status,
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

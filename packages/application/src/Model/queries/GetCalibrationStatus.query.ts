/**
 * @fileoverview Get Calibration Status Query Handler
 */

import type { IModelRepository } from '@foundry/domain'
import type { CalibrationStatusOutput, GetModelByIdInput } from '@/Model'
import { GetModelByIdSchema } from '@/Model'
import { ApplicationError } from '@/shared'
import { toCalibrationStatusResponse } from '../mappers'

export class GetCalibrationStatusQuery {
	constructor(private readonly modelRepository: IModelRepository) {}

	async execute(input: GetModelByIdInput): Promise<CalibrationStatusOutput> {
		const { modelId } = GetModelByIdSchema.parse(input)

		const model = await this.modelRepository.findById(modelId)
		if (!model || model.isDeleted) {
			throw ApplicationError.notFound('Model', modelId)
		}

		return toCalibrationStatusResponse(model)
	}
}

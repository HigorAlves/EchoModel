/**
 * @fileoverview Get Model By ID Query Handler
 */

import type { IModelRepository } from '@foundry/domain'
import type { GetModelByIdInput, ModelOutput } from '@/Model'
import { GetModelByIdSchema } from '@/Model'
import { toModelResponse } from '../mappers'

export class GetModelByIdQuery {
	constructor(private readonly modelRepository: IModelRepository) {}

	async execute(input: GetModelByIdInput): Promise<ModelOutput | null> {
		const { modelId } = GetModelByIdSchema.parse(input)

		const model = await this.modelRepository.findById(modelId)
		if (!model || model.isDeleted) {
			return null
		}

		return toModelResponse(model)
	}
}

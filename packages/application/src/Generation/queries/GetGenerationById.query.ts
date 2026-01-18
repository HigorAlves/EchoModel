/**
 * @fileoverview Get Generation By ID Query Handler
 */

import type { IGenerationRepository } from '@foundry/domain'
import type { GenerationOutput, GetGenerationByIdInput } from '@/Generation'
import { GetGenerationByIdSchema } from '@/Generation'
import { toGenerationResponse } from '../mappers'

export class GetGenerationByIdQuery {
	constructor(private readonly generationRepository: IGenerationRepository) {}

	async execute(input: GetGenerationByIdInput): Promise<GenerationOutput | null> {
		const { generationId } = GetGenerationByIdSchema.parse(input)

		const generation = await this.generationRepository.findById(generationId)
		if (!generation) {
			return null
		}

		return toGenerationResponse(generation)
	}
}

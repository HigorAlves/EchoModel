/**
 * @fileoverview List Generations Query Handler
 */

import type { GenerationQueryFilters, IGenerationRepository } from '@foundry/domain'
import type { GenerationOutput, ListGenerationsInput } from '@/Generation'
import { ListGenerationsSchema } from '@/Generation'
import type { PaginatedResult } from '@/shared'
import { toGenerationResponseList } from '../mappers'

export class ListGenerationsQuery {
	constructor(private readonly generationRepository: IGenerationRepository) {}

	async execute(input: ListGenerationsInput): Promise<PaginatedResult<GenerationOutput>> {
		const { storeId, modelId, status, page, limit } = ListGenerationsSchema.parse(input)
		const offset = (page - 1) * limit

		const filters: GenerationQueryFilters = {
			storeId,
			modelId,
			status,
			limit,
			offset,
			sortBy: 'createdAt',
			sortOrder: 'desc',
		}

		const [generations, total] = await Promise.all([
			this.generationRepository.findMany(filters),
			this.generationRepository.count(filters),
		])

		return {
			items: toGenerationResponseList(generations),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasNextPage: page * limit < total,
			hasPreviousPage: page > 1,
		}
	}
}

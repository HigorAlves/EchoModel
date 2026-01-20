/**
 * @fileoverview List Models Query Handler
 */

import type { IModelRepository, ModelQueryFilters } from '@foundry/domain'
import type { ListModelsInput, ModelOutput } from '@/Model'
import { ListModelsSchema } from '@/Model'
import type { PaginatedResult } from '@/shared'
import { toModelResponseList } from '../mappers'

export class ListModelsQuery {
	constructor(private readonly modelRepository: IModelRepository) {}

	async execute(input: ListModelsInput): Promise<PaginatedResult<ModelOutput>> {
		const { storeId, status, gender, page, limit, sortBy, sortOrder } = ListModelsSchema.parse(input)
		const offset = (page - 1) * limit

		const filters: ModelQueryFilters = {
			storeId,
			status,
			gender,
			limit,
			offset,
			sortBy: sortBy ?? 'createdAt',
			sortOrder: sortOrder ?? 'desc',
		}

		const [models, total] = await Promise.all([
			this.modelRepository.findMany(filters),
			this.modelRepository.count(filters),
		])

		return {
			items: toModelResponseList(models),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasNextPage: page * limit < total,
			hasPreviousPage: page > 1,
		}
	}
}

/**
 * @fileoverview List Assets Query Handler
 */

import type { AssetQueryFilters, IAssetRepository } from '@foundry/domain'
import type { PaginatedResult } from '@/shared'
import type { AssetOutput, ListAssetsInput } from '@/Asset'
import { ListAssetsSchema } from '@/Asset'
import { toAssetResponseList } from '../mappers'

export class ListAssetsQuery {
	constructor(private readonly assetRepository: IAssetRepository) {}

	async execute(input: ListAssetsInput): Promise<PaginatedResult<AssetOutput>> {
		const { storeId, category, status, page, limit } = ListAssetsSchema.parse(input)
		const offset = (page - 1) * limit

		const filters: AssetQueryFilters = {
			storeId,
			category,
			status,
			limit,
			offset,
			sortBy: 'createdAt',
			sortOrder: 'desc',
		}

		const [assets, total] = await Promise.all([
			this.assetRepository.findMany(filters),
			this.assetRepository.count(filters),
		])

		return {
			items: toAssetResponseList(assets),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasNextPage: page * limit < total,
			hasPreviousPage: page > 1,
		}
	}
}

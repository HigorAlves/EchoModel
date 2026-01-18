/**
 * @fileoverview List Stores Query Handler
 */

import type { IStoreRepository, StoreQueryFilters, StoreStatus } from '@foundry/domain'
import type { PaginatedResult } from '@/shared'
import type { ListStoresInput, StoreOutput } from '@/Store'
import { ListStoresSchema } from '@/Store'
import { toStoreResponseList } from '../mappers'

export class ListStoresQuery {
	constructor(private readonly storeRepository: IStoreRepository) {}

	async execute(input: ListStoresInput, ownerId: string): Promise<PaginatedResult<StoreOutput>> {
		const { page, limit, sortBy, sortOrder, status } = ListStoresSchema.parse(input)
		const offset = (page - 1) * limit

		const filters: StoreQueryFilters = {
			ownerId,
			limit,
			offset,
			sortBy: sortBy ?? 'createdAt',
			sortOrder: sortOrder ?? 'desc',
			status: status as StoreStatus | undefined,
		}

		const [stores, total] = await Promise.all([
			this.storeRepository.findMany(filters),
			this.storeRepository.count(filters),
		])

		return {
			items: toStoreResponseList(stores),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasNextPage: page * limit < total,
			hasPreviousPage: page > 1,
		}
	}
}

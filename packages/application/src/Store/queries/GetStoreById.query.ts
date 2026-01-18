/**
 * @fileoverview Get Store By ID Query Handler
 */

import type { IStoreRepository } from '@foundry/domain'
import type { GetStoreByIdInput, StoreOutput } from '@/Store'
import { GetStoreByIdSchema } from '@/Store'
import { toStoreResponse } from '../mappers'

export class GetStoreByIdQuery {
	constructor(private readonly storeRepository: IStoreRepository) {}

	async execute(input: GetStoreByIdInput): Promise<StoreOutput | null> {
		const { storeId } = GetStoreByIdSchema.parse(input)

		const store = await this.storeRepository.findById(storeId)
		if (!store || store.isDeleted) {
			return null
		}

		return toStoreResponse(store)
	}
}

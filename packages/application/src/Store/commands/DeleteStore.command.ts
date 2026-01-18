/**
 * @fileoverview Delete Store Command Handler
 */

import type { IStoreRepository } from '@foundry/domain'
import type { Context } from '@/shared'
import { ApplicationError } from '@/shared'
import type { DeleteStoreResponse } from '@/Store'

export class DeleteStoreCommand {
	constructor(private readonly storeRepository: IStoreRepository) {}

	async execute(storeId: string, ctx: Context): Promise<DeleteStoreResponse> {
		const store = await this.storeRepository.findById(storeId)
		if (!store) {
			throw ApplicationError.notFound('Store', storeId)
		}

		// Verify ownership
		if (store.ownerId !== ctx.userId) {
			throw ApplicationError.forbidden('You do not own this store')
		}

		if (store.isDeleted) {
			throw ApplicationError.conflict('Store is already deleted')
		}

		const deletedStore = store.delete()
		await this.storeRepository.update(deletedStore)

		return { storeId, deleted: true }
	}
}

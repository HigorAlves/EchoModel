/**
 * @fileoverview Update Store Command Handler
 */

import type { IStoreRepository, Store } from '@foundry/domain'
import type { Context, IEventBus } from '@/shared'
import { ApplicationError } from '@/shared'
import type { UpdateStoreInput, UpdateStoreResponse } from '@/Store'
import { UpdateStoreSchema } from '@/Store'

export class UpdateStoreCommand {
	constructor(
		private readonly storeRepository: IStoreRepository,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(storeId: string, input: UpdateStoreInput, ctx: Context): Promise<UpdateStoreResponse> {
		const validated = UpdateStoreSchema.parse(input)

		const store = await this.storeRepository.findById(storeId)
		if (!store) {
			throw ApplicationError.notFound('Store', storeId)
		}

		// Verify ownership
		if (store.ownerId !== ctx.userId) {
			throw ApplicationError.forbidden('You do not own this store')
		}

		const updatedStore = store.update({
			name: validated.name,
			description: validated.description,
			defaultStyle: validated.defaultStyle,
		})

		await this.storeRepository.update(updatedStore)
		await this.publishEvents(updatedStore, ctx)

		return { storeId, updated: true }
	}

	private async publishEvents(store: Store, ctx: Context): Promise<void> {
		if (!this.eventBus) return

		for (const event of store.domainEvents) {
			await this.eventBus.publish({
				eventType: event.eventType,
				aggregateType: event.aggregateType,
				aggregateId: event.aggregateId,
				payload: event.eventData as Record<string, unknown>,
				correlationId: ctx.correlationId,
				occurredAt: new Date(),
			})
		}
		store.clearDomainEvents()
	}
}

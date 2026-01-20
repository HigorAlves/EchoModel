/**
 * @fileoverview Create Store Command Handler
 */

import type { IStoreRepository, Store } from '@foundry/domain'
import type { CreateStoreInput, CreateStoreResponse } from '@/Store'
import { CreateStoreSchema } from '@/Store'
import type { Context, IEventBus } from '@/shared'

export class CreateStoreCommand {
	constructor(
		private readonly storeRepository: IStoreRepository,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(input: CreateStoreInput, ctx: Context): Promise<CreateStoreResponse> {
		const validated = CreateStoreSchema.parse(input)

		if (!ctx.userId) {
			throw new Error('User ID is required to create a store')
		}

		const { Store } = await import('@foundry/domain')
		const store = Store.create({
			ownerId: ctx.userId,
			name: validated.name,
			description: validated.description,
			defaultStyle: validated.defaultStyle,
			settings: validated.settings,
		})

		const storeId = await this.storeRepository.create(store)

		await this.publishEvents(store, ctx)

		return { storeId }
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

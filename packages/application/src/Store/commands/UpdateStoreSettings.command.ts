/**
 * @fileoverview Update Store Settings Command Handler
 */

import type { IStoreRepository, Store } from '@foundry/domain'
import type { Context, IEventBus } from '@/shared'
import { ApplicationError } from '@/shared'
import type { UpdateStoreSettingsInput, UpdateStoreSettingsResponse } from '@/Store'
import { UpdateStoreSettingsSchema } from '@/Store'

export class UpdateStoreSettingsCommand {
	constructor(
		private readonly storeRepository: IStoreRepository,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(storeId: string, input: UpdateStoreSettingsInput, ctx: Context): Promise<UpdateStoreSettingsResponse> {
		const validated = UpdateStoreSettingsSchema.parse(input)

		const store = await this.storeRepository.findById(storeId)
		if (!store) {
			throw ApplicationError.notFound('Store', storeId)
		}

		// Verify ownership
		if (store.ownerId !== ctx.userId) {
			throw ApplicationError.forbidden('You do not own this store')
		}

		const updatedStore = store.updateSettings({
			defaultAspectRatio: validated.defaultAspectRatio,
			defaultImageCount: validated.defaultImageCount,
			watermarkEnabled: validated.watermarkEnabled,
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

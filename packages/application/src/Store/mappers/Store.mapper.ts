/**
 * @fileoverview Store Mapper
 */

import type { Store } from '@foundry/domain'
import type { StoreOutput } from '@/Store'

export function toStoreResponse(store: Store): StoreOutput {
	return {
		id: store.id.value,
		ownerId: store.ownerId,
		name: store.name.value,
		description: store.description?.value ?? null,
		defaultStyle: store.defaultStyle?.value ?? null,
		logoAssetId: store.logoAssetId,
		status: store.status,
		settings: store.settings,
		createdAt: store.createdAt,
		updatedAt: store.updatedAt,
	}
}

export function toStoreResponseList(stores: Store[]): StoreOutput[] {
	return stores.map((store) => toStoreResponse(store))
}

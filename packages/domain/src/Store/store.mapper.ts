import { Store } from './Store.entity'
import type { PersistenceStore } from './store.repository'
import { DefaultStyle, StoreDescription, StoreId, StoreName } from './value-objects'

/**
 * @fileoverview Store Mapper
 *
 * Mappers are responsible for converting between domain entities and
 * persistence representations.
 */

/**
 * Maps persistence data to a domain entity
 * @param data - Raw persistence data from the database
 * @returns Store domain entity
 */
export function toDomain(data: PersistenceStore): Store {
	return Store.create({
		id: StoreId.create(data.id),
		ownerId: data.ownerId,
		name: StoreName.create(data.name),
		description: data.description ? StoreDescription.create(data.description) : null,
		defaultStyle: data.defaultStyle ? DefaultStyle.create(data.defaultStyle) : null,
		logoAssetId: data.logoAssetId,
		status: data.status,
		settings: data.settings,
		createdAt: data.createdAt,
		updatedAt: data.updatedAt,
		deletedAt: data.deletedAt,
	})
}

/**
 * Maps a domain entity to persistence format
 * @param entity - The store domain entity
 * @returns Persistence representation ready for database storage
 */
export function toPersistence(entity: Store): PersistenceStore {
	return {
		id: entity.id.value,
		ownerId: entity.ownerId,
		name: entity.name.value,
		description: entity.description?.value ?? null,
		defaultStyle: entity.defaultStyle?.value ?? null,
		logoAssetId: entity.logoAssetId,
		status: entity.status,
		settings: entity.settings,
		createdAt: entity.createdAt,
		updatedAt: entity.updatedAt,
		deletedAt: entity.deletedAt,
	}
}

/**
 * Store Mapper namespace for convenient access to mapping functions
 */
export const StoreMapper = {
	toDomain,
	toPersistence,
}

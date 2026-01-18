import { randomUUID } from 'node:crypto'
import { AspectRatio, StoreStatus } from './store.enum'
import type { StoreEvent } from './store.event'
import {
	createStoreCreatedEvent,
	createStoreSettingsUpdatedEvent,
	createStoreStatusChangedEvent,
	createStoreUpdatedEvent,
} from './store.event'
import type { StoreSettings } from './store.repository'
import { DefaultStyle, StoreDescription, StoreId, StoreName } from './value-objects'

/**
 * @fileoverview Store Aggregate Root
 *
 * This entity serves as the Aggregate Root for the Store bounded context.
 * A Store represents a tenant in the system - a clothing store that creates
 * AI influencers and generates social media photos.
 */

export interface StoreProps {
	readonly id: StoreId
	readonly ownerId: string
	readonly name: StoreName
	readonly description: StoreDescription | null
	readonly defaultStyle: DefaultStyle | null
	readonly logoAssetId: string | null
	readonly status: StoreStatus
	readonly settings: StoreSettings
	readonly createdAt: Date
	readonly updatedAt: Date
	readonly deletedAt: Date | null
}

interface CreateStoreDTO {
	readonly ownerId: string
	readonly name: string
	readonly description?: string
	readonly defaultStyle?: string
	readonly settings?: Partial<StoreSettings>
}

interface UpdateStoreDTO {
	readonly name?: string
	readonly description?: string | null
	readonly defaultStyle?: string | null
}

interface UpdateStoreSettingsDTO {
	readonly defaultAspectRatio?: AspectRatio
	readonly defaultImageCount?: number
	readonly watermarkEnabled?: boolean
}

/**
 * Default store settings
 */
const DEFAULT_STORE_SETTINGS: StoreSettings = {
	defaultAspectRatio: AspectRatio.PORTRAIT_4_5,
	defaultImageCount: 4,
	watermarkEnabled: false,
}

/**
 * Store Aggregate Root
 *
 * Represents a store (tenant) in the domain with unique identity and business behavior.
 */
export class Store {
	private readonly _domainEvents: StoreEvent[] = []

	private constructor(private readonly data: StoreProps) {}

	/**
	 * Factory method to create a Store aggregate
	 * @param data - Either entity props or DTO for creation
	 * @returns New Store instance
	 */
	static create(data: StoreProps | CreateStoreDTO): Store {
		// Handle both entity props and plain DTO
		if ((data as StoreProps).id instanceof StoreId) {
			return new Store(data as StoreProps)
		}

		// Create from DTO
		const dto = data as CreateStoreDTO
		const now = new Date()

		const id = StoreId.create(randomUUID())
		const name = StoreName.create(dto.name)
		const description = dto.description ? StoreDescription.create(dto.description) : null
		const defaultStyle = dto.defaultStyle ? DefaultStyle.create(dto.defaultStyle) : null

		const settings: StoreSettings = {
			...DEFAULT_STORE_SETTINGS,
			...dto.settings,
		}

		const store = new Store({
			id,
			ownerId: dto.ownerId,
			name,
			description,
			defaultStyle,
			logoAssetId: null,
			status: StoreStatus.ACTIVE,
			settings,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		})

		store.addDomainEvent(
			createStoreCreatedEvent(id.value, {
				storeId: id.value,
				ownerId: dto.ownerId,
				name: name.value,
			}),
		)

		return store
	}

	/**
	 * Get the entity data
	 * @returns Readonly copy of entity properties
	 */
	get value(): StoreProps {
		return this.data
	}

	/**
	 * Get the entity's unique identifier
	 */
	get id(): StoreId {
		return this.data.id
	}

	/**
	 * Get the store owner's user ID (Firebase Auth UID)
	 */
	get ownerId(): string {
		return this.data.ownerId
	}

	/**
	 * Get the store's name
	 */
	get name(): StoreName {
		return this.data.name
	}

	/**
	 * Get the store's description
	 */
	get description(): StoreDescription | null {
		return this.data.description
	}

	/**
	 * Get the store's default style
	 */
	get defaultStyle(): DefaultStyle | null {
		return this.data.defaultStyle
	}

	/**
	 * Get the store's logo asset ID
	 */
	get logoAssetId(): string | null {
		return this.data.logoAssetId
	}

	/**
	 * Get the store's status
	 */
	get status(): StoreStatus {
		return this.data.status
	}

	/**
	 * Get the store's settings
	 */
	get settings(): StoreSettings {
		return this.data.settings
	}

	/**
	 * Get the creation timestamp
	 */
	get createdAt(): Date {
		return this.data.createdAt
	}

	/**
	 * Get the last update timestamp
	 */
	get updatedAt(): Date {
		return this.data.updatedAt
	}

	/**
	 * Get the deletion timestamp (for soft delete)
	 */
	get deletedAt(): Date | null {
		return this.data.deletedAt
	}

	/**
	 * Check if the store has been soft deleted
	 */
	get isDeleted(): boolean {
		return this.data.deletedAt !== null
	}

	/**
	 * Check if the store is active
	 */
	get isActive(): boolean {
		return this.data.status === StoreStatus.ACTIVE && !this.isDeleted
	}

	/**
	 * Get all domain events that occurred on this aggregate
	 */
	get domainEvents(): readonly StoreEvent[] {
		return [...this._domainEvents]
	}

	/**
	 * Add a domain event to the aggregate
	 */
	addDomainEvent(event: StoreEvent): void {
		this._domainEvents.push(event)
	}

	/**
	 * Clear all domain events (typically called after events are published)
	 */
	clearDomainEvents(): void {
		this._domainEvents.length = 0
	}

	/**
	 * Check if this entity equals another entity
	 */
	equals(other: Store): boolean {
		return this.data.id.equals(other.data.id)
	}

	/**
	 * Check if a user is the owner of this store
	 */
	isOwnedBy(userId: string): boolean {
		return this.data.ownerId === userId
	}

	/**
	 * Update the store's basic information
	 * @returns New Store instance with updates
	 */
	update(dto: UpdateStoreDTO): Store {
		const now = new Date()
		const changes: Record<string, { from: unknown; to: unknown }> = {}

		let name = this.data.name
		let description = this.data.description
		let defaultStyle = this.data.defaultStyle

		if (dto.name !== undefined) {
			const newName = StoreName.create(dto.name)
			changes.name = { from: this.data.name.value, to: newName.value }
			name = newName
		}

		if (dto.description !== undefined) {
			const newDescription = dto.description ? StoreDescription.create(dto.description) : null
			changes.description = { from: this.data.description?.value ?? null, to: newDescription?.value ?? null }
			description = newDescription
		}

		if (dto.defaultStyle !== undefined) {
			const newDefaultStyle = dto.defaultStyle ? DefaultStyle.create(dto.defaultStyle) : null
			changes.defaultStyle = { from: this.data.defaultStyle?.value ?? null, to: newDefaultStyle?.value ?? null }
			defaultStyle = newDefaultStyle
		}

		const updatedStore = new Store({
			...this.data,
			name,
			description,
			defaultStyle,
			updatedAt: now,
		})

		if (Object.keys(changes).length > 0) {
			updatedStore.addDomainEvent(
				createStoreUpdatedEvent(this.data.id.value, {
					storeId: this.data.id.value,
					changes,
				}),
			)
		}

		return updatedStore
	}

	/**
	 * Update the store's settings
	 * @returns New Store instance with updated settings
	 */
	updateSettings(dto: UpdateStoreSettingsDTO): Store {
		const now = new Date()
		const changes: Record<string, { from: unknown; to: unknown }> = {}

		const newSettings = { ...this.data.settings }

		if (dto.defaultAspectRatio !== undefined) {
			changes.defaultAspectRatio = { from: this.data.settings.defaultAspectRatio, to: dto.defaultAspectRatio }
			newSettings.defaultAspectRatio = dto.defaultAspectRatio
		}

		if (dto.defaultImageCount !== undefined) {
			changes.defaultImageCount = { from: this.data.settings.defaultImageCount, to: dto.defaultImageCount }
			newSettings.defaultImageCount = dto.defaultImageCount
		}

		if (dto.watermarkEnabled !== undefined) {
			changes.watermarkEnabled = { from: this.data.settings.watermarkEnabled, to: dto.watermarkEnabled }
			newSettings.watermarkEnabled = dto.watermarkEnabled
		}

		const updatedStore = new Store({
			...this.data,
			settings: newSettings,
			updatedAt: now,
		})

		if (Object.keys(changes).length > 0) {
			updatedStore.addDomainEvent(
				createStoreSettingsUpdatedEvent(this.data.id.value, {
					storeId: this.data.id.value,
					changes,
				}),
			)
		}

		return updatedStore
	}

	/**
	 * Set the store's logo
	 * @returns New Store instance with logo
	 */
	setLogo(assetId: string): Store {
		const now = new Date()

		const updatedStore = new Store({
			...this.data,
			logoAssetId: assetId,
			updatedAt: now,
		})

		updatedStore.addDomainEvent(
			createStoreUpdatedEvent(this.data.id.value, {
				storeId: this.data.id.value,
				changes: {
					logoAssetId: { from: this.data.logoAssetId, to: assetId },
				},
			}),
		)

		return updatedStore
	}

	/**
	 * Remove the store's logo
	 * @returns New Store instance without logo
	 */
	removeLogo(): Store {
		const now = new Date()

		const updatedStore = new Store({
			...this.data,
			logoAssetId: null,
			updatedAt: now,
		})

		updatedStore.addDomainEvent(
			createStoreUpdatedEvent(this.data.id.value, {
				storeId: this.data.id.value,
				changes: {
					logoAssetId: { from: this.data.logoAssetId, to: null },
				},
			}),
		)

		return updatedStore
	}

	/**
	 * Update the store's status
	 * @returns New Store instance with updated status
	 */
	updateStatus(newStatus: StoreStatus): Store {
		const now = new Date()
		const fromStatus = this.data.status

		const updatedStore = new Store({
			...this.data,
			status: newStatus,
			updatedAt: now,
		})

		updatedStore.addDomainEvent(
			createStoreStatusChangedEvent(this.data.id.value, {
				storeId: this.data.id.value,
				fromStatus,
				toStatus: newStatus,
			}),
		)

		return updatedStore
	}

	/**
	 * Suspend the store
	 * @returns New Store instance with suspended status
	 */
	suspend(): Store {
		return this.updateStatus(StoreStatus.SUSPENDED)
	}

	/**
	 * Activate the store
	 * @returns New Store instance with active status
	 */
	activate(): Store {
		return this.updateStatus(StoreStatus.ACTIVE)
	}

	/**
	 * Deactivate the store
	 * @returns New Store instance with inactive status
	 */
	deactivate(): Store {
		return this.updateStatus(StoreStatus.INACTIVE)
	}

	/**
	 * Soft delete the store
	 * @returns New Store instance marked as deleted
	 */
	delete(): Store {
		const now = new Date()

		const deletedStore = new Store({
			...this.data,
			deletedAt: now,
			updatedAt: now,
		})

		return deletedStore
	}

	/**
	 * Restore a soft-deleted store
	 * @returns New Store instance with deletedAt cleared
	 */
	restore(): Store {
		const now = new Date()

		const restoredStore = new Store({
			...this.data,
			deletedAt: null,
			updatedAt: now,
		})

		return restoredStore
	}
}

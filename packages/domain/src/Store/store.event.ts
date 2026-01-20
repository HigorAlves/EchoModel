/**
 * @fileoverview Store Domain Events
 *
 * Domain Events represent something important that happened in the Store domain.
 */

import type { StoreStatus } from './store.enum'

/**
 * Base interface for all Store domain events
 */
export interface BaseStoreEvent {
	readonly eventId: string
	readonly eventType: string
	readonly aggregateId: string
	readonly aggregateType: string
	readonly eventVersion: number
	readonly occurredOn: Date
	readonly eventData: Record<string, unknown>
}

/**
 * Event fired when a store is created
 */
export interface StoreCreatedEvent extends BaseStoreEvent {
	readonly eventType: 'StoreCreated'
	readonly eventData: {
		readonly storeId: string
		readonly ownerId: string
		readonly name: string
	}
}

/**
 * Event fired when a store is updated
 */
export interface StoreUpdatedEvent extends BaseStoreEvent {
	readonly eventType: 'StoreUpdated'
	readonly eventData: {
		readonly storeId: string
		readonly changes: Record<string, { from: unknown; to: unknown }>
	}
}

/**
 * Event fired when store settings are updated
 */
export interface StoreSettingsUpdatedEvent extends BaseStoreEvent {
	readonly eventType: 'StoreSettingsUpdated'
	readonly eventData: {
		readonly storeId: string
		readonly changes: Record<string, { from: unknown; to: unknown }>
	}
}

/**
 * Event fired when a store is deleted (soft delete)
 */
export interface StoreDeletedEvent extends BaseStoreEvent {
	readonly eventType: 'StoreDeleted'
	readonly eventData: {
		readonly storeId: string
		readonly deletedAt: Date
	}
}

/**
 * Event fired when a store status changes
 */
export interface StoreStatusChangedEvent extends BaseStoreEvent {
	readonly eventType: 'StoreStatusChanged'
	readonly eventData: {
		readonly storeId: string
		readonly fromStatus: StoreStatus
		readonly toStatus: StoreStatus
	}
}

/**
 * Union type of all Store events
 */
export type StoreEvent =
	| StoreCreatedEvent
	| StoreUpdatedEvent
	| StoreSettingsUpdatedEvent
	| StoreDeletedEvent
	| StoreStatusChangedEvent

/**
 * Factory functions for creating Store domain events
 */

/**
 * Create a StoreCreated event
 */
export function createStoreCreatedEvent(aggregateId: string, data: StoreCreatedEvent['eventData']): StoreCreatedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'StoreCreated',
		aggregateId,
		aggregateType: 'Store',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

/**
 * Create a StoreUpdated event
 */
export function createStoreUpdatedEvent(aggregateId: string, data: StoreUpdatedEvent['eventData']): StoreUpdatedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'StoreUpdated',
		aggregateId,
		aggregateType: 'Store',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

/**
 * Create a StoreSettingsUpdated event
 */
export function createStoreSettingsUpdatedEvent(
	aggregateId: string,
	data: StoreSettingsUpdatedEvent['eventData'],
): StoreSettingsUpdatedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'StoreSettingsUpdated',
		aggregateId,
		aggregateType: 'Store',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

/**
 * Create a StoreDeleted event
 */
export function createStoreDeletedEvent(aggregateId: string, data: StoreDeletedEvent['eventData']): StoreDeletedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'StoreDeleted',
		aggregateId,
		aggregateType: 'Store',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

/**
 * Create a StoreStatusChanged event
 */
export function createStoreStatusChangedEvent(
	aggregateId: string,
	data: StoreStatusChangedEvent['eventData'],
): StoreStatusChangedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'StoreStatusChanged',
		aggregateId,
		aggregateType: 'Store',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

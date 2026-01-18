/**
 * @fileoverview Asset Domain Events
 *
 * Domain Events represent something important that happened in the Asset domain.
 */

import type { AssetCategory, AssetStatus } from './asset.enum'

/**
 * Base interface for all Asset domain events
 */
export interface BaseAssetEvent {
	readonly eventId: string
	readonly eventType: string
	readonly aggregateId: string
	readonly aggregateType: string
	readonly eventVersion: number
	readonly occurredOn: Date
	readonly eventData: Record<string, unknown>
}

/**
 * Event fired when an asset upload is requested
 */
export interface AssetUploadRequestedEvent extends BaseAssetEvent {
	readonly eventType: 'AssetUploadRequested'
	readonly eventData: {
		readonly assetId: string
		readonly storeId: string
		readonly category: AssetCategory
		readonly filename: string
	}
}

/**
 * Event fired when an asset upload is confirmed
 */
export interface AssetUploadConfirmedEvent extends BaseAssetEvent {
	readonly eventType: 'AssetUploadConfirmed'
	readonly eventData: {
		readonly assetId: string
		readonly storeId: string
	}
}

/**
 * Event fired when an asset is ready for use
 */
export interface AssetReadyEvent extends BaseAssetEvent {
	readonly eventType: 'AssetReady'
	readonly eventData: {
		readonly assetId: string
		readonly storeId: string
		readonly cdnUrl: string | null
	}
}

/**
 * Event fired when an asset processing fails
 */
export interface AssetFailedEvent extends BaseAssetEvent {
	readonly eventType: 'AssetFailed'
	readonly eventData: {
		readonly assetId: string
		readonly storeId: string
		readonly reason: string
	}
}

/**
 * Event fired when an asset is deleted
 */
export interface AssetDeletedEvent extends BaseAssetEvent {
	readonly eventType: 'AssetDeleted'
	readonly eventData: {
		readonly assetId: string
		readonly storeId: string
		readonly deletedAt: Date
	}
}

/**
 * Union type of all Asset events
 */
export type AssetEvent =
	| AssetUploadRequestedEvent
	| AssetUploadConfirmedEvent
	| AssetReadyEvent
	| AssetFailedEvent
	| AssetDeletedEvent

/**
 * Factory functions for creating Asset domain events
 */

export function createAssetUploadRequestedEvent(
	aggregateId: string,
	data: AssetUploadRequestedEvent['eventData'],
): AssetUploadRequestedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'AssetUploadRequested',
		aggregateId,
		aggregateType: 'Asset',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createAssetUploadConfirmedEvent(
	aggregateId: string,
	data: AssetUploadConfirmedEvent['eventData'],
): AssetUploadConfirmedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'AssetUploadConfirmed',
		aggregateId,
		aggregateType: 'Asset',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createAssetReadyEvent(aggregateId: string, data: AssetReadyEvent['eventData']): AssetReadyEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'AssetReady',
		aggregateId,
		aggregateType: 'Asset',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createAssetFailedEvent(aggregateId: string, data: AssetFailedEvent['eventData']): AssetFailedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'AssetFailed',
		aggregateId,
		aggregateType: 'Asset',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createAssetDeletedEvent(aggregateId: string, data: AssetDeletedEvent['eventData']): AssetDeletedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'AssetDeleted',
		aggregateId,
		aggregateType: 'Asset',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

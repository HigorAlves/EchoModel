/**
 * @fileoverview Model Domain Events
 *
 * Domain Events for the Model (AI Influencer) bounded context.
 */

/**
 * Base interface for all Model domain events
 */
export interface BaseModelEvent {
	readonly eventId: string
	readonly eventType: string
	readonly aggregateId: string
	readonly aggregateType: string
	readonly eventVersion: number
	readonly occurredOn: Date
	readonly eventData: Record<string, unknown>
}

/**
 * Event fired when a model is created
 */
export interface ModelCreatedEvent extends BaseModelEvent {
	readonly eventType: 'ModelCreated'
	readonly eventData: {
		readonly modelId: string
		readonly storeId: string
		readonly name: string
	}
}

/**
 * Event fired when model calibration is started
 */
export interface ModelCalibrationStartedEvent extends BaseModelEvent {
	readonly eventType: 'ModelCalibrationStarted'
	readonly eventData: {
		readonly modelId: string
		readonly storeId: string
	}
}

/**
 * Event fired when a calibration image is added
 */
export interface ModelCalibrationImageAddedEvent extends BaseModelEvent {
	readonly eventType: 'ModelCalibrationImageAdded'
	readonly eventData: {
		readonly modelId: string
		readonly imageId: string
	}
}

/**
 * Event fired when model is approved (calibration complete)
 */
export interface ModelApprovedEvent extends BaseModelEvent {
	readonly eventType: 'ModelApproved'
	readonly eventData: {
		readonly modelId: string
		readonly storeId: string
		readonly lockedIdentityUrl: string
	}
}

/**
 * Event fired when model calibration is rejected
 */
export interface ModelRejectedEvent extends BaseModelEvent {
	readonly eventType: 'ModelRejected'
	readonly eventData: {
		readonly modelId: string
		readonly storeId: string
		readonly reason: string
	}
}

/**
 * Event fired when a model is updated
 */
export interface ModelUpdatedEvent extends BaseModelEvent {
	readonly eventType: 'ModelUpdated'
	readonly eventData: {
		readonly modelId: string
		readonly changes: Record<string, { from: unknown; to: unknown }>
	}
}

/**
 * Event fired when a model is archived
 */
export interface ModelArchivedEvent extends BaseModelEvent {
	readonly eventType: 'ModelArchived'
	readonly eventData: {
		readonly modelId: string
		readonly storeId: string
	}
}

/**
 * Event fired when a model is deleted (soft delete)
 */
export interface ModelDeletedEvent extends BaseModelEvent {
	readonly eventType: 'ModelDeleted'
	readonly eventData: {
		readonly modelId: string
		readonly storeId: string
		readonly deletedAt: Date
	}
}

/**
 * Union type of all Model events
 */
export type ModelEvent =
	| ModelCreatedEvent
	| ModelCalibrationStartedEvent
	| ModelCalibrationImageAddedEvent
	| ModelApprovedEvent
	| ModelRejectedEvent
	| ModelUpdatedEvent
	| ModelArchivedEvent
	| ModelDeletedEvent

/**
 * Factory functions for creating Model domain events
 */

export function createModelCreatedEvent(aggregateId: string, data: ModelCreatedEvent['eventData']): ModelCreatedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'ModelCreated',
		aggregateId,
		aggregateType: 'Model',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createModelCalibrationStartedEvent(
	aggregateId: string,
	data: ModelCalibrationStartedEvent['eventData'],
): ModelCalibrationStartedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'ModelCalibrationStarted',
		aggregateId,
		aggregateType: 'Model',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createModelCalibrationImageAddedEvent(
	aggregateId: string,
	data: ModelCalibrationImageAddedEvent['eventData'],
): ModelCalibrationImageAddedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'ModelCalibrationImageAdded',
		aggregateId,
		aggregateType: 'Model',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createModelApprovedEvent(
	aggregateId: string,
	data: ModelApprovedEvent['eventData'],
): ModelApprovedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'ModelApproved',
		aggregateId,
		aggregateType: 'Model',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createModelRejectedEvent(
	aggregateId: string,
	data: ModelRejectedEvent['eventData'],
): ModelRejectedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'ModelRejected',
		aggregateId,
		aggregateType: 'Model',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createModelUpdatedEvent(aggregateId: string, data: ModelUpdatedEvent['eventData']): ModelUpdatedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'ModelUpdated',
		aggregateId,
		aggregateType: 'Model',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createModelArchivedEvent(
	aggregateId: string,
	data: ModelArchivedEvent['eventData'],
): ModelArchivedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'ModelArchived',
		aggregateId,
		aggregateType: 'Model',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createModelDeletedEvent(aggregateId: string, data: ModelDeletedEvent['eventData']): ModelDeletedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'ModelDeleted',
		aggregateId,
		aggregateType: 'Model',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

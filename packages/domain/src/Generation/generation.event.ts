/**
 * @fileoverview Generation Domain Events
 *
 * Domain Events for the Generation bounded context.
 */

import type { GenerationStatus } from './generation.enum'

/**
 * Base interface for all Generation domain events
 */
export interface BaseGenerationEvent {
	readonly eventId: string
	readonly eventType: string
	readonly aggregateId: string
	readonly aggregateType: string
	readonly eventVersion: number
	readonly occurredOn: Date
	readonly eventData: Record<string, unknown>
}

/**
 * Event fired when a generation is created
 */
export interface GenerationCreatedEvent extends BaseGenerationEvent {
	readonly eventType: 'GenerationCreated'
	readonly eventData: {
		readonly generationId: string
		readonly storeId: string
		readonly modelId: string
		readonly idempotencyKey: string
	}
}

/**
 * Event fired when processing starts
 */
export interface GenerationProcessingStartedEvent extends BaseGenerationEvent {
	readonly eventType: 'GenerationProcessingStarted'
	readonly eventData: {
		readonly generationId: string
		readonly storeId: string
	}
}

/**
 * Event fired when an image is generated
 */
export interface GenerationImageAddedEvent extends BaseGenerationEvent {
	readonly eventType: 'GenerationImageAdded'
	readonly eventData: {
		readonly generationId: string
		readonly imageId: string
		readonly aspectRatio: string
	}
}

/**
 * Event fired when generation completes
 */
export interface GenerationCompletedEvent extends BaseGenerationEvent {
	readonly eventType: 'GenerationCompleted'
	readonly eventData: {
		readonly generationId: string
		readonly storeId: string
		readonly imageCount: number
	}
}

/**
 * Event fired when generation fails
 */
export interface GenerationFailedEvent extends BaseGenerationEvent {
	readonly eventType: 'GenerationFailed'
	readonly eventData: {
		readonly generationId: string
		readonly storeId: string
		readonly reason: string
	}
}

/**
 * Union type of all Generation events
 */
export type GenerationEvent =
	| GenerationCreatedEvent
	| GenerationProcessingStartedEvent
	| GenerationImageAddedEvent
	| GenerationCompletedEvent
	| GenerationFailedEvent

/**
 * Factory functions for creating Generation domain events
 */

export function createGenerationCreatedEvent(
	aggregateId: string,
	data: GenerationCreatedEvent['eventData'],
): GenerationCreatedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'GenerationCreated',
		aggregateId,
		aggregateType: 'Generation',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createGenerationProcessingStartedEvent(
	aggregateId: string,
	data: GenerationProcessingStartedEvent['eventData'],
): GenerationProcessingStartedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'GenerationProcessingStarted',
		aggregateId,
		aggregateType: 'Generation',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createGenerationImageAddedEvent(
	aggregateId: string,
	data: GenerationImageAddedEvent['eventData'],
): GenerationImageAddedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'GenerationImageAdded',
		aggregateId,
		aggregateType: 'Generation',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createGenerationCompletedEvent(
	aggregateId: string,
	data: GenerationCompletedEvent['eventData'],
): GenerationCompletedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'GenerationCompleted',
		aggregateId,
		aggregateType: 'Generation',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

export function createGenerationFailedEvent(
	aggregateId: string,
	data: GenerationFailedEvent['eventData'],
): GenerationFailedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'GenerationFailed',
		aggregateId,
		aggregateType: 'Generation',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

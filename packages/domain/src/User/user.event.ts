/**
 * @fileoverview User Domain Events
 *
 * Domain Events represent something important that happened in the domain.
 * They are used to:
 * - Decouple different parts of the system
 * - Trigger side effects in other bounded contexts
 * - Maintain event sourcing capabilities
 * - Enable eventual consistency patterns
 *
 * Events should:
 * - Be immutable
 * - Contain all necessary data for handlers
 * - Use past tense naming (e.g., UserCreated, OrderShipped)
 * - Include metadata like timestamp, version, etc.
 */

/**
 * Base interface for all User domain events
 */
export interface BaseUserEvent {
	readonly eventId: string
	readonly eventType: string
	readonly aggregateId: string
	readonly aggregateType: string
	readonly eventVersion: number
	readonly occurredOn: Date
	readonly eventData: Record<string, unknown>
}

/**
 * Event fired when a user is created
 */
export interface UserCreatedEvent extends BaseUserEvent {
	readonly eventType: 'UserCreated'
	readonly eventData: {
		readonly userId: string
		// Add event-specific data here
	}
}

/**
 * Event fired when a user is updated
 */
export interface UserUpdatedEvent extends BaseUserEvent {
	readonly eventType: 'UserUpdated'
	readonly eventData: {
		readonly userId: string
		readonly changes: Record<string, { from: unknown; to: unknown }>
		// Add event-specific data here
	}
}

/**
 * Event fired when a user is deleted
 */
export interface UserDeletedEvent extends BaseUserEvent {
	readonly eventType: 'UserDeleted'
	readonly eventData: {
		readonly userId: string
		readonly deletedAt: Date
		// Add event-specific data here
	}
}

/**
 * Union type of all User events
 */
export type UserEvent = UserCreatedEvent | UserUpdatedEvent | UserDeletedEvent

/**
 * Factory functions for creating User domain events
 */

/**
 * Create a UserCreated event
 */
export function createUserCreatedEvent(aggregateId: string, data: UserCreatedEvent['eventData']): UserCreatedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'UserCreated',
		aggregateId,
		aggregateType: 'User',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

/**
 * Create a UserUpdated event
 */
export function createUserUpdatedEvent(aggregateId: string, data: UserUpdatedEvent['eventData']): UserUpdatedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'UserUpdated',
		aggregateId,
		aggregateType: 'User',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

/**
 * Create a UserDeleted event
 */
export function createUserDeletedEvent(aggregateId: string, data: UserDeletedEvent['eventData']): UserDeletedEvent {
	return {
		eventId: crypto.randomUUID(),
		eventType: 'UserDeleted',
		aggregateId,
		aggregateType: 'User',
		eventVersion: 1,
		occurredOn: new Date(),
		eventData: data,
	}
}

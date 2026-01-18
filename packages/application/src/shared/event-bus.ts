/**
 * @fileoverview Event Bus Interface
 *
 * Interface for publishing domain events.
 */

/**
 * Integration event structure
 */
export interface IntegrationEvent {
	readonly eventType: string
	readonly aggregateType: string
	readonly aggregateId: string
	readonly payload: Record<string, unknown>
	readonly correlationId: string
	readonly occurredAt: Date
}

/**
 * Event bus interface for publishing events
 */
export interface IEventBus {
	/**
	 * Publish an event
	 */
	publish(event: IntegrationEvent): Promise<void>
}

/**
 * Event handler interface
 */
export interface IEventHandler {
	/**
	 * Handle an event
	 */
	handle(event: IntegrationEvent): Promise<void>
}
